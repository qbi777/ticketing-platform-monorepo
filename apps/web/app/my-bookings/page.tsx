'use client';

import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import Link from 'next/link';

interface Booking {
  bookingId: number;
  eventId: number;
  quantity: number;
  email: string;
  totalPrice: string;
  status: string;
  createdAt: string;
  eventName?: string;
  eventDate?: string;
  eventVenue?: string;
}

export default function MyBookingsPage() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setError('');

    try {
      // Fetch all events first to get event details
      const eventsRes = await fetch('http://localhost:3001/api/events');
      const eventsData = await eventsRes.json();
      const events = eventsData.data || [];

      // Create a map of event details
      const eventMap = new Map(events.map((e: any) => [e.id, e]));

      // Fetch bookings for each event and filter by email
      const allBookings: Booking[] = [];
      
      for (const event of events) {
        try {
          const bookingsRes = await fetch(`http://localhost:3001/api/bookings?eventId=${event.id}`);
          const bookingsData = await bookingsRes.json();
          const eventBookings = bookingsData.data || [];
          
          // Filter bookings by email
          const userBookings = eventBookings.filter((b: any) => 
            b.email.toLowerCase() === email.toLowerCase()
          );

          // Add event details to each booking
          userBookings.forEach((booking: any) => {
            allBookings.push({
              ...booking,
              eventName: event.name,
              eventDate: event.date,
              eventVenue: event.venue,
            });
          });
        } catch (err) {
          console.error(`Failed to fetch bookings for event ${event.id}:`, err);
        }
      }

      setBookings(allBookings);
      
      if (allBookings.length === 0) {
        setError('No bookings found for this email address.');
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-slate-100 mb-2">My Bookings</h1>
          <p className="text-slate-400">View and manage your event bookings</p>
        </div>

        {/* Search Form */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-orange-900/20 border border-orange-900/50 rounded-lg p-6 mb-8">
            <p className="text-orange-400">{error}</p>
          </div>
        )}

        {/* Bookings List */}
        {searched && bookings.length > 0 && (
          <div className="space-y-4">
            <div className="text-slate-400 mb-4">
              Found {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </div>
            
            {bookings.map((booking) => {
              const bookingDate = new Date(booking.createdAt);
              const eventDate = booking.eventDate ? new Date(booking.eventDate) : null;
              
              return (
                <div key={booking.bookingId} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 hover:bg-slate-800/60 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-light text-slate-100 mb-1">
                        {booking.eventName || 'Event'}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {booking.eventVenue || 'Venue'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg text-slate-100">{booking.totalPrice}</div>
                      <div className="text-xs text-slate-500">Booking #{booking.bookingId}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm border-t border-slate-700 pt-4">
                    <div className="text-slate-400">
                      📅 {eventDate ? eventDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </div>
                    <div className="text-slate-400">
                      🎫 {booking.quantity} ticket{booking.quantity !== 1 ? 's' : ''}
                    </div>
                    <div className="text-green-400 text-right">
                      ✓ {booking.status}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Booked on {bookingDate.toLocaleDateString()}</span>
                      <Link 
                        href={`/events/${booking.eventId}`}
                        className="text-slate-400 hover:text-slate-200 transition"
                      >
                        View Event →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
