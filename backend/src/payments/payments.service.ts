import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
  CreatePaymentDto,
  PaymentMethod,
} from './dto/create-payment.dto';

import {
  MockPaymentGateway,
  PaymentStatus,
} from './mock-payment.gateway';

export interface MockPaymentResult {
  orderId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  message: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly gateway: MockPaymentGateway,
    private readonly prisma: PrismaService,
  ) {}

  async createPayment(
    userId: number,
    dto: CreatePaymentDto,
  ): Promise<MockPaymentResult> {
    // Find the order in PostgreSQL
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    // Check ownership
    if (order.userId !== userId) {
      throw new ForbiddenException(
        'You cannot pay for this order',
      );
    }

    // Only pending or previously failed orders can be paid
    if (
      order.status !== 'PENDING' &&
      order.status !== 'PAYMENT_FAILED'
    ) {
      throw new BadRequestException(
        'Order cannot be paid in its current status',
      );
    }

    // Simulated wallet/card payment
    const status = await this.gateway.charge(dto.method);

    // Update the real order in PostgreSQL
    const updated = await this.prisma.order.updateMany({
      where: {
        id: order.id,
        status: order.status,
      },
      data: { status },
    });

    if (updated.count !== 1) {
      throw new BadRequestException(
        'Order status changed. Please try again',
      );
    }

    return {
      orderId: order.id,
      method: dto.method,
      status,
      message:
        status === 'PAID'
          ? 'Thanh toán giả lập thành công'
          : 'Thanh toán thất bại',
    };
  }
}