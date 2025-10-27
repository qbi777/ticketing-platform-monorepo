"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orders = exports.tickets = exports.events = exports.users = exports.eventStatusEnum = exports.ticketStatusEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Enums
exports.userRoleEnum = (0, pg_core_1.pgEnum)("user_role", ["admin", "organizer", "customer"]);
exports.ticketStatusEnum = (0, pg_core_1.pgEnum)("ticket_status", ["available", "reserved", "sold", "cancelled"]);
exports.eventStatusEnum = (0, pg_core_1.pgEnum)("event_status", ["draft", "published", "cancelled", "completed"]);
// Users table
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    name: (0, pg_core_1.text)("name").notNull(),
    role: (0, exports.userRoleEnum)("role").default("customer").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Events table
exports.events = (0, pg_core_1.pgTable)("events", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    location: (0, pg_core_1.text)("location").notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    status: (0, exports.eventStatusEnum)("status").default("draft").notNull(),
    organizerId: (0, pg_core_1.integer)("organizer_id").references(() => exports.users.id).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Tickets table
exports.tickets = (0, pg_core_1.pgTable)("tickets", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    eventId: (0, pg_core_1.integer)("event_id").references(() => exports.events.id).notNull(),
    price: (0, pg_core_1.integer)("price").notNull(), // in cents
    status: (0, exports.ticketStatusEnum)("status").default("available").notNull(),
    seatNumber: (0, pg_core_1.text)("seat_number"),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id),
    purchasedAt: (0, pg_core_1.timestamp)("purchased_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Orders table
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id).notNull(),
    eventId: (0, pg_core_1.integer)("event_id").references(() => exports.events.id).notNull(),
    totalAmount: (0, pg_core_1.integer)("total_amount").notNull(), // in cents
    status: (0, pg_core_1.text)("status").notNull(), // pending, completed, cancelled
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
