'use client';

import { useEffect, useState, memo } from 'react';

interface SingleClockProps {
  timezone: string;
  label: string;
}

const AnalogueClock = memo(({ timezone, label }: SingleClockProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time in the requested timezone
  const tzTime = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  }).formatToParts(now).reduce((acc: any, part) => {
    acc[part.type] = parseInt(part.value, 10);
    return acc;
  }, {});

  const hour = (tzTime.hour % 12) + tzTime.minute / 60;
  const minute = tzTime.minute + tzTime.second / 60;
  const second = tzTime.second;

  const hrHand = (hour * 30);
  const minHand = (minute * 6);
  const secHand = (second * 6);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative w-24 h-24 rounded-full border border-white/20 bg-white/5 drop-shadow-2xl">
        {/* Tick Marks (Minimal) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
          <div 
            key={deg} 
            className="absolute top-1/2 left-1/2 w-[1px] h-[6px] bg-white/30 origin-bottom" 
            style={{ transform: `translate(-50%, -12px) translateY(-36px) rotate(${deg}deg)` }}
          />
        ))}

        {/* Center Nut */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white z-20" />

        {/* Hour Hand */}
        <div 
          className="absolute top-1/2 left-1/2 w-1.5 h-8 bg-white/80 rounded-full origin-bottom transition-transform duration-500 ease-out"
          style={{ transform: `translate(-50%, -100%) rotate(${hrHand}deg)` }}
        />
        
        {/* Minute Hand */}
        <div 
           className="absolute top-1/2 left-1/2 w-1 h-11 bg-white/60 rounded-full origin-bottom transition-transform duration-500 ease-out"
           style={{ transform: `translate(-50%, -100%) rotate(${minHand}deg)` }}
        />

        {/* Second Hand */}
        <div 
           className="absolute top-1/2 left-1/2 w-[1px] h-12 bg-teal-500 origin-bottom transition-transform duration-100 ease-linear shadow-[0_0_8px_#14b8a6]"
           style={{ transform: `translate(-50%, -100%) rotate(${secHand}deg)` }}
        />
      </div>
      <p className="text-[12px] font-bold text-white/50 uppercase tracking-[0.2em] leading-none">{label}</p>
    </div>
  );
});

AnalogueClock.displayName = 'AnalogueClock';

export default function AnalogClocks({ 
  tz1 = 'America/New_York', label1 = 'New York',
  tz2 = 'Europe/Paris', label2 = 'France',
  tz3 = 'Asia/Shanghai', label3 = 'China'
}: {
  tz1?: string; label1?: string;
  tz2?: string; label2?: string;
  tz3?: string; label3?: string;
}) {
  return (
    <div className="flex gap-6 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
      <AnalogueClock timezone={tz1} label={label1} />
      <AnalogueClock timezone={tz2} label={label2} />
      <AnalogueClock timezone={tz3} label={label3} />
    </div>
  );
}
