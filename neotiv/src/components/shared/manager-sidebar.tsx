import { createClient } from '@/lib/supabase/server';

interface ManagerSidebarProps {
  hotelSlug: string;
  hotelName: string;
  role: string;
}

export default async function ManagerSidebar({
  hotelSlug,
  hotelName,
  role,
}: ManagerSidebarProps) {
  const isManager = role === 'manager' || role === 'superadmin';

  const navItems = [
    { icon: '🏠', label: 'Rooms', href: `/${hotelSlug}/frontoffice/rooms` },
    { icon: '🔔', label: 'Notifications', href: `/${hotelSlug}/frontoffice/notifications` },
    { icon: '💬', label: 'Chat', href: `/${hotelSlug}/frontoffice/chat` },
    { icon: '⏰', label: 'Alarms', href: `/${hotelSlug}/frontoffice/alarms` },
    { icon: '🛎', label: 'Requests', href: `/${hotelSlug}/frontoffice/service-requests` },
    { icon: '🎟', label: 'Promos', href: `/${hotelSlug}/frontoffice/promos` },
  ];

  const managerItems = [
    { icon: '⚙️', label: 'Settings', href: `/${hotelSlug}/settings` },
    { icon: '🛏', label: 'Room Types', href: `/${hotelSlug}/settings/room-types` },
    { icon: '📋', label: 'Manage Rooms', href: `/${hotelSlug}/settings/rooms` },
    { icon: '👥', label: 'Staff', href: `/${hotelSlug}/settings/staff` },
    { icon: '🔧', label: 'Services', href: `/${hotelSlug}/settings/services` },
    { icon: '📊', label: 'Analytics', href: `/${hotelSlug}/analytics` },
  ];

  // TODO: Fetch other managed hotels for the multi-hotel switcher.
  // For now, we simply display the current hotel.

  return (
    <aside
      style={{
        width: '240px',
        background: '#0f172a',
        minHeight: '100vh',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        zIndex: 10,
        overflowY: 'auto',
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '28px',
          padding: '0 8px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#14b8a6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          N
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {hotelName}
          </p>
          <p style={{ color: '#64748b', fontSize: '11px', textTransform: 'capitalize' }}>
            {role}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {isManager && (
          <>
            <div
              style={{
                borderTop: '1px solid #1e293b',
                margin: '12px 0 8px',
              }}
            />
            <p
              style={{
                color: '#475569',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '0 12px',
                marginBottom: '4px',
              }}
            >
              Manager
            </p>
            {managerItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <form action="/api/auth/signout" method="POST" style={{ marginTop: '12px' }}>
        <button
          type="submit"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            color: '#64748b',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            textAlign: 'left',
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </form>
    </aside>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '9px 12px',
        borderRadius: '8px',
        color: '#94a3b8',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
