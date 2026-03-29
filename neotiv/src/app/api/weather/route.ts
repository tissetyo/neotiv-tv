import { NextResponse, type NextRequest } from 'next/server';
import type { WeatherData } from '@/types';
import { getCached } from '@/lib/utils/cache';

const WEATHER_ICONS: Record<string, string> = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '⛅',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

export async function GET(
  request: NextRequest
): Promise<NextResponse<WeatherData | { error: string }>> {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (!city) {
    return NextResponse.json({ error: 'city parameter required' }, { status: 400 });
  }

  if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY_HERE') {
    return NextResponse.json(
      { temp: 28, icon: '☀️', description: 'Sunny', city },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' },
      }
    );
  }

  try {
    const fetchWeather = async () => {
       const res = await fetch(
         `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
         { next: { revalidate: 600 } }
       );
       if (!res.ok) throw new Error('Weather API error');
       const data = await res.json();
       return {
         temp: Math.round(data.main?.temp ?? 0),
         icon: WEATHER_ICONS[data.weather?.[0]?.icon ?? ''] ?? '🌤️',
         description: data.weather?.[0]?.description ?? 'Clear',
         city: data.name ?? city,
       };
    };

    const cachedData = await getCached(`weather:${city}`, fetchWeather, 600);

    return NextResponse.json(cachedData, {
       headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' },
    });
  } catch (err: any) {
    console.error("OpenWeather Fetch failed", err);
    return NextResponse.json({ temp: 28, icon: '☀️', description: 'Sunny', city });
  }
}
