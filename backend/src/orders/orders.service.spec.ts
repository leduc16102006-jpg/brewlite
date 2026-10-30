import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { releaseOrderIngredients } from './ingredient-stock';

describe('OrdersService - Task 10.1', () => {
  let service: OrdersService;

  const tx = {
    order: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    product: {
      update: jest.fn(),
      updateMany: jest.fn(),
    },

    // TASK 10.3: Mock bảng Ingredient
    ingredient: {
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const prisma = {
    $transaction: jest.fn((callback: (transaction: typeof tx) => unknown) =>
      callback(tx),
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Khởi tạo trực tiếp Service với Prisma Mock thuần Unit Test
    service = new OrdersService(prisma as unknown as PrismaService);
  });

  it.each([
    ['PENDING', 'PAID'],
    ['PAID', 'PREPARING'],
    ['PREPARING', 'READY'],
    ['READY', 'COMPLETED'],
  ])('cho phép %s -> %s', async (from, to) => {
    tx.order.findUnique
      .mockResolvedValueOnce({
        id: 1,
        status: from,
        items: [],
      })
      .mockResolvedValueOnce({
        id: 1,
        status: to,
        items: [],
      });

    tx.order.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.updateStatus(1, to as never);

    expect(result?.status).toBe(to);
  });

  it.each([
    ['PENDING', 'PAYMENT_FAILED'],
    ['PENDING', 'CANCELLED'],
  ])('hoàn kho khi %s -> %s', async (from, to) => {
  tx.order.findUnique
    // Lần 1: OrdersService đọc Order
    .mockResolvedValueOnce({
      id: 1,
      status: from,
      items: [{ productId: 1, qty: 2 }],
    })

    // Lần 2: releaseOrderIngredients đọc nguyên liệu
    .mockResolvedValueOnce({
      id: 1,
      ingredientsReserved: false,
      ingredientUses: [],
    })

    // Lần 3: OrdersService trả về Order đã cập nhật
    .mockResolvedValueOnce({
      id: 1,
      status: to,
      items: [],
    });

    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.product.update.mockResolvedValue({ id: 1 });

    await service.updateStatus(1, to as never);

    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        stock: { increment: 2 },
        version: { increment: 1 },
      },
    });
  });

  it('cho phép PAYMENT_FAILED -> PENDING khi đủ kho', async () => {

  tx.order.findUnique
    .mockResolvedValueOnce({
      id: 1,
      status: 'PAYMENT_FAILED',
      items: [{ productId: 1, qty: 2 }],
    })

    // Đơn cũ chưa có công thức nguyên liệu
    .mockResolvedValueOnce({
      id: 1,
      ingredientsReserved: false,
      ingredientUses: [],
    })

    .mockResolvedValueOnce({
      id: 1,
      status: 'PENDING',
      items: [],
    });

    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.product.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.updateStatus(1, 'PENDING');

    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: { id: 1, stock: { gte: 2 } },
      data: { stock: { decrement: 2 }, version : { increment: 1 } },
    });
    expect(result?.status).toBe('PENDING');
  });

  it('từ chối thử lại nếu không đủ kho', async () => {
  tx.order.findUnique.mockResolvedValue({
    id: 1,
    status: 'PAYMENT_FAILED',
    items: [{ productId: 1, qty: 2 }],

    // Dữ liệu cần cho hàm reserveOrderIngredients
    ingredientsReserved: false,
    ingredientUses: [],
  });

    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.product.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateStatus(1, 'PENDING'),
    ).rejects.toThrow(BadRequestException);
  });

  it.each([
    ['PENDING', 'COMPLETED'],
    ['CANCELLED', 'PAID'],
    ['PAYMENT_FAILED', 'PAID'],
    ['COMPLETED', 'CANCELLED'],
  ])('từ chối %s -> %s', async (from, to) => {
    tx.order.findUnique.mockResolvedValue({
      id: 1,
      status: from,
      items: [],
    });

    await expect(
      service.updateStatus(1, to as never),
    ).rejects.toThrow(BadRequestException);

    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });

  it('từ chối đơn hàng không tồn tại', async () => {
    tx.order.findUnique.mockResolvedValue(null);

    await expect(
      service.updateStatus(999, 'PAID'),
    ).rejects.toThrow(NotFoundException);
  });

  it('từ chối khi trạng thái đã thay đổi đồng thời', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 1,
      status: 'PAID',
      items: [],
    });

    tx.order.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateStatus(1, 'PREPARING'),
    ).rejects.toThrow(BadRequestException);
  });


  it(
    'TASK 10.3: Hủy đơn mới phải hoàn nguyên liệu',
    async () => {
      // Lần 1: OrdersService đọc đơn hàng
      tx.order.findUnique
        .mockResolvedValueOnce({
          id: 101,
          status: 'PENDING',
          items: [
            { productId: 2, qty: 2 },
          ],
        })

        // Lần 2: releaseOrderIngredients đọc nguyên liệu
        .mockResolvedValueOnce({
          id: 101,
          ingredientsReserved: true,
          ingredientUses: [
            {
              ingredientId: 1,
              quantity: 36,
            },
            {
              ingredientId: 2,
              quantity: 300,
            },
          ],
        })

        // Lần 3: Trả về đơn hàng sau khi hủy
        .mockResolvedValueOnce({
          id: 101,
          status: 'CANCELLED',
          ingredientsReserved: false,
          items: [],
        });

      tx.order.updateMany.mockResolvedValue({
        count: 1,
      });

      tx.ingredient.update.mockResolvedValue({
        id: 1,
      });

      // Thực hiện hủy đơn
      const result = await service.updateStatus(
        101,
        'CANCELLED',
      );

      // 1. Trạng thái chuyển thành CANCELLED
      expect(result?.status).toBe('CANCELLED');

      // 2. Đánh dấu đã hoàn nguyên liệu
      expect(tx.order.updateMany).toHaveBeenCalledWith({
        where: {
          id: 101,
          ingredientsReserved: true,
        },
        data: {
          ingredientsReserved: false,
        },
      });

      // 3. Hoàn 36g bột cà phê
      expect(tx.ingredient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          stock: { increment: 36 },
          version: { increment: 1 },
        },
      });

      // 4. Hoàn 300ml sữa tươi
      expect(tx.ingredient.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          stock: { increment: 300 },
          version: { increment: 1 },
        },
      });

      // 5. Phải hoàn đúng 2 nguyên liệu
      expect(tx.ingredient.update).toHaveBeenCalledTimes(2);

      // 6. Đơn mới không hoàn kho Product.stock
      expect(tx.product.update).not.toHaveBeenCalled();
    },
  );


  it(
    'TASK 10.3: Thanh toán lại phải giữ nguyên liệu',
    async () => {
      tx.order.findUnique
        // Lần 1: Đọc Order trước khi cập nhật trạng thái
        .mockResolvedValueOnce({
          id: 102,
          status: 'PAYMENT_FAILED',
          items: [{ productId: 2, qty: 2 }],
        })

        // Lần 2: reserveOrderIngredients đọc dữ liệu
        .mockResolvedValueOnce({
          id: 102,
          ingredientsReserved: false,
          ingredientUses: [
            {
              ingredientId: 1,
              quantity: 36,
              ingredient: {
                id: 1,
                name: 'Bột cà phê',
                unit: 'g',
              },
            },
            {
              ingredientId: 2,
              quantity: 300,
              ingredient: {
                id: 2,
                name: 'Sữa tươi',
                unit: 'ml',
              },
            },
          ],
        })

        // Lần 3: Trả về Order sau khi cập nhật
        .mockResolvedValueOnce({
          id: 102,
          status: 'PENDING',
          ingredientsReserved: true,
          items: [],
        });

      // Mock tồn kho nguyên liệu hiện tại
      tx.ingredient.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Bột cà phê',
          unit: 'g',
          stock: 5000,
          version: 0,
        },
        {
          id: 2,
          name: 'Sữa tươi',
          unit: 'ml',
          stock: 10000,
          version: 0,
        },
      ]);

      // Giả lập cập nhật thành công
      tx.order.updateMany.mockResolvedValue({
        count: 1,
      });

      tx.ingredient.updateMany.mockResolvedValue({
        count: 1,
      });

      // Thực hiện chuyển trạng thái
      const result = await service.updateStatus(
        102,
        'PENDING',
      );

      // 1. Order chuyển thành PENDING
      expect(result?.status).toBe('PENDING');

      // 2. Giữ lại 36 g bột cà phê
      expect(tx.ingredient.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          version: 0,
          stock: { gte: 36 },
        },
        data: {
          stock: { decrement: 36 },
          version: { increment: 1 },
        },
      });

      // 3. Giữ lại 300 ml sữa tươi
      expect(tx.ingredient.updateMany).toHaveBeenCalledWith({
        where: {
          id: 2,
          version: 0,
          stock: { gte: 300 },
        },
        data: {
          stock: { decrement: 300 },
          version: { increment: 1 },
        },
      });

      // 4. Phải trừ đúng hai nguyên liệu
      expect(tx.ingredient.updateMany).toHaveBeenCalledTimes(2);

      // 5. Đánh dấu nguyên liệu đã được giữ
      expect(tx.order.updateMany).toHaveBeenCalledWith({
        where: {
          id: 102,
          ingredientsReserved: false,
        },
        data: {
          ingredientsReserved: true,
        },
      });

      // 6. Không sử dụng kho Product cũ
      expect(tx.product.updateMany).not.toHaveBeenCalled();
    },
  );

  it(
    'TASK 10.3: Từ chối thanh toán lại nếu thiếu nguyên liệu',
    async () => {
      tx.order.findUnique
        // Lần 1: OrdersService đọc Order
        .mockResolvedValueOnce({
          id: 103,
          status: 'PAYMENT_FAILED',
          items: [{ productId: 2, qty: 2 }],
        })

        // Lần 2: reserveOrderIngredients đọc OrderIngredient
        .mockResolvedValueOnce({
          id: 103,
          ingredientsReserved: false,
          ingredientUses: [
            {
              ingredientId: 1,
              quantity: 36,
              ingredient: {
                id: 1,
                name: 'Bột cà phê',
                unit: 'g',
              },
            },
            {
              ingredientId: 2,
              quantity: 300,
              ingredient: {
                id: 2,
                name: 'Sữa tươi',
                unit: 'ml',
              },
            },
          ],
        });

      // Kho chỉ còn 20g cà phê, không đủ 36g
      tx.ingredient.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Bột cà phê',
          unit: 'g',
          stock: 20,
          version: 0,
        },
        {
          id: 2,
          name: 'Sữa tươi',
          unit: 'ml',
          stock: 10000,
          version: 0,
        },
      ]);

      tx.order.updateMany.mockResolvedValue({
        count: 1,
      });

      // Phải từ chối chuyển trạng thái
      await expect(
        service.updateStatus(103, 'PENDING'),
      ).rejects.toThrow(BadRequestException);

      // Không nguyên liệu nào được trừ
      expect(
        tx.ingredient.updateMany,
      ).not.toHaveBeenCalled();

      // Không được dùng kho Product cũ
      expect(
        tx.product.updateMany,
      ).not.toHaveBeenCalled();

      // Không được đánh dấu đã giữ nguyên liệu
      expect(
        tx.order.updateMany,
      ).not.toHaveBeenCalledWith({
        where: {
          id: 103,
          ingredientsReserved: false,
        },
        data: {
          ingredientsReserved: true,
        },
      });
    },
  );

  it(
    'TASK 10.3: Không hoàn nguyên liệu hai lần',
    async () => {
      // Lần đầu: Đơn hàng vẫn giữ nguyên liệu
      tx.order.findUnique
        .mockResolvedValueOnce({
          id: 104,
          ingredientsReserved: true,
          ingredientUses: [
            {
              ingredientId: 1,
              quantity: 36,
            },
            {
              ingredientId: 2,
              quantity: 300,
            },
          ],
        })

        // Lần hai: Nguyên liệu đã được hoàn
        .mockResolvedValueOnce({
          id: 104,
          ingredientsReserved: false,
          ingredientUses: [
            {
              ingredientId: 1,
              quantity: 36,
            },
            {
              ingredientId: 2,
              quantity: 300,
            },
          ],
        });

      tx.order.updateMany.mockResolvedValue({
        count: 1,
      });

      tx.ingredient.update.mockResolvedValue({
        id: 1,
      });

      const transaction =
        tx as unknown as Prisma.TransactionClient;

      // Lần 1: Thực hiện hoàn kho
      const firstResult = await releaseOrderIngredients(
        transaction,
        104,
      );

      // Lần 2: Gọi lại hàm hoàn kho
      const secondResult = await releaseOrderIngredients(
        transaction,
        104,
      );

      expect(firstResult).toBe(true);
      expect(secondResult).toBe(true);

      // Chỉ được đổi cờ ingredientsReserved một lần
      expect(tx.order.updateMany).toHaveBeenCalledTimes(1);

      // Có hai nguyên liệu, nên chỉ được cập nhật hai lần
      expect(tx.ingredient.update).toHaveBeenCalledTimes(2);

      expect(tx.ingredient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          stock: { increment: 36 },
          version: { increment: 1 },
        },
      });

      expect(tx.ingredient.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          stock: { increment: 300 },
          version: { increment: 1 },
        },
      });

      // Không được cập nhật Product.stock
      expect(tx.product.update).not.toHaveBeenCalled();
    },
  );
});