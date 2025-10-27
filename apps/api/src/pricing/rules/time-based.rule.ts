import { Injectable } from '@nestjs/common';
import { PricingRule, EventPricingData } from '../interfaces/pricing-rule.interface';

/**
 * Time-Based Pricing Rule
 * 
 * Logic: Price increases as the event date approaches
 * - Events 30+ days out: No increase (0%)
 * - Events 7-30 days out: Moderate increase (default 10%)
 * - Events 1-7 days out: Higher increase (default 20%)
 * - Events within 24 hours: Maximum increase (default 50%)
 * 
 * Percentages are configurable via event's pricingRules
 */
@Injectable()
export class TimeBasedRule implements PricingRule {
  constructor(private readonly eventData: EventPricingData) {}

  calculate(): number {
    const now = new Date();
    const eventDate = new Date(this.eventData.date);
    
    // Calculate time difference in milliseconds
    const timeDiff = eventDate.getTime() - now.getTime();
    
    // Convert to days
    const daysUntilEvent = timeDiff / (1000 * 60 * 60 * 24);
    
    // Convert to hours for last-minute check
    const hoursUntilEvent = timeDiff / (1000 * 60 * 60);
    
    const rules = this.eventData.pricingRules.timeRules;
    
    // Event has passed - no adjustment
    if (daysUntilEvent < 0) {
      return 0;
    }
    
    // Last 24 hours - maximum urgency
    if (hoursUntilEvent <= 24) {
      return rules.hoursTo24; // Default: 0.5 (50% increase)
    }
    
    // 1-7 days out - high urgency
    if (daysUntilEvent <= 7) {
      return rules.days1To7; // Default: 0.2 (20% increase)
    }
    
    // 7-30 days out - moderate urgency
    if (daysUntilEvent <= 30) {
      return rules.days7To30; // Default: 0.1 (10% increase)
    }
    
    // 30+ days out - no urgency
    return rules.days30Plus; // Default: 0 (no increase)
  }
}
