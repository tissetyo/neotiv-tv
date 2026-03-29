import { createClient } from '@/lib/supabase/server';
import SettingsTabs from './settings-tabs';

interface PageProps {
  params: Promise<{ hotelSlug: string }>;
}

export default async function SettingsPage({ params }: PageProps): Promise<JSX.Element> {
  const { hotelSlug } = await params;
  const supabase = await createClient();
  const { data: hotel } = await supabase.from('hotels').select('*').eq('slug', hotelSlug).single();
  const { data: announcements } = await supabase.from('announcements').select('*').eq('hotel_id', hotel?.id);

  if (!hotel) return <div>Hotel not found</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: '#0f172a' }}>Hotel Settings</h1>
      <SettingsTabs hotel={hotel} initialAnnouncements={announcements ?? []} />
    </div>
  );
}
