import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy toàn bộ danh sách món từ CSDL thật (có kèm stock)
  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { id: 'asc' }, // Sắp xếp theo ID tăng dần
    });
  }

  // Lấy chi tiết 1 món theo ID từ CSDL thật
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID = ${id}`);
    }

    return product;
  }
}