'use client';

import { useEffect, useState, useRef } from 'react';

interface Flight {
  id: string;
  code: string;
  time: string;
  destination: string;
  gate: string;
  status: 'last_call' | 'closed' | 'on_schedule' | 'gate_open' | 'delay' | 'check_in';
  remarks: string;
}

const mockFlights: Flight[] = [
  { id: '1', code: 'GA-421', time: '18:45', destination: 'Jakarta', gate: 'B12', status: 'on_schedule', remarks: 'ON SCHEDULE' },
  { id: '2', code: 'SQ-938', time: '19:10', destination: 'Singapore', gate: 'A05', status: 'check_in', remarks: 'CHECK-IN' },
  { id: '3', code: 'QF-044', time: '19:35', destination: 'Sydney', gate: 'C22', status: 'gate_open', remarks: 'GATE OPEN' },
  { id: '4', code: 'EK-451', time: '20:05', destination: 'Dubai', gate: 'B11', status: 'delay', remarks: 'DELAY 20M' },
  { id: '5', code: 'KL-835', time: '20:30', destination: 'Amsterdam', gate: 'A08', status: 'last_call', remarks: 'LAST CALL' },
  { id: '6', code: 'CX-784', time: '20:55', destination: 'Hong Kong', gate: 'B04', status: 'on_schedule', remarks: 'ON SCHEDULE' },
  { id: '7', code: 'JL-728', time: '21:15', destination: 'Tokyo', gate: 'C10', status: 'check_in', remarks: 'CHECK-IN' },
  { id: '8', code: 'TR-285', time: '21:40', destination: 'Singapore', gate: 'A02', status: 'on_schedule', remarks: 'ON SCHEDULE' },
];

export default function FlightSchedule({ airportCode = 'DPS' }: { airportCode?: string }) {
  const [flights, setFlights] = useState<Flight[]>(mockFlights);
  
  const getStatusColor = (status: Flight['status']) => {
    switch (status) {
      case 'last_call': return 'flight-last-call';
      case 'closed': return 'flight-closed';
      case 'gate_open': return 'flight-gate-open';
      case 'check_in': return 'flight-check-in';
      case 'delay': return 'flight-delay';
      default: return 'flight-on-schedule';
    }
  };

  return (
    <div className="tv-widget flex flex-col h-full p-6 bg-slate-900/40 border-white/10 backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <span className="text-white/60 text-[12px] font-black uppercase tracking-[0.2em]">Flight Schedule</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-[10px] text-teal-300 font-black tracking-widest uppercase">
           {airportCode} Airport
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/20">
            <tr>
              <th className="pb-3 text-[10px] font-black text-white/40 uppercase tracking-widest">Flight</th>
              <th className="pb-3 text-[10px] font-black text-white/40 uppercase tracking-widest">Time</th>
              <th className="pb-3 text-[10px] font-black text-white/40 uppercase tracking-widest">Dest</th>
              <th className="pb-3 text-[10px] font-black text-white/40 uppercase tracking-widest">Gate</th>
              <th className="pb-3 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {flights.map((flight) => (
              <tr key={flight.id} className="transition-colors hover:bg-white/5 group">
                <td className="py-3 text-[14px] font-black text-white/90 tv-font-display tracking-[0.1em]">{flight.code}</td>
                <td className="py-3 text-[14px] font-bold text-white/70">{flight.time}</td>
                <td className="py-3 text-[14px] font-medium text-white/80 truncate max-w-[120px]">{flight.destination}</td>
                <td className="py-3 text-[14px] font-bold text-teal-400/80">{flight.gate}</td>
                <td className={`py-3 text-[13px] font-black text-right tracking-tight ${getStatusColor(flight.status)}`}>
                  {flight.remarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
         <span className="text-[10px] text-white/20 font-bold tracking-widest">LAST UPDATED: 19:42</span>
         <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-teal-500' : 'bg-white/10'}`} />
            ))}
         </div>
      </div>
    </div>
  );
}
