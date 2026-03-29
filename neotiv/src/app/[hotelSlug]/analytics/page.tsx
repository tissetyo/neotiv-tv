import { createClient } from '@/lib/supabase/server';

export default async function AnalyticsPage({ params }: { params: Promise<{ hotelSlug: string }> }) {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  
  const { data: hotel } = await supabase.from('hotels').select('id, name').eq('slug', hotelSlug).single();
  
  if (!hotel) return <div>Hotel not found</div>;

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

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Hotel Analytics</h1>
        <p style={{ color: '#64748b' }}>Overview for {hotel.name}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Occupancy</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a' }}>{occRate}%</div>
        </div>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Active Rooms</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#14b8a6' }}>{occupied} / {totalRooms}</div>
        </div>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Pending Requests</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#f59e0b' }}>{pendingReqs?.length || 0}</div>
        </div>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Unread Chats</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6' }}>{unreadChats?.length || 0}</div>
        </div>
      </div>
      
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Charts coming soon</h3>
        <p>Implementation of detailed activity charts requires sufficient historical test data. For now, the real-time metrics above provide the operational overview.</p>
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};
const cardHeaderStyle = {
  fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '12px'
};
