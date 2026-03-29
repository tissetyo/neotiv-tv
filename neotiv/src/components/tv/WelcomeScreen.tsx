'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { RoomSession } from '@/types';

interface WelcomeScreenProps {
  session: RoomSession;
  roomCode: string;
  onFinish: () => void;
}

export default function WelcomeScreen({ session, roomCode, onFinish }: WelcomeScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000; // 5 seconds
    const interval = 50;
    const step = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          onFinish();
          return 100;
        }
        return p + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-transparent overflow-hidden">
      {/* Room Number - Top Right */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-12 right-12 text-right"
      >
        <p className="text-white/40 text-[14px] font-black uppercase tracking-[0.2em] mb-2 leading-none">Room</p>
        <p className="text-white text-[96px] font-bold leading-none tv-font-display">{roomCode}</p>
      </motion.div>

      {/* Welcome Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-[720px]"
      >
        {/* Guest Avatar - Floating Overlap */}
        <motion.div 
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="absolute -top-16 left-12 z-20"
        >
          {session.guestPhotoUrl ? (
            <div className="relative w-32 h-32 rounded-full border-[6px] border-white/20 shadow-2xl overflow-hidden shadow-black/40">
              <Image 
                src={session.guestPhotoUrl} 
                alt="Guest" 
                fill 
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full border-[6px] border-white/20 shadow-2xl bg-teal-500 flex items-center justify-center text-white text-5xl font-black tv-font-display shadow-black/40">
              {session.guestName?.charAt(0) || 'G'}
            </div>
          )}
        </motion.div>

        {/* Content Card */}
        <div className="tv-widget px-12 pb-12 pt-20 backdrop-blur-2xl bg-slate-900/40 border-white/10 relative overflow-hidden">
           {/* Ambient Glow */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
           
           <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <p className="text-teal-400 text-lg font-medium tracking-wide">
                  Welcome to <span className="font-bold text-white uppercase tracking-normal">{session.hotelName}</span>, {session.hotelLocation || 'Bali'}!
                </p>
                <h1 className="text-white text-5xl font-bold tv-font-display leading-tight">
                  {session.guestName || 'Stephen Hawk'}
                </h1>
              </div>

              <div className="h-[2px] w-full bg-gradient-to-r from-white/20 via-white/10 to-transparent" />

              <div className="space-y-4">
                <p className="text-white/70 text-[20px] leading-relaxed font-medium">
                  {session.customWelcomeMessage || "We hope you enjoy your Trip! We are always ready whenever you want, let us know what you need."}
                </p>
                <p className="text-white/90 text-[20px] font-bold italic tv-font-display">
                  Your comfort is our priority!
                </p>
              </div>
           </div>

           {/* Progress Bar Footer */}
           <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5 overflow-hidden">
              <motion.div 
                className="h-full bg-teal-500 shadow-[0_0_10px_#14b8a6]"
                style={{ width: `${progress}%` }}
              />
           </div>
        </div>
      </motion.div>
    </div>
  );
}
