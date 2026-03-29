import { createClient } from '@/lib/supabase/server';
import RoomsClient from './rooms-client';

export default async function RoomsSettingsPage({ params }: { params: Promise<{ hotelSlug: string }> }): Promise<JSX.Element> {
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
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Manage Rooms</h1>
      </div>
      <RoomsClient hotelId={hotel.id} initialRooms={rooms || []} roomTypes={roomTypes || []} />
    </div>
  );
}
