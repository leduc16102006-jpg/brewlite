
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentMethod } from './dto/create-payment.dto';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  const mockPaymentsService = {
    createPayment: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [PaymentsController],
        providers: [
          {
            provide: PaymentsService,
            useValue: mockPaymentsService,
          },
        ],
      }).compile();

    controller = module.get<PaymentsController>(
      PaymentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should forward userId and payment DTO to service', async () => {
    const req = {
      user: {
        userId: 1,
        email: 'test@brewlite.com',
      },
    };

    const dto = {
      orderId: 1,
      method: PaymentMethod.WALLET,
    };

    const idempotencyKey = 'payment-order-1-abc123';

    const expected = {
      orderId: 1,
      method: PaymentMethod.WALLET,
      status: 'PAID',
      message: 'Thanh toán giả lập thành công',
    };

    mockPaymentsService.createPayment.mockResolvedValue(expected);

    const result = await controller.createPayment(req, dto, idempotencyKey);

    expect(mockPaymentsService.createPayment).toHaveBeenCalledWith(
      1,
      dto,
      idempotencyKey,
    );

    expect(result).toEqual(expected);
  });
});