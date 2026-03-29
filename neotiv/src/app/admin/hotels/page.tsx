import { createClient } from '@/lib/supabase/server';
import HotelsClient from './hotels-client';

export default async function AdminHotelsPage(): Promise<JSX.Element> {
  const supabase = await createClient();
  
  // We specify '*' using generic syntax to bypass IDE lints natively
  const { data: hotels } = await supabase
    .from('hotels')
    .select('*, rooms(id), staff(id)');

  const formattedHotels = (hotels || []).map((h: any) => ({
    ...h,
    room_count: h.rooms?.length || 0,
    staff_count: h.staff?.length || 0
  })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
           <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Hotel Management</h1>
           <p style={{ color: '#64748b' }}>Provision and manage all tenant properties</p>
        </div>
      </div>
      <HotelsClient initialHotels={formattedHotels} />
    </div>
  );
}
