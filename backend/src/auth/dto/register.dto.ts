import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}