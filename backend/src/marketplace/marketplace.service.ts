import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../subscription/stripe.service';
import { getFrontendUrl } from '../common/frontend-url';

export const MARKETPLACE_CATEGORIES = [
  'TECH', 'DESIGN', 'MARKETING', 'COMPTABILITE',
  'SANTE', 'COACHING', 'JURIDIQUE', 'FORMATION', 'TRADUCTION', 'AUTRE',
] as const;

const SELLER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  freelancerProfile: { select: { title: true } },
  entrepreneurProfile: { select: { companyName: true } },
};

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => StripeService))
    private readonly stripe: StripeService,
  ) {}

  // ── List services ─────────────────────────────────────────────
  async listServices(params: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const { category, search, minPrice, maxPrice, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const [services, total] = await Promise.all([
      this.prisma.marketplaceService.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { seller: { select: SELLER_SELECT } },
      }),
      this.prisma.marketplaceService.count({ where }),
    ]);

    return { services, total, page, limit };
  }

  // ── Get one ───────────────────────────────────────────────────
  async getService(id: string) {
    const service = await this.prisma.marketplaceService.findFirst({
      where: { id, status: { not: 'DELETED' } },
      include: {
        seller: { select: SELLER_SELECT },
        _count: { select: { orders: { where: { status: { in: ['PAID', 'COMPLETED'] } } } } },
      },
    });
    if (!service) throw new NotFoundException('Service introuvable');
    return service;
  }

  // ── Create service ────────────────────────────────────────────
  async createService(sellerId: string, data: {
    title: string;
    description: string;
    price: number;
    currency?: string;
    category: string;
    delivery: string;
    images?: string[];
  }) {
    if (!MARKETPLACE_CATEGORIES.includes(data.category as any)) {
      throw new BadRequestException('Catégorie invalide');
    }
    return this.prisma.marketplaceService.create({
      data: {
        title:       data.title,
        description: data.description,
        price:       data.price,
        currency:    data.currency ?? 'CAD',
        category:    data.category,
        delivery:    data.delivery,
        images:      data.images ?? [],
        sellerId,
      },
      include: { seller: { select: SELLER_SELECT } },
    });
  }

  // ── Update service ────────────────────────────────────────────
  async updateService(id: string, sellerId: string, data: Partial<{
    title: string;
    description: string;
    price: number;
    category: string;
    delivery: string;
    images: string[];
    status: string;
  }>) {
    const svc = await this.prisma.marketplaceService.findUnique({ where: { id } });
    if (!svc) throw new NotFoundException('Service introuvable');
    if (svc.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');
    return this.prisma.marketplaceService.update({ where: { id }, data });
  }

  // ── Delete service (soft) ─────────────────────────────────────
  async deleteService(id: string, sellerId: string) {
    const svc = await this.prisma.marketplaceService.findUnique({ where: { id } });
    if (!svc) throw new NotFoundException('Service introuvable');
    if (svc.sellerId !== sellerId) throw new ForbiddenException('Accès refusé');
    return this.prisma.marketplaceService.update({ where: { id }, data: { status: 'DELETED' } });
  }

  // ── My services ───────────────────────────────────────────────
  async myServices(sellerId: string) {
    return this.prisma.marketplaceService.findMany({
      where: { sellerId, status: { not: 'DELETED' } },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { orders: { where: { status: { in: ['PAID', 'COMPLETED'] } } } } },
      },
    });
  }

  // ── My orders (as buyer) ──────────────────────────────────────
  async myOrders(buyerId: string) {
    return this.prisma.marketplaceOrder.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          include: { seller: { select: SELLER_SELECT } },
        },
      },
    });
  }

  // ── My sales (as seller) ──────────────────────────────────────
  async mySales(sellerId: string) {
    return this.prisma.marketplaceOrder.findMany({
      where: { service: { sellerId } },
      orderBy: { createdAt: 'desc' },
      include: {
        service: true,
        buyer: {
          select: {
            id: true, firstName: true, lastName: true, avatarUrl: true, role: true,
          },
        },
      },
    });
  }

  // ── Create order + Stripe session ─────────────────────────────
  async createOrder(serviceId: string, buyerId: string) {
    const svc = await this.prisma.marketplaceService.findFirst({
      where: { id: serviceId, status: 'ACTIVE' },
      include: { seller: true },
    });
    if (!svc) throw new NotFoundException('Service introuvable ou inactif');
    if (svc.sellerId === buyerId) throw new BadRequestException('Vous ne pouvez pas acheter votre propre service');

    const order = await this.prisma.marketplaceOrder.create({
      data: {
        serviceId,
        buyerId,
        amount:   svc.price,
        currency: svc.currency,
        status:   'PENDING',
      },
    });

    const frontendUrl = getFrontendUrl();
    let checkoutUrl: string | null = null;

    if (this.stripe.isConfigured()) {
      const { url, sessionId } = await this.stripe.createMarketplaceCheckoutSession({
        amount:       Math.round(svc.price * 100),
        currency:     svc.currency.toLowerCase(),
        serviceTitle: svc.title,
        orderId:      order.id,
        serviceId,
        buyerId,
        successUrl:   `${frontendUrl}/marketplace/order-success?orderId=${order.id}`,
        cancelUrl:    `${frontendUrl}/marketplace/${serviceId}`,
      });
      await this.prisma.marketplaceOrder.update({
        where: { id: order.id },
        data: { stripeSessionId: sessionId },
      });
      checkoutUrl = url;
    }

    return { order, checkoutUrl };
  }

  // ── Complete order (buyer confirms delivery) ──────────────────
  async completeOrder(orderId: string, buyerId: string) {
    const order = await this.prisma.marketplaceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.buyerId !== buyerId) throw new ForbiddenException('Accès refusé');
    if (!['PAID', 'DELIVERED'].includes(order.status)) {
      throw new BadRequestException('La commande ne peut pas être complétée dans cet état');
    }
    return this.prisma.marketplaceOrder.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });
  }

  // ── Webhook: activate order after payment ─────────────────────
  async activateOrder(orderId: string, stripeSessionId: string) {
    return this.prisma.marketplaceOrder.update({
      where: { id: orderId },
      data: { status: 'PAID', stripeSessionId },
    });
  }
}
