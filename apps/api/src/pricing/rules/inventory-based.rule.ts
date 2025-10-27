import { Injectable } from '@nestjs/common';
import { PricingRule, EventPricingData } from '../interfaces/pricing-rule.interface';

/**
 * Inventory-Based Pricing Rule
 * 
 * Logic: Price increases as tickets sell out
 * Based on percentage of remaining tickets
 * 
 * Default thresholds:
 * - 80%+ available: No increase (0%)
 * - 50-80% available: Small increase (10%)
 * - 20-50% available: Moderate increase (25%)
 * - <20% available: Large increase (50%)
 */
@Injectable()
export class InventoryBasedRule implements PricingRule {
  constructor(private readonly eventData: EventPricingData) {}

  calculate(): number {
    const { totalTickets, bookedTickets } = this.eventData;
    
    // Calculate percentage of tickets remaining
    const remainingTickets = totalTickets - bookedTickets;
    const percentageRemaining = (remainingTickets / totalTickets) * 100;
    
    const thresholds = this.eventData.pricingRules.inventoryRules.thresholds;
    
    // Sold out or oversold - maximum adjustment
    if (percentageRemaining <= 0) {
      return thresholds['10'] || 0.5;
    }
    
    // Less than 10% remaining - critical scarcity
    if (percentageRemaining < 10) {
      return thresholds['10'] || 0.5; // Default: 0.5 (50% increase)
    }
    
    // Less than 20% remaining - high scarcity
    if (percentageRemaining < 20) {
      return thresholds['20'] || 0.25; // Default: 0.25 (25% increase)
    }
    
    // Less than 50% remaining - moderate scarcity
    if (percentageRemaining < 50) {
      return thresholds['50'] || 0.10; // Default: 0.10 (10% increase)
    }
    
    // 50% or more remaining - plenty available
    return thresholds['80'] || 0; // Default: 0 (no increase)
  }
}
