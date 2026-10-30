import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { PrismaService } from '../src/prisma/prisma.service';
import { OrdersService } from '../src/orders/orders.service';

describe(
  'Task 10.3 - Ingredient Inventory Concurrency',
  () => {
    const prisma = new PrismaService();
    const ordersService = new OrdersService(prisma);

    afterAll(async () => {
      await prisma.$disconnect();
    });

    it(
      '5 request cùng đặt hàng: chỉ 1 đơn thành công',
      async () => {
        const marker = `${Date.now()}_${process.pid}`;

        let userId: number | null = null;
        let productId: number | null = null;
        let ingredientId: number | null = null;

        try {
          // 1. Tạo user riêng cho bài kiểm thử
          const user = await prisma.user.create({
            data: {
              email: `task103_5requests_${marker}@example.invalid`,
              fullName: 'Task 10.3 Concurrency Tester',
              passwordHash: 'test_only',
            },
          });

          userId = user.id;

        // Đồng bộ sequence: tách riêng từng lệnh để thỏa mãn Prepared Statement của Postgres
          await prisma.$executeRawUnsafe(
            `SELECT setval(pg_get_serial_sequence('"Product"', 'id'), COALESCE((SELECT MAX(id) FROM "Product"), 1))`
          );
          await prisma.$executeRawUnsafe(
            `SELECT setval(pg_get_serial_sequence('"Ingredient"', 'id'), COALESCE((SELECT MAX(id) FROM "Ingredient"), 1))`
          );

          // 2. Tạo sản phẩm, không dùng Product.stock
          const product = await prisma.product.create({
            data: {
              name: `__TASK103_PRODUCT_${marker}`,
              price: 35000,
              stock: 0,
              version: 0,
            },
          });

          productId = product.id;

          // 3. Kho nguyên liệu chỉ có 100g
          const ingredient = await prisma.ingredient.create({
            data: {
              name: `__TASK103_INGREDIENT_${marker}`,
              unit: 'g',
              stock: 100,
              version: 0,
            },
          });

          ingredientId = ingredient.id;

          // 4. Một ly size M cần 20g
          await prisma.recipeItem.create({
            data: {
              productId: product.id,
              ingredientId: ingredient.id,
              size: 'M',
              quantity: 20,
            },
          });

          console.log('=== TỒN KHO BAN ĐẦU ===');
          console.log({
            stock: ingredient.stock,
            version: ingredient.version,
          });

          // 5. Mỗi request đặt 4 ly = 80g
          const payload = {
            items: [
              {
                productId: product.id,
                qty: 4,
                size: 'M',
              },
            ],
          };

          // Gửi 5 yêu cầu gần như đồng thời
          const results = await Promise.allSettled(
            Array.from({ length: 5 }, () =>
              ordersService.create(user.id, payload),
            ),
          );

          const successful = results.filter(
            (result) => result.status === 'fulfilled',
          );

          const failed = results.filter(
            (result) => result.status === 'rejected',
          );

          console.log('=== KẾT QUẢ 5 REQUEST ===');

          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              console.log(
                `Request ${index + 1}: THÀNH CÔNG`,
              );
            } else {
              const message =
                result.reason instanceof Error
                  ? result.reason.message
                  : String(result.reason);

              console.log(
                `Request ${index + 1}: THẤT BẠI - ${message}`,
              );
            }
          });

          // 6. Đọc tồn kho và đơn hàng thật
          const finalIngredient =
            await prisma.ingredient.findUniqueOrThrow({
              where: { id: ingredient.id },
            });

          const finalProduct =
            await prisma.product.findUniqueOrThrow({
              where: { id: product.id },
            });

          const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
              items: true,
              ingredientUses: true,
            },
          });

          console.log('=== DỮ LIỆU POSTGRESQL ===');
          console.log({
            successfulRequests: successful.length,
            failedRequests: failed.length,
            ordersCreated: orders.length,
            ingredientStock: finalIngredient.stock,
            ingredientVersion: finalIngredient.version,
            productStock: finalProduct.stock,
          });

          // 7. Kiểm tra kết quả
          expect(successful.length).toBe(1);
          expect(failed.length).toBe(4);

          expect(orders).toHaveLength(1);
          expect(orders[0].status).toBe('PENDING');
          expect(orders[0].ingredientsReserved).toBe(true);

          expect(orders[0].items).toHaveLength(1);
          expect(orders[0].items[0].qty).toBe(4);

          expect(orders[0].ingredientUses).toHaveLength(1);
          expect(orders[0].ingredientUses[0].quantity).toBe(80);
          expect(
            orders[0].ingredientUses[0].ingredientId,
          ).toBe(ingredient.id);

          expect(finalIngredient.stock).toBe(20);
          expect(finalIngredient.version).toBe(1);
          expect(finalProduct.stock).toBe(0);

          console.log('ORDER CONCURRENCY TEST PASSED');
        } finally {
          // 8. Dọn dữ liệu riêng của test
          if (userId !== null) {
            await prisma.order.deleteMany({
              where: { userId },
            });
          }

          if (productId !== null) {
            await prisma.recipeItem.deleteMany({
              where: { productId },
            });

            await prisma.product.deleteMany({
              where: { id: productId },
            });
          }

          if (ingredientId !== null) {
            await prisma.ingredient.deleteMany({
              where: { id: ingredientId },
            });
          }

          if (userId !== null) {
            await prisma.user.deleteMany({
              where: { id: userId },
            });
          }

          console.log('Đã dọn dữ liệu kiểm thử');
        }
      },
      90000,
    );
  },
);