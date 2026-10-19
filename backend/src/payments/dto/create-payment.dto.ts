
import { IsEnum, IsInt, Min } from 'class-validator';

export enum PaymentMethod {
  WALLET = 'WALLET',
  CARD = 'CARD',
}

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  orderId: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
