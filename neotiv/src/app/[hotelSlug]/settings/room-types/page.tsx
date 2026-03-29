import { createClient } from '@/lib/supabase/server';
import RoomTypesClient from './room-types-client';

export default async function RoomTypesPage({ params }: { params: Promise<{ hotelSlug: string }> }): Promise<JSX.Element> {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  
  const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', hotelSlug).single();
  
  if (!hotel) return <div>Hotel not found</div>;

  const { data: roomTypes } = await supabase
    .from('room_types')
    .select('id, name, description, created_at')
    .eq('hotel_id', hotel.id)
    .order('created_at', { ascending: false });

  // Get room count per type to check if we can delete
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, room_type_id')
    .eq('hotel_id', hotel.id);
    
  const typeCounts = (rooms || []).reduce((acc: Record<string, number>, room) => {
    if (room.room_type_id) {
      acc[room.room_type_id] = (acc[room.room_type_id] || 0) + 1;
    }
    return acc;
  }, {});

  const roomTypesWithCount = (roomTypes || []).map(rt => ({
    ...rt,
    room_count: typeCounts[rt.id] || 0
  }));

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Room Types</h1>
      </div>
      <RoomTypesClient hotelId={hotel.id} initialRoomTypes={roomTypesWithCount} />
    </div>
  );
}
