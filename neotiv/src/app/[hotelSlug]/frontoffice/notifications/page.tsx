'use client';

import { useState, useEffect, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
  is_read: boolean;
  room_id: string | null;
  rooms?: { room_code: string } | null;
}

export default function StaffNotificationsPage({ params }: { params: Promise<{ hotelSlug: string }> }) {
  const { hotelSlug } = use(params);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchNotifications();
    
    // Real-time subscription for new alerts
    const channel = supabase
      .channel('staff_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications'
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const fetchNotifications = async () => {
    let query = supabase
      .from('notifications')
      .select('*, rooms(room_code)')
      .order('created_at', { ascending: false });
    
    if (filter === 'unread') {
      query = query.eq('is_read', false);
    }

    const { data } = await query.limit(50);
    if (data) setNotifications(data as any[]);
    setIsLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    fetchNotifications();
  };

  const getTypeStyle = (type: string) => {
     switch (type.toLowerCase()) {
        case 'emergency': return 'bg-rose-500 text-white';
        case 'service': return 'bg-amber-500 text-white';
        case 'system': return 'bg-slate-900 text-white';
        default: return 'bg-teal-500 text-white';
     }
  };

  return (
    <div className="p-10 font-staff max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔔</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Alerts & Notifications</h1>
           </div>
           <p className="text-slate-500 text-sm font-medium">Monitoring all staff-facing activity for {hotelSlug}</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
           <button 
             onClick={() => setFilter('all')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >All</button>
           <button 
             onClick={() => setFilter('unread')}
             className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >Unread</button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
           <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-3xl" />)}
           </div>
        ) : notifications.length === 0 ? (
           <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <p className="text-4xl mb-4">✨</p>
              <h3 className="text-lg font-black text-slate-900">All clear</h3>
              <p className="text-slate-400 text-sm mt-2">No active notifications to display.</p>
           </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={notif.id}
                className={`relative group bg-white p-6 rounded-[32px] border-2 transition-all flex items-start gap-6 ${notif.is_read ? 'border-slate-50 opacity-60' : 'border-teal-500/10 shadow-lg shadow-teal-500/5'}`}
              >
                 <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${getTypeStyle(notif.type)}`}>
                    <span className="text-xs opacity-50">{notif.rooms?.room_code || 'SY'}</span>
                    <span className="text-[10px] tracking-tighter uppercase">{notif.type.substring(0,4)}</span>
                 </div>

                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                       <h3 className={`text-base font-black truncate ${notif.is_read ? 'text-slate-500' : 'text-slate-900'}`}>{notif.title}</h3>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap ml-4">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">{notif.body}</p>
                    
                    <div className="mt-4 flex items-center gap-4">
                        {!notif.is_read && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline"
                          >Mark as Read ✓</button>
                        )}
                        <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">
                           {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                    </div>
                 </div>

                 <button className="opacity-0 group-hover:opacity-100 p-2 bg-slate-50 rounded-xl transition-all absolute top-6 right-6">
                    ➔
                 </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
