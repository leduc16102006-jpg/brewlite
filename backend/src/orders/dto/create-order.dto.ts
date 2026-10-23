import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  qty: number;

  @ApiPropertyOptional({ example: 'M', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  size?: string;

  // BỔ SUNG ĐỂ SWAGGER VÀ BACKEND CHẤP NHẬN TOPPING
  @ApiPropertyOptional({
    example: ['Trân châu', 'Kem cheese'],
    type: [String],
    description: 'Danh sách topping kèm theo',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  toppings?: string[];
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({
    example: 'WELCOME10',
    description: 'Mã khuyến mãi (không bắt buộc)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  promotionCode?: string;
}