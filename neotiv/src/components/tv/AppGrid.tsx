'use client';

import { motion } from 'framer-motion';

interface AppItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  wide?: boolean;
}

const row1: AppItem[] = [
  { id: 'youtube', name: 'YouTube', icon: '🔴', color: 'bg-red-600' },
  { id: 'disney', name: 'Disney+', icon: '🏰', color: 'bg-blue-900' },
  { id: 'netflix', name: 'Netflix', wide: true },
  { id: 'launcher', name: 'Apps', icon: '▦', color: 'bg-slate-700' },
];

const row2: AppItem[] = [
  { id: 'spotify', name: 'Spotify', icon: '🎧', color: 'bg-green-600' },
  { id: 'prime', name: 'Prime Video', icon: '📺', color: 'bg-blue-500' },
  { id: 'tv', name: 'TV', wide: true },
  { id: 'grid', name: 'Menu', icon: '⊡', color: 'bg-slate-700' },
];

const utilities = [
  { id: 'notifications', icon: '🔔', color: 'bg-rose-500/20 text-rose-500' },
  { id: 'night', icon: '🌙', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 'alarm', icon: '⏰', color: 'bg-teal-500/20 text-teal-400' },
];

export default function AppGrid({ onLaunch }: { onLaunch: (id: string) => void }) {
  const renderApp = (app: AppItem) => (
    <button
      key={app.id}
      onClick={() => onLaunch(app.id)}
      className={`tv-focusable relative h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all overflow-hidden ${
        app.wide ? 'col-span-2' : 'col-span-1'
      } ${app.id.includes('netflix') || app.id === 'tv' ? 'bg-black/40' : 'bg-white/5'} border border-white/10`}
      data-focusable="true"
    >
      {/* Brand Specifics */}
      {app.id === 'netflix' && (
        <div className="flex flex-col items-center justify-center py-2 px-4 w-full h-full">
           <span className="text-red-600 text-2xl font-black tv-font-display">NETFLIX</span>
           <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Watch Now</span>
        </div>
      )}
      {app.id === 'tv' && (
        <div className="flex flex-col items-center justify-center py-2 px-4 w-full h-full">
           <span className="text-white text-2xl font-black tv-font-display">TV</span>
           <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Explore Channel</span>
        </div>
      )}

      {/* Standard Icons */}
      {!app.wide && (
        <>
          <div className={`w-10 h-10 ${app.color} rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/20`}>
             {app.icon}
          </div>
        </>
      )}
    </button>
  );

  return (
    <div className="flex items-end gap-3 w-full">
      {/* 2x4 Main App Grid Area */}
      <div className="flex-1 grid grid-cols-5 gap-3">
        {row1.map(renderApp)}
        {row2.map(renderApp)}
      </div>

      {/* Far Right Utilities (Vertical) */}
      <div className="flex flex-col gap-3">
        {utilities.map((util) => (
          <button
            key={util.id}
            onClick={() => onLaunch(util.id)}
            className={`tv-focusable w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center text-xl transition-all ${util.color}`}
            data-focusable="true"
          >
            {util.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
