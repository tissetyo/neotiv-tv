import { createClient } from '@/lib/supabase/server';
import HotelsClient from './hotels-client';

export default async function AdminHotelsPage() {
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
    <div className="p-12 max-w-[1400px] mx-auto font-staff">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Hospitality Ecosystem</h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Property Provisioning & Instance Management</p>
        </div>
      </div>
      <HotelsClient initialHotels={formattedHotels} />
    </div>
  );
}
