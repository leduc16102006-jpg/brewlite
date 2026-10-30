import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import {
  reserveIngredients,
  IngredientRequirement,
} from '../src/orders/ingredient-stock';

const prisma = new PrismaClient();

async function main() {
  // Tạo nguyên liệu riêng cho bài kiểm thử
  const testName =
    `__TASK103_TEST_${Date.now()}_${process.pid}`;

  let testIngredientId: number | null = null;

  try {
    const ingredient = await prisma.ingredient.create({
      data: {
        name: testName,
        unit: 'g',
        stock: 100,
        version: 0,
      },
    });

    testIngredientId = ingredient.id;

    console.log('=== TỒN KHO BAN ĐẦU ===');
    console.log({
      stock: ingredient.stock,
      version: ingredient.version,
    });

    // Mỗi request cần 80 g nguyên liệu
    const requirements: IngredientRequirement[] = [
      {
        ingredientId: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        quantity: 80,
      },
    ];

    // Hai Transaction chạy gần như đồng thời
    const requests = [1, 2].map((requestId) =>
      prisma.$transaction(
        async (tx) => {
          await reserveIngredients(tx, requirements);
          return requestId;
        },
        {
          maxWait: 10000,
          timeout: 20000,
        },
      ),
    );

    // Chờ cả hai request kết thúc
    const results = await Promise.allSettled(requests);

    console.log('=== KẾT QUẢ HAI REQUEST ===');

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(
          `Request ${index + 1}: THÀNH CÔNG`,
        );
      } else {
        console.log(
          `Request ${index + 1}: THẤT BẠI`,
        );

        const reason =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);

        console.log('Lý do:', reason);
      }
    });

    // Đọc kết quả thực tế từ PostgreSQL
    const finalIngredient =
      await prisma.ingredient.findUniqueOrThrow({
        where: { id: ingredient.id },
      });

    const successCount = results.filter(
      (result) => result.status === 'fulfilled',
    ).length;

    console.log('=== TỒN KHO SAU TEST ===');
    console.log({
      stock: finalIngredient.stock,
      version: finalIngredient.version,
      successfulRequests: successCount,
    });

    // Kiểm tra tính đúng đắn
    if (
      successCount !== 1 ||
      finalIngredient.stock !== 20 ||
      finalIngredient.version !== 1
    ) {
      throw new Error(
        'CONCURRENCY TEST FAILED',
      );
    }

    console.log('CONCURRENCY TEST PASSED');
  } finally {
    // Xóa nguyên liệu chỉ dùng cho bài test
    if (testIngredientId !== null) {
      await prisma.ingredient.delete({
        where: { id: testIngredientId },
      });
      console.log('Đã dọn dữ liệu kiểm thử');
    }

    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
