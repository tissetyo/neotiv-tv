'use client';

import { useState, useEffect, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';

interface Alarm {
  id: string;
  room_id: string;
  scheduled_time: string;
  is_acknowledged: boolean;
  note: string;
  rooms?: { room_code: string; guest_name: string } | null;
}

export default function StaffAlarmsPage({ params }: { params: Promise<{ hotelSlug: string }> }) {
  const { hotelSlug } = use(params);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAlarms();
    
    // Real-time listener for new alarms
    const channel = supabase
      .channel('staff_alarms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alarms' }, () => {
        fetchAlarms();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAlarms = async () => {
    const { data } = await supabase
      .from('alarms')
      .select('*, rooms(room_code, guest_name)')
      .eq('is_acknowledged', false)
      .order('scheduled_time', { ascending: true });
    
    if (data) setAlarms(data as any[]);
    setIsLoading(false);
  };

  const acknowledgeAlarm = async (id: string) => {
    await supabase.from('alarms').update({ is_acknowledged: true }).eq('id', id);
    fetchAlarms();
  };

  return (
    <div className="p-10 font-staff max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⏰</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Wake-Up Calls</h1>
           </div>
           <p className="text-slate-500 text-sm font-medium">Critical schedule for {hotelSlug} rooms</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">
              Upcoming: {alarms.length}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
           [1,2,3].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-[32px]" />)
        ) : alarms.length === 0 ? (
           <div className="col-span-full py-24 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <p className="text-4xl mb-4">🌙</p>
              <h3 className="text-lg font-black text-slate-900">No pending alarms</h3>
              <p className="text-slate-400 text-sm mt-2">All guests are currently resting or alarms completed.</p>
           </div>
        ) : (
          <AnimatePresence>
            {alarms.map((alarm) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={alarm.id}
                className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-xl shadow-slate-900/5 flex flex-col justify-between"
              >
                 <div>
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-4xl font-black text-slate-900">{new Date(alarm.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       <div className="px-3 py-1 bg-teal-500 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">Pending</div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-900 border border-slate-200">
                          {alarm.rooms?.room_code}
                       </div>
                       <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{alarm.rooms?.guest_name || 'Guest Room'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In-Room Notification</p>
                       </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-6">
                       Note: {alarm.note || 'Wake up call'}
                    </div>
                 </div>

                 <button 
                   onClick={() => acknowledgeAlarm(alarm.id)}
                   className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                 >
                   Acknowledge Call ✓
                 </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
