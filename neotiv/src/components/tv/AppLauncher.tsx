'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';

export interface AppConfig {
  id: string;
  name: string;
  url: string;
  mode: 'iframe' | 'tv-dispatch' | 'qr-fallback';
  icon: string;
  color: string;
}

interface AppLauncherProps {
  app: AppConfig | null;
  onClose: () => void;
}

export default function AppLauncher({ app, onClose }: AppLauncherProps) {
  const [showExitHint, setShowExitHint] = useState(true);

  useEffect(() => {
    if (!app) return;
    
    setShowExitHint(true);
    const timer = setTimeout(() => setShowExitHint(false), 5000);
    
    if (app.mode === 'tv-dispatch') {
      // Dispatches a payload instructing the Android TV wrapper or set-top host to transition HDMI contexts
      window.dispatchEvent(new CustomEvent('neotiv:switch-to-tv', { bubbles: true, detail: { target: app.id } }));
    }

    const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => {
       clearTimeout(timer);
       window.removeEventListener('keydown', handleKey);
    };
  }, [app, onClose]);

  if (!app) return null;

  return (
    <AnimatePresence>
      <motion.div
         initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
         animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.4 }}
         className="fixed inset-0 z-[5000] bg-black text-white overflow-hidden flex flex-col"
      >
        <AnimatePresence>
           {showExitHint && (
              <motion.div
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="absolute top-10 left-10 z-[5010] bg-black/80 backdrop-blur-xl px-6 py-3.5 rounded-2xl border border-white/10 flex items-center gap-5 shadow-2xl"
              >
                  <span className="text-white/40 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">Navigation Override</span>
                  <div className="flex items-center gap-3 border-l border-white/10 pl-5">
                      <span className="bg-white text-black rounded px-2.5 py-1 text-xs font-bold font-mono shadow-[0_0_15px_rgba(255,255,255,0.4)]">ESC</span>
                      <span className="text-[13px] font-bold text-white/90 tracking-wide">Exit {app.name}</span>
                  </div>
              </motion.div>
           )}
        </AnimatePresence>

        {app.mode === 'iframe' && (
           <iframe
             src={app.url}
             className="w-full h-full border-0 absolute inset-0 z-[5005]"
             allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
           />
        )}

        {app.mode === 'tv-dispatch' && (
           <div className="w-full h-full flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              
              <span className="text-9xl mb-8 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] animate-pulse">{app.icon}</span>
              <h2 className="font-display font-bold text-5xl tracking-wide mb-3 text-white drop-shadow-md">Engaging {app.name}...</h2>
              <p className="tv-text-xl text-teal-400 font-mono tracking-widest font-semibold uppercase">Executing HDMI Port Transition</p>
              
              <div className="mt-16 text-center z-10">
                 <button 
                   className="tv-focusable bg-white/5 hover:bg-white/10 px-8 py-4 rounded-xl font-bold tracking-widest text-sm uppercase transition-all shadow-xl border border-white/10 text-white/70 hover:text-white" 
                   onClick={onClose} 
                   autoFocus
                 >
                    Abort / Return
                 </button>
              </div>
           </div>
        )}

        {app.mode === 'qr-fallback' && (
           <div className="w-full h-full flex items-center justify-center bg-[#07070a] p-24 gap-40 relative">
              <div className="flex flex-col flex-1 max-w-xl z-10">
                 <div className="w-24 h-24 flex items-center justify-center rounded-3xl bg-white/5 border border-white/10 text-5xl mb-8 shadow-2xl" style={{ background: `linear-gradient(135deg, ${app.color}20, transparent)`, borderColor: `${app.color}40` }}>
                    {app.icon}
                 </div>
                 <h2 className="text-6xl font-display font-bold mb-6 tracking-tight text-white drop-shadow-lg">Scan to access <br/><span style={{ color: app.color }}>{app.name}</span></h2>
                 <p className="text-[22px] text-white/50 leading-relaxed max-w-lg mb-14 font-medium">
                    This secured application does not permit native TV dashboard embedding. Scan the QR code with your mobile camera to login directly.
                 </p>
                 <button 
                   className="tv-focusable self-start bg-white/10 hover:bg-white/15 border border-white/10 px-8 py-4 rounded-xl font-bold tracking-widest text-sm uppercase transition-all focus:ring-4 text-white/80 hover:text-white shadow-xl" 
                   style={{ '--tw-ring-color': `${app.color}60` } as React.CSSProperties}
                   onClick={onClose} 
                   autoFocus
                 >
                    Dismiss Context
                 </button>
              </div>
              <div className="shrink-0 bg-white p-8 rounded-[2rem] shadow-[0_0_80px_rgba(255,255,255,0.08)] z-10">
                 <QRCode value={app.url} size={400} level="H" className="filter drop-shadow-sm" />
              </div>
              
              {/* Background ambient glow matching the app color */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20" style={{ background: app.color, pointerEvents: 'none' }} />
           </div>
        )}

      </motion.div>
    </AnimatePresence>
  );
}
