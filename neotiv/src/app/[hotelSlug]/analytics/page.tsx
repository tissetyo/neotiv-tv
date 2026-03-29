import { createClient } from '@/lib/supabase/server';

export default async function AnalyticsPage({ params }: { params: Promise<{ hotelSlug: string }> }) {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  
  const { data: hotel } = await supabase.from('hotels').select('id, name, location').eq('slug', hotelSlug).single();
  
  if (!hotel) return <div className="p-12 text-center text-slate-500 font-medium">Hotel not found</div>;

  const { data: rooms } = await supabase.from('rooms').select('id, is_occupied').eq('hotel_id', hotel.id);
  const totalRooms = rooms?.length || 0;
  const occupied = rooms?.filter(r => r.is_occupied).length || 0;
  const occRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

  const { data: pendingReqs } = await supabase
    .from('service_requests')
    .select('id')
    .eq('hotel_id', hotel.id)
    .in('status', ['pending', 'in_progress']);
    
  const { data: unreadChats } = await supabase
    .from('chat_messages')
    .select('id')
    .eq('hotel_id', hotel.id)
    .eq('sender_role', 'guest')
    .eq('is_read', false);

  const stats = [
    { label: 'Occupancy', value: `${occRate}%`, icon: '📊', color: 'text-slate-900', bg: 'bg-white' },
    { label: 'Active Rooms', value: `${occupied} / ${totalRooms}`, icon: '🚪', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Live Requests', value: pendingReqs?.length || 0, icon: '🛎️', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Guest Messages', value: unreadChats?.length || 0, icon: '💬', color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Property Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium">{hotel.name} — {hotel.location || 'Global Instance'}</p>
        </div>
        <div className="flex gap-2">
           <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-teal-600/20">Realtime Active</span>
           <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-slate-400/20">Production Mode</span>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex flex-col gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center text-2xl shadow-sm border border-slate-100 transition-transform group-hover:scale-110 duration-300`}>
                {stat.icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                <p className={`text-4xl font-bold ${stat.color} tracking-tight font-display`}>{stat.value}</p>
              </div>
            </div>
            {/* Design accents */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          </div>
        ))}
      </div>
      
      {/* Charts Section Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl opacity-60">📉</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Advanced Visualizations coming soon</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              We are currently collecting historical activity telemetry. Detailed occupancy heatmaps and service request response time trendlines will become active shortly.
            </p>
          </div>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-slate-900/10">Configure Data Streams</button>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
           <div className="relative z-10">
              <h4 className="text-lg font-bold mb-4">Instance Status</h4>
              <div className="space-y-5">
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-sm font-medium text-white/60">API Latency</span>
                    <span className="font-mono text-teal-400 text-sm">~24ms</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-sm font-medium text-white/60">Uptime</span>
                    <span className="font-mono text-teal-400 text-sm">99.98%</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-sm font-medium text-white/60">TV Connections</span>
                    <span className="font-mono text-teal-400 text-sm">{totalRooms} Active</span>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">System Integrity</p>
                 <div className="flex gap-1 mt-3">
                    {Array.from({length: 12}).map((_, i) => (
                       <div key={i} className="h-1 flex-1 bg-teal-500/40 rounded-full" />
                    ))}
                 </div>
              </div>
           </div>
           {/* Glow */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/20 transition-all" />
        </div>
      </div>
    </div>
  );
}
