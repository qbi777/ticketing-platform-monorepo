export class EventResponseDto {
  id: number;
  name: string;
  date: Date;
  venue: string;
  description?: string;
  totalTickets: number;
  bookedTickets: number;
  availableTickets: number;
  basePrice: string; // formatted as "$XX.XX"
  currentPrice: string; // formatted as "$XX.XX"
  priceFloor: string;
  priceCeiling: string;
  status: string;
  organizerId?: number;
  priceBreakdown?: {
    basePrice: string;
    currentPrice: string;
    priceChange: string;
    breakdown: {
      timeImpact: string;
      demandImpact: string;
      inventoryImpact: string;
      totalImpact: string;
    };
  };
}
