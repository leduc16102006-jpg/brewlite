import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private createAccessToken(user: { id: number; email: string }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được đăng ký');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let user;

    try {
      user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName.trim(),
          email,
          passwordHash,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email đã được đăng ký');
      }

      throw error;
    }

    return {
      message: 'Đăng ký thành công',
      accessToken: this.createAccessToken(user),
      tokenType: 'Bearer',
      user,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không chính xác',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Email hoặc mật khẩu không chính xác',
      );
    }

    return {
      message: 'Đăng nhập thành công',
      accessToken: this.createAccessToken(user),
      tokenType: 'Bearer',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}