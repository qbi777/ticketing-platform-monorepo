import Link from 'next/link';
import { Navigation } from './components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-8 py-16">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-light text-slate-100 tracking-tight">
              Dynamic Event Pricing
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              A sophisticated platform for managing events with intelligent
              pricing algorithms and real-time availability tracking.
            </p>
          </div>

          <div className="flex gap-4">
            <Link 
              href="/events"
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-all duration-300"
            >
              Browse Events
            </Link>
            <Link 
              href="/my-bookings"
              className="px-8 py-3 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-slate-100 rounded-lg transition-all duration-300"
            >
              My Bookings
            </Link>
          </div>

          <div className="grid gap-6 mt-12">
            <div className="group bg-slate-800/40 border border-slate-700/50 rounded-lg p-8 hover:bg-slate-800/60 transition-all duration-300">
              <h3 className="text-xl font-light text-slate-200 mb-3">
                Dynamic Pricing Engine
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Ticket prices adjust automatically based on time, demand, and availability. Book early for better prices!
              </p>
            </div>

            <div className="group bg-slate-800/40 border border-slate-700/50 rounded-lg p-8 hover:bg-slate-800/60 transition-all duration-300">
              <h3 className="text-xl font-light text-slate-200 mb-3">
                Real-time Availability
              </h3>
              <p className="text-slate-400 leading-relaxed">
                See live ticket counts and secure your spot with our concurrency-safe booking system.
              </p>
            </div>

            <div className="group bg-slate-800/40 border border-slate-700/50 rounded-lg p-8 hover:bg-slate-800/60 transition-all duration-300">
              <h3 className="text-xl font-light text-slate-200 mb-3">
                Instant Confirmation
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Get your tickets confirmed immediately with email notifications and booking management.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
