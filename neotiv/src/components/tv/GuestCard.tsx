'use client';

import Image from 'next/image';

interface GuestCardProps {
  guestName: string;
  roomCode: string;
  photoUrl: string | null;
}

export default function GuestCard({ guestName, roomCode, photoUrl }: GuestCardProps) {
  const firstName = guestName.split(' ')[0] || 'Guest';

  return (
    <div className="flex flex-col items-end w-full">
      {/* Top Identity Row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col items-end">
          <p className="text-white/40 text-[12px] font-black uppercase tracking-[0.2em] mb-1.5">Identity</p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Hello</span>
            <span className="text-teal-400 text-sm font-black uppercase tracking-tight">{firstName}</span>
          </div>
        </div>
        
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full border-2 border-white/20 shadow-xl overflow-hidden shadow-black/40">
           {photoUrl ? (
             <Image src={photoUrl} alt="Guest" fill className="object-cover" />
           ) : (
             <div className="w-full h-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xl tv-font-display">
               {firstName.charAt(0)}
             </div>
           )}
        </div>
      </div>

      {/* Room Number Hero */}
      <div className="text-right">
        <p className="text-white/40 text-[14px] font-black uppercase tracking-[0.2em] mb-1 leading-none">Room</p>
        <p className="text-white text-[96px] font-bold leading-none tv-font-display tracking-tighter">
          {roomCode}
        </p>
      </div>
    </div>
  );
}
