import { Injectable, BadRequestException } from '@nestjs/common';
import { db, events, bookings } from '@repo/database';
import { eq, sql } from 'drizzle-orm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';

@Injectable()
export class BookingsService {
  /**
   * Create a booking with concurrency control
   * Uses database transaction with row-level locking to prevent overbooking
   */
  async create(createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    try {
      // Execute booking in a transaction
      const result = await db.transaction(async (tx) => {
        // Step 1: Get event with row-level lock
        // Use sql template to get proper typing
        const lockedEvents = await tx.execute<{
          id: number;
          total_tickets: number;
          booked_tickets: number;
          current_price: number;
        }>(
          sql`SELECT * FROM events WHERE id = ${createBookingDto.eventId} FOR UPDATE`
        );
        
        // Check if event exists
        if (lockedEvents.length === 0) {
          throw new BadRequestException('Event not found');
        }
        
        const event = lockedEvents[0];
        
        // Step 2: Check ticket availability
        const availableTickets = event.total_tickets - event.booked_tickets;
        
        if (availableTickets < createBookingDto.quantity) {
          throw new BadRequestException(
            `Not enough tickets available. Only ${availableTickets} ticket(s) remaining.`
          );
        }
        
        // Step 3: Calculate total price
        const totalPrice = event.current_price * createBookingDto.quantity;
        
        // Step 4: Create the booking
        const [booking] = await tx
          .insert(bookings)
          .values({
            eventId: createBookingDto.eventId,
            userEmail: createBookingDto.email,
            quantity: createBookingDto.quantity,
            pricePaid: totalPrice,
            status: 'confirmed' as const,
          } as any)
          .returning();
        
        // Step 5: Update event's booked tickets atomically
        await tx
          .update(events)
          .set({ 
            bookedTickets: event.booked_tickets + createBookingDto.quantity 
          } as any)
          .where(eq(events.id, createBookingDto.eventId));
        
        return booking;
      });
      
      // Format and return response
      return {
        bookingId: result.id,
        eventId: result.eventId,
        quantity: result.quantity,
        email: result.userEmail,
        totalPrice: `$${(result.pricePaid / 100).toFixed(2)}`,
        status: result.status,
        createdAt: result.bookingTimestamp,
      };
      
    } catch (error) {
      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Handle other errors
      throw new BadRequestException(
        `Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  async findByEvent(eventId: number): Promise<BookingResponseDto[]> {
    const bookingsList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId));
    
    return bookingsList.map(b => ({
      bookingId: b.id,
      eventId: b.eventId,
      quantity: b.quantity,
      email: b.userEmail,
      totalPrice: `$${(b.pricePaid / 100).toFixed(2)}`,
      status: b.status,
      createdAt: b.bookingTimestamp,
    }));
  }
}
