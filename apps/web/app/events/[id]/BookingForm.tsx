'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/lib/api';

interface BookingFormProps {
  eventId: number;
  availableTickets: number;
  currentPrice: string;
}

export function BookingForm({ eventId, availableTickets, currentPrice }: BookingFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pricePerTicket = parseFloat(currentPrice.replace('$', ''));
  const totalPrice = (pricePerTicket * quantity).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createBooking({
        eventId,
        email,
        quantity,
      });

      // Redirect to success page with booking ID
      router.push(`/bookings/success?bookingId=${result.data.bookingId}&email=${email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 sticky top-24">
      <h2 className="text-xl font-light text-slate-100 mb-6">Book Tickets</h2>

      {availableTickets === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">😔 Sold Out</p>
          <p className="text-sm text-slate-500">This event has no tickets available</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm text-slate-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-slate-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm text-slate-400 mb-2">
              Number of Tickets
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              {Array.from({ length: Math.min(availableTickets, 10) }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'ticket' : 'tickets'}
                </option>
              ))}
            </select>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-slate-700">
            <div className="flex justify-between text-lg mb-4">
              <span className="text-slate-400">Total:</span>
              <span className="text-slate-100 font-medium">${totalPrice}</span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Book Now'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
