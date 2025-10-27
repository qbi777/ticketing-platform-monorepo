import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db, events } from '@repo/database';
import { eq } from 'drizzle-orm';
import { CreateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class EventsService {
  constructor(private readonly pricingService: PricingService) {}

  async findAll(): Promise<EventResponseDto[]> {
    const allEvents = await db.select().from(events);

    const eventsWithPricing = await Promise.all(
      allEvents.map(async (event) => {
        await this.pricingService.updateEventPrice(event.id);
        
        const [updatedEvent] = await db
          .select()
          .from(events)
          .where(eq(events.id, event.id));

        return this.formatEventResponse(updatedEvent);
      }),
    );

    return eventsWithPricing;
  }

  async findOne(id: number): Promise<EventResponseDto> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const priceBreakdown = await this.pricingService.getPriceBreakdown(id);
    await this.pricingService.updateEventPrice(id);

    const [updatedEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));

    const response = this.formatEventResponse(updatedEvent);
    response.priceBreakdown = priceBreakdown;

    return response;
  }

  async create(createEventDto: CreateEventDto): Promise<EventResponseDto> {
    if (createEventDto.priceFloor > createEventDto.priceCeiling) {
      throw new BadRequestException('Price floor cannot be greater than price ceiling');
    }

    if (createEventDto.basePrice < createEventDto.priceFloor) {
      throw new BadRequestException('Base price cannot be less than price floor');
    }

    if (createEventDto.basePrice > createEventDto.priceCeiling) {
      throw new BadRequestException('Base price cannot be greater than price ceiling');
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        name: createEventDto.name,
        date: new Date(createEventDto.date),
        venue: createEventDto.venue,
        description: createEventDto.description,
        totalTickets: createEventDto.totalTickets,
        bookedTickets: 0,
        basePrice: createEventDto.basePrice,
        currentPrice: createEventDto.basePrice,
        priceFloor: createEventDto.priceFloor,
        priceCeiling: createEventDto.priceCeiling,
        organizerId: createEventDto.organizerId,
        status: createEventDto.status || 'published',
      } as any)
      .returning();

    return this.formatEventResponse(newEvent);
  }

  private formatEventResponse(event: any): EventResponseDto {
    return {
      id: event.id,
      name: event.name,
      date: event.date,
      venue: event.venue,
      description: event.description,
      totalTickets: event.totalTickets,
      bookedTickets: event.bookedTickets,
      availableTickets: event.totalTickets - event.bookedTickets,
      basePrice: `$${(event.basePrice / 100).toFixed(2)}`,
      currentPrice: `$${(event.currentPrice / 100).toFixed(2)}`,
      priceFloor: `$${(event.priceFloor / 100).toFixed(2)}`,
      priceCeiling: `$${(event.priceCeiling / 100).toFixed(2)}`,
      status: event.status,
      organizerId: event.organizerId,
    };
  }
}
