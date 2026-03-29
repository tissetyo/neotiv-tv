import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ManagerSidebar from '@/components/shared/manager-sidebar';

interface AnalyticsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ hotelSlug: string }>;
}

export default async function AnalyticsLayout({
  children,
  params,
}: AnalyticsLayoutProps) {
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

  const { data: hotel } = await supabase
    .from('hotels')
    .select('name')
    .eq('slug', hotelSlug)
    .single();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <ManagerSidebar 
        hotelSlug={hotelSlug} 
        hotelName={hotel?.name ?? hotelSlug} 
        role={role} 
      />

      <main className="flex-1 ml-[260px] min-h-screen relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-16 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">{user.user_metadata?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">{user.email}</p>
            </div>
          </div>
        </header>

        <div className="p-0">{children}</div>
      </main>
    </div>
  );
}
