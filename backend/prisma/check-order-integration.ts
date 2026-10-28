import 'reflect-metadata';
import 'dotenv/config';

import { PrismaService } from '../src/prisma/prisma.service';
import { OrdersService } from '../src/orders/orders.service';
import { releaseOrderIngredients } from '../src/orders/ingredient-stock';

const prisma = new PrismaService();
const ordersService = new OrdersService(prisma);

async function main() {
  const marker = `${Date.now()}_${process.pid}`;

  let userId: number | undefined;
  let productId: number | undefined;
  let ingredientId: number | undefined;
  let orderId: number | undefined;

  try {
    // 1. Tạo dữ liệu riêng cho Integration Test
    const user = await prisma.user.create({
      data: {
        email: `task103_${marker}@example.invalid`,
        passwordHash: 'integration-test-only',
        fullName: 'Task 10.3 Test User',
      },
    });
    userId = user.id;

    const product = await prisma.product.create({
      data: {
        name: `__TASK103_PRODUCT_${marker}`,
        price: 39000,
        stock: 0,
      },
    });
    productId = product.id;

    const ingredient = await prisma.ingredient.create({
      data: {
        name: `__TASK103_INGREDIENT_${marker}`,
        unit: 'g',
        stock: 100,
        version: 0,
      },
    });
    ingredientId = ingredient.id;

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
      ingredientStock: 100,
      productStock: 0,
    });

    // 2. Tạo đơn 2 ly, mỗi ly cần 20g
    const order = await ordersService.create(user.id, {
      items: [
        {
          productId: product.id,
          qty: 2,
          size: 'M',
        },
      ],
    });

    orderId = order.id;

    // 3. Kiểm tra sau khi tạo Order
    const afterCreate =
      await prisma.ingredient.findUniqueOrThrow({
        where: { id: ingredient.id },
      });

    const savedOrder =
      await prisma.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { ingredientUses: true },
      });

    const savedProduct =
      await prisma.product.findUniqueOrThrow({
        where: { id: product.id },
      });

    console.log('=== SAU KHI TẠO ORDER ===');
    console.log({
      orderId: order.id,
      status: savedOrder.status,
      ingredientsReserved: savedOrder.ingredientsReserved,
      ingredientStock: afterCreate.stock,
      ingredientVersion: afterCreate.version,
      productStock: savedProduct.stock,
      ingredientUses: savedOrder.ingredientUses,
    });

    if (
      afterCreate.stock !== 60 ||
      afterCreate.version !== 1 ||
      savedProduct.stock !== 0 ||
      savedOrder.status !== 'PENDING' ||
      !savedOrder.ingredientsReserved ||
      savedOrder.ingredientUses.length !== 1 ||
      savedOrder.ingredientUses[0].quantity !== 40
    ) {
      throw new Error('ORDER CREATE TEST FAILED');
    }

    console.log('ORDER CREATE TEST PASSED');

    // 4. Hủy đơn hàng
    await ordersService.updateStatus(
      order.id,
      'CANCELLED',
    );

    const afterCancel =
      await prisma.ingredient.findUniqueOrThrow({
        where: { id: ingredient.id },
      });

    const cancelledOrder =
      await prisma.order.findUniqueOrThrow({
        where: { id: order.id },
      });

    console.log('=== SAU KHI HỦY ORDER ===');
    console.log({
      status: cancelledOrder.status,
      ingredientsReserved:
        cancelledOrder.ingredientsReserved,
      ingredientStock: afterCancel.stock,
      ingredientVersion: afterCancel.version,
    });

    if (
      cancelledOrder.status !== 'CANCELLED' ||
      cancelledOrder.ingredientsReserved !== false ||
      afterCancel.stock !== 100 ||
      afterCancel.version !== 2
    ) {
      throw new Error('ORDER CANCEL TEST FAILED');
    }

    console.log('ORDER CANCEL TEST PASSED');

    // 5. Kiểm tra không hoàn kho thêm lần nữa
    await prisma.$transaction((tx) =>
      releaseOrderIngredients(tx, order.id),
    );

    const afterRepeat =
      await prisma.ingredient.findUniqueOrThrow({
        where: { id: ingredient.id },
      });

    if (
      afterRepeat.stock !== 100 ||
      afterRepeat.version !== 2
    ) {
      throw new Error('DOUBLE RELEASE TEST FAILED');
    }

    console.log('DOUBLE RELEASE TEST PASSED');
    console.log('ORDER INTEGRATION TEST PASSED');
  } finally {
    // Dọn dữ liệu riêng của Integration Test
    try {
      if (orderId !== undefined) {
        await prisma.order.deleteMany({
          where: { id: orderId },
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

      if (userId !== undefined) {
        await prisma.user.deleteMany({
          where: { id: userId },
        });
      }

      console.log('Đã dọn dữ liệu Integration Test');
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
