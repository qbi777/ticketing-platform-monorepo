import { Injectable, NotFoundException } from '@nestjs/common';
import { db, events, bookings } from '@repo/database';
import { eq, sum, count, avg } from 'drizzle-orm';

@Injectable()
export class AnalyticsService {
  /**
   * Get analytics for a specific event
   */
  async getEventAnalytics(eventId: number) {
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    
    // Get all bookings for this event
    const eventBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId));
    
    // Calculate metrics
    const totalSold = eventBookings.reduce((sum, b) => sum + b.quantity, 0);
    const totalRevenue = eventBookings.reduce((sum, b) => sum + b.pricePaid, 0);
    const avgPrice = eventBookings.length > 0 ? totalRevenue / totalSold : 0;
    const remaining = event.totalTickets - event.bookedTickets;
    
    return {
      eventId: event.id,
      eventName: event.name,
      totalTickets: event.totalTickets,
      ticketsSold: totalSold,
      ticketsRemaining: remaining,
      percentageSold: ((totalSold / event.totalTickets) * 100).toFixed(1) + '%',
      totalRevenue: `$${(totalRevenue / 100).toFixed(2)}`,
      averagePrice: `$${(avgPrice / 100).toFixed(2)}`,
      basePrice: `$${(event.basePrice / 100).toFixed(2)}`,
      currentPrice: `$${(event.currentPrice / 100).toFixed(2)}`,
      totalBookings: eventBookings.length,
    };
  }
  
  /**
   * Get system-wide analytics
   */
  async getSystemSummary() {
    const allEvents = await db.select().from(events);
    const allBookings = await db.select().from(bookings);
    
    const totalEvents = allEvents.length;
    const publishedEvents = allEvents.filter(e => e.status === 'published').length;
    const totalTicketsSold = allBookings.reduce((sum, b) => sum + b.quantity, 0);
    const totalRevenue = allBookings.reduce((sum, b) => sum + b.pricePaid, 0);
    const totalCapacity = allEvents.reduce((sum, e) => sum + e.totalTickets, 0);
    const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
    
    return {
      totalEvents,
      publishedEvents,
      draftEvents: allEvents.filter(e => e.status === 'draft').length,
      totalTicketsSold,
      totalCapacity,
      overallCapacityUsed: ((totalTicketsSold / totalCapacity) * 100).toFixed(1) + '%',
      totalRevenue: `$${(totalRevenue / 100).toFixed(2)}`,
      averageTicketPrice: `$${(averageTicketPrice / 100).toFixed(2)}`,
      totalBookings: allBookings.length,
    };
  }
}
