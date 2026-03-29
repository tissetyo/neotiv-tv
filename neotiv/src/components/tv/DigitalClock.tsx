'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface DigitalClockProps {
  timezone?: string;
  location?: string;
  weatherCity?: string;
}

export default function DigitalClock({ 
  timezone = 'Asia/Jakarta', 
  location = 'Kuta, Bali',
  weatherCity = 'Kuta,ID'
}: DigitalClockProps) {
  const [time, setTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time for specific timezone
  const getTimeString = () => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(time).replace(':', '.'); // Figma uses dots
  };

  const getDateString = () => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(time);
  };

  // Weather - Mock for now unless NEXT_PUBLIC_OPENWEATHER_KEY exists
  const { data: weather } = useSWR(
    process.env.NEXT_PUBLIC_OPENWEATHER_KEY 
      ? `https://api.openweathermap.org/data/2.5/weather?q=${weatherCity}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}&units=metric` 
      : null,
    fetcher,
    { refreshInterval: 600000 } // 10 mins
  );

  const temp = weather ? Math.round(weather.main.temp) : 24;
  const condition = weather ? weather.weather[0].main : 'Sunny';

  return (
    <div className="flex flex-col items-start space-y-2">
      {/* Weather HUD */}
      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
        <span className="text-2xl">
          {condition === 'Rain' ? '🌧️' : condition === 'Clouds' ? '☁️' : '☀️'}
        </span>
        <span className="text-white text-lg font-bold tracking-tight leading-none pt-1">
          {temp}°C • {location}
        </span>
      </div>

      {/* Hero Time */}
      <div className="space-y-0">
        <h1 className="text-white tv-text-hero tv-font-display leading-none tracking-tighter">
          {getTimeString()}
        </h1>
        <p className="text-white/60 text-[22px] font-medium mt-2">
          {getDateString()}
        </p>
      </div>
    </div>
  );
}
