import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, Payment } from '@prisma/client';
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
    idempotencyKey: string,
  ): Promise<MockPaymentResult> {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException(
        'Header Idempotency-Key is required',
      );
    }

    const key = idempotencyKey.trim();

    // 1. Nếu key đã tồn tại, không thanh toán lần nữa.
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey: key },
      include: { order: true },
    });

    if (existingPayment) {
      if (
        existingPayment.orderId !== dto.orderId ||
        existingPayment.method !== dto.method
      ) {
        throw new ConflictException(
          'Idempotency-Key has already been used for another request',
        );
      }

      if (existingPayment.order.userId !== userId) {
        throw new ForbiddenException(
          'You cannot pay for this order',
        );
      }

      if (existingPayment.status === 'PROCESSING') {
        throw new ConflictException(
          'Payment with this key is still processing',
        );
      }

      return this.toResult(
        existingPayment.orderId,
        existingPayment.method as PaymentMethod,
        existingPayment.status as PaymentStatus,
      );
    }

    // 2. Kiểm tra đơn hàng và quyền sở hữu.
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException(
        'You cannot pay for this order',
      );
    }

    if (
      order.status !== 'PENDING' &&
      order.status !== 'PAYMENT_FAILED'
    ) {
      throw new BadRequestException(
        'Order cannot be paid in its current status',
      );
    }

    // 3. Tạo bản ghi giữ chỗ trước khi gọi cổng thanh toán.
    // Unique idempotencyKey giúp ngăn hai request cùng key tạo
    // hai bản ghi thanh toán.
    let payment: Payment;

    try {
      payment = await this.prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          method: dto.method,
          status: 'PROCESSING',
          idempotencyKey: key,
        },
      });
    } catch (error) {
      // Một request khác có thể vừa tạo cùng key.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const duplicate = await this.prisma.payment.findUnique({
          where: { idempotencyKey: key },
          include: { order: true },
        });

        if (!duplicate) {
          throw new ConflictException(
            'Payment request is already being processed',
          );
        }

        if (
          duplicate.orderId !== dto.orderId ||
          duplicate.method !== dto.method
        ) {
          throw new ConflictException(
            'Idempotency-Key has already been used for another request',
          );
        }

        if (duplicate.order.userId !== userId) {
          throw new ForbiddenException(
            'You cannot pay for this order',
          );
        }

        if (duplicate.status === 'PROCESSING') {
          throw new ConflictException(
            'Payment with this key is still processing',
          );
        }

        return this.toResult(
          duplicate.orderId,
          duplicate.method as PaymentMethod,
          duplicate.status as PaymentStatus,
        );
      }

      throw error;
    }

    // 4. Gọi gateway sau khi đã lưu key.
    // Với gateway thật, phải truyền key cho gateway để nó cũng
    // chống trùng giao dịch; gateway mock hiện tại chưa hỗ trợ việc đó.
    let status: PaymentStatus;

    try {
      status = await this.gateway.charge(dto.method);
    } catch (error) {
      // Không xóa key khi kết quả không rõ ràng.
      // Để PROCESSING giúp tránh tự động charge lại cùng key.
      throw error;
    }

    // 5. Cập nhật trạng thái đơn hàng và bản ghi thanh toán.
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: {
          id: order.id,
          userId,
          status: order.status,
        },
        data: { status },
      });

      if (updated.count !== 1) {
        throw new ConflictException(
          'Order status changed. Please check payment status',
        );
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: { status },
      });
    });

    return this.toResult(order.id, dto.method, status);
  }

  private toResult(
    orderId: number,
    method: PaymentMethod,
    status: PaymentStatus,
  ): MockPaymentResult {
    return {
      orderId,
      method,
      status,
      message:
        status === 'PAID'
          ? 'Thanh toán giả lập thành công'
          : 'Thanh toán thất bại',
    };
  }
}