'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/stores/roomStore';
import { useDpadNavigation } from '@/lib/hooks/useDpadNavigation';

// Components
import DigitalClock from '@/components/tv/DigitalClock';
import AnalogClocks from '@/components/tv/AnalogClocks';
import GuestCard from '@/components/tv/GuestCard';
import WifiCard from '@/components/tv/WifiCard';
import FlightSchedule from '@/components/tv/FlightSchedule';
import { NotificationCard, HotelDeals } from '@/components/tv/InfoWidgets';
import HotelService from '@/components/tv/HotelService';
import HotelInfo from '@/components/tv/HotelInfo';
import MapWidget from '@/components/tv/MapWidget';
import AppGrid from '@/components/tv/AppGrid';
import MarqueeBar from '@/components/tv/MarqueeBar';
import AppLauncher from '@/components/tv/AppLauncher';
import DashboardSync from '@/components/tv/DashboardSync';
import ChatModal from '@/components/tv/ChatModal';
import AlarmModal from '@/components/tv/AlarmModal';
import { useRealtime } from '@/lib/hooks/useRealtime';

export default function MainDashboardPage() {
  const router = useRouter();
  const params = useParams<{ hotelSlug: string; roomCode: string }>();
  const { hotelSlug, roomCode } = params;
  const store = useRoomStore();
  const { registerElement } = useDpadNavigation();

  const [activeApp, setActiveApp] = useState<any>(null);
  const [modal, setModal] = useState<'chat' | 'alarm' | 'notifications' | null>(null);

  // Sync Data
  useRealtime(store.hotelId, store.roomId);

  // Security Check
  useEffect(() => {
    const key = `neotiv_room_${hotelSlug}_${roomCode}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      router.replace(`/${hotelSlug}/dashboard/${roomCode}`);
    }
  }, [hotelSlug, roomCode, router]);

  const handleLaunchApp = (id: string) => {
    if (['chat', 'alarm', 'notifications'].includes(id)) {
       setModal(id as any);
    } else {
       setActiveApp({ id, name: id.toUpperCase(), mode: 'tv-dispatch' });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950 overflow-hidden text-white"
      style={{ width: '1920px', height: '1080px' }}
    >
      {/* Background with Vignette Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: store.backgroundUrl 
            ? `url(${store.backgroundUrl})` 
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.6)_100%)]" />

      {/* Main Grid Layout (24px padding) */}
      <div className="absolute inset-0 p-8 grid grid-cols-[480px_1fr_400px] grid-rows-[220px_1fr_260px_48px] gap-6">
        
        {/* ROW 1: Clocks | Empty | Identity */}
        <div className="flex flex-col justify-between">
           <div className="flex flex-col gap-4">
              <DigitalClock 
                timezone={store.hotelTimezone} 
                location={store.hotelLocation ?? undefined} 
              />
           </div>
           <AnalogClocks 
             tz1={store.getClockTimezones()[0]} label1={store.getClockLabels()[0]}
             tz2={store.getClockTimezones()[1]} label2={store.getClockLabels()[1]}
             tz3={store.getClockTimezones()[2]} label3={store.getClockLabels()[2]}
           />
        </div>
        
        <div className="flex items-center justify-center">
           {/* Center Background View */}
        </div>

        <div className="flex flex-col justify-between items-end">
           <GuestCard 
             guestName={store.guestName || 'Stephen Hawk'} 
             roomCode={roomCode} 
             photoUrl={store.guestPhotoUrl} 
           />
           <WifiCard 
             ssid={store.wifiSsid || 'HotelABC'} 
             password={store.wifiPassword ?? undefined} 
             username={store.wifiUsername ?? 'Guest'}
           />
        </div>

        {/* ROW 2: Flight Schedule | Empty | Notification Area */}
        <div className="row-span-1 min-h-0">
           <FlightSchedule airportCode={store.airportIataCode || 'DPS'} />
        </div>

        <div className="relative">
           {/* Dynamic Center Backdrop */}
        </div>

        <div className="flex flex-col justify-end">
           <NotificationCard 
             title="Title Notification" 
             body="Lorem ipsum dolor sit amet consectetur. Scelerisque ipsum nisi elementum elementum faucibus etiam nunc turpis."
             time="10:08 AM, 26 March 2026"
             onSelect={() => setModal('notifications')}
           />
        </div>

        {/* ROW 3: Action Center | Map | Apps Grid */}
        <div className="flex flex-col gap-4">
           {/* Hotel Info & Services Side by Side */}
           <div className="grid grid-cols-2 gap-4 h-full">
              <HotelInfo 
                hotelName={store.hotelName || 'Neotiv Hotel'} 
                roomCode={roomCode} 
              />
              <div className="tv-widget bg-slate-900/60 backdrop-blur-2xl border-white/10 p-5 flex flex-col gap-4">
                 <HotelService 
                   services={store.services.map(s => ({ ...s, icon: s.icon || '🛎️' }))} 
                   onSelect={(s) => console.log('Select Service', s)} 
                 />
              </div>
           </div>
           
           {/* Deals Area at Bottom Left Column */}
           <div className="tv-widget bg-slate-900/60 backdrop-blur-2xl border-white/10 p-5">
              <HotelDeals 
                promos={store.promos.map(p => ({ ...p, poster_url: p.poster_url || '' }))} 
                onSelect={(p) => console.log('Select Promo', p)} 
              />
           </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
           <MapWidget 
             locationString={store.hotelLocation || 'Local Area'} 
             latitude={store.latitude ?? undefined} 
             longitude={store.longitude ?? undefined} 
           />
        </div>

        <div className="tv-widget bg-slate-900/60 backdrop-blur-2xl border-white/10 p-4">
           <AppGrid onLaunch={handleLaunchApp} />
        </div>

        {/* ROW 4: Marquee */}
        <div className="col-span-3 -mx-8">
           <MarqueeBar announcements={store.announcements || []} />
        </div>
      </div>

      {/* Overlay Modals & Launchers */}
      <DashboardSync hotelId={store.hotelId || ''} roomId={store.roomId || ''} />
      <AppLauncher app={activeApp} onClose={() => setActiveApp(null)} />
      
      <AnimatePresence>
        {modal === 'chat' && (
          <ChatModal 
            hotelId={store.hotelId || ''} 
            roomId={store.roomId || ''} 
            guestName={store.guestName || 'Guest'}
            onClose={() => setModal(null)} 
          />
        )}
        {modal === 'alarm' && (
          <AlarmModal 
            hotelId={store.hotelId || ''} 
            roomId={store.roomId || ''} 
            onClose={() => setModal(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
