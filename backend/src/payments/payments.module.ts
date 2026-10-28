import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MockPaymentGateway } from './mock-payment.gateway';
import { VnpayService } from './vnpay.service';
import { VnpayController } from './vnpay.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController,  VnpayController,],
  providers: [PaymentsService, MockPaymentGateway, VnpayService,],
  exports: [VnpayService],
})
export class PaymentsModule {}