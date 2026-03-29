import { createClient } from '@/lib/supabase/server';
import SettingsTabs from './settings-tabs';

interface PageProps {
  params: Promise<{ hotelSlug: string }>;
}

export default async function SettingsPage({ params }: PageProps) {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  const { data: hotel } = await supabase.from('hotels').select('*').eq('slug', hotelSlug).single();
  const { data: announcements } = await supabase.from('announcements').select('*').eq('hotel_id', hotel?.id);

  if (!hotel) return <div>Hotel not found</div>;

  return (
    <div className="p-12 max-w-[1200px] mx-auto font-staff">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Property Configuration</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global metadata & network settings</p>
      </div>
      <SettingsTabs hotel={hotel} initialAnnouncements={announcements ?? []} />
    </div>
  );
}
