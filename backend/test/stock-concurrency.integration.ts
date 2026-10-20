import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../src/prisma/prisma.service';
import { OrdersService } from '../src/orders/orders.service';

const prisma = new PrismaService();
const ordersService = new OrdersService(prisma);

let testUserId: number | undefined;
let testProductId: number | undefined;

async function main() {
  try {
    // Tạo dữ liệu thử nghiệm độc lập.
    const user = await prisma.user.create({
      data: {
        email: `task103-${randomUUID()}@example.test`,
        passwordHash: 'TEST_ONLY',
        fullName: 'Task 10.3 Integration Test',
      },
    });
    testUserId = user.id;

    const product = await prisma.product.create({
      data: {
        name: `Stock Test ${randomUUID()}`,
        price: 39000,
        stock: 1,
        version: 0,
      },
    });
    testProductId = product.id;

    const dto = {
      items: [
        {
          productId: product.id,
          qty: 1,
          size: 'M',
        },
      ],
    };

    console.log('Starting concurrent order test...');
    console.log('Initial stock: 1, version: 0');

    // Cả hai yêu cầu bắt đầu mà không chờ nhau.
    const results = await Promise.allSettled([
      ordersService.create(user.id, dto),
      ordersService.create(user.id, dto),
    ]);

    const successful = results.filter(
      (result) => result.status === 'fulfilled',
    );
    const rejected = results.filter(
      (result) => result.status === 'rejected',
    );

    for (const result of rejected) {
      if (result.status === 'rejected') {
        console.log('Rejected request:', result.reason?.message);
      }
    }

    const finalProduct = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });

    const createdOrders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
    });

    console.log('Successful requests:', successful.length);
    console.log('Rejected requests:', rejected.length);
    console.log('Created orders:', createdOrders.length);
    console.log('Final stock:', finalProduct.stock);
    console.log('Final version:', finalProduct.version);

    assert.equal(successful.length, 1);
    assert.equal(rejected.length, 1);
    const failedRequest = rejected[0];

    assert.ok(
    failedRequest && failedRequest.status === 'rejected',
    );

    assert.equal(
    failedRequest.reason?.getStatus?.(),
    400,
    `Expected a stock conflict (HTTP 400), but received: ${failedRequest.reason?.message}`,
    );

    assert.equal(createdOrders.length, 1);
    assert.equal(createdOrders[0].items.length, 1);
    assert.equal(createdOrders[0].items[0].qty, 1);
    assert.equal(finalProduct.stock, 0);
    assert.equal(finalProduct.version, 1);
    // Task 10.3: Test Optimistic Locking trực tiếp.
    // Sử dụng lại sản phẩm test, không ảnh hưởng sản phẩm thật.
    await prisma.product.update({
        where: { id: product.id },
        data: { stock: 1, version: 0 },
    });

    const competeForStock = () =>
    prisma.product.updateMany({
        where: {
            id: product.id,
            version: 0,
            stock: { gte: 1 },
        },
        data: {
            stock: { decrement: 1 },
            version: { increment: 1 },
        },
    });

    const [resultA, resultB] = await Promise.all([
    competeForStock(),
    competeForStock(),
    ]);

    const finalVersionCheck =
    await prisma.product.findUniqueOrThrow({
        where: { id: product.id },
    });

    console.log(
    'Concurrent version update counts:',
    resultA.count,
    resultB.count,
    );

    assert.equal(resultA.count + resultB.count, 1);
    assert.equal(finalVersionCheck.stock, 0);
    assert.equal(finalVersionCheck.version, 1);

    console.log('PASS: Optimistic Locking verified!');
    console.log('PASS: No overselling detected!');
  } finally {
    // Dọn dẹp dữ liệu test, kể cả khi assertion thất bại.
    try {
      if (testUserId !== undefined) {
        await prisma.order.deleteMany({
          where: { userId: testUserId },
        });
      }

      if (testProductId !== undefined) {
        await prisma.product.delete({
          where: { id: testProductId },
        });
      }

      if (testUserId !== undefined) {
        await prisma.user.delete({
          where: { id: testUserId },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch((error) => {
  console.error('FAIL: Stock concurrency test:', error);
  process.exitCode = 1;
});