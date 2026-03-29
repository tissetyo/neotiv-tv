'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsTabs({ hotel, initialAnnouncements }: { hotel: any; initialAnnouncements: any[] }) {
  const [activeTab, setActiveTab] = useState('General');
  const [formData, setFormData] = useState(hotel);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('hotels').update(formData).eq('id', hotel.id);
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const addAnnouncement = async () => {
    if (!newAnnouncement) return;
    const { data } = await supabase.from('announcements').insert({ hotel_id: hotel.id, text: newAnnouncement }).select().single();
    if (data) {
      setAnnouncements([...announcements, data]);
      setNewAnnouncement('');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const toggleAnnouncement = async (id: string, currentStatus: boolean) => {
    await supabase.from('announcements').update({ is_active: !currentStatus }).eq('id', id);
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
  };

  const tabs = ['General', 'Appearance', 'WiFi', 'Clocks', 'Announcements'];

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: activeTab === tab ? 'white' : 'transparent',
              borderBottom: activeTab === tab ? '2px solid #14b8a6' : '2px solid transparent',
              color: activeTab === tab ? '#0f172a' : '#64748b',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '32px' }}>
        {activeTab === 'General' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Hotel Name</label>
              <input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Location / City</label>
              <input value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Timezone</label>
              <input value={formData.timezone || ''} onChange={e => setFormData({...formData, timezone: e.target.value})} placeholder="e.g. Asia/Jakarta" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Airport IATA Code</label>
              <input value={formData.airport_iata_code || ''} onChange={e => setFormData({...formData, airport_iata_code: e.target.value})} placeholder="e.g. DPS" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Latitude</label>
                <input value={formData.latitude || ''} onChange={e => setFormData({...formData, latitude: e.target.value})} placeholder="e.g. -8.7481" style={inputStyle} type="number" step="0.00000001" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Longitude</label>
                <input value={formData.longitude || ''} onChange={e => setFormData({...formData, longitude: e.target.value})} placeholder="e.g. 115.1670" style={inputStyle} type="number" step="0.00000001" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Logo URL (Supabase Storage URL)</label>
              <input value={formData.logo_url || ''} onChange={e => setFormData({...formData, logo_url: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Default Background URL</label>
              <input value={formData.default_background_url || ''} onChange={e => setFormData({...formData, default_background_url: e.target.value})} style={inputStyle} />
            </div>
          </div>
        )}

        {activeTab === 'WiFi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>SSID</label>
              <input value={formData.wifi_ssid || ''} onChange={e => setFormData({...formData, wifi_ssid: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Username (optional)</label>
              <input value={formData.wifi_username || ''} onChange={e => setFormData({...formData, wifi_username: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Password</label>
              <input type="password" value={formData.wifi_password || ''} onChange={e => setFormData({...formData, wifi_password: e.target.value})} style={inputStyle} />
            </div>
          </div>
        )}

        {activeTab === 'Clocks' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Clock 1 Label</label>
               <input value={formData.clock_label_1 || ''} onChange={e => setFormData({...formData, clock_label_1: e.target.value})} style={inputStyle} />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Clock 1 Timezone</label>
               <input value={formData.clock_timezone_1 || ''} onChange={e => setFormData({...formData, clock_timezone_1: e.target.value})} style={inputStyle} />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Clock 2 Label</label>
               <input value={formData.clock_label_2 || ''} onChange={e => setFormData({...formData, clock_label_2: e.target.value})} style={inputStyle} />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Clock 2 Timezone</label>
               <input value={formData.clock_timezone_2 || ''} onChange={e => setFormData({...formData, clock_timezone_2: e.target.value})} style={inputStyle} />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Clock 3 Label</label>
               <input value={formData.clock_label_3 || ''} onChange={e => setFormData({...formData, clock_label_3: e.target.value})} style={inputStyle} />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Clock 3 Timezone</label>
               <input value={formData.clock_timezone_3 || ''} onChange={e => setFormData({...formData, clock_timezone_3: e.target.value})} style={inputStyle} />
             </div>
          </div>
        )}

        {activeTab === 'Announcements' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input value={newAnnouncement} onChange={e => setNewAnnouncement(e.target.value)} placeholder="New announcement text..." style={{...inputStyle, flex: 1}} />
              <button onClick={addAnnouncement} style={buttonStyle}>Add</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <span style={{ color: a.is_active ? '#0f172a' : '#94a3b8' }}>{a.text}</span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => toggleAnnouncement(a.id, a.is_active)} style={outlineButtonStyle}>{a.is_active ? 'Disable' : 'Enable'}</button>
                    <button onClick={() => deleteAnnouncement(a.id)} style={{...outlineButtonStyle, color: '#ef4444', borderColor: '#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && <p style={{ color: '#94a3b8', fontSize: '14px' }}>No active announcements</p>}
            </div>
          </div>
        )}

        {activeTab !== 'Announcements' && (
          <div style={{ marginTop: '32px' }}>
            <button onClick={handleSave} disabled={saving} style={{...buttonStyle, width: '100%', padding: '12px'}}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none',
};

const buttonStyle = {
  background: '#0f172a',
  color: 'white',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
};

const outlineButtonStyle = {
  background: 'transparent',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  cursor: 'pointer',
};
