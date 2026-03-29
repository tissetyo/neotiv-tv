import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from './admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'superadmin') {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-rose-100 selection:text-rose-900">
      <AdminSidebar />
      <main className="flex-1 ml-[260px] min-h-screen relative">
        {children}
      </main>
    </div>
  );
}
