import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
  };
}

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user.userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Lấy lịch sử đơn hàng của người dùng hiện tại' })
  findMyOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.findMyOrders(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một đơn hàng theo ID' })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.findOne(req.user.userId, orderId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (State Machine)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}