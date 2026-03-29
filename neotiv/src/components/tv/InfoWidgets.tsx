'use client';

import { motion } from 'framer-motion';

interface NotificationProps {
  title: string;
  body: string;
  time: string;
  onSelect: () => void;
}

export function NotificationCard({ title, body, time, onSelect }: NotificationProps) {
  return (
    <button
      onClick={onSelect}
      className="tv-focusable w-full text-left p-6 rounded-3xl bg-slate-900/60 backdrop-blur-3xl border border-white/10 flex flex-col gap-4 relative overflow-hidden"
      data-focusable="true"
    >
      <div className="absolute top-0 right-0 p-4">
        <span className="text-white/40 text-[12px] font-black uppercase tracking-widest">{time}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500 text-xl border border-rose-500/30">
          🔔
        </div>
        <span className="text-white/60 text-[12px] font-black uppercase tracking-[0.2em]">Latest Alert</span>
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-xl font-bold tv-font-display leading-tight">{title}</h3>
        <p className="text-white/60 text-sm line-clamp-3 leading-relaxed">
          {body}
        </p>
      </div>

      <div className="mt-2 text-teal-400 text-xs font-bold uppercase tracking-widest">
        Press Enter to Read Full →
      </div>
    </button>
  );
}

interface Promo {
  id: string;
  title: string;
  poster_url: string;
}

export function HotelDeals({ promos, onSelect }: { promos: Promo[], onSelect: (p: Promo) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎟️</span>
          <span className="text-white/60 text-[12px] font-black uppercase tracking-[0.2em]">Hotel Deals</span>
        </div>
        <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white/40 text-xs">
          ⚙️
        </div>
      </div>

      <div className="flex gap-4 overflow-hidden">
        {promos.length > 0 ? promos.map((promo) => (
          <button
            key={promo.id}
            onClick={() => onSelect(promo)}
            className="tv-focusable flex-shrink-0 w-40 h-24 rounded-2xl bg-cover bg-center border border-white/10 relative overflow-hidden group"
            style={{ backgroundImage: `url(${promo.poster_url})` }}
            data-focusable="true"
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-[10px] font-bold uppercase tracking-widest leading-none truncate">{promo.title}</p>
            </div>
          </button>
        )) : (
          <div className="w-full h-24 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/20 text-xs">
            No active promos
          </div>
        )}
      </div>
    </div>
  );
}
