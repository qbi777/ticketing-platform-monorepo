import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function reset() {
  console.log('🗑️  Dropping all tables...');
  
  const sql = postgres(process.env.DATABASE_URL!);
  
  try {
    await sql`DROP TABLE IF EXISTS bookings CASCADE`;
    await sql`DROP TABLE IF EXISTS tickets CASCADE`;
    await sql`DROP TABLE IF EXISTS orders CASCADE`;
    await sql`DROP TABLE IF EXISTS events CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    await sql`DROP TYPE IF EXISTS booking_status CASCADE`;
    await sql`DROP TYPE IF EXISTS event_status CASCADE`;
    await sql`DROP TYPE IF EXISTS ticket_status CASCADE`;
    await sql`DROP TYPE IF EXISTS user_role CASCADE`;
    
    console.log('✅ All tables dropped!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Update src/schema.ts with new schema');
    console.log('   2. Run: pnpm db:generate');
    console.log('   3. Run: pnpm db:migrate');
    console.log('   4. Run: pnpm db:seed');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

reset();
