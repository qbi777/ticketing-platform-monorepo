import { Navigation } from '@/app/components/Navigation';
import Link from 'next/link';

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { bookingId?: string; email?: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-8 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-light text-slate-100 mb-4">Booking Confirmed!</h1>
          <p className="text-slate-400">Your tickets have been successfully booked</p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-8 mb-8">
          <div className="space-y-4">
            {searchParams.bookingId && (
              <div className="flex justify-between border-b border-slate-700 pb-4">
                <span className="text-slate-400">Booking ID:</span>
                <span className="text-slate-100 font-medium">#{searchParams.bookingId}</span>
              </div>
            )}
            
            {searchParams.email && (
              <div className="flex justify-between">
                <span className="text-slate-400">Confirmation sent to:</span>
                <span className="text-slate-100">{searchParams.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-6 mb-8">
          <p className="text-blue-400 text-sm">
            📧 A confirmation email has been sent to your email address with your booking details.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link 
            href="/events"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-all duration-300"
          >
            Browse More Events
          </Link>
          <Link 
            href="/my-bookings"
            className="px-6 py-3 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 rounded-lg transition-all duration-300"
          >
            View My Bookings
          </Link>
        </div>
      </main>
    </div>
  );
}
