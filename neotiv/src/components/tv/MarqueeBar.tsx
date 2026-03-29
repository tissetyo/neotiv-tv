'use client';

import { motion } from 'framer-motion';

interface MarqueeBarProps {
  announcements: { id: string; text: string }[];
}

export default function MarqueeBar({ announcements }: MarqueeBarProps) {
  const fullText = announcements.length > 0 
    ? announcements.map(a => a.text).join(' • ') 
    : 'Welcome to our Hotel • Experience luxury and comfort like never before • Room services are available 24/7 • Please call extension 0 for any assistance.';

  // Doubling the text to ensure continuous loop
  const displayLabel = `${fullText} • ${fullText}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-slate-950/80 backdrop-blur-md border-t border-white/5 flex items-center overflow-hidden z-[100]">
      {/* Action Label */}
      <div className="flex-shrink-0 bg-teal-500 h-full flex items-center px-6 z-10 shadow-[8px_0_12px_rgba(0,0,0,0.4)]">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap pt-1">NEWS • FEED</span>
      </div>

      {/* Marquee Container */}
      <div className="flex-1 whitespace-nowrap relative flex items-center h-full">
         <motion.div 
           initial={{ x: 0 }}
           animate={{ x: '-50%' }}
           transition={{ 
             duration: 60, // Adjust speed based on content length ideally
             repeat: Infinity,
             ease: "linear"
           }}
           className="inline-block"
         >
           <span className="text-[14px] font-bold text-white/50 uppercase tracking-[0.15em] mx-10">
              {displayLabel}
           </span>
         </motion.div>
      </div>
    </div>
  );
}
