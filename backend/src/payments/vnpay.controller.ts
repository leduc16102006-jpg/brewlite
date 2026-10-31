
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Prisma } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { VnpayService } from './vnpay.service';

import { CreateVnpayPaymentDto } from './dto/create-vnpay-payment.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@ApiTags('VNPay')
@Controller('payments/vnpay')
export class VnpayController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vnpayService: VnpayService,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tạo URL thanh toán VNPay Sandbox',
  })
  
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateVnpayPaymentDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (
      !Number.isSafeInteger(body.orderId) ||
      body.orderId < 1
    ) {
      throw new BadRequestException('orderId is invalid');
    }

    if (!idempotencyKey?.trim()) {
      throw new BadRequestException(
        'Header Idempotency-Key is required',
      );
    }

    const key = idempotencyKey.trim();
    const userId = req.user.userId;

    // Kiểm tra key trước để retry không tạo payment mới.
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey: key },
      include: { order: true },
    });

    if (existing) {
      if (
        existing.orderId !== body.orderId ||
        existing.method !== 'VNPAY'
      ) {
        throw new BadRequestException(
          'Idempotency-Key was used for another request',
        );
      }

      if (existing.order.userId !== userId) {
        throw new BadRequestException('Order not available');
      }

      if (existing.status !== 'PROCESSING') {
        return {
          orderId: existing.orderId,
          paymentId: existing.id,
          status: existing.status,
          message: 'This payment has already been processed',
        };
      }

      const url = await this.vnpayService.createPaymentUrl(
        existing.id,
        existing.amount,
        this.getClientIp(req),
      );

      return {
        orderId: existing.orderId,
        paymentId: existing.id,
        status: existing.status,
        paymentUrl: url,
      };
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: body.orderId,
        userId,
      },
    });

    if (!order) {
      throw new BadRequestException(
        'Order not found or not owned by current user',
      );
    }

    if (
      !['PENDING', 'PAYMENT_FAILED'].includes(order.status)
    ) {
      throw new BadRequestException(
        'Order cannot be paid in its current status',
      );
    }

    let payment;

    try {
      payment = await this.prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          method: 'VNPAY',
          status: 'PROCESSING',
          idempotencyKey: key,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Idempotency-Key is already being processed; retry the request',
        );
      }

      throw error;
    }

    const paymentUrl = await this.vnpayService.createPaymentUrl(
      payment.id,
      payment.amount,
      this.getClientIp(req),
    );

    return {
      orderId: order.id,
      paymentId: payment.id,
      status: payment.status,
      paymentUrl,
    };
  }
@Get('ipn')
@ApiOperation({
  summary: 'Nhận IPN callback từ VNPay',
})
async paymentIpn(
  @Req() req: Request,
  @Query()
  query: Record<string, string | string[] | undefined>,
) {
   

  const result = await this.vnpayService.handleIpn(query);

  console.log('[VNPay Controller] IPN response:', result);
  return result;
}
 
@Get('ipn/test')
@ApiOperation({
  summary: 'Test payment lookup by Payment ID (development only)',
})
@ApiQuery({
  name: 'paymentId',
  type: Number,
  required: true,
  example: 18,
})
async testIpn(@Query('paymentId') paymentId: string) {
  const id = Number(paymentId);

  if (!Number.isSafeInteger(id) || id < 1) {
    throw new BadRequestException('Invalid paymentId');
  }

  const payment = await this.vnpayService.findPaymentForTest(id);

  return payment;
}


  
  
@Get('return')
@ApiOperation({
  summary: 'Nhận kết quả thanh toán trả về từ VNPay',
})
async paymentReturn(
  @Query()
  query: Record<string, string | string[] | undefined>,
) {
  return this.vnpayService.verifyReturn(query);
}

private getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];

  const ip =
    (typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : undefined) ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  return ip.replace(/^::ffff:/, '').replace(/^::1$/, '127.0.0.1');
}
}
