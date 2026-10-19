// Import các thứ CẦN THIẾT ở đầu file
import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateOrderDto) {
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
        throw new NotFoundException('Một hoặc nhiều sản phẩm không tồn tại');
      }

      const productMap = new Map(
        products.map((p) => [p.id, p])
      );

      let total = 0;
      const orderItems = dto.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundException(`Sản phẩm không tồn tại`);
        }
        if (product.stock < item.qty) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" không đủ tồn kho`,
          );
        }
        const lineTotal = Number(product.price) * item.qty;
        total += lineTotal;
        return {
          productId: product.id,
          qty: item.qty,
          size: item.size,
          lineTotal,
        };
      });

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
          throw new BadRequestException('Tồn kho đã thay đổi. Vui lòng thử lại');
        }
      }

      return tx.order.create({
        data: {
          userId,
          total,
          status: 'PENDING',
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });
    });
  }


async findMyOrders(userId: number) {
  return this.prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

  async findOne(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Không tìm thấy đơn hàng',
      );
    }

    return order;
  }
}