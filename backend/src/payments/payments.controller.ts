import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
  };
}

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  async createPayment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePaymentDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.paymentsService.createPayment(
      req.user.userId,
      dto,
      idempotencyKey,
    );
  }
}
