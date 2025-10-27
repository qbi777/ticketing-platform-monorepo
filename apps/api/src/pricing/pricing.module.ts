import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingCalculator } from './pricing.calculator';

/**
 * Pricing Module
 * 
 * Encapsulates all pricing-related functionality
 * - Dynamic price calculation
 * - Time-based, demand-based, and inventory-based rules
 * - Price breakdown and formatting
 */
@Module({
  providers: [PricingService, PricingCalculator],
  exports: [PricingService, PricingCalculator],
})
export class PricingModule {}
