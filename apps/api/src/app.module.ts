import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PricingModule } from './pricing/pricing.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    PricingModule,
    EventsModule,
    BookingsModule,
    AnalyticsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
