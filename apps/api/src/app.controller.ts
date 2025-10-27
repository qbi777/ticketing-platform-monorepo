import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { PricingService } from './pricing/pricing.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly pricingService: PricingService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('pricing/test/:eventId')
  async testPricing(@Param('eventId') eventId: string) {
    try {
      const priceBreakdown = await this.pricingService.getPriceBreakdown(
        parseInt(eventId),
      );
      return {
        success: true,
        eventId: parseInt(eventId),
        pricing: priceBreakdown,
      };
    } catch (err) {
      const error = err as Error;
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }
}
