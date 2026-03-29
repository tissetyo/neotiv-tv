import { createClient } from '@/lib/supabase/server';
import RoomsClient from './rooms-client';

export default async function RoomsSettingsPage({ params }: { params: Promise<{ hotelSlug: string }> }) {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  
  const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', hotelSlug).single();
  
  if (!hotel) return <div>Hotel not found</div>;

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*, room_types(name)')
    .eq('hotel_id', hotel.id)
    .order('room_code', { ascending: true });

  const { data: roomTypes } = await supabase
    .from('room_types')
    .select('id, name')
    .eq('hotel_id', hotel.id);

  return (
    <div className="p-12 max-w-[1400px] mx-auto font-staff">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Room Inventory</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Physical Asset Management</p>
        </div>
      </div>
      <RoomsClient hotelId={hotel.id} initialRooms={rooms || []} roomTypes={roomTypes || []} />
    </div>
  );
}
