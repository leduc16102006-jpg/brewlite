import dotenv from 'dotenv';
dotenv.config({ quiet: true }); // Tắt thông báo injected env

import { PrismaClient } from '@prisma/client';
import { OrdersService } from '../src/orders/orders.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Task 10.3 - Kiểm soát tồn kho khi đặt đồng thời (Optimistic Locking)', () => {
  const prisma = new PrismaClient();
  const prismaService = new PrismaService();
  const ordersService = new OrdersService(prismaService);

  it('đặt đồng thời 5 luồng khi kho chỉ còn 1: chỉ 1 đơn thành công, tồn kho không bị âm', async () => {
    // 1. Lấy user hợp lệ
    let testUser = await prisma.user.findFirst();
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: `concurrency_user_${Date.now()}@example.com`,
          fullName: 'Concurrent Tester',
          passwordHash: 'dummy_hash_for_test',
        },
      });
    }

    // 2. Tạo món test với stock = 1, version = 0
    const lastProduct = await prisma.product.findFirst({ orderBy: { id: 'desc' } });
    const safeProductId = (lastProduct?.id ?? 0) + 1000 + Math.floor(Math.random() * 500);

    const testProduct = await prisma.product.create({
      data: {
        id: safeProductId,
        name: `Cà phê Test Concurrency #${safeProductId}`,
        price: 35000,
        stock: 1, // KHO CHỈ CÒN 1 LY
        version: 0,
      },
    });

    console.log(`\n================ KẾT QUẢ KIỂM THỬ CONCURRENCY ================`);
    console.log(`[BAN ĐẦU] Sản phẩm: ${testProduct.name} | Tồn kho ban đầu: ${testProduct.stock} | Version: ${testProduct.version}`);

    // 3. Giả lập 5 khách hàng bấm Đặt hàng CÙNG MỘT LÚC
    const orderPayload = { items: [{ productId: testProduct.id, qty: 1 }] };
    const results = await Promise.allSettled([
      ordersService.create(testUser.id, orderPayload),
      ordersService.create(testUser.id, orderPayload),
      ordersService.create(testUser.id, orderPayload),
      ordersService.create(testUser.id, orderPayload),
      ordersService.create(testUser.id, orderPayload),
    ]);

    const successful = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    const updatedProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });

    console.log(`[KẾT QUẢ] Số request gửi đồng thời: 5`);
    console.log(`[KẾT QUẢ] Số đơn tạo THÀNH CÔNG: ${successful.length}`);
    console.log(`[KẾT QUẢ] Số đơn bị TỪ CHỐI (Optimistic Lock chặn): ${failed.length}`);
    console.log(`[CSDL] Tồn kho sau cùng: ${updatedProduct?.stock} (Tuyệt đối không bị âm)`);
    console.log(`[CSDL] Version sau cùng: ${updatedProduct?.version} (Đã tăng từ 0 lên 1)`);
    console.log(`===============================================================\n`);

    // Tiêu chí chấm điểm:
    expect(successful.length).toBe(1);
    expect(failed.length).toBe(4);
    expect(updatedProduct?.stock).toBe(0);
    expect(updatedProduct?.version).toBe(1);

    // Dọn dẹp dữ liệu test
    await prisma.orderItem.deleteMany({ where: { productId: testProduct.id } });
    await prisma.product.delete({ where: { id: testProduct.id } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await prismaService.$disconnect();
  });
});