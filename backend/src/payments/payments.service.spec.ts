
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { MockPaymentGateway } from './mock-payment.gateway';
import { PaymentMethod } from './dto/create-payment.dto';
import { PrismaService } from '../prisma/prisma.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const userId = 1;

  const mockGateway = {
    charge: jest.fn(),
  };

  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const pendingOrder = {
    id: 1,
    userId: 1,
    status: 'PENDING',
    total: 94000,
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          PaymentsService,
          {
            provide: MockPaymentGateway,
            useValue: mockGateway,
          },
          {
            provide: PrismaService,
            useValue: mockPrisma,
          },
        ],
      }).compile();

    service = module.get<PaymentsService>(PaymentsService);

    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder,
    });

    mockPrisma.order.updateMany.mockResolvedValue({
      count: 1,
    });
  });

  it('WALLET: thanh toán thành công', async () => {
    mockGateway.charge.mockResolvedValue('PAID');

    const result = await service.createPayment(userId, {
      orderId: 1,
      method: PaymentMethod.WALLET,
    });

    expect(result.status).toBe('PAID');
    expect(result.orderId).toBe(1);

    expect(mockGateway.charge).toHaveBeenCalledWith(
      PaymentMethod.WALLET,
    );

    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        status: 'PENDING',
      },
      data: {
        status: 'PAID',
      },
    });
  });

  it('CARD: thanh toán thành công', async () => {
    mockGateway.charge.mockResolvedValue('PAID');

    const result = await service.createPayment(userId, {
      orderId: 1,
      method: PaymentMethod.CARD,
    });

    expect(result.status).toBe('PAID');
    expect(result.method).toBe(PaymentMethod.CARD);

    expect(mockGateway.charge).toHaveBeenCalledWith(
      PaymentMethod.CARD,
    );
  });

  it('Thanh toán thất bại: PAYMENT_FAILED', async () => {
    mockGateway.charge.mockResolvedValue(
      'PAYMENT_FAILED',
    );

    const result = await service.createPayment(userId, {
      orderId: 1,
      method: PaymentMethod.WALLET,
    });

    expect(result.status).toBe('PAYMENT_FAILED');
    expect(result.message).toBe('Thanh toán thất bại');

    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        status: 'PENDING',
      },
      data: {
        status: 'PAYMENT_FAILED',
      },
    });
  });

  it('Order không tồn tại: 404', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);

    await expect(
      service.createPayment(userId, {
        orderId: 999,
        method: PaymentMethod.WALLET,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockGateway.charge).not.toHaveBeenCalled();
  });

  it('Không được thanh toán Order của người khác: 403', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder,
      userId: 2,
    });

    await expect(
      service.createPayment(userId, {
        orderId: 1,
        method: PaymentMethod.WALLET,
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockGateway.charge).not.toHaveBeenCalled();
  });

  it('Order đã PAID không được thanh toán lại', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder,
      status: 'PAID',
    });

    await expect(
      service.createPayment(userId, {
        orderId: 1,
        method: PaymentMethod.CARD,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockGateway.charge).not.toHaveBeenCalled();
  });

  it('Order thay đổi trạng thái trong lúc thanh toán', async () => {
    mockGateway.charge.mockResolvedValue('PAID');

    mockPrisma.order.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      service.createPayment(userId, {
        orderId: 1,
        method: PaymentMethod.WALLET,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
