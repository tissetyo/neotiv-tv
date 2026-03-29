'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRoomStore } from '@/stores/roomStore';

// Phase 1 stub — Phase 2 will build the full widget dashboard
export default function MainDashboardPage() {
  const router = useRouter();
  const params = useParams<{ hotelSlug: string; roomCode: string }>();
  const { hotelSlug, roomCode } = params;
  const store = useRoomStore();

  useEffect(() => {
    const key = `neotiv_room_${hotelSlug}_${roomCode}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      router.replace(`/${hotelSlug}/dashboard/${roomCode}`);
    }
  }, [hotelSlug, roomCode, router]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f4c6e 0%, #1a7a6e 40%, #0f172a 100%)',
      }}
    >
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-teal-400 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>N</span>
        </div>
        <h1 className="text-white text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Neotiv Dashboard
        </h1>
        <p className="text-white/60 text-lg">
          Room {roomCode} • {store.hotelName || 'Loading...'}
        </p>
        <p className="text-teal-400/70 text-sm mt-4">Phase 2 — Full dashboard coming soon</p>
      </div>
    </div>
  );
}
