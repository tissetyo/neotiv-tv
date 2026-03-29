'use client';

import Image from 'next/image';

interface HotelInfoProps {
  hotelName: string;
  roomCode: string;
  photoUrl?: string | null;
}

export default function HotelInfo({ hotelName, roomCode, photoUrl }: HotelInfoProps) {
  return (
    <div className="tv-widget h-full p-5 bg-slate-900/60 transition-transform duration-300 hover:scale-[1.02] border-white/20 relative overflow-hidden group">
      <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-all" />
      
      <div className="relative z-10 flex flex-col justify-between h-full">
         <div className="space-y-1">
            <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Hotel Info</p>
            <h3 className="text-white text-lg font-bold tv-font-display leading-tight">{hotelName}</h3>
         </div>

         {photoUrl ? (
            <div className="mt-2 h-20 w-full rounded-xl border border-white/10 overflow-hidden relative">
               <Image src={photoUrl} alt={hotelName} fill className="object-cover" />
            </div>
         ) : (
            <div className="mt-2 h-20 w-full rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/20 text-[10px] uppercase font-bold tracking-widest">
               No Image
            </div>
         )}
         
         <p className="mt-3 text-white/40 text-[10px] font-bold uppercase tracking-widest border-t border-white/5 pt-2">
            Room {roomCode}
         </p>
      </div>
    </div>
  );
}
