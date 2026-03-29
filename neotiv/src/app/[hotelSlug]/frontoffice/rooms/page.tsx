import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ hotelSlug: string }>;
}

export default async function RoomsPage({ params }: Props) {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hotelId = user?.user_metadata?.hotel_id as string;

  const { data: hotel } = await supabase
    .from('hotels')
    .select('name')
    .eq('slug', hotelSlug)
    .single();

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('room_code');

  const occupied = rooms?.filter((r) => r.is_occupied).length ?? 0;
  const total = rooms?.length ?? 0;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="p-10 font-staff">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏠</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Room Inventory</h1>
           </div>
           <p className="text-slate-500 text-sm font-medium">Real-time occupancy and status monitoring for {hotel?.name}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">🔍</span>
              <input 
                type="text" 
                placeholder="Search rooms..." 
                className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-64 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              />
           </div>
           <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2">
              <span>+</span> Add Room
           </button>
        </div>
      </div>

      {/* Stats HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Inventory', value: total, icon: '🏨', trend: 'Fixed' },
          { label: 'Occupied', value: occupied, icon: '👥', trend: 'Live', color: 'text-teal-600' },
          { label: 'Vacant', value: total - occupied, icon: '✨', trend: 'Available', color: 'text-slate-500' },
          { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: '📊', trend: 'Active', color: 'text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{stat.trend}</span>
              </div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color || 'text-slate-900'}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-slate-200 pb-2">
         {['All Rooms', 'Occupied', 'Vacant', 'Maintenance'].map((tab, i) => (
           <button 
             key={tab} 
             className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${i === 0 ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
           >
             {tab}
           </button>
         ))}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        {rooms?.map((room) => (
          <div
            key={room.id}
            className={`group bg-white rounded-3xl p-5 border-2 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer shadow-sm hover:shadow-xl ${
              room.is_occupied 
                ? 'border-teal-500/30' 
                : 'border-slate-100 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-slate-900 leading-none">
                {room.room_code}
              </span>
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                room.is_occupied 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {room.is_occupied ? 'Occupied' : 'Vacant'}
              </div>
            </div>

            <div className="space-y-2.5">
              {room.is_occupied ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">👤</div>
                    <p className="text-xs font-bold text-slate-700 truncate">{room.guest_name}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px]">🗓️</div>
                    <p className="text-[10px] font-bold text-slate-500">
                      In: {new Date(room.checkin_date || '').toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-2">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ready for Check-in</p>
                </div>
              )}
            </div>

            {/* Quick Actions (Hover) */}
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-black text-teal-600 uppercase">View Details →</span>
               <div className="flex gap-1">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-xs">💬</div>
                  <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-xs">🛎️</div>
               </div>
            </div>
          </div>
        ))}

        {(!rooms || rooms.length === 0) && (
          <div className="col-span-full py-20 bg-slate-100/50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl mb-6">🏨</div>
            <h3 className="text-lg font-black text-slate-900">No rooms mapped yet</h3>
            <p className="text-slate-400 text-sm max-w-md mt-2">Get started by importing your room inventory in the Asset Management settings.</p>
            <button className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-lg">Import Inventory</button>
          </div>
        )}
      </div>
    </div>
  );
}
