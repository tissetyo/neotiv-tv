import { NextResponse, type NextRequest } from 'next/server';
import { getCached } from '@/lib/utils/cache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const airport = searchParams.get('airport');
  const type = searchParams.get('type') || 'departure'; // 'departure' or 'arrival'
  const apiKey = process.env.AVIATIONSTACK_API_KEY;

  if (!airport) {
    return NextResponse.json({ error: 'airport parameter required' }, { status: 400 });
  }

  // Fallback to mocks if no valid API key is present in the environment
  if (!apiKey || apiKey === 'YOUR_AVIATIONSTACK_API_KEY_HERE') {
    const mockFlights = Array.from({ length: 6 }).map((_, i) => ({
      id: `mock-${i}`,
      flightNumber: `FL${1000 + i}`,
      destination: type === 'departure' ? `Destination ${i + 1}` : `Origin ${i + 1}`,
      scheduledTime: new Date(Date.now() + i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: i % 3 === 0 ? 'DELAYED' : 'ON TIME',
      gate: `G${(i % 10) + 1}`,
    }));
    return NextResponse.json(mockFlights, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' },
    });
  }

  try {
    const fetchFlights = async () => {
       const endpoint = type === 'departure' ? 'dep_iata' : 'arr_iata';
       // Note: Aviation Stack free tier only supports HTTP over standard REST calls (not HTTPS)
       const res = await fetch(
         `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&${endpoint}=${encodeURIComponent(airport)}&limit=15`,
         { next: { revalidate: 300 } }
       );
       
       if (!res.ok) throw new Error('AviationStack API error');
       
       const json = await res.json();
       if (!json.data || !Array.isArray(json.data)) return [];

       return json.data.map((f: any, i: number) => {
         const time = type === 'departure' ? f.departure?.scheduled : f.arrival?.scheduled;
         const loc = type === 'departure' ? f.arrival?.airport : f.departure?.airport;
         const gate = type === 'departure' ? f.departure?.gate : f.arrival?.gate;
         
         let status = 'ON TIME';
         if (f.flight_status === 'delayed') status = 'DELAYED';
         else if (f.flight_status === 'cancelled') status = 'CANCELLED';
         else if (f.flight_status === 'active') status = 'BOARDING';

         return {
           id: `${f.flight?.iata || 'FL'}-${i}`,
           flightNumber: f.flight?.iata || f.flight?.icao || 'Unknown',
           destination: loc || 'Unknown',
           scheduledTime: time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
           status,
           gate: gate || 'TBD',
         };
       });
    };

    const cacheKey = `flights:${airport}:${type}`;
    // Cache for 5 minutes (300 seconds)
    const flights = await getCached(cacheKey, fetchFlights, 300);

    return NextResponse.json(flights, {
       headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' },
    });
  } catch (err: any) {
    console.error("AviationStack Fetch failed", err);
    return NextResponse.json([], { status: 500 });
  }
}
