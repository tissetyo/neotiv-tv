'use client';

import useSWR from 'swr';
import React from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function FlightScheduleSkeleton() {
  return (
    <div className="tv-widget p-6 flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="tv-text-xl font-bold bg-white/10 text-transparent animate-pulse rounded w-32 h-6"></h3>
      </div>
      <div className="flex-1 space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="w-16 h-5 bg-white/20 rounded-md"></div>
            <div className="w-24 h-6 bg-white/20 rounded-md"></div>
            <div className="w-12 h-5 bg-white/20 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlightSchedule({ airport = 'DPS' }: { airport?: string }) {
  const { data: flights, error } = useSWR(`/api/flights?airport=${airport}&type=departure`, fetcher, {
    refreshInterval: 300000, // 5 mins
  });

  if (error) return (
    <div className="tv-widget p-6 flex items-center justify-center">
      <p className="tv-text-muted">Unable to load flight data.</p>
    </div>
  );

  if (!flights) return <FlightScheduleSkeleton />;

  return (
    <div className="tv-widget p-6 flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="tv-text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">Live Departures • {airport}</h3>
        <span className="text-[10px] tv-text-muted tracking-widest uppercase px-2 shadow-sm rounded-full border border-white/10 bg-white/5 py-1">AviationStack Sync</span>
      </div>

      <div className="space-y-3 flex-1 overflow-hidden relative">
        {flights.length === 0 ? (
          <p className="tv-text-muted text-center pt-8">No current flights scheduled from {airport}.</p>
        ) : (
          flights.slice(0, 5).map((flight: any) => {
             // Assign colors dynamically based on real statuses
             let statusColor = "text-emerald-400";
             if (flight.status === 'DELAYED') statusColor = "text-amber-400";
             else if (flight.status === 'CANCELLED') statusColor = "text-rose-500";
             else if (flight.status === 'BOARDING') statusColor = "text-teal-300 animate-pulse font-bold";

             return (
              <div key={flight.id} className="flex items-center justify-between p-3.5 bg-black/20 rounded-xl border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-md">
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-semibold text-white/90 font-mono tracking-wider leading-none">{flight.flightNumber}</span>
                  <span className="text-[10px] uppercase font-medium text-white/50 bg-white/5 px-1.5 py-0.5 rounded-sm w-max border border-white/5">Gate {flight.gate}</span>
                </div>

                <div className="flex flex-col items-center">
                 <span className="text-[16px] font-bold tracking-wide leading-none text-white/95">{flight.destination}</span>
                 <span className={`text-[9px] tracking-widest uppercase font-semibold mt-1.5 ${statusColor}`}>
                    {flight.status}
                 </span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[18px] font-bold font-mono text-white/90 leading-none">{flight.scheduledTime}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
