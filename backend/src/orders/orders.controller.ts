import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
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
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(
      req.user.userId,
      dto,
    );
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get my order history',
  })
  findMyOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.findMyOrders(
      req.user.userId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order details',
  })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.findOne(
      req.user.userId,
      orderId,
    );
  }
}
