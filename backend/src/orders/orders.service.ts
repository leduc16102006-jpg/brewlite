
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

  // TASK 6: Tạo đơn hàng và trừ tồn kho.
  async create(userId: number, dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Đơn hàng phải có ít nhất một sản phẩm');
    }

    const productIds = dto.items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException(
        'Mỗi sản phẩm chỉ được xuất hiện một lần trong đơn hàng',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }

      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException(
          'Một hoặc nhiều sản phẩm không tồn tại',
        );
      }

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

      let total = 0;

      const orderItems = dto.items.map((item) => {
        const product = productMap.get(item.productId)!;

        if (product.stock < item.qty) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" không đủ tồn kho`,
          );
        }

        const lineTotal = product.price * item.qty;
        total += lineTotal;

        return {
          productId: product.id,
          qty: item.qty,
          size: item.size,
          lineTotal,
        };
      });

      // Cập nhật kho có điều kiện để tránh bán vượt tồn kho.
      for (const item of dto.items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.qty },
          },
          data: {
            stock: { decrement: item.qty },
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
          total,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    });
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

      // Chỉ một request được chuyển từ trạng thái cũ.
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

      // PAYMENT_FAILED và CANCELLED từ PENDING:
      // hoàn kho vì Task 6 đã trừ kho khi tạo đơn.
      const releaseStock =
        currentStatus === 'PENDING' &&
        (nextStatus === 'PAYMENT_FAILED' ||
          nextStatus === 'CANCELLED');

      // PAID -> CANCELLED: hoàn kho theo sơ đồ.
      // Quy trình hoàn tiền cổng thanh toán phải được xử lý riêng.
      const cancelPaidOrder =
        currentStatus === 'PAID' && nextStatus === 'CANCELLED';

      if (releaseStock || cancelPaidOrder) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.qty },
            },
          });
        }
      }

      // PAYMENT_FAILED -> PENDING: thử thanh toán lại.
      // Giữ kho lần nữa trước khi cho phép thử lại.
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
}
