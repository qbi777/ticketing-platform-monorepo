/**
 * Interface that all pricing rules must implement
 * Each rule calculates an adjustment factor (0.0 to 1.0+)
 */
export interface PricingRule {
  /**
   * Calculate the price adjustment for this rule
   * @returns number between 0 and 1+ representing percentage increase
   * Example: 0.2 = 20% increase, 0.5 = 50% increase
   */
  calculate(): number | Promise<number>;
}

/**
 * Event data required for pricing calculations
 */
export interface EventPricingData {
  id: number;
  date: Date;
  totalTickets: number;
  bookedTickets: number;
  basePrice: number;
  priceFloor: number;
  priceCeiling: number;
  pricingRules: PricingRulesConfig;
}

/**
 * Pricing rules configuration from database
 */
export interface PricingRulesConfig {
  timeWeight: number;
  demandWeight: number;
  inventoryWeight: number;
  timeRules: {
    days30Plus: number;
    days7To30: number;
    days1To7: number;
    hoursTo24: number;
  };
  demandRules: {
    bookingsPerHourThreshold: number;
    priceIncrease: number;
  };
  inventoryRules: {
    thresholds: {
      [key: string]: number;
    };
  };
}

/**
 * Result of pricing calculation
 */
export interface PriceCalculationResult {
  basePrice: number;
  currentPrice: number;
  adjustments: {
    time: number;
    demand: number;
    inventory: number;
  };
  breakdown: {
    timeAdjustment: number;
    demandAdjustment: number;
    inventoryAdjustment: number;
    totalAdjustment: number;
  };
  cappedByFloor: boolean;
  cappedByCeiling: boolean;
}
