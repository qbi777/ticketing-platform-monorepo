import Link from 'next/link';

export function Navigation() {
  return (
    <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-light tracking-tight text-slate-100 hover:text-slate-300 transition">
            Ticketing System
          </Link>
          <div className="flex gap-6">
            <Link href="/events" className="text-slate-300 hover:text-slate-100 transition">
              Events
            </Link>
            <Link href="/my-bookings" className="text-slate-300 hover:text-slate-100 transition">
              My Bookings
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
