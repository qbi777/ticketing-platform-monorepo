import { fetchEvents } from '@/lib/api';
import { EventCard } from '../components/EventCard';
import { Navigation } from '../components/Navigation';

export default async function EventsPage() {
  const data = await fetchEvents();
  const events = data.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-slate-100 mb-2">Upcoming Events</h1>
          <p className="text-slate-400">Book tickets with dynamic pricing</p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No events available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
