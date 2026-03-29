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
    <div className="flex min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <AdminSidebar />
      <main style={{ flex: 1, marginLeft: '240px', background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>
        {children}
      </main>
    </div>
  );
}
