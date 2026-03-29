import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ hotelSlug: string }>;
}

export default async function HotelManagementPage({ params }: Props): Promise<JSX.Element> {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${hotelSlug}/login`);

  const role = user.user_metadata?.role as string;
  if (role !== 'manager' && role !== 'superadmin') {
    redirect(`/${hotelSlug}/frontoffice`);
  }

  const hotelId = user.user_metadata?.hotel_id as string;

  const { data: hotel } = await supabase
    .from('hotels')
    .select('*')
    .eq('slug', hotelSlug)
    .single();

  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, is_occupied')
    .eq('hotel_id', hotelId);

  const { data: staffList } = await supabase
    .from('staff')
    .select('id, is_active')
    .eq('hotel_id', hotelId);

  const totalRooms = rooms?.length ?? 0;
  const occupied = rooms?.filter((r) => r.is_occupied).length ?? 0;
  const totalStaff = staffList?.filter((s) => s.is_active).length ?? 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'IBM Plex Sans, sans-serif',
        background: '#f8fafc',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '240px',
          height: '100vh',
          background: '#0f172a',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>N</div>
          <div>
            <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{hotel?.name ?? hotelSlug}</p>
            <p style={{ color: '#64748b', fontSize: '11px' }}>Management</p>
          </div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            ['📊', 'Dashboard', `/${hotelSlug}`],
            ['🏠', 'Rooms (FO)', `/${hotelSlug}/frontoffice/rooms`],
            ['🔔', 'Notifications', `/${hotelSlug}/frontoffice/notifications`],
            ['💬', 'Chat', `/${hotelSlug}/frontoffice/chat`],
            ['⏰', 'Alarms', `/${hotelSlug}/frontoffice/alarms`],
            ['🛎', 'Requests', `/${hotelSlug}/frontoffice/service-requests`],
            ['🎟', 'Promos', `/${hotelSlug}/frontoffice/promos`],
            ['—', '', ''],
            ['⚙️', 'Hotel Settings', `/${hotelSlug}/settings`],
            ['🛏', 'Room Types', `/${hotelSlug}/settings/room-types`],
            ['📋', 'Manage Rooms', `/${hotelSlug}/settings/rooms`],
            ['👥', 'Staff', `/${hotelSlug}/settings/staff`],
            ['🔧', 'Services', `/${hotelSlug}/settings/services`],
          ].map(([icon, label, href], i) =>
            label === '' ? (
              <div key={i} style={{ borderTop: '1px solid #1e293b', margin: '8px 0' }} />
            ) : (
              <a key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '8px', color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>
                <span style={{ width: '20px', textAlign: 'center' }}>{icon}</span>
                <span>{label}</span>
              </a>
            )
          )}
        </nav>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            <span>🚪</span><span>Logout</span>
          </button>
        </form>
      </div>

      {/* Main */}
      <main style={{ marginLeft: '240px', padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            {hotel?.name ?? hotelSlug}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>{hotel?.location ?? 'Hotel Management Dashboard'}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { icon: '🏨', label: 'Total Rooms', value: totalRooms, color: '#0f172a' },
            { icon: '✅', label: 'Occupied', value: occupied, color: '#0f766e' },
            { icon: '🔓', label: 'Vacant', value: totalRooms - occupied, color: '#64748b' },
            { icon: '👥', label: 'Active Staff', value: totalStaff, color: '#1d4ed8' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { title: 'Hotel Settings', desc: 'Configure WiFi, clocks, background, airport code', href: `/${hotelSlug}/settings`, icon: '⚙️', color: '#14b8a6' },
            { title: 'Manage Rooms', desc: 'Add, edit and configure rooms and their PINs', href: `/${hotelSlug}/settings/rooms`, icon: '🛏', color: '#3b82f6' },
            { title: 'Staff Management', desc: 'Invite front office staff and manage roles', href: `/${hotelSlug}/settings/staff`, icon: '👥', color: '#8b5cf6' },
            { title: 'Front Office', desc: 'Room operations, notifications and chat', href: `/${hotelSlug}/frontoffice/rooms`, icon: '🏠', color: '#f59e0b' },
            { title: 'Services Config', desc: 'Enable or disable hotel services for guests', href: `/${hotelSlug}/settings/services`, icon: '🔧', color: '#ef4444' },
            { title: 'Room Types', desc: 'Define room categories like Deluxe, Suite etc', href: `/${hotelSlug}/settings/room-types`, icon: '🏷️', color: '#10b981' },
          ].map((action) => (
            <a key={action.href} href={action.href} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'block', transition: 'all 0.15s' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${action.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' }}>
                {action.icon}
              </div>
              <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{action.title}</p>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.4 }}>{action.desc}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
