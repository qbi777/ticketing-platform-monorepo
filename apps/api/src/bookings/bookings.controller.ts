import { Controller, Post, Get, Body, Query, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Book tickets (POST)
  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    const booking = await this.bookingsService.create(createBookingDto);
    return {
      success: true,
      message: 'Booking successful!',
      data: booking,
    };
  }

  // List bookings for an event (GET)
  @Get()
  async findByEvent(@Query('eventId', ParseIntPipe) eventId: number) {
    const bookings = await this.bookingsService.findByEvent(eventId);
    return {
      success: true,
      count: bookings.length,
      data: bookings,
    };
  }
}
