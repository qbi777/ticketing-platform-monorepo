import { IsString, IsNotEmpty, IsInt, Min, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  totalTickets: number;

  @IsInt()
  @Min(0)
  basePrice: number; // in cents

  @IsInt()
  @Min(0)
  priceFloor: number; // in cents

  @IsInt()
  @Min(0)
  priceCeiling: number; // in cents

  @IsInt()
  @IsOptional()
  organizerId?: number;

  @IsEnum(['draft', 'published', 'cancelled', 'completed'])
  @IsOptional()
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
}
