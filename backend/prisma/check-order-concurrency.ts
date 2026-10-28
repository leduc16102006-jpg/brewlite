import 'reflect-metadata';
import 'dotenv/config';

import { PrismaService } from '../src/prisma/prisma.service';
import { OrdersService } from '../src/orders/orders.service';

const prisma = new PrismaService();
const ordersService = new OrdersService(prisma);

async function main() {
  const marker = `${Date.now()}_${process.pid}`;

  const userIds: number[] = [];
  let productId: number | undefined;
  let ingredientId: number | undefined;

  try {
    // 1. Tạo hai khách hàng giả lập
    for (let i = 1; i <= 2; i++) {
      const user = await prisma.user.create({
        data: {
          email: `task103_customer${i}_${marker}@example.invalid`,
          passwordHash: 'integration-test-only',
          fullName: `Task103 Customer ${i}`,
        },
      });

      userIds.push(user.id);
    }

    // 2. Tạo Product test
    const product = await prisma.product.create({
      data: {
        name: `__TASK103_CONCURRENT_${marker}`,
        price: 39000,
        stock: 0,
      },
    });

    productId = product.id;

    // 3. Tạo nguyên liệu có tồn kho 100g
    const ingredient = await prisma.ingredient.create({
      data: {
        name: `__TASK103_STOCK_${marker}`,
        unit: 'g',
        stock: 100,
        version: 0,
      },
    });

    ingredientId = ingredient.id;

    // 4. Mỗi ly dùng 20g nguyên liệu
    await prisma.recipeItem.create({
      data: {
        productId: product.id,
        ingredientId: ingredient.id,
        size: 'M',
        quantity: 20,
      },
    });

    console.log('=== BAN ĐẦU ===');
    console.log({
      stock: ingredient.stock,
      version: ingredient.version,
    });

    // 5. Hai khách cùng đặt 4 ly
    const results = await Promise.allSettled([
      ordersService.create(userIds[0], {
        items: [
          {
            productId: product.id,
            qty: 4,
            size: 'M',
          },
        ],
      }),

      ordersService.create(userIds[1], {
        items: [
          {
            productId: product.id,
            qty: 4,
            size: 'M',
          },
        ],
      }),
    ]);

    console.log('=== KẾT QUẢ ĐẶT HÀNG ===');

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(
          `Khách ${index + 1}: THÀNH CÔNG - Order ${result.value.id}`,
        );
      } else {
        const message =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);

        console.log(
          `Khách ${index + 1}: THẤT BẠI - ${message}`,
        );
      }
    });

    // 6. Đọc dữ liệu thật từ PostgreSQL
    const finalIngredient =
      await prisma.ingredient.findUniqueOrThrow({
        where: { id: ingredient.id },
      });

    const orders = await prisma.order.findMany({
      where: {
        userId: { in: userIds },
      },
      include: {
        items: true,
        ingredientUses: true,
      },
    });

    const finalProduct =
      await prisma.product.findUniqueOrThrow({
        where: { id: product.id },
      });

    const successCount = results.filter(
      (result) => result.status === 'fulfilled',
    ).length;

    console.log('=== DỮ LIỆU SAU KIỂM THỬ ===');
    console.log({
      successfulRequests: successCount,
      ordersCreated: orders.length,
      ingredientStock: finalIngredient.stock,
      ingredientVersion: finalIngredient.version,
      productStock: finalProduct.stock,
    });

    // 7. Kiểm tra tính nhất quán
    const validOrder =
      orders.length === 1 &&
      orders[0].status === 'PENDING' &&
      orders[0].ingredientsReserved === true &&
      orders[0].items.length === 1 &&
      orders[0].items[0].qty === 4 &&
      orders[0].ingredientUses.length === 1 &&
      orders[0].ingredientUses[0].ingredientId ===
        ingredient.id &&
      orders[0].ingredientUses[0].quantity === 80;

    if (
      successCount !== 1 ||
      !validOrder ||
      finalIngredient.stock !== 20 ||
      finalIngredient.version !== 1 ||
      finalProduct.stock !== 0
    ) {
      throw new Error('ORDER CONCURRENCY TEST FAILED');
    }

    console.log('ORDER CONCURRENCY TEST PASSED');
  } finally {
    // 8. Dọn dữ liệu test
    try {
      if (userIds.length > 0) {
        await prisma.order.deleteMany({
          where: {
            userId: { in: userIds },
          },
        });
      }

      if (productId !== undefined) {
        await prisma.recipeItem.deleteMany({
          where: { productId },
        });

        await prisma.product.deleteMany({
          where: { id: productId },
        });
      }

      if (ingredientId !== undefined) {
        await prisma.ingredient.deleteMany({
          where: { id: ingredientId },
        });
      }

      if (userIds.length > 0) {
        await prisma.user.deleteMany({
          where: {
            id: { in: userIds },
          },
        });
      }

      console.log('Đã dọn dữ liệu kiểm thử');
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
