import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdersService - Task 9', () => {
  let service: OrdersService;

  const mockPrisma = {
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockOrder = {
    id: 1,
    userId: 1,
    status: 'PAID',
    total: 94000,
    createdAt: new Date('2026-10-16'),
    items: [
      {
        id: 1,
        productId: 1,
        qty: 1,
        lineTotal: 39000,
        product: {
          id: 1,
          name: 'Americano',
        },
      },
    ],
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          OrdersService,
          {
            provide: PrismaService,
            useValue: mockPrisma,
          },
        ],
      }).compile();

    service = module.get<OrdersService>(
      OrdersService,
    );
  });

  it('Lấy lịch sử đơn hàng của người đăng nhập', async () => {
    mockPrisma.order.findMany.mockResolvedValue([
      mockOrder,
    ]);

    const result = await service.findMyOrders(1);

    expect(result).toEqual([mockOrder]);

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('Trả danh sách rỗng nếu chưa có đơn hàng', async () => {
    mockPrisma.order.findMany.mockResolvedValue([]);

    const result = await service.findMyOrders(2);

    expect(result).toEqual([]);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 2,
        },
      }),
    );
  });

  it('Lấy chi tiết đơn hàng của chính mình', async () => {
    mockPrisma.order.findFirst.mockResolvedValue(
      mockOrder,
    );

    const result = await service.findOne(1, 1);

    expect(result).toEqual(mockOrder);

    expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
      where: {
        id: 1,
        userId: 1,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });

  it('Order không tồn tại thì trả 404', async () => {
    mockPrisma.order.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne(1, 999999),
    ).rejects.toThrow(NotFoundException);
  });

  it('Không được xem đơn hàng của người khác', async () => {
    // Prisma returns null when no order matches
    // both the order ID and the current user ID.
    mockPrisma.order.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne(2, 1),
    ).rejects.toThrow(NotFoundException);

    expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 1,
          userId: 2,
        },
      }),
    );
  });
});
