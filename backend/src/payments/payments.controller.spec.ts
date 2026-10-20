import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

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