import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

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
      .mockResolvedValueOnce({
        id: 1,
        status: from,
        items: [{ productId: 1, qty: 2 }],
      })
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
      data: { stock: { increment: 2 } },
    });
  });

  it('cho phép PAYMENT_FAILED -> PENDING khi đủ kho', async () => {
    tx.order.findUnique
      .mockResolvedValueOnce({
        id: 1,
        status: 'PAYMENT_FAILED',
        items: [{ productId: 1, qty: 2 }],
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
      data: { stock: { decrement: 2 } },
    });
    expect(result?.status).toBe('PENDING');
  });

  it('từ chối thử lại nếu không đủ kho', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 1,
      status: 'PAYMENT_FAILED',
      items: [{ productId: 1, qty: 2 }],
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
});