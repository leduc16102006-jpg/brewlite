
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import * as qs from 'qs';

@Injectable()
export class VnpayService {
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly paymentUrl: string;
  private readonly returnUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.tmnCode = this.config.getOrThrow<string>(
      'VNPAY_TMN_CODE',
    ).trim();
    this.hashSecret = this.config.getOrThrow<string>(
      'VNPAY_HASH_SECRET',
    ).trim();
    this.paymentUrl = this.config.getOrThrow<string>(
      'VNPAY_PAYMENT_URL',
    ).trim();
    this.returnUrl = this.config.getOrThrow<string>(
      'VNPAY_RETURN_URL',
    ).trim();
  }

  private encode(value: string): string {
    return encodeURIComponent(value).replace(/%20/g, '+');
  }

  

private sortVnpayParams(
  params: Record<string, string>,
): Record<string, string> {
  const sorted: Record<string, string> = {};

  for (const key of Object.keys(params).sort()) {
    sorted[encodeURIComponent(key)] = encodeURIComponent(
      params[key],
    ).replace(/%20/g, '+');
  }

  return sorted;
}

private signData(params: Record<string, string>): string {
  const sortedParams = this.sortVnpayParams(params);

  return qs.stringify(sortedParams, {
    encode: false,
  });
}

private sign(params: Record<string, string>): string {
  return createHmac('sha512', this.hashSecret)
    .update(this.signData(params), 'utf-8')
    .digest('hex');
}



  

verifySignature(
  query: Record<string, string | string[] | undefined>,
): boolean {
  const receivedHash = query.vnp_SecureHash;

  if (
    typeof receivedHash !== 'string' ||
    !/^[a-fA-F0-9]{128}$/.test(receivedHash)
  ) {
    return false;
  }

  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(query)) {
    if (
      key === 'vnp_SecureHash' ||
      key === 'vnp_SecureHashType'
    ) {
      continue;
    }

    if (!key.startsWith('vnp_')) {
      continue;
    }

    if (typeof value !== 'string') {
      return false;
    }

    params[key] = value;
  }

  const expectedHash = this.sign(params);

  const received = Buffer.from(receivedHash, 'hex');
  const expected = Buffer.from(expectedHash, 'hex');

  const isValid =
    received.length === expected.length &&
    timingSafeEqual(received, expected);

  return isValid;
}


async handleIpn(
  query: Record<string, string | string[] | undefined>,
) {
  // 1. Kiểm tra chữ ký IPN
  const signatureValid = this.verifySignature(query);

  if (!signatureValid) {
    return {
      RspCode: '97',
      Message: 'Invalid signature',
    };
  }

  // 2. Kiểm tra merchant
  if (query.vnp_TmnCode !== this.tmnCode) {
    return {
      RspCode: '97',
      Message: 'Invalid merchant',
    };
  }

  // 3. Kiểm tra dữ liệu callback
  const paymentId = Number(query.vnp_TxnRef);
  const vnpAmount = Number(query.vnp_Amount);

  if (
    !Number.isSafeInteger(paymentId) ||
    paymentId < 1 ||
    !Number.isSafeInteger(vnpAmount) ||
    vnpAmount < 0
  ) {
    return {
      RspCode: '04',
      Message: 'Invalid data',
    };
  }

  // 4. Tìm payment và order
  const payment = await this.prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    return {
      RspCode: '01',
      Message: 'Order not found',
    };
  }

  if (
    payment.method !== 'VNPAY' ||
    vnpAmount !== payment.amount * 100
  ) {
    return {
      RspCode: '04',
      Message: 'Invalid amount',
    };
  }

  // 5. Xác định kết quả giao dịch từ VNPay
  const success =
    query.vnp_ResponseCode === '00' &&
    query.vnp_TransactionStatus === '00';

  try {
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.payment.findUnique({
        where: { id: payment.id },
      });

      if (!current) {
        throw new BadRequestException('Payment not found');
      }

      // Callback lặp lại: không xử lý thanh toán lần nữa.
      if (
        current.status === 'PAID' ||
        current.status === 'FAILED'
      ) {
        return;
      }

      // Chỉ cập nhật payment đang PROCESSING.
      const updated = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: 'PROCESSING',
        },
        data: {
          status: success ? 'PAID' : 'FAILED',
        },
      });

      if (updated.count !== 1) {
        throw new BadRequestException(
          'Payment status changed',
        );
      }

      if (success) {
        // Chỉ chuyển order sang PAID từ trạng thái hợp lệ.
        const orderUpdated = await tx.order.updateMany({
          where: {
            id: payment.orderId,
            status: {
              in: ['PENDING', 'PAYMENT_FAILED'],
            },
          },
          data: { status: 'PAID' },
        });

        if (orderUpdated.count !== 1) {
          throw new BadRequestException(
            'Order cannot transition to PAID',
          );
        }

        // Cộng điểm trong cùng transaction.
        const points = Math.floor(payment.amount / 10_000);

        if (points > 0) {
          await tx.loyaltyTransaction.create({
            data: {
              userId: payment.order.userId,
              orderId: payment.orderId,
              points,
            },
          });
        }
      } else {
        await tx.order.updateMany({
          where: {
            id: payment.orderId,
            status: 'PENDING',
          },
          data: { status: 'PAYMENT_FAILED' },
        });
      }
    });

    return {
      RspCode: '00',
      Message: 'Confirm Success',
    };
  } catch (error) {
    console.error('[VNPay IPN] Processing error:', error);

    return {
      RspCode: '99',
      Message: 'Processing error',
    };
  }
}


  async createPaymentUrl(
  paymentId: number,
  amount: number,
  ipAddress: string,
  ): Promise<string> {
  const dateFormat = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');

    return (
      date.getFullYear().toString() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  };

  const now = new Date();
  const expireTime = new Date(now.getTime() + 15 * 60 * 1000);

  const params: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: this.tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(paymentId),
    vnp_OrderInfo: `Thanh toan don hang ${paymentId}`,
    vnp_OrderType: 'other',
    vnp_Amount: String(amount * 100),
    vnp_ReturnUrl: this.returnUrl,
    vnp_IpAddr: ipAddress,
    vnp_CreateDate: dateFormat(now),
    vnp_ExpireDate: dateFormat(expireTime),
  };

const signData = this.signData(params);

const secureHash = createHmac('sha512', this.hashSecret)
  .update(signData, 'utf-8')
  .digest('hex');

const sortedParams = this.sortVnpayParams(params);

const queryString = qs.stringify(
  {
    ...sortedParams,
    vnp_SecureHash: secureHash,
  },
  { encode: false },
);

return `${this.paymentUrl}?${queryString}`;
}

 async verifyReturn(
  query: Record<string, string | string[] | undefined>,
) {
  if (!this.verifySignature(query)) {
    return {
      valid: false,
      code: '97',
      message: 'Invalid signature',
    };
  }

  // 1. Lấy ID payment từ callback VNPay
  const paymentId = Number(query.vnp_TxnRef);

  if (!Number.isSafeInteger(paymentId) || paymentId < 1) {
    return {
      valid: false,
      code: '04',
      message: 'Invalid reference',
    };
  }

  // 2. Tìm payment trong database
  const payment = await this.prisma.payment.findUnique({
    where: { id: paymentId },
  });

  // 3. Kiểm tra dữ liệu thanh toán
  const receivedAmount = Number(query.vnp_Amount);
  const expectedAmount = payment
    ? payment.amount * 100
    : null;

  if (
    !payment ||
    payment.method !== 'VNPAY' ||
    query.vnp_TmnCode !== this.tmnCode ||
    receivedAmount !== expectedAmount
  ) {
    return {
      valid: false,
      code: '04',
      message: 'Payment mismatch',
    };
  }

  // 4. Trả kết quả thanh toán
  return {
    valid: true,
    orderId: payment.orderId,
    paymentStatus: payment.status,
    responseCode: query.vnp_ResponseCode,
    message:
      'Return URL chỉ hiển thị kết quả; IPN xác nhận trạng thái đơn hàng.',
  };
}

  async findPaymentForTest(paymentId: number) {
  const payment = await this.prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    return {
      found: false,
      paymentId,
      message: 'Payment not found',
    };
  }

  return {
    found: true,
    paymentId: payment.id,
    orderId: payment.orderId,
    amount: payment.amount,
    paymentStatus: payment.status,
  };
}
}
