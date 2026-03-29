import { createClient } from '@/lib/supabase/server';
import SettingsClient from './settings-client';

export default async function AdminSettingsPage(): Promise<JSX.Element> {
  const supabase = await createClient();
  
  const { data: presets } = await supabase
    .from('service_icon_presets')
    .select('*')
    .order('sort_order', { ascending: true });

  const { data: platform } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('id', 1)
    .single();

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
           <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Platform Settings</h1>
           <p style={{ color: '#64748b' }}>Manage global configurations and presets</p>
        </div>
      </div>
      <SettingsClient initialPresets={presets || []} platformSettings={platform || {}} />
    </div>
  );
}
