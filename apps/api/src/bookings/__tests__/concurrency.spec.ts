import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { db, events } from '@repo/database';

describe('Booking Concurrency Control (Critical Test)', () => {
  let app: INestApplication;
  let testEventId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    app.setGlobalPrefix('api');
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const [event] = await db
      .insert(events)
      .values({
        name: 'Concurrency Test Event',
        date: new Date('2025-12-31T20:00:00Z'),
        venue: 'Test Venue',
        description: 'Testing concurrent bookings',
        totalTickets: 1,
        bookedTickets: 0,
        basePrice: 5000,
        currentPrice: 5000,
        priceFloor: 5000,
        priceCeiling: 5000,
        status: 'published',
      } as any)
      .returning();

    testEventId = event.id;
  });

  it('should prevent overbooking when 2 users book the last ticket simultaneously', async () => {
    const booking1 = {
      eventId: testEventId,
      email: 'user1@concurrent-test.com',
      quantity: 1,
    };

    const booking2 = {
      eventId: testEventId,
      email: 'user2@concurrent-test.com',
      quantity: 1,
    };

    const [response1, response2] = await Promise.all([
      request(app.getHttpServer())
        .post('/api/bookings')
        .send(booking1),
      request(app.getHttpServer())
        .post('/api/bookings')
        .send(booking2),
    ]);

    const responses = [response1, response2];
    const successfulBookings = responses.filter(r => r.status === 201 || r.body.success === true);
    const failedBookings = responses.filter(r => r.status === 400);

    expect(successfulBookings).toHaveLength(1);
    expect(failedBookings).toHaveLength(1);

    const failedResponse = failedBookings[0];
    expect(failedResponse.body.message).toContain('Not enough tickets available');

    const verifyResponse = await request(app.getHttpServer())
      .get(`/api/events/${testEventId}`);

    expect(verifyResponse.body.data.bookedTickets).toBe(1);
    expect(verifyResponse.body.data.availableTickets).toBe(0);

    const bookingsResponse = await request(app.getHttpServer())
      .get(`/api/bookings?eventId=${testEventId}`);

    expect(bookingsResponse.body.count).toBe(1);
  });

  it('should handle multiple concurrent bookings correctly', async () => {
    const [multiEvent] = await db
      .insert(events)
      .values({
        name: 'Multi-ticket Test',
        date: new Date('2025-12-31T20:00:00Z'),
        venue: 'Test Venue',
        totalTickets: 3,
        bookedTickets: 0,
        basePrice: 5000,
        currentPrice: 5000,
        priceFloor: 5000,
        priceCeiling: 5000,
        status: 'published',
      } as any)
      .returning();

    const bookingPromises = Array.from({ length: 5 }, (_, i) =>
      request(app.getHttpServer())
        .post('/api/bookings')
        .send({
          eventId: multiEvent.id,
          email: `user${i}@test.com`,
          quantity: 1,
        })
    );

    const responses = await Promise.all(bookingPromises);

    const successful = responses.filter(r => r.status === 201 || r.body.success === true);
    const failed = responses.filter(r => r.status === 400);

    expect(successful).toHaveLength(3);
    expect(failed).toHaveLength(2);

    const finalEvent = await request(app.getHttpServer())
      .get(`/api/events/${multiEvent.id}`);

    expect(finalEvent.body.data.bookedTickets).toBe(3);
    expect(finalEvent.body.data.availableTickets).toBe(0);
  });
});
