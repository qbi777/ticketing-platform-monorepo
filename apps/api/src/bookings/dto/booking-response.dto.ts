export class BookingResponseDto {
    bookingId: number;
    eventId: number;
    quantity: number;
    email: string;
    totalPrice: string; // e.g., "$150.00"
    status: string;
    createdAt: Date;
  }
  