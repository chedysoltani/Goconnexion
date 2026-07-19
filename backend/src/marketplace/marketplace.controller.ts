import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, Request, UseGuards,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // ── Public ────────────────────────────────────────────────────

  @Get('services')
  listServices(
    @Query('category') category?: string,
    @Query('search')   search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page')     page?: string,
    @Query('limit')    limit?: string,
  ) {
    return this.marketplaceService.listServices({
      category,
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('services/:id')
  getService(@Param('id') id: string) {
    return this.marketplaceService.getService(id);
  }

  // ── Auth ──────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('my-services')
  myServices(@Request() req: any) {
    return this.marketplaceService.myServices(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  myOrders(@Request() req: any) {
    return this.marketplaceService.myOrders(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-sales')
  mySales(@Request() req: any) {
    return this.marketplaceService.mySales(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('services')
  createService(
    @Request() req: any,
    @Body() body: {
      title: string;
      description: string;
      price: number;
      currency?: string;
      category: string;
      delivery: string;
      images?: string[];
    },
  ) {
    return this.marketplaceService.createService(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('services/:id')
  updateService(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    return this.marketplaceService.updateService(id, req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('services/:id')
  deleteService(@Param('id') id: string, @Request() req: any) {
    return this.marketplaceService.deleteService(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('services/:id/order')
  createOrder(@Param('id') serviceId: string, @Request() req: any) {
    return this.marketplaceService.createOrder(serviceId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('orders/:id/complete')
  completeOrder(@Param('id') orderId: string, @Request() req: any) {
    return this.marketplaceService.completeOrder(orderId, req.user.id);
  }
}
