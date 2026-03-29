import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ManagerSidebar from '@/components/shared/manager-sidebar';

interface FrontOfficeLayoutProps {
  children: React.ReactNode;
  params: Promise<{ hotelSlug: string }>;
}

export default async function FrontOfficeLayout({
  children,
  params,
}: FrontOfficeLayoutProps) {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${hotelSlug}/login`);

  const role = user.user_metadata?.role as string;
  if (role !== 'frontoffice' && role !== 'manager' && role !== 'superadmin') {
    redirect(`/${hotelSlug}/login?error=unauthorized`);
  }

  const { data: hotel } = await supabase
    .from('hotels')
    .select('name')
    .eq('slug', hotelSlug)
    .single();

  return (
    <div className="flex min-h-screen bg-slate-50 font-staff">
      <ManagerSidebar 
        hotelSlug={hotelSlug} 
        hotelName={hotel?.name ?? hotelSlug} 
        role={role} 
      />

      <main className="flex-1 ml-[260px] min-h-screen relative">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-10 h-20 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 rounded-full border border-teal-500/20">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Live Operations</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">{user.user_metadata?.name || 'Authorized Staff'}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-widest opacity-60">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
               {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-0">{children}</div>
      </main>
    </div>
  );
}
