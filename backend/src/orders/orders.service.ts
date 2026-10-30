import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  calculateIngredientRequirements,
  reserveIngredients, releaseOrderIngredients,
  reserveOrderIngredients,
} from './ingredient-stock';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly allowedTransitions: Record<
    OrderStatus,
    readonly OrderStatus[]
  > = {
    PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
    PAID: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY'],
    READY: ['COMPLETED'],
    COMPLETED: [],
    PAYMENT_FAILED: ['PENDING', 'CANCELLED'],
    CANCELLED: [],
  };

  async create(userId: number, dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Đơn hàng phải có ít nhất một sản phẩm');
    }

    // Nâng cấp: Khóa trùng lặp bao gồm cả Topping
    const itemKeys = dto.items.map(
      (item) => `${item.productId}_${item.size || 'DEFAULT'}_${item.toppings?.sort().join(',') || 'NONE'}`,
    );
    if (new Set(itemKeys).size !== itemKeys.length) {
      throw new BadRequestException(
        'Sản phẩm cùng kích cỡ và topping không được lặp lại, vui lòng tăng số lượng',
      );
    }

    const uniqueProductIds = [...new Set(dto.items.map((item) => item.productId))];

    return this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!user) {
          throw new UnauthorizedException('Tài khoản không tồn tại');
        }

        const products = await tx.product.findMany({
          where: { id: { in: uniqueProductIds } },
        });

        if (products.length !== uniqueProductIds.length) {
          throw new NotFoundException('Một hoặc nhiều sản phẩm không tồn tại');
        }

        const productMap = new Map(products.map((p) => [p.id, p]));

        let subtotal = 0;
        const orderItems = dto.items.map((item) => {
          const product = productMap.get(item.productId);
          if (!product) throw new NotFoundException('Sản phẩm không tồn tại');



          // 1. Tính giá cơ bản + Phụ thu Size
          let unitPrice = Number(product.price);
          if (item.size === 'M') unitPrice += 5000;
          if (item.size === 'L') unitPrice += 10000;

          // 2. Tính phụ thu Topping
          let toppingStr = '';
          if (item.toppings && item.toppings.length > 0) {
            const toppingPrices: Record<string, number> = {
              'Trân châu': 7000,
              'Extra shot': 10000,
              'Kem cheese': 10000,
            };
            item.toppings.forEach((t) => {
              if (toppingPrices[t]) unitPrice += toppingPrices[t];
            });
            toppingStr = ` (+ ${item.toppings.join(', ')})`;
          }

          // 3. Tính tổng dòng
          const lineTotal = unitPrice * item.qty;
          subtotal += lineTotal;

          // 4. Gộp tên Topping vào trường size để lưu lịch sử trọn vẹn
          const savedSize = item.size
            ? `${item.size}${toppingStr}`
            : (toppingStr ? toppingStr.replace(' (+ ', '').replace(')', '') : null);

          return {
            productId: product.id,
            qty: item.qty,
            size: savedSize,
            lineTotal,
          };
        });

        // TASK 10.4: Kiểm tra và áp dụng mã khuyến mãi
        let promotionId: number | null = null;
        let discountAmount = 0;

        if (dto.promotionCode?.trim()) {
          const code = dto.promotionCode.trim().toUpperCase();
          const promotion = await tx.promotion.findUnique({
            where: { code },
          });

          if (!promotion) throw new BadRequestException('Mã khuyến mãi không tồn tại');

          const now = new Date();
          if (!promotion.isActive || now < promotion.startsAt || now > promotion.expiresAt) {
            throw new BadRequestException('Mã khuyến mãi không hoạt động hoặc đã hết hạn');
          }
          if (subtotal < promotion.minOrderAmount) {
            throw new BadRequestException(`Đơn hàng phải đạt tối thiểu ${promotion.minOrderAmount} đồng`);
          }

          if (promotion.type === 'PERCENT') {
            discountAmount = Math.floor((subtotal * promotion.value) / 100);
            if (promotion.maxDiscount !== null) {
              discountAmount = Math.min(discountAmount, promotion.maxDiscount);
            }
          } else if (promotion.type === 'FIXED') {
            discountAmount = promotion.value;
          }

          discountAmount = Math.min(discountAmount, subtotal);
          promotionId = promotion.id;
        }

        const total = subtotal - discountAmount;

        // TASK 10.3: Tính nguyên liệu theo công thức
        const requirements =
          await calculateIngredientRequirements(
            tx,
            dto.items,
          );

        // Giữ nguyên liệu bằng Optimistic Locking
        await reserveIngredients(tx, requirements);

        return tx.order.create({
          data: {
            userId,
            subtotal,
            discountAmount,
            promotionId,
            total,
            status: 'PENDING',

            // Đánh dấu nguyên liệu đã được giữ
            ingredientsReserved: true,

            // Lưu các sản phẩm khách đặt
            items: {
              create: orderItems,
            },

            // Lưu lượng nguyên liệu đã giữ
            ingredientUses: {
              create: requirements.map((item) => ({
                ingredientId: item.ingredientId,
                quantity: item.quantity,
              })),
            },
          },
          include: {
            items: {
              include: { product: true },
            },
            ingredientUses: {
              include: { ingredient: true },
            },
          },
        });
      },
      { maxWait: 10000, timeout: 20000 },
    );
  }

  async updateStatus(orderId: number, nextStatus: OrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: { select: { productId: true, qty: true } } },
      });

      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

      const currentStatus = order.status as OrderStatus;
      const allowed = this.allowedTransitions[currentStatus] ?? [];

      if (!allowed.includes(nextStatus)) {
        throw new BadRequestException(`Không thể chuyển trạng thái từ ${currentStatus} sang ${nextStatus}`);
      }

      const changed = await tx.order.updateMany({
        where: { id: orderId, status: currentStatus },
        data: { status: nextStatus },
      });

      if (changed.count !== 1) {
        throw new BadRequestException('Trạng thái đơn hàng đã thay đổi. Vui lòng thử lại');
      }

      // TASK 10.3: Hoàn nguyên liệu khi hủy/thất bại
      const releaseStock =
        currentStatus === 'PENDING' &&
        (
          nextStatus === 'PAYMENT_FAILED' ||
          nextStatus === 'CANCELLED'
        );

      const cancelPaidOrder =
        currentStatus === 'PAID' &&
        nextStatus === 'CANCELLED';

      if (releaseStock || cancelPaidOrder) {
        const handledByIngredients =
          await releaseOrderIngredients(tx, orderId);

        // Tương thích với các đơn hàng cũ:
        // Chưa có OrderIngredient thì dùng Product.stock
        if (!handledByIngredients) {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.qty },
                version: { increment: 1 },
              },
            });
          }
        }
      }

      // TASK 10.3: Giữ lại nguyên liệu khi thử thanh toán lại
      if (
        currentStatus === 'PAYMENT_FAILED' &&
        nextStatus === 'PENDING'
      ) {
        const handledByIngredients =
          await reserveOrderIngredients(tx, orderId);

        // Đơn hàng cũ chưa có OrderIngredient
        if (!handledByIngredients) {
          for (const item of order.items) {
            const reserved = await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: { gte: item.qty },
              },
              data: {
                stock: { decrement: item.qty },
                version: { increment: 1 },
              },
            });

            if (reserved.count !== 1) {
              throw new BadRequestException(
                'Không đủ tồn kho để thử thanh toán lại',
              );
            }
          }
        }
      }

      return tx.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });
    });
  }

  async findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }
}