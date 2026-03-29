import { createClient } from '@/lib/supabase/server';
import ServicesClient from './services-client';

export default async function ServicesSettingsPage({ params }: { params: Promise<{ hotelSlug: string }> }) {
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
    <div className="p-12 max-w-[1400px] mx-auto font-staff">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Service Catalog</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guest Experience Configuration</p>
        </div>
      </div>
      <ServicesClient hotelId={hotel.id} initialServices={services || []} />
    </div>
  );
}
