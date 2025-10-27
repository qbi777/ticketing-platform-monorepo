"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookings = exports.events = exports.users = exports.bookingStatusEnum = exports.eventStatusEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// ============================================================================
// ENUMS
// ============================================================================
exports.userRoleEnum = (0, pg_core_1.pgEnum)("user_role", ["admin", "organizer", "customer"]);
exports.eventStatusEnum = (0, pg_core_1.pgEnum)("event_status", ["draft", "published", "cancelled", "completed"]);
exports.bookingStatusEnum = (0, pg_core_1.pgEnum)("booking_status", ["confirmed", "cancelled"]);
// ============================================================================
// USERS TABLE
// ============================================================================
// Purpose: Store user accounts (for future authentication, organizers)
// Note: Not required by assignment but useful for system integrity
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    name: (0, pg_core_1.text)("name").notNull(),
    role: (0, exports.userRoleEnum)("role").default("customer").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
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
exports.events = (0, pg_core_1.pgTable)("events", {
    // ------------------------------------------------------------------------
    // Basic Information (Required by assignment)
    // ------------------------------------------------------------------------
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(), // Event name
    date: (0, pg_core_1.timestamp)("date").notNull(), // Event date/time
    venue: (0, pg_core_1.text)("venue").notNull(), // Location/venue name
    description: (0, pg_core_1.text)("description"), // Event description (optional)
    // ------------------------------------------------------------------------
    // Capacity Management (Required by assignment)
    // ------------------------------------------------------------------------
    totalTickets: (0, pg_core_1.integer)("total_tickets").notNull(), // Maximum capacity
    bookedTickets: (0, pg_core_1.integer)("booked_tickets").default(0).notNull(), // Currently sold
    // ------------------------------------------------------------------------
    // Pricing Configuration (Required by assignment)
    // ------------------------------------------------------------------------
    basePrice: (0, pg_core_1.integer)("base_price").notNull(), // Starting price in cents
    currentPrice: (0, pg_core_1.integer)("current_price").notNull(), // Dynamically calculated price
    priceFloor: (0, pg_core_1.integer)("price_floor").notNull(), // Minimum allowed price
    priceCeiling: (0, pg_core_1.integer)("price_ceiling").notNull(), // Maximum allowed price
    // ------------------------------------------------------------------------
    // Pricing Rules Configuration (Required by assignment - stored as JSON)
    // ------------------------------------------------------------------------
    // Structure:
    // - timeWeight, demandWeight, inventoryWeight: Rule importance (sum to ~1.0)
    // - timeRules: Price adjustments based on days until event
    // - demandRules: Price adjustments based on booking velocity
    // - inventoryRules: Price adjustments based on remaining capacity
    // ------------------------------------------------------------------------
    pricingRules: (0, pg_core_1.jsonb)("pricing_rules").default({
        // Rule weights (configurable, should sum to ~1.0)
        timeWeight: 0.33,
        demandWeight: 0.33,
        inventoryWeight: 0.34,
        // Time-based pricing rules
        // Price increases as event date approaches
        timeRules: {
            days30Plus: 0, // 30+ days out: no increase
            days7To30: 0.10, // 7-30 days: +10%
            days1To7: 0.20, // 1-7 days: +20%
            hoursTo24: 0.50, // Last 24 hours: +50%
        },
        // Demand-based pricing rules
        // Price increases when booking velocity is high
        demandRules: {
            bookingsPerHourThreshold: 10, // If >10 bookings in last hour
            priceIncrease: 0.15, // Increase by 15%
        },
        // Inventory-based pricing rules
        // Price increases as tickets sell out
        inventoryRules: {
            thresholds: {
                "80": 0, // 80%+ available: no increase
                "50": 0.10, // 50-80% available: +10%
                "20": 0.25, // 20-50% available: +25%
                "10": 0.50, // <10% available: +50%
            },
        },
    }).notNull(),
    // ------------------------------------------------------------------------
    // Metadata (Additional useful fields)
    // ------------------------------------------------------------------------
    organizerId: (0, pg_core_1.integer)("organizer_id").references(() => exports.users.id),
    status: (0, exports.eventStatusEnum)("status").default("published").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
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
exports.bookings = (0, pg_core_1.pgTable)("bookings", {
    // ------------------------------------------------------------------------
    // Core Booking Information (Required by assignment)
    // ------------------------------------------------------------------------
    id: (0, pg_core_1.serial)("id").primaryKey(),
    eventId: (0, pg_core_1.integer)("event_id")
        .references(() => exports.events.id)
        .notNull(), // Reference to event
    userEmail: (0, pg_core_1.text)("user_email").notNull(), // Customer email (no auth required)
    quantity: (0, pg_core_1.integer)("quantity").notNull(), // Number of tickets purchased
    pricePaid: (0, pg_core_1.integer)("price_paid").notNull(), // Total price paid (snapshot in cents)
    bookingTimestamp: (0, pg_core_1.timestamp)("booking_timestamp")
        .defaultNow()
        .notNull(), // When booking was made
    // ------------------------------------------------------------------------
    // Metadata (Additional useful fields)
    // ------------------------------------------------------------------------
    status: (0, exports.bookingStatusEnum)("status").default("confirmed").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
