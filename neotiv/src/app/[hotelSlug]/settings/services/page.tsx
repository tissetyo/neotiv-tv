import { createClient } from '@/lib/supabase/server';
import ServicesClient from './services-client';

export default async function ServicesSettingsPage({ params }: { params: Promise<{ hotelSlug: string }> }): Promise<JSX.Element> {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  
  const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', hotelSlug).single();
  
  if (!hotel) return <div>Hotel not found</div>;

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('hotel_id', hotel.id)
    .order('sort_order', { ascending: true });

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Service Configuration</h1>
      </div>
      <ServicesClient hotelId={hotel.id} initialServices={services || []} />
    </div>
  );
}
