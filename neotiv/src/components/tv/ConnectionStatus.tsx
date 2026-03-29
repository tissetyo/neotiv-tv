'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500/95 text-white px-5 py-2.5 rounded-full shadow-[0_8px_32px_rgba(245,158,11,0.25)] backdrop-blur-xl flex items-center gap-3 border border-amber-400/50 pointer-events-none"
        >
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <span className="font-bold tracking-widest text-[11px] uppercase drop-shadow-sm font-mono">
             Connection Lost
          </span>
          <span className="text-white/80 text-[10px] uppercase font-semibold tracking-wider border-l border-white/20 pl-3">
             Queuing Offline Events...
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
