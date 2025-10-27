import { Injectable } from '@nestjs/common';
import {
  EventPricingData,
  PriceCalculationResult,
} from './interfaces/pricing-rule.interface';
import { TimeBasedRule } from './rules/time-based.rule';
import { DemandBasedRule } from './rules/demand-based.rule';
import { InventoryBasedRule } from './rules/inventory-based.rule';

/**
 * Pricing Calculator
 * 
 * Orchestrates all pricing rules and calculates final price
 * 
 * Formula: currentPrice = basePrice × (1 + sum of weighted adjustments)
 * 
 * Where weighted adjustment = rule_adjustment × rule_weight
 */
@Injectable()
export class PricingCalculator {
  /**
   * Calculate current price for an event
   * 
   * @param eventData Event pricing data from database
   * @param recentBookingsCount Number of bookings in last hour (for demand rule)
   * @returns Complete price calculation with breakdown
   */
  async calculatePrice(
    eventData: EventPricingData,
    recentBookingsCount: number = 0,
  ): Promise<PriceCalculationResult> {
    // Initialize pricing rules
    const timeRule = new TimeBasedRule(eventData);
    const demandRule = new DemandBasedRule(eventData, recentBookingsCount);
    const inventoryRule = new InventoryBasedRule(eventData);

    // Calculate adjustments from each rule
    const timeAdjustment = await timeRule.calculate();
    const demandAdjustment = await demandRule.calculate();
    const inventoryAdjustment = await inventoryRule.calculate();

    // Get weights from configuration
    const { timeWeight, demandWeight, inventoryWeight } = eventData.pricingRules;

    // Calculate weighted adjustments
    const weightedTimeAdjustment = timeAdjustment * timeWeight;
    const weightedDemandAdjustment = demandAdjustment * demandWeight;
    const weightedInventoryAdjustment = inventoryAdjustment * inventoryWeight;

    // Sum all weighted adjustments
    const totalAdjustment =
      weightedTimeAdjustment +
      weightedDemandAdjustment +
      weightedInventoryAdjustment;

    // Apply formula: currentPrice = basePrice × (1 + totalAdjustment)
    let calculatedPrice = Math.round(
      eventData.basePrice * (1 + totalAdjustment),
    );

    // Track if price was capped
    let cappedByFloor = false;
    let cappedByCeiling = false;

    // Enforce floor constraint
    if (calculatedPrice < eventData.priceFloor) {
      calculatedPrice = eventData.priceFloor;
      cappedByFloor = true;
    }

    // Enforce ceiling constraint
    if (calculatedPrice > eventData.priceCeiling) {
      calculatedPrice = eventData.priceCeiling;
      cappedByCeiling = true;
    }

    // Return complete calculation result
    return {
      basePrice: eventData.basePrice,
      currentPrice: calculatedPrice,
      adjustments: {
        time: timeAdjustment,
        demand: demandAdjustment,
        inventory: inventoryAdjustment,
      },
      breakdown: {
        timeAdjustment: weightedTimeAdjustment,
        demandAdjustment: weightedDemandAdjustment,
        inventoryAdjustment: weightedInventoryAdjustment,
        totalAdjustment: totalAdjustment,
      },
      cappedByFloor,
      cappedByCeiling,
    };
  }

  /**
   * Format price for display (converts cents to dollars)
   */
  formatPrice(priceInCents: number): string {
    return `$${(priceInCents / 100).toFixed(2)}`;
  }

  /**
   * Calculate price change percentage
   */
  calculatePriceChange(basePrice: number, currentPrice: number): number {
    return ((currentPrice - basePrice) / basePrice) * 100;
  }
}
