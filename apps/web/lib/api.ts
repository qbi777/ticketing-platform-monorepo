const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchEvents() {
  const res = await fetch(`${API_URL}/events`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEvent(id: string) {
  const res = await fetch(`${API_URL}/events/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
}

export async function fetchBookings(eventId: string) {
  const res = await fetch(`${API_URL}/bookings?eventId=${eventId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function createBooking(data: {
  eventId: number;
  email: string;
  quantity: number;
}) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const result = await res.json();
  
  if (!res.ok) {
    throw new Error(result.message || 'Failed to create booking');
  }
  
  return result;
}
