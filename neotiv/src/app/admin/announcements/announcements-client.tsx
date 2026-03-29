'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AnnouncementsClient({ initialAnnouncements, hotels }: { initialAnnouncements: any[], hotels: any[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showAdd, setShowAdd] = useState(false);
  const [text, setText] = useState('');
  const [target, setTarget] = useState('all');
  const supabase = createClient();
  const router = useRouter();

  const handleAdd = async () => {
    if (!text) return;
    const { data, error } = await supabase.from('announcements').insert({
      text,
      hotel_id: target === 'all' ? null : target,
      is_active: true
    }).select('*, hotels(name)').single();
    
    if (error) {
       alert('Error broadcasting: ' + error.message);
       return;
    }
    
    if (data) {
       setAnnouncements([data, ...announcements]);
       setShowAdd(false);
       setText(''); setTarget('all');
       router.refresh();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('announcements').update({ is_active: !current }).eq('id', id);
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_active: !current } : a));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Perma-delete this broadcast?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
         <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Active Broadcasts</h2>
         <button onClick={() => setShowAdd(true)} style={buttonStyle}>+ Compose Broadcast</button>
      </div>

      {showAdd && (
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Message Text</label>
            <textarea 
               value={text} 
               onChange={e => setText(e.target.value)} 
               placeholder="Enter the marquee announcement..."
               style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', minHeight: '80px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Broadcast Target</label>
            <select value={target} onChange={e => setTarget(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white', minWidth: '300px' }}>
               <option value="all">🌐 All Hotels Globewide</option>
               {hotels.map(h => <option key={h.id} value={h.id}>🏨 {h.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAdd} style={buttonStyle}>Send Broadcast</button>
            <button onClick={() => setShowAdd(false)} style={outlineButtonStyle}>Cancel</button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Message</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Target</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map(a => (
            <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '16px 20px', color: '#0f172a' }}>{a.text}</td>
              <td style={{ padding: '16px 20px', color: '#64748b' }}>
                 {a.hotel_id ? `🏨 ${a.hotels?.name || 'Unknown'}` : '🌐 All Hotels'}
              </td>
              <td style={{ padding: '16px 20px' }}>
                 <span style={{ background: a.is_active ? '#ccfbf1' : '#f1f5f9', color: a.is_active ? '#0f766e' : '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                   {a.is_active ? 'Live' : 'Paused'}
                 </span>
              </td>
              <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                 <button onClick={() => toggleActive(a.id, a.is_active)} style={{...outlineButtonStyle, color: a.is_active ? '#64748b' : '#10b981', borderColor: a.is_active ? '#e2e8f0' : '#10b981'}}>
                   {a.is_active ? 'Pause' : 'Resume'}
                 </button>
                 <button onClick={() => handleDelete(a.id)} style={{...outlineButtonStyle, color: '#ef4444', borderColor: '#ef4444'}}>Delete</button>
              </td>
            </tr>
          ))}
          {announcements.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No active broadcasts.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const buttonStyle = { background: '#0f172a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' };
const outlineButtonStyle = { background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 };
