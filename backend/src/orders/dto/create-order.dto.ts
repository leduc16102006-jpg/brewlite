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
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderToppingDto {
  @ApiProperty({ example: 'pearl' })
  @IsString()
  @MaxLength(50)
  id: string;

  @ApiProperty({ example: 'Trân châu' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 7000, minimum: 0 })
  @IsInt()
  @Min(0)
  price: number;
}

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
  @IsIn(['S', 'M', 'L'])
  size?: string;

  @ApiPropertyOptional({ type: [CreateOrderToppingDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderToppingDto)
  toppings?: CreateOrderToppingDto[];
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