import { pgTable, serial, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["admin", "organizer", "customer"]);
export const eventStatusEnum = pgEnum("event_status", ["draft", "published", "cancelled", "completed"]);
export const bookingStatusEnum = pgEnum("booking_status", ["confirmed", "cancelled"]);

// ============================================================================
// USERS TABLE
// ============================================================================
// Purpose: Store user accounts (for future authentication, organizers)
// Note: Not required by assignment but useful for system integrity

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// EVENTS TABLE
// ============================================================================
// Purpose: Store event information with capacity and pricing configuration
// Requirements:
// - Basic info: name, date, venue, description ✓
// - Capacity: total tickets, booked tickets ✓
// - Pricing: base price, current price, floor, ceiling ✓
// - Pricing rules configuration (stored as JSON) ✓

export const events = pgTable("events", {
  // ------------------------------------------------------------------------
  // Basic Information (Required by assignment)
  // ------------------------------------------------------------------------
  id: serial("id").primaryKey(),
  name: text("name").notNull(),                    // Event name
  date: timestamp("date").notNull(),               // Event date/time
  venue: text("venue").notNull(),                  // Location/venue name
  description: text("description"),                // Event description (optional)
  
  // ------------------------------------------------------------------------
  // Capacity Management (Required by assignment)
  // ------------------------------------------------------------------------
  totalTickets: integer("total_tickets").notNull(),      // Maximum capacity
  bookedTickets: integer("booked_tickets").default(0).notNull(), // Currently sold
  
  // ------------------------------------------------------------------------
  // Pricing Configuration (Required by assignment)
  // ------------------------------------------------------------------------
  basePrice: integer("base_price").notNull(),            // Starting price in cents
  currentPrice: integer("current_price").notNull(),      // Dynamically calculated price
  priceFloor: integer("price_floor").notNull(),          // Minimum allowed price
  priceCeiling: integer("price_ceiling").notNull(),      // Maximum allowed price
  
  // ------------------------------------------------------------------------
  // Pricing Rules Configuration (Required by assignment - stored as JSON)
  // ------------------------------------------------------------------------
  // Structure:
  // - timeWeight, demandWeight, inventoryWeight: Rule importance (sum to ~1.0)
  // - timeRules: Price adjustments based on days until event
  // - demandRules: Price adjustments based on booking velocity
  // - inventoryRules: Price adjustments based on remaining capacity
  // ------------------------------------------------------------------------
  pricingRules: jsonb("pricing_rules").default({
    // Rule weights (configurable, should sum to ~1.0)
    timeWeight: 0.33,
    demandWeight: 0.33,
    inventoryWeight: 0.34,
    
    // Time-based pricing rules
    // Price increases as event date approaches
    timeRules: {
      days30Plus: 0,        // 30+ days out: no increase
      days7To30: 0.10,      // 7-30 days: +10%
      days1To7: 0.20,       // 1-7 days: +20%
      hoursTo24: 0.50,      // Last 24 hours: +50%
    },
    
    // Demand-based pricing rules
    // Price increases when booking velocity is high
    demandRules: {
      bookingsPerHourThreshold: 10,  // If >10 bookings in last hour
      priceIncrease: 0.15,            // Increase by 15%
    },
    
    // Inventory-based pricing rules
    // Price increases as tickets sell out
    inventoryRules: {
      thresholds: {
        "80": 0,      // 80%+ available: no increase
        "50": 0.10,   // 50-80% available: +10%
        "20": 0.25,   // 20-50% available: +25%
        "10": 0.50,   // <10% available: +50%
      },
    },
  }).notNull(),
  
  // ------------------------------------------------------------------------
  // Metadata (Additional useful fields)
  // ------------------------------------------------------------------------
  organizerId: integer("organizer_id").references(() => users.id),
  status: eventStatusEnum("status").default("published").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// BOOKINGS TABLE
// ============================================================================
// Purpose: Store ticket bookings/purchases
// Requirements:
// - Reference to event ✓
// - User email ✓
// - Quantity ✓
// - Price paid (snapshot at booking time) ✓
// - Booking timestamp ✓

export const bookings = pgTable("bookings", {
  // ------------------------------------------------------------------------
  // Core Booking Information (Required by assignment)
  // ------------------------------------------------------------------------
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .references(() => events.id)
    .notNull(),                                    // Reference to event
  userEmail: text("user_email").notNull(),         // Customer email (no auth required)
  quantity: integer("quantity").notNull(),         // Number of tickets purchased
  pricePaid: integer("price_paid").notNull(),      // Total price paid (snapshot in cents)
  bookingTimestamp: timestamp("booking_timestamp")
    .defaultNow()
    .notNull(),                                    // When booking was made
  
  // ------------------------------------------------------------------------
  // Metadata (Additional useful fields)
  // ------------------------------------------------------------------------
  status: bookingStatusEnum("status").default("confirmed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// TYPE EXPORTS (for TypeScript type inference)
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

// ============================================================================
// PRICING RULES TYPE (for type safety when working with JSON field)
// ============================================================================

export interface PricingRules {
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
