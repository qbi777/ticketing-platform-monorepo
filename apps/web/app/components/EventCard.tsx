import Link from 'next/link';

interface EventCardProps {
  event: {
    id: number;
    name: string;
    date: string;
    venue: string;
    availableTickets: number;
    currentPrice: string;
    basePrice: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isLowStock = event.availableTickets < 20;
  
  return (
    <Link href={`/events/${event.id}`}>
      <div className="group bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 hover:bg-slate-800/60 transition-all duration-300 hover:border-slate-600">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-light text-slate-100 group-hover:text-white transition mb-2">
              {event.name}
            </h3>
            <p className="text-slate-400 text-sm">{event.venue}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-light text-slate-100">{event.currentPrice}</div>
            {event.currentPrice !== event.basePrice && (
              <div className="text-xs text-slate-500 line-through">{event.basePrice}</div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="text-slate-400">
            {eventDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className={`${isLowStock ? 'text-orange-400' : 'text-slate-400'}`}>
            {event.availableTickets} tickets left
            {isLowStock && ' 🔥'}
          </div>
        </div>
      </div>
    </Link>
  );
}
