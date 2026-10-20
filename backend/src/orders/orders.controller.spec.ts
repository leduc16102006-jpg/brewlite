import 'reflect-metadata';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(() => {
    const mockOrdersService = {} as unknown as OrdersService;
    controller = new OrdersController(mockOrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});