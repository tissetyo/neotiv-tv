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
    <div
      className="flex min-h-screen"
      style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
    >
      <ManagerSidebar 
        hotelSlug={hotelSlug} 
        hotelName={hotel?.name ?? hotelSlug} 
        role={role} 
      />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: '240px',
          background: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 32px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 5,
          }}
        >
          <div />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {user.user_metadata?.name ?? user.email}
            </span>
          </div>
        </div>

        <div>{children}</div>
      </main>
    </div>
  );
}
