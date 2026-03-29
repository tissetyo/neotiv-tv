'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { icon: '🏨', label: 'Hotels', href: '/admin/hotels' },
    { icon: '👤', label: 'Accounts', href: '/admin/accounts' },
    { icon: '📢', label: 'Announcements', href: '/admin/announcements' },
    { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
    { icon: '📊', label: 'Monitor', href: '/admin/monitor' },
  ];

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
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
          padding: '0 8px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#f43f5e',
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
        <div>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
            Neotiv Admin
          </p>
          <p style={{ color: '#64748b', fontSize: '11px' }}>Super Admin</p>
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href) || (pathname === '/admin' && link.href === '/admin/hotels');
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: isActive ? 'white' : '#94a3b8',
                background: isActive ? '#f43f5e' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <form action="/api/auth/signout" method="POST">
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
            whiteSpace: 'nowrap'
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </form>
    </aside>
  );
}
