'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import type { Alarm } from '@/types';

interface AlarmModalProps {
  hotelId: string;
  roomId: string;
  onClose: () => void;
}

export default function AlarmModal({ hotelId, roomId, onClose }: AlarmModalProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAlarms();
  }, [roomId]);

  const fetchAlarms = async () => {
    const { data } = await supabase
      .from('alarms')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_acknowledged', false)
      .order('scheduled_time', { ascending: true });
    
    if (data) setAlarms(data as Alarm[]);
  };

  const addAlarm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const scheduledDate = new Date();
    scheduledDate.setHours(hour, minute, 0, 0);
    // If time is in the past today, set for tomorrow
    if (scheduledDate.getTime() <= Date.now()) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const { error } = await supabase.from('alarms').insert({
      hotel_id: hotelId,
      room_id: roomId,
      scheduled_time: scheduledDate.toISOString(),
      note: note.trim() || 'Wake up call'
    });

    if (!error) {
      setNote('');
      fetchAlarms();
    }
    setIsSubmitting(false);
  };

  const deleteAlarm = async (id: string) => {
    const { error } = await supabase.from('alarms').delete().eq('id', id);
    if (!error) fetchAlarms();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-20"
    >
      <motion.div
        initial={{ y: 40, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 40, scale: 0.95 }}
        className="tv-widget w-full max-w-2xl bg-slate-900/60 border-white/10 p-12 flex flex-col gap-10"
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-900/40 p-10 -m-12 mb-0 border-b border-white/10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 text-2xl border border-teal-500/30">⏰</div>
              <div>
                 <h2 className="text-white text-3xl font-bold tv-font-display">Wake-Up Call</h2>
                 <p className="text-teal-400 text-xs font-black uppercase tracking-widest mt-1">Scheduled Alarms</p>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="tv-focusable px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10"
             data-focusable="true"
             autoFocus
           >
             Close [esc]
           </button>
        </div>

        {/* Time Picker Section */}
        <div className="flex flex-col items-center gap-6 py-4">
          <p className="text-white/40 text-sm font-black uppercase tracking-widest">Set Wake-up Time</p>
          <div className="flex items-center gap-8">
            {/* Hour Picker */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => setHour((h) => (h + 1) % 24)} 
                className="tv-focusable w-16 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                data-focusable="true"
              >▲</button>
              <span className="text-7xl font-bold font-display text-white w-24 text-center">
                {hour.toString().padStart(2, '0')}
              </span>
              <button 
                onClick={() => setHour((h) => (h - 1 + 24) % 24)} 
                className="tv-focusable w-16 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                data-focusable="true"
              >▼</button>
            </div>

            <span className="text-6xl font-bold text-teal-400 mb-2">:</span>

            {/* Minute Picker */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => setMinute((m) => (m + 5) % 60)} 
                className="tv-focusable w-16 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                data-focusable="true"
              >▲</button>
              <span className="text-7xl font-bold font-display text-white w-24 text-center">
                {minute.toString().padStart(2, '0')}
              </span>
              <button 
                onClick={() => setMinute((m) => (m - 5 + 60) % 60)} 
                className="tv-focusable w-16 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                data-focusable="true"
              >▼</button>
            </div>
          </div>

          <button 
            onClick={addAlarm}
            disabled={isSubmitting}
            className="tv-focusable mt-6 px-12 py-5 rounded-2xl bg-teal-500 text-white font-black uppercase tracking-widest text-lg shadow-xl shadow-teal-500/20 active:scale-95 transition-all"
            data-focusable="true"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Call'}
          </button>
        </div>

        {/* Active Alarms List */}
        <div className="flex flex-col gap-4">
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Pending Alarms</p>
           <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {alarms.length === 0 ? (
                <div className="text-center py-6 bg-white/5 rounded-2xl border border-dashed border-white/10 text-white/20 text-sm">
                  No wake-up calls scheduled
                </div>
              ) : alarms.map((alarm) => (
                <div 
                  key={alarm.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5"
                >
                   <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold font-display text-white">
                        {new Date(alarm.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        {new Date(alarm.scheduled_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                   </div>
                   <button 
                     onClick={() => deleteAlarm(alarm.id)}
                     className="tv-focusable w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-sm"
                     data-focusable="true"
                   >✕</button>
                </div>
              ))}
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
