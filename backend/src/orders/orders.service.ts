// Import các thứ CẦN THIẾT ở đầu file
import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateOrderDto) {
  // 1. Chặn việc trùng lặp cùng một món và cùng một kích cỡ
  const itemKeys = dto.items.map(
    (item) => `${item.productId}_${item.size || 'DEFAULT'}`,
  );
  if (new Set(itemKeys).size !== itemKeys.length) {
    throw new BadRequestException(
      'Sản phẩm cùng kích cỡ không được lặp lại trong đơn hàng, vui lòng tăng số lượng',
    );
  }

  // 2. Lấy danh sách productId duy nhất để truy vấn CSDL
  const uniqueProductIds = [...new Set(dto.items.map((item) => item.productId))];

  return this.prisma.$transaction(async (tx) => {
    // Xác thực người dùng
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    // Lấy thông tin các sản phẩm
    const products = await tx.product.findMany({
      where: { id: { in: uniqueProductIds } },
    });

    if (products.length !== uniqueProductIds.length) {
      throw new NotFoundException('Một hoặc nhiều sản phẩm không tồn tại');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Gom tổng số lượng yêu cầu theo từng productId để kiểm tra tồn kho chính xác
    const productQtyMap = new Map<number, number>();
    for (const item of dto.items) {
      const currentQty = productQtyMap.get(item.productId) || 0;
      productQtyMap.set(item.productId, currentQty + item.qty);
    }

    let total = 0;
    const orderItems = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }

      const totalRequiredQty = productQtyMap.get(item.productId) || 0;
      if (product.stock < totalRequiredQty) {
        throw new BadRequestException(
          `Sản phẩm "${product.name}" không đủ tồn kho`,
        );
      }

      const lineTotal = Number(product.price) * item.qty;
      total += lineTotal;

      return {
        productId: product.id,
        qty: item.qty,
        size: item.size || null,
        lineTotal,
      };
    });

    // Cập nhật tồn kho theo tổng số lượng từng sản phẩm
    for (const [productId, qtyToDeduct] of productQtyMap.entries()) {
      const result = await tx.product.updateMany({
        where: {
          id: productId,
          stock: { gte: qtyToDeduct },
        },
        data: {
          stock: { decrement: qtyToDeduct },
        },
      });
      if (result.count !== 1) {
        throw new BadRequestException('Tồn kho đã thay đổi. Vui lòng thử lại');
      }
    }

    // Tạo đơn hàng trạng thái PENDING
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
}