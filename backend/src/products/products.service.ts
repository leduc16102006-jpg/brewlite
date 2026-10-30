import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Các size hiện được hỗ trợ trong BrewLite
type DrinkSize = 'DEFAULT' | 'S' | 'M' | 'L';

// Kiểu Product bao gồm công thức và nguyên liệu
type ProductWithRecipes = Prisma.ProductGetPayload<{
  include: {
    recipes: {
      include: {
        ingredient: true;
      };
    };
  };
}>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // Tính số ly tối đa có thể pha theo một size
  private calculateAvailable(
    recipes: ProductWithRecipes['recipes'],
    size: DrinkSize,
  ): number {
    const sizeRecipes = recipes.filter(
      (recipe) => recipe.size === size,
    );

    // Chưa có công thức thì không cho hiển thị còn hàng
    if (sizeRecipes.length === 0) {
      return 0;
    }

    let available = Number.MAX_SAFE_INTEGER;

    for (const recipe of sizeRecipes) {
      // Dữ liệu công thức không hợp lệ
      if (recipe.quantity <= 0) {
        return 0;
      }

      const ingredientStock = Math.max(
        0,
        recipe.ingredient.stock,
      );

      // Số ly tối đa theo từng nguyên liệu
      const possibleCups = Math.floor(
        ingredientStock / recipe.quantity,
      );

      // Nguyên liệu khan hiếm nhất quyết định số ly
      available = Math.min(available, possibleCups);
    }

    return available;
  }

  // Chuyển Product thành dữ liệu phục vụ API
  private withAvailability(product: ProductWithRecipes) {
    const { recipes, ...productData } = product;

    const availableBySize = {
      DEFAULT: this.calculateAvailable(recipes, 'DEFAULT'),
      S: this.calculateAvailable(recipes, 'S'),
      M: this.calculateAvailable(recipes, 'M'),
      L: this.calculateAvailable(recipes, 'L'),
    };

    return {
      ...productData,

      // Ghi đè stock trong RESPONSE, không cập nhật DB
      stock: availableBySize.DEFAULT,

      // Số ly khả dụng độc lập theo từng size
      availableBySize,
    };
  }

  // GET /products
  async findAll() {
    const products = await this.prisma.product.findMany({
      orderBy: { id: 'asc' },
      include: {
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return products.map((product) =>
      this.withAvailability(product),
    );
  }

  // GET /products/:id
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm có ID = ${id}`,
      );
    }

    return this.withAvailability(product);
  }
}