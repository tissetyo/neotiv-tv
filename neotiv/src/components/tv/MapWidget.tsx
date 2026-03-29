'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MapSkeleton() {
  return (
    <div className="tv-widget w-full h-full flex flex-col justify-center items-center bg-black/20 animate-pulse border border-white/5 p-4 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent mix-blend-overlay"></div>
        <div className="w-12 h-12 rounded-full border border-teal-500/30 bg-teal-500/20 mb-3 flex items-center justify-center">
            <span className="text-xl">📍</span>
        </div>
        <div className="h-4 w-32 bg-white/10 rounded-md"></div>
    </div>
  );
}

export default function MapWidget({ 
  locationString, 
  latitude, 
  longitude 
}: { 
  locationString: string; 
  latitude?: number; 
  longitude?: number; 
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

  // Render a nice fallback mock map if dev keys missing
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
       <div className="tv-widget w-full h-full relative overflow-hidden p-0 rounded-3xl">
         <div className="absolute inset-0 flex items-center justify-center bg-slate-900 border border-slate-700/50">
             <div className="text-center p-6">
                 <span className="text-5xl block mb-4 filter drop-shadow-[0_0_15px_rgba(20,184,166,0.6)]">🗺️</span>
                 <p className="tv-text-base text-teal-400 font-medium">Map Embed Offline</p>
                 <p className="text-xs text-slate-500 mt-2 font-mono">Missing GPS API Key</p>
                 <p className="text-xs text-white/40 mt-3 max-w-[200px] leading-relaxed mx-auto">{locationString}</p>
             </div>
         </div>
       </div>
    );
  }

  // Exact coordinates via &center=, or standard query URL
  let mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(locationString)}&zoom=14&maptype=roadmap`;
  if (latitude && longitude) {
      mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=16&maptype=roadmap`;
  }

  return (
    <React.Fragment>
      <div 
        className="tv-widget tv-focusable w-full h-full p-0 overflow-hidden cursor-pointer relative group rounded-3xl border border-white/10 shadow-xl"
        tabIndex={0}
        onClick={() => setFullscreen(true)}
        onKeyDown={(e) => {
            if (e.key === 'Enter') setFullscreen(true);
        }}
        style={{ pointerEvents: 'auto' }}
      >
        {/* We use pointer-events-none here to stop map scrolling intercepting the TV bounding box navigation */}
        <iframe
          src={mapUrl}
          className="w-full h-full border-0 pointer-events-none filter saturate-150 contrast-125 brightness-90 grayscale-[0.2]"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        
        {/* Overlay interaction hint */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-5">
             <h4 className="text-white font-bold text-lg leading-tight font-display drop-shadow-md">{locationString}</h4>
             <div className="flex items-center gap-2 mt-2">
                 <span className="inline-block px-2.5 py-1 rounded bg-teal-500/20 border border-teal-500/30 text-[10px] text-teal-300 uppercase tracking-widest font-bold backdrop-blur-sm">View Fullscreen</span>
                 <span className="text-[10px] text-white/50 tracking-widest">press enter</span>
             </div>
        </div>
      </div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                   <h2 className="text-3xl font-display font-bold text-white tracking-wide">{locationString}</h2>
                   <p className="text-teal-400 font-mono tracking-widest text-sm mt-1 uppercase">Local Area Extrapolations</p>
                </div>
                <button 
                  className="tv-focusable bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 border border-white/20 transition-all focus:ring-4 focus:ring-teal-500/50"
                  onClick={() => setFullscreen(false)}
                  autoFocus
                >
                  <span className="font-bold tracking-widest uppercase text-sm mr-2">Exit Map</span>
                  <span className="text-white/50 tracking-wide text-xs">[esc]</span>
                </button>
            </div>
            <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative">
                <iframe
                  src={mapUrl}
                  className="w-full h-full border-0 absolute inset-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
}
