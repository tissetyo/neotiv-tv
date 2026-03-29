'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import WelcomeScreen from '@/components/tv/WelcomeScreen';
import type { RoomSession } from '@/types';

interface PageProps {
  params: Promise<{ hotelSlug: string; roomCode: string }>;
}

const SESSION_KEY = (hotelSlug: string, roomCode: string) => `neotiv_room_${hotelSlug}_${roomCode}`;

export default function RoomEntryPage({ params }: PageProps) {
  const { hotelSlug, roomCode } = use(params);
  const router = useRouter();

  const [screen, setScreen] = useState<'loading' | 'pin' | 'welcome'>('loading');
  const [pin, setPin] = useState<string[]>([]);
  const [session, setSession] = useState<RoomSession | null>(null);
  const [pinError, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check localStorage for existing session
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY(hotelSlug, roomCode));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RoomSession;
        setSession(parsed);
        setScreen('welcome');
      } catch {
        setScreen('pin');
      }
    } else {
      setScreen('pin');
    }
  }, [hotelSlug, roomCode]);

  const handleWelcomeFinish = useCallback(() => {
    router.push(`/${hotelSlug}/dashboard/${roomCode}/main`);
  }, [hotelSlug, roomCode, router]);

  const submitPin = useCallback(async (digits: string[]): Promise<void> => {
    if (digits.length !== 4 || isSubmitting) return;
    setIsSubmitting(true);
    setError(false);

    try {
      const res = await fetch('/api/room/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlug, roomCode, pin: digits.join('') }),
      });
      const data = await res.json() as { session?: RoomSession; error?: string };

      if (!res.ok || !data.session) {
        setError(true);
        setPin([]);
      } else {
        localStorage.setItem(SESSION_KEY(hotelSlug, roomCode), JSON.stringify(data.session));
        setSession(data.session);
        setScreen('welcome');
      }
    } catch {
      setError(true);
      setPin([]);
    } finally {
      setIsSubmitting(false);
    }
  }, [hotelSlug, roomCode, isSubmitting]);

  const pressKey = useCallback((digit: string): void => {
    setError(false);
    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const next = [...prev, digit];
      if (next.length === 4) {
        setTimeout(() => submitPin(next), 50);
      }
      return next;
    });
  }, [submitPin]);

  const backspace = useCallback((): void => {
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  }, []);

  // Keyboard support for PIN & skip welcome
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (screen === 'pin') {
        if (e.key >= '0' && e.key <= '9') pressKey(e.key);
        if (e.key === 'Backspace') backspace();
      } else if (screen === 'welcome') {
        if (e.key === 'Enter' || e.key === ' ') handleWelcomeFinish();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, pressKey, backspace, handleWelcomeFinish]);

  const numpadKeys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  if (screen === 'loading') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-teal-500/20" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950" style={{ width: '1920px', height: '1080px' }}>
      {/* Background with Ambient Overlay */}
      <AnimatePresence>
        <motion.div
           key={session?.backgroundUrl || 'default'}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1.5 }}
           className="absolute inset-0 bg-cover bg-center"
           style={{
             backgroundImage: session?.backgroundUrl
               ? `url(${session.backgroundUrl})`
               : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
           }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <AnimatePresence mode="wait">
        {/* ━━━ PIN ENTRY SCREEN ━━━ */}
        {screen === 'pin' && (
          <motion.div
            key="pin"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <motion.div
              animate={pinError ? { x: [-16, 16, -12, 12, -8, 8, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="tv-widget text-center bg-slate-900/60 backdrop-blur-2xl border-white/10"
              style={{ width: '480px', padding: '60px' }}
            >
              <div className="w-20 h-20 rounded-3xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-10 shadow-lg">
                <span className="text-teal-400 text-3xl font-bold tv-font-display">N</span>
              </div>

              <div className="mb-10 text-center">
                <p className="text-white/40 text-sm font-black uppercase tracking-[0.2em] mb-2 leading-none">Access Control</p>
                <p className="text-white text-4xl font-bold tv-font-display leading-tight tracking-tight">
                  Room <span className="text-teal-400">{roomCode}</span>
                </p>
              </div>

              {/* PIN Indicators */}
              <div className="flex justify-center gap-6 mb-12">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={i < pin.length ? { scale: 1.2, backgroundColor: '#14b8a6' } : { scale: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                  />
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-6">
                {numpadKeys.map((key, idx) => (
                  key === '' ? <div key={idx} /> : (
                    <button
                      key={idx}
                      onClick={() => key === '⌫' ? backspace() : pressKey(key)}
                      className="tv-focusable aspect-square flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-2xl transition-all hover:bg-white/10 active:bg-teal-500/20"
                      tabIndex={0}
                      data-focusable="true"
                    >
                      {key}
                    </button>
                  )
                ))}
              </div>

              {pinError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 font-bold text-sm mt-8 absolute w-full left-0 bottom-12">
                  INVALID PIN • ACCESS DENIED
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ━━━ WELCOME / SPLASH SCREEN ━━━ */}
        {screen === 'welcome' && session && (
          <WelcomeScreen 
            session={session} 
            roomCode={roomCode} 
            onFinish={handleWelcomeFinish} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
