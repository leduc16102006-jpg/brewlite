import 'reflect-metadata';
import { PaymentsController } from './payments.controller';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { MockPaymentGateway } from './mock-payment.gateway';
import { PaymentMethod } from './dto/create-payment.dto';
import { PrismaService } from '../prisma/prisma.service';


describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(() => {
    const mockPaymentsService = {} as unknown as PaymentsService;
    controller = new PaymentsController(mockPaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});


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


  const mockTx = {
    order: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },

    payment: {
      create: jest.fn(),
      update: jest.fn(),
    },

    // Dùng khi hoàn kho nguyên liệu
    ingredient: {
      update: jest.fn(),
    },

    // Dùng cho đơn hàng cũ quản lý theo Product.stock
    orderItem: {
      findMany: jest.fn(),
    },

    product: {
      update: jest.fn(),
    },

    loyaltyTransaction: {
      create: jest.fn(),
    },
  };

  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    // THÊM ĐOẠN NÀY VÀO:
    loyaltyTransaction: {
      create: jest.fn().mockResolvedValue({ id: 1, points: 9 }),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

  // Giả lập Order đã giữ nguyên liệu
  mockTx.order.findUnique.mockResolvedValue({
    id: 1,
    status: 'PAYMENT_FAILED',
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
  });

  // Cập nhật trạng thái Order thành công
  mockTx.order.updateMany.mockResolvedValue({
    count: 1,
  });

  // Mô phỏng hoàn nguyên liệu
  mockTx.ingredient.update.mockResolvedValue({
    id: 1,
  });

  // Mô phỏng dữ liệu của đơn hàng cũ
  mockTx.orderItem.findMany.mockResolvedValue([]);

  // Điểm thưởng
  mockTx.loyaltyTransaction.create.mockResolvedValue({
    id: 1,
    points: 9,
  });

    mockPrisma.payment.findUnique.mockResolvedValue(null);

    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder,
    });

    mockPrisma.payment.create.mockResolvedValue({
      id: 1,
      orderId: 1,
      amount: 94000,
      method: PaymentMethod.WALLET,
      status: 'PROCESSING',
      idempotencyKey: 'test-payment-key-1',
    });

    mockTx.order.updateMany.mockResolvedValue({
      count: 1,
    });

    mockTx.payment.update.mockResolvedValue({
      id: 1,
      orderId: 1,
      amount: 94000,
      method: PaymentMethod.WALLET,
      status: 'PAID',
      idempotencyKey: 'test-payment-key-1',
    });

    mockPrisma.$transaction.mockImplementation(
      async (
        callback: (tx: typeof mockTx) => Promise<unknown>,
      ) => callback(mockTx),
    );

    // Thay thế bằng khởi tạo thuần:
    service = new PaymentsService(
      mockGateway as any,
      mockPrisma as any,
    );
  });

  it('WALLET: thanh toán thành công và lưu Payment', async () => {
    mockGateway.charge.mockResolvedValue('PAID');

    const key = 'test-payment-key-1';

    const result = await service.createPayment(
      userId,
      {
        orderId: 1,
        method: PaymentMethod.WALLET,
      },
      key,
    );

    expect(result.status).toBe('PAID');
    expect(result.orderId).toBe(1);

    expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
      where: { idempotencyKey: key },
      include: { order: true },
    });

    expect(mockPrisma.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 1,
        amount: 94000,
        method: PaymentMethod.WALLET,
        status: 'PROCESSING',
        idempotencyKey: key,
      },
    });

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
      data: { status: 'PAID' },
    });

    expect(mockTx.payment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'PAID' },
    });

  // Thanh toán thành công không hoàn nguyên liệu
  expect(
    mockTx.ingredient.update,
  ).not.toHaveBeenCalled();

  // Không cần đọc dữ liệu hoàn kho
  expect(
    mockTx.order.findUnique,
  ).not.toHaveBeenCalled();

  // Thanh toán thành công được cộng điểm
  expect(
    mockTx.loyaltyTransaction.create,
  ).toHaveBeenCalled();
  });

  it('CARD: thanh toán thành công', async () => {
    mockGateway.charge.mockResolvedValue('PAID');

    const result = await service.createPayment(
      userId,
      {
        orderId: 1,
        method: PaymentMethod.CARD,
      },
      'test-card-key',
    );

    expect(result.status).toBe('PAID');
    expect(result.method).toBe(PaymentMethod.CARD);

    expect(mockPrisma.payment.create).toHaveBeenCalledWith({
      data: {
        orderId: 1,
        amount: 94000,
        method: PaymentMethod.CARD,
        status: 'PROCESSING',
        idempotencyKey: 'test-card-key',
      },
    });

    expect(mockGateway.charge).toHaveBeenCalledWith(
      PaymentMethod.CARD,
    );

    expect(mockTx.payment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'PAID' },
    });
  });

  it('Thanh toán thất bại: lưu PAYMENT_FAILED', async () => {
    mockGateway.charge.mockResolvedValue('PAYMENT_FAILED');

    const result = await service.createPayment(
      userId,
      {
        orderId: 1,
        method: PaymentMethod.WALLET,
      },
      'test-failed-key',
    );

  // Payment phải trả về thất bại
  expect(result.status).toBe('PAYMENT_FAILED');

  // Phải đọc lượng nguyên liệu đã giữ của Order
  expect(mockTx.order.findUnique).toHaveBeenCalledWith({
    where: { id: 1 },
    include: { ingredientUses: true },
  });

  // Phải chuyển ingredientsReserved về false
  expect(mockTx.order.updateMany).toHaveBeenCalledWith({
    where: {
      id: 1,
      ingredientsReserved: true,
    },
    data: {
      ingredientsReserved: false,
    },
  });

  // Hoàn lại 36 g cà phê
  expect(mockTx.ingredient.update).toHaveBeenCalledWith({
    where: { id: 1 },
    data: {
      stock: { increment: 36 },
      version: { increment: 1 },
    },
  });

  // Hoàn lại 300 ml sữa
  expect(mockTx.ingredient.update).toHaveBeenCalledWith({
    where: { id: 2 },
    data: {
      stock: { increment: 300 },
      version: { increment: 1 },
    },
  });

  // Thanh toán thất bại không được cộng điểm
  expect(
    mockTx.loyaltyTransaction.create,
  ).not.toHaveBeenCalled();

  });

  it('Thiếu Idempotency-Key: trả lỗi 400', async () => {
    await expect(
      service.createPayment(
        userId,
        {
          orderId: 1,
          method: PaymentMethod.WALLET,
        },
        '',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(mockGateway.charge).not.toHaveBeenCalled();
  });

  it('Order không tồn tại: trả lỗi 404', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);

    await expect(
      service.createPayment(
        userId,
        {
          orderId: 999,
          method: PaymentMethod.WALLET,
        },
        'test-not-found-key',
      ),
    ).rejects.toThrow(NotFoundException);

    expect(mockGateway.charge).not.toHaveBeenCalled();
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
  });

  it('Không được thanh toán Order người khác: trả lỗi 403', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder,
      userId: 2,
    });

    await expect(
      service.createPayment(
        userId,
        {
          orderId: 1,
          method: PaymentMethod.WALLET,
        },
        'test-forbidden-key',
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(mockGateway.charge).not.toHaveBeenCalled();
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
  });

  it('Order đã PAID không được thanh toán lại bằng key mới', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      ...pendingOrder,
      status: 'PAID',
    });

    await expect(
      service.createPayment(
        userId,
        {
          orderId: 1,
          method: PaymentMethod.CARD,
        },
        'test-already-paid-key',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(mockGateway.charge).not.toHaveBeenCalled();
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
  });

  it('Order thay đổi trạng thái: báo ConflictException', async () => {
    mockGateway.charge.mockResolvedValue('PAID');
    mockTx.order.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.createPayment(
        userId,
        {
          orderId: 1,
          method: PaymentMethod.WALLET,
        },
        'test-order-changed-key',
      ),
    ).rejects.toThrow(ConflictException);

    expect(mockTx.order.updateMany).toHaveBeenCalled();
  });

  it('Dùng lại key đã PAID: trả kết quả cũ, không charge lại', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 1,
      orderId: 1,
      amount: 94000,
      method: PaymentMethod.WALLET,
      status: 'PAID',
      idempotencyKey: 'reused-key',
      order: {
        ...pendingOrder,
        userId,
      },
    });

    const result = await service.createPayment(
      userId,
      {
        orderId: 1,
        method: PaymentMethod.WALLET,
      },
      'reused-key',
    );

    expect(result.status).toBe('PAID');
    expect(mockGateway.charge).not.toHaveBeenCalled();
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
  });

  it('Dùng lại key cho request khác: báo ConflictException', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 1,
      orderId: 1,
      amount: 94000,
      method: PaymentMethod.WALLET,
      status: 'PAID',
      idempotencyKey: 'reused-key',
      order: {
        ...pendingOrder,
        userId,
      },
    });

    await expect(
      service.createPayment(
        userId,
        {
          orderId: 1,
          method: PaymentMethod.CARD,
        },
        'reused-key',
      ),
    ).rejects.toThrow(ConflictException);

    expect(mockGateway.charge).not.toHaveBeenCalled();
  });

  it('Key đã tồn tại và đang PROCESSING: không charge lại', async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 1,
      orderId: 1,
      amount: 94000,
      method: PaymentMethod.WALLET,
      status: 'PROCESSING',
      idempotencyKey: 'processing-key',
      order: {
        ...pendingOrder,
        userId,
      },
    });

    await expect(
      service.createPayment(
        userId,
        {
          orderId: 1,
          method: PaymentMethod.WALLET,
        },
        'processing-key',
      ),
    ).rejects.toThrow(ConflictException);

    expect(mockGateway.charge).not.toHaveBeenCalled();
  });


  it(
    'PAYMENT_FAILED: phải giữ lại nguyên liệu trước khi thanh toán lại',
    async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        ...pendingOrder,
        status: 'PAYMENT_FAILED',
      });

      await expect(
        service.createPayment(
          userId,
          {
            orderId: 1,
            method: PaymentMethod.WALLET,
          },
          'retry-payment-key',
        ),
      ).rejects.toThrow(BadRequestException);

      // Không được gọi Gateway
      expect(
        mockGateway.charge,
      ).not.toHaveBeenCalled();

      // Không tạo Payment mới
      expect(
        mockPrisma.payment.create,
      ).not.toHaveBeenCalled();
    },
  );
});
