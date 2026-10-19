import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController - Task 9', () => {
  let controller: OrdersController;

  const mockOrdersService = {
    create: jest.fn(),
    findMyOrders: jest.fn(),
    findOne: jest.fn(),
  };

  const req = {
    user: {
      userId: 1,
      email: 'test@brewlite.com',
    },
  };

  const mockOrder = {
    id: 1,
    userId: 1,
    status: 'PAID',
    total: 94000,
    items: [
      {
        productId: 1,
        qty: 1,
        lineTotal: 39000,
      },
      {
        productId: 2,
        qty: 1,
        lineTotal: 55000,
      },
    ],
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [OrdersController],
        providers: [
          {
            provide: OrdersService,
            useValue: mockOrdersService,
          },
        ],
      }).compile();

    controller = module.get<OrdersController>(
      OrdersController,
    );
  });

  it('OrdersController được khởi tạo thành công', () => {
    expect(controller).toBeDefined();
  });

  it('GET /orders/me: truyền đúng userId', async () => {
    mockOrdersService.findMyOrders.mockResolvedValue([
      mockOrder,
    ]);

    const result = await controller.findMyOrders(req);

    expect(
      mockOrdersService.findMyOrders,
    ).toHaveBeenCalledWith(1);

    expect(result).toEqual([mockOrder]);
  });

  it('GET /orders/:id: truyền đúng userId và orderId', async () => {
    mockOrdersService.findOne.mockResolvedValue(
      mockOrder,
    );

    const result = await controller.findOne(req, 1);

    expect(
      mockOrdersService.findOne,
    ).toHaveBeenCalledWith(1, 1);

    expect(result).toEqual(mockOrder);
  });

  it('POST /orders: vẫn chuyển dữ liệu tạo đơn đúng', async () => {
    const dto = {
      items: [
        {
          productId: 1,
          qty: 1,
          size: 'M',
        },
      ],
    };

    mockOrdersService.create.mockResolvedValue({
      id: 5,
      userId: 1,
      status: 'PENDING',
      total: 39000,
    });

    const result = await controller.create(req, dto);

    expect(
      mockOrdersService.create,
    ).toHaveBeenCalledWith(1, dto);

    expect(result.status).toBe('PENDING');
  });
});
