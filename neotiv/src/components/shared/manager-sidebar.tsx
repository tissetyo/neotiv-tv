'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ManagerSidebarProps {
  hotelSlug: string;
  hotelName: string;
  role: string;
}

export default function ManagerSidebar({
  hotelSlug,
  hotelName,
  role,
}: ManagerSidebarProps) {
  const pathname = usePathname();
  const isManager = role === 'manager' || role === 'superadmin';

  const navItems = [
    { icon: '🏠', label: 'Rooms', href: `/${hotelSlug}/frontoffice/rooms` },
    { icon: '🔔', label: 'Alerts', href: `/${hotelSlug}/frontoffice/notifications` },
    { icon: '💬', label: 'Guest Chat', href: `/${hotelSlug}/frontoffice/chat` },
    { icon: '⏰', label: 'Alarms', href: `/${hotelSlug}/frontoffice/alarms` },
    { icon: '🛎️', label: 'Requests', href: `/${hotelSlug}/frontoffice/service-requests` },
    { icon: '🎟️', label: 'Promos', href: `/${hotelSlug}/frontoffice/promos` },
  ];

  const managerItems = [
    { icon: '📊', label: 'Analytics', href: `/${hotelSlug}/analytics` },
    { icon: '🔧', label: 'Services', href: `/${hotelSlug}/settings/services` },
    { icon: '👥', label: 'Staffing', href: `/${hotelSlug}/settings/staff` },
    { icon: '📋', label: 'Assets', href: `/${hotelSlug}/settings/rooms` },
    { icon: '⚙️', label: 'Configuration', href: `/${hotelSlug}/settings` },
  ];

  return (
    <aside className="w-[260px] bg-slate-950 flex flex-col fixed top-0 left-0 h-full z-50 border-r border-white/5 font-staff">
      {/* Brand Section */}
      <div className="p-8 pb-10 flex items-center gap-4">
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20">
          N
        </div>
        <div className="min-w-0">
          <h1 className="text-white font-bold tracking-tight leading-none text-sm truncate uppercase">{hotelName}</h1>
          <p className="text-teal-500/80 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">{role}</p>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} isActive={pathname === item.href} />
        ))}

        {isManager && (
          <div className="pt-6">
            <div className="px-4 mb-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Property Management</p>
            </div>
            <div className="space-y-1">
              {managerItems.map((item) => (
                <NavLink key={item.href} {...item} isActive={pathname === item.href} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 mt-auto border-t border-white/5 bg-black/20">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all font-bold text-sm group"
          >
            <span className="group-hover:scale-110 transition-transform">🚪</span>
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  icon,
  label,
  isActive
}: {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
        isActive 
          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className="font-semibold text-[13px] tracking-wide">{label}</span>
      {isActive && (
        <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
      )}
    </Link>
  );
}
