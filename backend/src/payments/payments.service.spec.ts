
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

  const pendingOrder = {
    id: 1,
    userId: 1,
    status: 'PENDING',
    total: 94000,
  };

  // Mock operations inside Prisma transaction
  const mockTx = {
    order: {
      updateMany: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
  };

  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder,
    });

    mockTx.order.updateMany.mockResolvedValue({
      count: 1,
    });

    mockTx.payment.create.mockResolvedValue({
      id: 1,
      orderId: 1,
      amount: 94000,
      method: 'WALLET',
      status: 'PAID',
    });

    // Execute transaction callback with mocked tx
    mockPrisma.$transaction.mockImplementation(
      async (
        callback: (tx: typeof mockTx) => Promise<unknown>,
      ) => callback(mockTx),
    );

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

    service = module.get<PaymentsService>(
      PaymentsService,
    );
  });

  it('WALLET: thanh toán và lưu Payment thành công', async () => {
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

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

    expect(mockTx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        userId: 1,
        status: 'PENDING',
      },
      data: {
        status: 'PAID',
      },
    });

    expect(mockTx.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 1,
        amount: 94000,
        method: PaymentMethod.WALLET,
        status: 'PAID',
      },
    });
  });

  it('CARD: thanh toán và lưu Payment thành công', async () => {
    mockGateway.charge.mockResolvedValue('PAID');

    const result = await service.createPayment(userId, {
      orderId: 1,
      method: PaymentMethod.CARD,
    });

    expect(result.status).toBe('PAID');
    expect(result.method).toBe(PaymentMethod.CARD);

    expect(mockTx.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 1,
        amount: 94000,
        method: PaymentMethod.CARD,
        status: 'PAID',
      },
    });
  });

  it('Thanh toán thất bại: lưu PAYMENT_FAILED', async () => {
    mockGateway.charge.mockResolvedValue(
      'PAYMENT_FAILED',
    );

    const result = await service.createPayment(userId, {
      orderId: 1,
      method: PaymentMethod.WALLET,
    });

    expect(result.status).toBe('PAYMENT_FAILED');

    expect(mockTx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        userId: 1,
        status: 'PENDING',
      },
      data: {
        status: 'PAYMENT_FAILED',
      },
    });

    expect(mockTx.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 1,
        amount: 94000,
        method: PaymentMethod.WALLET,
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
    expect(mockTx.payment.create).not.toHaveBeenCalled();
  });

  it('Không được thanh toán Order người khác: 403', async () => {
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
    expect(mockTx.payment.create).not.toHaveBeenCalled();
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
    expect(mockTx.payment.create).not.toHaveBeenCalled();
  });

  it('Order thay đổi trạng thái thì không lưu Payment', async () => {
    mockGateway.charge.mockResolvedValue('PAID');

    mockTx.order.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      service.createPayment(userId, {
        orderId: 1,
        method: PaymentMethod.WALLET,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockTx.payment.create).not.toHaveBeenCalled();
  });
});
