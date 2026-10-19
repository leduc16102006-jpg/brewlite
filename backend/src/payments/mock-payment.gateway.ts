import { Injectable } from '@nestjs/common';
import { PaymentMethod } from './dto/create-payment.dto';

export type PaymentStatus = 'PAID' | 'PAYMENT_FAILED';

@Injectable()
export class MockPaymentGateway {
  async charge(
    method: PaymentMethod,
  ): Promise<PaymentStatus> {
    // Mock Payment: chưa giao dịch tiền thật.
    // Unit test có thể giả lập kết quả thất bại.
    return 'PAID';
  }
}
