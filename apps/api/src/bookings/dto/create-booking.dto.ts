import { IsInt, IsString, IsEmail, Min } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  eventId: number;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
