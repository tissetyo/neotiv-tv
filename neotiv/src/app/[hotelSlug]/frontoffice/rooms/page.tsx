import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ hotelSlug: string }>;
}

export default async function RoomsPage({ params }: Props): Promise<JSX.Element> {
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

  return (
    <div style={{ padding: '32px', fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Rooms
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {occupied} occupied · {total - occupied} vacant · {total} total
          </p>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {[
          { label: 'Total Rooms', value: total, color: '#0f172a' },
          { label: 'Occupied', value: occupied, color: '#0f766e' },
          { label: 'Vacant', value: total - occupied, color: '#64748b' },
          {
            label: 'Occupancy',
            value: total > 0 ? `${Math.round((occupied / total) * 100)}%` : '0%',
            color: '#1d4ed8',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Room grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
        }}
      >
        {rooms?.map((room) => (
          <div
            key={room.id}
            style={{
              background: 'white',
              border: `1px solid ${room.is_occupied ? '#99f6e4' : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                {room.room_code}
              </span>
              <span
                style={{
                  background: room.is_occupied ? '#ccfbf1' : '#f1f5f9',
                  color: room.is_occupied ? '#0f766e' : '#64748b',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {room.is_occupied ? 'Occupied' : 'Vacant'}
              </span>
            </div>
            {room.guest_name && (
              <p style={{ color: '#64748b', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {room.guest_name}
              </p>
            )}
            {room.checkin_date && (
              <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                In: {new Date(room.checkin_date).toLocaleDateString()}
              </p>
            )}
            {!room.guest_name && !room.is_occupied && (
              <p style={{ color: '#cbd5e1', fontSize: '12px' }}>No guest</p>
            )}
          </div>
        ))}

        {(!rooms || rooms.length === 0) && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>🏨</p>
            <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>No rooms yet</p>
            <p style={{ fontSize: '14px' }}>
              Add rooms from Hotel Management → Settings → Rooms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
