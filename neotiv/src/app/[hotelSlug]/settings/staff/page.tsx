import { createClient } from '@/lib/supabase/server';
import StaffClient from './staff-client';

export default async function StaffSettingsPage({ params }: { params: Promise<{ hotelSlug: string }> }): Promise<JSX.Element> {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  
  const { data: hotel } = await supabase.from('hotels').select('id, name').eq('slug', hotelSlug).single();
  
  if (!hotel) return <div>Hotel not found</div>;

  const { data: staff } = await supabase
    .from('staff')
    .select('*')
    .eq('hotel_id', hotel.id)
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Manage Staff</h1>
      </div>
      <StaffClient hotelSlug={hotelSlug} initialStaff={staff || []} />
    </div>
  );
}
