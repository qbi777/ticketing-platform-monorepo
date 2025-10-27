import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class SeedService {
  async seedDatabase() {
    try {
      // Run the seed script from database package
      const { stdout, stderr } = await execAsync(
        'cd ../../packages/database && pnpm db:seed',
        { cwd: process.cwd() }
      );
      
      return {
        success: true,
        message: 'Database seeded successfully',
        output: stdout,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Seeding failed',
        error: error.message,
      };
    }
  }
}
