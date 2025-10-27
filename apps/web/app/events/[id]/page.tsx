import { fetchEvent } from '@/lib/api';
import { Navigation } from '@/app/components/Navigation';
import { BookingForm } from './BookingForm';
import { notFound } from 'next/navigation';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  try {
    const data = await fetchEvent(params.id);
    const event = data.data;

    const eventDate = new Date(event.date);
    const priceChange = parseFloat(event.priceBreakdown?.priceChange || '0%');
    const isIncreased = priceChange > 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navigation />
        
        <main className="max-w-4xl mx-auto px-8 py-12">
          {/* Event Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-light text-slate-100 mb-4">{event.name}</h1>
            <div className="flex gap-8 text-slate-400">
              <div>
                📍 {event.venue}
              </div>
              <div>
                📅 {eventDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 mb-8">
              <p className="text-slate-300 leading-relaxed">{event.description}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pricing Info */}
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6">
                <h2 className="text-xl font-light text-slate-100 mb-4">Current Price</h2>
                
                <div className="flex items-baseline gap-3 mb-4">
                  <div className="text-4xl font-light text-slate-100">{event.currentPrice}</div>
                  {isIncreased && (
                    <div className="text-sm text-orange-400">
                      +{event.priceBreakdown?.priceChange} from base
                    </div>
                  )}
                </div>

                {event.priceBreakdown && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>Base Price:</span>
                      <span>{event.priceBreakdown.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Time Impact:</span>
                      <span>{event.priceBreakdown.breakdown.timeImpact}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Demand Impact:</span>
                      <span>{event.priceBreakdown.breakdown.demandImpact}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Inventory Impact:</span>
                      <span>{event.priceBreakdown.breakdown.inventoryImpact}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6">
                <h2 className="text-xl font-light text-slate-100 mb-4">Availability</h2>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available:</span>
                    <span className={`font-medium ${event.availableTickets < 20 ? 'text-orange-400' : 'text-slate-100'}`}>
                      {event.availableTickets} tickets
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Capacity:</span>
                    <span className="text-slate-100">{event.totalTickets} tickets</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${(event.bookedTickets / event.totalTickets) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {((event.bookedTickets / event.totalTickets) * 100).toFixed(0)}% sold
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div>
              <BookingForm eventId={event.id} availableTickets={event.availableTickets} currentPrice={event.currentPrice} />
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
