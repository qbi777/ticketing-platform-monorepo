# 🎫 Dynamic Event Ticketing Platform

A full-stack event ticketing platform with intelligent dynamic pricing, built with Next.js 15, NestJS, and PostgreSQL.

---

## 🌟 Features

### Core Functionality
- ✅ **Dynamic Pricing Engine** - Ticket prices adjust in real-time based on:
  - ⏰ Time until event (urgency pricing)
  - 📈 Booking velocity (demand-based pricing)
  - 🎟️ Remaining inventory (scarcity pricing)
- ✅ **Concurrency Control** - Prevents overbooking with database-level row locking
- ✅ **Real-time Analytics** - Event metrics and system-wide statistics
- ✅ **Modern UI** - Responsive Next.js interface with live price updates

### Technical Highlights
- 🏗️ **Monorepo Architecture** - Turborepo with pnpm workspaces
- 🔒 **Type-Safe** - End-to-end TypeScript with strict mode
- 🗄️ **PostgreSQL** - Robust relational database with Drizzle ORM
- 🧪 **Tested** - Automated concurrency tests prove correctness
- 🐳 **Containerized** - Docker for database portability

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | v20+ | JavaScript runtime |
| **pnpm** | v8+ | Fast package manager |
| **Docker** | Latest | Database containerization |
| **Git** | Any | Version control |

### Installation Commands
```bash
# Install Node.js (via nvm - recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
```

---

## 🚀 Quick Start (5 Commands)
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/ticketing-platform-monorepo.git
cd ticketing-platform-monorepo

# 2. Install dependencies
pnpm install

# 3. Start PostgreSQL database
docker run -d \
  --name ticketing-postgres \
  -e POSTGRES_USER=ticketing_user \
  -e POSTGRES_PASSWORD=ticketing_pass \
  -e POSTGRES_DB=ticketing_db \
  -p 5432:5432 \
  postgres:16-alpine

# 4. Set up database schema
cd packages/database
pnpm build
pnpm db:push
pnpm db:seed

# 5. Start all applications
cd ../..
pnpm dev
```

🎉 **Done!** Access the application:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/api
- **API Health:** http://localhost:3001/api/health

---

## 📁 Project Structure
```
ticketing-platform-monorepo/
├── apps/
│   ├── api/                    # NestJS Backend API
│   │   ├── src/
│   │   │   ├── main.ts        # Application entry point
│   │   │   ├── app.module.ts  # Root module
│   │   │   ├── pricing/       # Dynamic pricing engine ⭐
│   │   │   │   ├── pricing.service.ts
│   │   │   │   ├── pricing.calculator.ts
│   │   │   │   └── rules/     # Time, Demand, Inventory rules
│   │   │   ├── events/        # Event management
│   │   │   │   ├── events.controller.ts
│   │   │   │   ├── events.service.ts
│   │   │   │   └── dto/
│   │   │   ├── bookings/      # Booking with concurrency control ⭐
│   │   │   │   ├── bookings.controller.ts
│   │   │   │   ├── bookings.service.ts (transaction locking)
│   │   │   │   └── __tests__/
│   │   │   │       └── concurrency.spec.ts
│   │   │   ├── analytics/     # Event & system analytics
│   │   │   └── seed/          # Database seeding
│   │   └── package.json
│   │
│   └── web/                    # Next.js 15 Frontend
│       ├── app/
│       │   ├── events/         # Event listing & detail pages
│       │   │   ├── page.tsx    # Event list
│       │   │   └── [id]/       # Event detail + booking form
│       │   │       ├── page.tsx
│       │   │       └── BookingForm.tsx (client component)
│       │   ├── bookings/
│       │   │   └── success/    # Booking confirmation
│       │   ├── my-bookings/    # User's booking history
│       │   └── components/     # Shared UI components
│       ├── lib/
│       │   └── api.ts          # API client utilities
│       └── package.json
│
├── packages/
│   ├── database/               # Drizzle ORM & Schemas
│   │   ├── src/
│   │   │   ├── schema.ts       # Database schema definition ⭐
│   │   │   ├── index.ts        # DB client export
│   │   │   └── seed.ts         # Sample data generator
│   │   ├── drizzle/            # Generated migrations
│   │   └── drizzle.config.ts   # ORM configuration
│   │
│   ├── ui/                     # Shared React components
│   ├── eslint-config/          # Shared ESLint rules
│   └── typescript-config/      # Shared TypeScript config
│
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── package.json                # Root package.json
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `packages/database/src/schema.ts` | Defines all database tables with pricing rules |
| `apps/api/src/pricing/pricing.calculator.ts` | Core pricing algorithm implementation |
| `apps/api/src/bookings/bookings.service.ts` | Transaction locking for concurrency control |
| `apps/web/app/events/[id]/BookingForm.tsx` | Client-side booking form with validation |
| `turbo.json` | Defines build pipeline and task dependencies |

---

## 🔧 Environment Variables

### Database Package (`.env`)
```bash
# packages/database/.env
DATABASE_URL="postgresql://ticketing_user:ticketing_pass@localhost:5432/ticketing_db"
```

### API Package (`.env`)
```bash
# apps/api/.env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://ticketing_user:ticketing_pass@localhost:5432/ticketing_db"
```

### Web Package (`.env.local`)
```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🗄️ Database Schema

### Tables Overview
```sql
-- Users (organizers, customers)
users {
  id: serial PRIMARY KEY
  email: text UNIQUE NOT NULL
  name: text NOT NULL
  role: enum('admin', 'organizer', 'customer')
  created_at, updated_at: timestamp
}

-- Events with pricing configuration
events {
  id: serial PRIMARY KEY
  name, date, venue, description: text
  
  -- Capacity
  total_tickets: integer
  booked_tickets: integer DEFAULT 0
  
  -- Pricing
  base_price: integer (in cents)
  current_price: integer (dynamically calculated)
  price_floor: integer (minimum allowed)
  price_ceiling: integer (maximum allowed)
  
  -- Pricing rules (JSONB) ⭐
  pricing_rules: {
    timeWeight: 0.33,
    demandWeight: 0.33,
    inventoryWeight: 0.34,
    timeRules: { days30Plus: 0, days7To30: 0.1, ... },
    demandRules: { bookingsPerHourThreshold: 10, ... },
    inventoryRules: { thresholds: { "80": 0, "50": 0.1, ... } }
  }
  
  organizer_id: integer → users(id)
  status: enum('draft', 'published', 'cancelled', 'completed')
}

-- Bookings with price snapshots
bookings {
  id: serial PRIMARY KEY
  event_id: integer → events(id)
  user_email: text NOT NULL
  quantity: integer
  price_paid: integer (snapshot at booking time)
  booking_timestamp: timestamp
  status: enum('confirmed', 'cancelled')
}
```

### Seeded Data

After running `pnpm db:seed`, you'll have:
- **6 events** with varying scenarios (sold out, low inventory, far future)
- **3 users** (2 organizers + 1 admin)
- **467 bookings** distributed across events

---

## 🎯 API Endpoints

### Events
```http
GET    /api/events              # List all events with current prices
GET    /api/events/:id          # Get event details with price breakdown
POST   /api/events              # Create new event (admin)
```

### Bookings
```http
POST   /api/bookings            # Book tickets
GET    /api/bookings?eventId=:id  # List bookings for an event
```

### Analytics
```http
GET    /api/analytics/events/:id  # Event-specific metrics
GET    /api/analytics/summary      # System-wide analytics
```

### Development
```http
GET    /api/health              # Health check
POST   /api/seed                # Seed database
GET    /api/pricing/test/:eventId  # Test pricing calculation
```

---

## 💰 Dynamic Pricing Algorithm

### Formula
```typescript
currentPrice = basePrice × (1 + totalAdjustment)

where:
  totalAdjustment = (timeAdjustment × timeWeight) +
                    (demandAdjustment × demandWeight) +
                    (inventoryAdjustment × inventoryWeight)

constrained by:
  priceFloor ≤ currentPrice ≤ priceCeiling
```

### Example Calculation
```typescript
Event: Rock Concert (tomorrow, 92.5% sold)
basePrice = $80.00

// Rule calculations
timeAdjustment = 0.50      // Last 24 hours = 50% increase
demandAdjustment = 0.00    // No recent bookings
inventoryAdjustment = 0.50 // <10% left = 50% increase

// Weighted adjustments (weights: 0.33, 0.33, 0.34)
timeImpact = 0.50 × 0.33 = 0.165 (16.5%)
demandImpact = 0.00 × 0.33 = 0.000 (0.0%)
inventoryImpact = 0.50 × 0.34 = 0.170 (17.0%)

// Final calculation
totalAdjustment = 0.335 (33.5%)
currentPrice = $80.00 × 1.335 = $106.80 ✅
```

---

## �� Concurrency Control

### The Problem

Without proper locking, concurrent bookings can oversell:
```
Time  | User A                    | User B
------|---------------------------|---------------------------
T1    | SELECT: 1 ticket left     |
T2    |                           | SELECT: 1 ticket left ❌
T3    | CHECK: 1 ≥ 1 ✓            |
T4    |                           | CHECK: 1 ≥ 1 ✓ (WRONG!)
T5    | INSERT booking            |
T6    | UPDATE: booked = 1        |
T7    |                           | INSERT booking ❌
T8    |                           | UPDATE: booked = 2 ❌ OVERSOLD!
```

### The Solution

Use PostgreSQL row-level locking with `SELECT ... FOR UPDATE`:
```typescript
await db.transaction(async (tx) => {
  // 🔒 Lock the event row
  const [event] = await tx.execute(
    sql`SELECT * FROM events WHERE id = ${eventId} FOR UPDATE`
  );
  
  // ✅ Check availability (now safe!)
  if (event.total_tickets - event.booked_tickets < quantity) {
    throw new Error('Not enough tickets');
  }
  
  // ✅ Book atomically
  await tx.insert(bookings).values({...});
  await tx.update(events).set({ booked_tickets: event.booked_tickets + quantity });
});
```

**Result:** Only one booking succeeds, the other receives a clear error.

---

## 🧪 Testing

### Run All Tests
```bash
cd apps/api
pnpm test
```

### Concurrency Test (Critical)
```bash
pnpm test concurrency.spec.ts
```

**What it tests:**
1. Creates event with 1 ticket
2. Sends 2 simultaneous booking requests
3. Asserts: Exactly 1 succeeds, 1 fails
4. Verifies: Event has exactly 1 booked ticket (not 2)

---

## 🛠️ Development Commands
```bash
# Root commands (run from project root)
pnpm install          # Install all dependencies
pnpm dev              # Start all apps (API + Web)
pnpm build            # Build all packages
pnpm test             # Run all tests

# Database commands (run from packages/database)
pnpm db:generate      # Generate migrations from schema
pnpm db:migrate       # Apply migrations
pnpm db:push          # Push schema directly (dev only)
pnpm db:seed          # Populate with sample data
pnpm db:studio        # Open Drizzle Studio GUI

# API commands (run from apps/api)
pnpm dev              # Start API in watch mode
pnpm build            # Build for production
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:cov         # Run tests with coverage

# Web commands (run from apps/web)
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
pnpm start            # Start production server
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001 (API)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000 (Web)
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues
```bash
# Check if Docker container is running
docker ps

# Restart PostgreSQL
docker restart ticketing-postgres

# View database logs
docker logs ticketing-postgres
```

### Module Not Found Errors
```bash
# Rebuild database package
cd packages/database
rm -rf dist/
pnpm build

# Reinstall dependencies
cd ../..
rm -rf node_modules
pnpm install
```

---

## 📊 Performance Metrics

- **API Response Time:** <100ms average
- **Database Queries:** Optimized with indexing
- **Concurrent Users:** Tested with 5+ simultaneous bookings
- **Price Calculation:** Real-time (<10ms)

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Enable CORS for production domain
- [ ] Set up environment variables
- [ ] Run database migrations
- [ ] Build all packages: `pnpm build`
- [ ] Set up monitoring and logging

---

## �� Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ as part of a full-stack development assignment.

**Tech Stack:**
- Frontend: Next.js 15, React, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL, Drizzle ORM
- Tools: Turborepo, pnpm, Docker

