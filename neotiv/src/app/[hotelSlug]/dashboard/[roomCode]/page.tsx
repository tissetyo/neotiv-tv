'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { RoomSession } from '@/types';

interface PageProps {
  params: Promise<{ hotelSlug: string; roomCode: string }>;
}

const SESSION_KEY = (hotelSlug: string, roomCode: string) => `neotiv_room_${hotelSlug}_${roomCode}`;

export default function RoomEntryPage({ params }: PageProps): JSX.Element {
  const { hotelSlug, roomCode } = use(params);
  const router = useRouter();

  const [screen, setScreen] = useState<'loading' | 'pin' | 'welcome'>('loading');
  const [pin, setPin] = useState<string[]>([]);
  const [session, setSession] = useState<RoomSession | null>(null);
  const [pinError, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);

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

  // Countdown from welcome → main
  useEffect(() => {
    if (screen !== 'welcome') return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.push(`/${hotelSlug}/dashboard/${roomCode}/main`);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, hotelSlug, roomCode, router]);

  // D-pad: Enter on welcome skips countdown
  useEffect(() => {
    if (screen !== 'welcome') return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        router.push(`/${hotelSlug}/dashboard/${roomCode}/main`);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, hotelSlug, roomCode, router]);

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

  // D-pad numpad navigation for PIN
  useEffect(() => {
    if (screen !== 'pin') return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key >= '0' && e.key <= '9') pressKey(e.key);
      if (e.key === 'Backspace') backspace();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, pressKey, backspace]);

  const numpadKeys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  if (screen === 'loading') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ width: '100vw', height: '100vh' }}>
      {/* Background — hotel surfing image fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: session?.backgroundUrl
            ? `url(${session.backgroundUrl})`
            : 'linear-gradient(135deg, #0f4c6e 0%, #1a7a6e 40%, #0f172a 100%)',
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      <AnimatePresence mode="wait">
        {/* ━━━ PIN ENTRY SCREEN ━━━ */}
        {screen === 'pin' && (
          <motion.div
            key="pin"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={pinError ? { x: [-16, 16, -12, 12, -8, 8, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="tv-widget text-center"
              style={{ width: '360px', padding: '40px' }}
            >
              {/* Hotel logo placeholder */}
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-6">
                <span className="text-teal-400 text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>N</span>
              </div>

              <p className="text-white/60 text-sm mb-1">Room</p>
              <p className="text-white font-bold mb-6" style={{ fontSize: '28px', fontFamily: 'var(--font-display)' }}>
                {roomCode}
              </p>

              <p className="text-white/70 text-sm mb-5">Enter PIN</p>

              {/* PIN dots */}
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      i < pin.length ? 'bg-teal-400 scale-110' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-red-400 text-xs mb-4">Incorrect PIN. Please try again.</p>
              )}

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3">
                {numpadKeys.map((key, idx) => (
                  key === '' ? (
                    <div key={idx} />
                  ) : (
                    <button
                      key={idx}
                      onClick={() => key === '⌫' ? backspace() : pressKey(key)}
                      className="tv-focusable w-full py-3 rounded-xl font-semibold text-white transition-all duration-150 focus:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        fontSize: '20px',
                      }}
                      tabIndex={0}
                    >
                      {key}
                    </button>
                  )
                ))}
              </div>

              {isSubmitting && (
                <div className="mt-4 flex justify-center">
                  <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ━━━ WELCOME / SPLASH SCREEN ━━━ */}
        {screen === 'welcome' && session && (
          <motion.div
            key="welcome"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Room number — top right */}
            <div className="absolute top-8 right-10 text-right">
              <p className="text-white/70 text-sm font-medium tracking-widest uppercase">Room</p>
              <p className="text-white font-bold leading-none" style={{ fontSize: '72px', fontFamily: 'var(--font-display)' }}>
                {roomCode}
              </p>
            </div>

            {/* Centered welcome card */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingLeft: '15%' }}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="relative"
                style={{ width: '520px' }}
              >
                {/* Guest avatar — overlaps card top */}
                <div className="absolute -top-12 left-10 z-10">
                  {session.guestPhotoUrl ? (
                    <Image
                      src={session.guestPhotoUrl}
                      alt="Guest"
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-teal-500/30 border-4 border-white/30 flex items-center justify-center shadow-xl">
                      <span className="text-white text-3xl font-bold">
                        {session.guestName?.charAt(0) ?? 'G'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Glass card */}
                <div
                  className="tv-widget"
                  style={{ padding: '48px 40px 36px', paddingTop: '60px' }}
                >
                  <p className="text-white/70 text-base mb-1">
                    Welcome in <span className="text-white font-medium">{session.hotelName}</span>
                    {session.hotelLocation && `, ${session.hotelLocation}`}!
                  </p>
                  <p className="text-white font-bold mb-5" style={{ fontSize: '28px', fontFamily: 'var(--font-display)' }}>
                    {session.guestName ?? 'Dear Guest'}
                  </p>

                  <div className="border-t border-white/15 mb-5" />

                  <p className="text-white/75 leading-relaxed mb-3" style={{ fontSize: '16px' }}>
                    We hope you enjoy your Trip! We always ready whenever you want,
                    let us know what you needed.
                  </p>
                  <p className="text-white/75" style={{ fontSize: '16px' }}>
                    Your comfort is our priority!
                  </p>

                  {/* Countdown progress bar */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/40 text-xs">Entering in {countdown}s — press Enter to skip</span>
                      <span className="text-teal-400 text-xs">{Math.round(((5 - countdown) / 5) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-teal-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((5 - countdown) / 5) * 100}%` }}
                        transition={{ duration: 0.9, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
