import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Ticketing Platform API - NestJS Backend';
  }
}
