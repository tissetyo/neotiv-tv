'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/stores/roomStore';
import FlightSchedule from '@/components/tv/FlightSchedule';
import MapWidget from '@/components/tv/MapWidget';
import AppLauncher from '@/components/tv/AppLauncher';
import type { AppConfig } from '@/components/tv/AppLauncher';
import ConnectionStatus from '@/components/tv/ConnectionStatus';
import Image from 'next/image';

export default function MainDashboardPage() {
  const router = useRouter();
  const params = useParams<{ hotelSlug: string; roomCode: string }>();
  const { hotelSlug, roomCode } = params;
  const store = useRoomStore();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeApp, setActiveApp] = useState<AppConfig | null>(null);

  useEffect(() => {
    const key = `neotiv_room_${hotelSlug}_${roomCode}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      router.replace(`/${hotelSlug}/dashboard/${roomCode}`);
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [hotelSlug, roomCode, router]);

  const handleLaunchApp = (service: any) => {
    setActiveApp({
      id: service.id,
      name: service.name,
      url: service.url || 'https://neotiv.com', // placeholder if none
      mode: service.mode || 'tv-dispatch',
      icon: service.icon || '📱',
      color: service.color || '#14b8a6'
    });
  };

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: store.hotelTimezone || 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: store.hotelTimezone || 'UTC',
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Safe defaults if services aren't populated
  const displayServices = store.services && store.services.length > 0 
    ? store.services 
    : [
        { id: '1', name: 'Room Service', icon: '🍽️', color: '#14b8a6', mode: 'qr-fallback', url: `https://neotiv.com/order/${roomCode}` },
        { id: '2', name: 'Smart Home', icon: '💡', color: '#f59e0b', mode: 'tv-dispatch' },
        { id: '3', name: 'Front Desk', icon: '🛎️', color: '#3b82f6', mode: 'qr-fallback', url: `https://wa.me/something` }
      ];

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col bg-slate-900"
      style={{
        width: '100vw',
        height: '100vh',
        background: store.backgroundUrl 
          ? `linear-gradient(to right, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.4) 100%), url(${store.backgroundUrl})`
          : 'linear-gradient(135deg, #0f4c6e 0%, #1a7a6e 40%, #0f172a 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Top HUD */}
      <div className="w-full h-24 flex items-center justify-between px-12 pt-6 shrink-0 z-10 hidden sm:flex">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.2)]">
            <span className="text-teal-400 text-2xl font-bold font-display">N</span>
          </div>
          <div>
            <h1 className="text-white text-3xl font-display font-bold mix-blend-screen">{store.hotelName || 'Neotiv Hotel'}</h1>
            <p className="text-white/60 tracking-wider text-sm font-medium uppercase mt-0.5">Room {roomCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <ConnectionStatus />
          <div className="text-right">
            <div className="text-4xl text-white font-bold tracking-tight font-display drop-shadow-md">
              {timeFormatter.format(currentTime)}
            </div>
            <div className="text-white/70 text-sm tracking-widest uppercase font-medium mt-1">
              {dateFormatter.format(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Payload */}
      <div className="flex-1 w-full h-full p-12 grid grid-cols-12 gap-8 z-10 relative">
        
        {/* Left Nav Apps (Span 4) */}
        <div className="col-span-4 h-full flex flex-col gap-6">
          <div className="tv-widget bg-slate-900/60 flex-1 flex flex-col border border-white/10 shadow-2xl rounded-3xl p-8 backdrop-blur-xl">
            <div className="mb-8">
               <h2 className="text-white font-display text-3xl font-bold">Discover</h2>
               <p className="text-teal-400 font-medium text-sm mt-1 uppercase tracking-widest">Available Services</p>
            </div>
            
            <div className="flex flex-col gap-4 flex-1">
              {displayServices.map((s, idx) => {
                const service = s as any;
                return (
                  <button
                    key={service.id || idx}
                    className="tv-focusable flex items-center gap-6 w-full p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/15 transition-all outline-none"
                    onClick={() => handleLaunchApp(service)}
                  >
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/10" 
                      style={{ background: `linear-gradient(135deg, ${service.color || '#14b8a6'}40, transparent)` }}
                    >
                      {service.icon || '✨'}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white text-xl font-bold font-display">{service.name}</h3>
                      <p className="text-white/50 text-sm mt-1 flex items-center gap-2">
                         {service.mode === 'qr-fallback' ? 'Mobile Context' : 'Native Engagement'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Guest Summary block embedded in sidebar bottom */}
            <div className="mt-8 border-t border-white/10 pt-6 flex items-center gap-5">
              {store.guestPhotoUrl ? (
                <Image src={store.guestPhotoUrl} alt="Guest" width={48} height={48} className="w-12 h-12 rounded-full border-2 border-white/20" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white/50 border border-white/10 uppercase font-bold">
                  {store.guestName?.charAt(0) || 'G'}
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{store.guestName || 'Valued Guest'}</p>
                <p className="text-white/40 text-xs">Comfort is our priority.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Panels (Span 8) */}
        <div className="col-span-8 h-full flex flex-col gap-8">
           {/* Flight Radar Row */}
           <motion.div 
             initial={{ y: 20, opacity: 0 }} 
             animate={{ y: 0, opacity: 1 }} 
             transition={{ delay: 0.2 }} 
             className="h-1/2 rounded-3xl overflow-hidden shadow-2xl relative tv-focusable ring-rose-500/20"
             tabIndex={0}
           >
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl" />
              <div className="relative z-10 h-full p-2">
                 <FlightSchedule />
              </div>
           </motion.div>
           
           {/* Dynamic Environment Row */}
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="h-1/2 flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl bg-black/40 border border-white/10 relative">
              {store.latitude && store.longitude ? (
                 <MapWidget locationString={store.hotelLocation || store.hotelName || 'Local Area'} latitude={store.latitude} longitude={store.longitude} />
              ) : (
                <div className="flex flex-col w-full h-full items-center justify-center bg-slate-900/80 backdrop-blur-md">
                   <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 mb-6 border border-teal-500/30">
                      🌤️
                   </div>
                   <h2 className="text-white text-3xl font-display font-bold">Resort Map Unavailable</h2>
                   <p className="text-white/50 mt-2">Geographical coordinates are not configured for this instance.</p>
                </div>
              )}
           </motion.div>
        </div>
      </div>

      {/* Layer Apps Over The Grid */}
      <AppLauncher app={activeApp} onClose={() => setActiveApp(null)} />
    </div>
  );
}
