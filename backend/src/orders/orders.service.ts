import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly sizeExtras: Record<string, number> = {
  S: 0,
  M: 5000,
  L: 10000,
};

private readonly toppingPrices: Record<
  string,
  { name: string; price: number }
> = {
  pearl: { name: 'Trân châu', price: 7000 },
  espresso: { name: 'Extra shot', price: 10000 },
  cream: { name: 'Kem cheese', price: 10000 },
};

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

  // TASK 6 & 10.3 & 10.4: Tạo đơn hàng, áp mã giảm giá, trừ tồn kho bằng Optimistic Locking
  async create(userId: number, dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Đơn hàng phải có ít nhất một sản phẩm');
    }

    const itemKeys = dto.items.map(
      (item) => `${item.productId}_${item.size || 'DEFAULT'}`,
    );
    if (new Set(itemKeys).size !== itemKeys.length) {
      throw new BadRequestException(
        'Sản phẩm cùng kích cỡ không được lặp lại trong đơn hàng, vui lòng tăng số lượng',
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

        const productQtyMap = new Map<number, number>();
        for (const item of dto.items) {
          const currentQty = productQtyMap.get(item.productId) || 0;
          productQtyMap.set(item.productId, currentQty + item.qty);
        }

        let subtotal = 0;

const orderItems = dto.items.map((item) => {
  const product = productMap.get(item.productId);

  if (!product) {
    throw new NotFoundException('Sản phẩm không tồn tại');
  }

  if (!Number.isInteger(item.qty) || item.qty < 1) {
    throw new BadRequestException('Số lượng sản phẩm không hợp lệ');
  }

  const totalRequiredQty = productQtyMap.get(item.productId) || 0;

  if (product.stock < totalRequiredQty) {
    throw new BadRequestException(
      `Sản phẩm "${product.name}" không đủ tồn kho`,
    );
  }

  const size = item.size || 'S';
  const sizeExtra = this.sizeExtras[size];

  if (sizeExtra === undefined) {
    throw new BadRequestException('Kích cỡ không hợp lệ');
  }

  const selectedToppings = item.toppings ?? [];
  const seenToppingIds = new Set<string>();

  const toppings = selectedToppings.map((topping) => {
    if (seenToppingIds.has(topping.id)) {
      throw new BadRequestException('Topping bị trùng lặp');
    }

    seenToppingIds.add(topping.id);

    const validTopping = this.toppingPrices[topping.id];

    if (!validTopping) {
      throw new BadRequestException(
        `Topping "${topping.id}" không hợp lệ`,
      );
    }

    return {
      id: topping.id,
      name: validTopping.name,
      price: validTopping.price,
    };
  });

  const toppingTotal = toppings.reduce(
    (sum, topping) => sum + topping.price,
    0,
  );

  const unitPrice = Number(product.price) + sizeExtra + toppingTotal;
  const lineTotal = unitPrice * item.qty;

  subtotal += lineTotal;

  return {
    productId: product.id,
    qty: item.qty,
    size,
    sizeExtra,
    toppings,
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

          if (!promotion) {
            throw new BadRequestException('Mã khuyến mãi không tồn tại');
          }

          const now = new Date();
          if (
            !promotion.isActive ||
            now < promotion.startsAt ||
            now > promotion.expiresAt
          ) {
            throw new BadRequestException(
              'Mã khuyến mãi không hoạt động hoặc đã hết hạn',
            );
          }

          if (subtotal < promotion.minOrderAmount) {
            throw new BadRequestException(
              `Đơn hàng phải đạt tối thiểu ${promotion.minOrderAmount} đồng`,
            );
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

        // TASK 10.3: Trừ tồn kho bằng Optimistic Locking (chống Deadlock và Race Condition)
        for (const [productId, qtyToDeduct] of [
          ...productQtyMap.entries(),
        ].sort((a, b) => a[0] - b[0])) {
          const product = productMap.get(productId);
          if (!product) {
            throw new NotFoundException('Sản phẩm không tồn tại');
          }

          const result = await tx.product.updateMany({
            where: {
              id: productId,
              version: product.version,
              stock: { gte: qtyToDeduct },
            },
            data: {
              stock: { decrement: qtyToDeduct },
              version: { increment: 1 },
            },
          });

          if (result.count !== 1) {
            throw new BadRequestException(
              'Tồn kho đã thay đổi. Vui lòng thử lại',
            );
          }
        }

        return tx.order.create({
          data: {
            userId,
            subtotal,
            discountAmount,
            promotionId,
            total,
            status: 'PENDING',
            items: { create: orderItems },
          },
          include: { items: { include: { product: true } } },
        });
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );
  }

  // TASK 10.1: Chuyển trạng thái, xử lý ngoại lệ và tồn kho.
  async updateStatus(orderId: number, nextStatus: OrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            select: {
              productId: true,
              qty: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      const currentStatus = order.status as OrderStatus;
      const allowed = this.allowedTransitions[currentStatus] ?? [];

      if (!allowed.includes(nextStatus)) {
        throw new BadRequestException(
          `Không thể chuyển trạng thái từ ${currentStatus} sang ${nextStatus}`,
        );
      }

      const changed = await tx.order.updateMany({
        where: {
          id: orderId,
          status: currentStatus,
        },
        data: {
          status: nextStatus,
        },
      });

      if (changed.count !== 1) {
        throw new BadRequestException(
          'Trạng thái đơn hàng đã thay đổi. Vui lòng thử lại',
        );
      }

      const releaseStock =
        currentStatus === 'PENDING' &&
        (nextStatus === 'PAYMENT_FAILED' || nextStatus === 'CANCELLED');

      const cancelPaidOrder =
        currentStatus === 'PAID' && nextStatus === 'CANCELLED';

      if (releaseStock || cancelPaidOrder) {
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

      if (
        currentStatus === 'PAYMENT_FAILED' &&
        nextStatus === 'PENDING'
      ) {
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

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    });
  }

  // TASK 9: Lấy toàn bộ lịch sử đơn hàng của người dùng hiện tại
  async findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // TASK 9: Xem chi tiết một đơn hàng cụ thể
  async findOne(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return order;
  }
}