import { Body, Controller, Post, HttpCode, HttpStatus, Get, Req, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth
} from '@nestjs/swagger';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
    @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
    @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đăng nhập và nhận JWT Token' })
    @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
    @ApiResponse({ status: 401, description: 'Sai email hoặc mật khẩu' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy thông tin người dùng từ JWT' })
    @ApiResponse({ status: 200, description: 'JWT hợp lệ' })
    @ApiResponse({ status: 401, description: 'Thiếu hoặc sai JWT' })
    getProfile(
        @Req() req: Request & {
            user: { userId: number; email: string };
        },
    ) {
        return req.user;
    }
}
