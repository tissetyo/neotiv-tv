'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { icon: '🏨', label: 'Properties', href: '/admin/hotels' },
    { icon: '👥', label: 'User Accounts', href: '/admin/accounts' },
    { icon: '📢', label: 'Global Alerts', href: '/admin/announcements' },
    { icon: '📊', label: 'Live Monitor', href: '/admin/monitor' },
    { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <aside className="w-[260px] bg-slate-950 min-h-screen flex flex-col fixed top-0 left-0 h-full z-50 border-r border-white/5">
      {/* Brand Section */}
      <div className="p-8 pb-10 flex items-center gap-4">
        <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/20">
          N
        </div>
        <div>
          <h1 className="text-white font-bold tracking-tight leading-none text-lg">Neotiv</h1>
          <p className="text-rose-500/80 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Platform Hub</p>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 px-4 space-y-1.5">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href) || (pathname === '/admin' && link.href === '/admin/hotels');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {link.icon}
              </span>
              <span className="font-semibold text-sm tracking-wide">{link.label}</span>
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 mt-auto border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 mb-4">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Environment</p>
          <p className="text-white text-xs font-semibold mt-1">Production v1.0.4</p>
        </div>
        
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all font-bold text-sm"
          >
            <span>🚪</span>
            <span>Terminate Session</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
