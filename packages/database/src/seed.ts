import { db, users, events, bookings } from './index';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    console.log('👥 Creating organizer users...');
    const createdUsers = await db
      .insert(users)
      .values([
        {
          email: 'organizer@example.com',
          name: 'John Event Organizer',
          role: 'organizer',
        },
        {
          email: 'sarah@festivals.com',
          name: 'Sarah Festival Manager',
          role: 'organizer',
        },
        {
          email: 'admin@ticketing.com',
          name: 'System Admin',
          role: 'admin',
        },
      ])
      .returning();

    const organizer1 = createdUsers[0]!;
    const organizer2 = createdUsers[1]!;

    console.log(`   ✓ Created ${3} users\n`);

    console.log('🎪 Creating sample events...');

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in2Weeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const sampleEvents = await db
      .insert(events)
      .values([
        {
          name: 'Tech Conference 2025',
          date: nextMonth,
          venue: 'San Francisco Convention Center',
          description: 'Annual technology conference',
          totalTickets: 500,
          bookedTickets: 50,
          basePrice: 15000,
          currentPrice: 15000,
          priceFloor: 10000,
          priceCeiling: 30000,
          organizerId: organizer1.id,
          status: 'published',
        },
        {
          name: 'Rock Concert - The Legends',
          date: tomorrow,
          venue: 'Madison Square Garden',
          description: 'Epic rock concert',
          totalTickets: 200,
          bookedTickets: 185,
          basePrice: 8000,
          currentPrice: 8000,
          priceFloor: 5000,
          priceCeiling: 20000,
          organizerId: organizer1.id,
          status: 'published',
        },
        {
          name: 'International Food Festival',
          date: nextWeek,
          venue: 'Central Park',
          description: 'Taste cuisines from around the world',
          totalTickets: 1000,
          bookedTickets: 500,
          basePrice: 3500,
          currentPrice: 3500,
          priceFloor: 2500,
          priceCeiling: 7500,
          organizerId: organizer2.id,
          status: 'published',
        },
        {
          name: 'Stand-Up Comedy Night',
          date: in2Weeks,
          venue: 'Comedy Club Downtown',
          description: 'Evening of laughter',
          totalTickets: 150,
          bookedTickets: 15,
          basePrice: 4000,
          currentPrice: 4000,
          priceFloor: 3000,
          priceCeiling: 8000,
          organizerId: organizer2.id,
          status: 'published',
        },
        {
          name: 'Jazz Night Under The Stars',
          date: in3Days,
          venue: 'Rooftop Amphitheater',
          description: 'Intimate jazz performance',
          totalTickets: 300,
          bookedTickets: 180,
          basePrice: 6000,
          currentPrice: 6000,
          priceFloor: 4500,
          priceCeiling: 12000,
          organizerId: organizer1.id,
          status: 'published',
        },
        {
          name: 'Summer Music Festival 2025',
          date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
          venue: 'Beach Boardwalk',
          description: 'Multi-day music festival',
          totalTickets: 5000,
          bookedTickets: 0,
          basePrice: 25000,
          currentPrice: 25000,
          priceFloor: 20000,
          priceCeiling: 40000,
          organizerId: organizer2.id,
          status: 'draft',
        },
      ])
      .returning();

    console.log(`   ✓ Created ${sampleEvents.length} events\n`);

    console.log('🎫 Creating sample bookings...');

    let totalBookingsCreated = 0;

    for (const event of sampleEvents) {
      if (event.status === 'draft' || event.bookedTickets === 0) continue;

      const avgTicketsPerBooking = 2;
      const numberOfBookings = Math.ceil(event.bookedTickets / avgTicketsPerBooking);

      const bookingsToCreate = [];

      for (let i = 0; i < numberOfBookings; i++) {
        const quantity = Math.floor(Math.random() * 4) + 1;
        const daysAgo = Math.random() * 7;
        const bookingTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const pricePaid = event.basePrice * quantity;

        bookingsToCreate.push({
          eventId: event.id,
          userEmail: `user${i + 1}@example.com`,
          quantity: quantity,
          pricePaid: pricePaid,
          bookingTimestamp: bookingTime,
          status: 'confirmed' as const,
        });
      }

      if (bookingsToCreate.length > 0) {
        await db.insert(bookings).values(bookingsToCreate);
        totalBookingsCreated += bookingsToCreate.length;
      }
    }

    console.log(`   ✓ Created ${totalBookingsCreated} bookings\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Database seeded successfully!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   👥 Users created: ${3}`);
    console.log(`   🎪 Events created: ${sampleEvents.length}`);
    console.log(`   🎫 Bookings created: ${totalBookingsCreated}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n📊 Event Summary:');
    
    for (const event of sampleEvents) {
      const percentSold = ((event.bookedTickets / event.totalTickets) * 100).toFixed(1);
      const priceDisplay = `$${(event.basePrice / 100).toFixed(2)}`;
      console.log(`   • ${event.name}`);
      console.log(`     Status: ${event.status} | Tickets: ${event.bookedTickets}/${event.totalTickets} (${percentSold}%) | Price: ${priceDisplay}`);
    }
    
    console.log('\n🚀 Ready to start development!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
