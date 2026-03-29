import { createClient } from '@/lib/supabase/server';
import AnnouncementsClient from './announcements-client';

export default async function AdminAnnouncementsPage(): Promise<JSX.Element> {
  const supabase = await createClient();
  
  const { data: hotels } = await supabase
    .from('hotels')
    .select('id, name')
    .order('name', { ascending: true });

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, hotels(name)')
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
           <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Global Announcements</h1>
           <p style={{ color: '#64748b' }}>Broadcast marquee messages across TV dashboards</p>
        </div>
      </div>
      <AnnouncementsClient initialAnnouncements={announcements || []} hotels={hotels || []} />
    </div>
  );
}
