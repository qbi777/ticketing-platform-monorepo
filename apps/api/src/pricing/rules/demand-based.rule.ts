import { Injectable } from '@nestjs/common';
import { PricingRule, EventPricingData } from '../interfaces/pricing-rule.interface';

/**
 * Demand-Based Pricing Rule
 * 
 * Logic: Price increases when booking velocity is high
 * Checks recent booking activity (last hour) to detect high demand
 * 
 * Example: If more than 10 bookings in the last hour, increase by 15%
 */
@Injectable()
export class DemandBasedRule implements PricingRule {
  constructor(
    private readonly eventData: EventPricingData,
    private readonly recentBookingsCount: number, // Injected from service
  ) {}

  calculate(): number {
    const rules = this.eventData.pricingRules.demandRules;
    
    // Check if booking velocity exceeds threshold
    if (this.recentBookingsCount >= rules.bookingsPerHourThreshold) {
      // High demand detected - apply price increase
      return rules.priceIncrease; // Default: 0.15 (15% increase)
    }
    
    // Normal demand - no adjustment
    return 0;
  }
}
