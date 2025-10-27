import { Injectable } from '@nestjs/common';
import { db, events, bookings } from '@repo/database';
import { eq, and, gte } from 'drizzle-orm';
import { PricingCalculator } from './pricing.calculator';
import {
  EventPricingData,
  PriceCalculationResult,
} from './interfaces/pricing-rule.interface';

@Injectable()
export class PricingService {
  constructor(private readonly pricingCalculator: PricingCalculator) {}

  async getCurrentPrice(eventId: number): Promise<PriceCalculationResult> {
    const event = await this.getEventPricingData(eventId);
    
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    const recentBookingsCount = await this.getRecentBookingsCount(eventId);
    const priceResult = await this.pricingCalculator.calculatePrice(
      event,
      recentBookingsCount,
    );

    return priceResult;
  }

  async updateEventPrice(eventId: number): Promise<number> {
    const priceResult = await this.getCurrentPrice(eventId);

    await db
      .update(events)
      .set({ 
        currentPrice: priceResult.currentPrice,
      })
      .where(eq(events.id, eventId));

    return priceResult.currentPrice;
  }

  async getPriceBreakdown(eventId: number) {
    const priceResult = await this.getCurrentPrice(eventId);
    
    return {
      basePrice: this.pricingCalculator.formatPrice(priceResult.basePrice),
      currentPrice: this.pricingCalculator.formatPrice(priceResult.currentPrice),
      priceChange: this.pricingCalculator.calculatePriceChange(
        priceResult.basePrice,
        priceResult.currentPrice,
      ).toFixed(1) + '%',
      breakdown: {
        timeImpact: (priceResult.breakdown.timeAdjustment * 100).toFixed(1) + '%',
        demandImpact: (priceResult.breakdown.demandAdjustment * 100).toFixed(1) + '%',
        inventoryImpact: (priceResult.breakdown.inventoryAdjustment * 100).toFixed(1) + '%',
        totalImpact: (priceResult.breakdown.totalAdjustment * 100).toFixed(1) + '%',
      },
      constraints: {
        cappedByFloor: priceResult.cappedByFloor,
        cappedByCeiling: priceResult.cappedByCeiling,
      },
    };
  }

  private async getEventPricingData(
    eventId: number,
  ): Promise<EventPricingData | null> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return null;
    }

    return {
      id: event.id,
      date: event.date,
      totalTickets: event.totalTickets,
      bookedTickets: event.bookedTickets,
      basePrice: event.basePrice,
      priceFloor: event.priceFloor,
      priceCeiling: event.priceCeiling,
      pricingRules: event.pricingRules as any,
    };
  }

  private async getRecentBookingsCount(eventId: number): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.eventId, eventId),
          gte(bookings.bookingTimestamp, oneHourAgo),
        ),
      );

    return recentBookings.length;
  }
}
