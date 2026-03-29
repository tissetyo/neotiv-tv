'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsClient({ initialPresets, platformSettings }: { initialPresets: any[], platformSettings: any }) {
  const [presets, setPresets] = useState(initialPresets);
  const [maintenance, setMaintenance] = useState(platformSettings.maintenance_mode || false);
  const [mMessage, setMMessage] = useState(platformSettings.maintenance_message || 'We are currently under maintenance.');
  
  const [showAdd, setShowAdd] = useState(false);
  const [newEmoji, setNewEmoji] = useState('🛎️');
  const [newLabel, setNewLabel] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  const handleAddPreset = async () => {
    if (!newLabel) return;
    const nextOrder = presets.length > 0 ? Math.max(...presets.map(p => p.sort_order || 0)) + 1 : 0;
    const { data } = await supabase.from('service_icon_presets').insert({
      emoji: newEmoji,
      label: newLabel,
      sort_order: nextOrder,
      is_active: true
    }).select().single();
    
    if (data) {
       setPresets([...presets, data]);
       setShowAdd(false);
       setNewLabel(''); setNewEmoji('🛎️');
       router.refresh();
    }
  };

  const togglePreset = async (id: string, current: boolean) => {
    await supabase.from('service_icon_presets').update({ is_active: !current }).eq('id', id);
    setPresets(presets.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const deletePreset = async (id: string) => {
    if (!confirm('Delete this preset? (Existing hotel services using this visual will remain, but will not show in the dropdown anymore).')) return;
    await supabase.from('service_icon_presets').delete().eq('id', id);
    setPresets(presets.filter(p => p.id !== id));
  };

  const saveMaintenance = async () => {
    await supabase.from('platform_settings').update({
       maintenance_mode: maintenance,
       maintenance_message: mMessage
    }).eq('id', 1);
    alert('Platform maintenance settings saved and broadcasted.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Maintenance Mode */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
         <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#fff1f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#be123c' }}>Platform Maintenance Mode</h2>
               <p style={{ color: '#9f1239', fontSize: '13px', marginTop: '4px' }}>Enabling this will unconditionally render a full-screen maintenance overlay across all active hotel TV Dashboards globally.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <span style={{ fontWeight: 600, fontSize: '14px', color: maintenance ? '#e11d48' : '#64748b' }}>{maintenance ? 'ACTIVE' : 'OFF'}</span>
               <input type="checkbox" checked={maintenance} onChange={e => setMaintenance(e.target.checked)} style={{ width: '24px', height: '24px', accentColor: '#e11d48', cursor: 'pointer' }} />
            </div>
         </div>
         <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
               <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Maintenance Output Message</label>
               <input value={mMessage} onChange={e => setMMessage(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
            </div>
            <div>
               <button onClick={saveMaintenance} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Apply Maintenance Target Settings</button>
            </div>
         </div>
      </div>

      {/* Service Icon Presets */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
           <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Service Icon Dictionary</h2>
           <button onClick={() => setShowAdd(true)} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>+ Add Dictionary Item</button>
        </div>

        {showAdd && (
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} placeholder="Emoji (e.g. 🍷)" style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '20px', outline: 'none', width: '80px', textAlign: 'center' }} />
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Service Name (e.g. Room Service)" style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', flex: 1 }} />
            <button onClick={handleAddPreset} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Save Preset</button>
            <button onClick={() => setShowAdd(false)} style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', width: '80px', textAlign: 'center' }}>Emoji</th>
              <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Label</th>
              <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {presets.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 20px', fontSize: '24px', textAlign: 'center' }}>{p.emoji}</td>
                <td style={{ padding: '16px 20px', fontWeight: 500, color: '#0f172a' }}>{p.label}</td>
                <td style={{ padding: '16px 20px' }}>
                   <span style={{ background: p.is_active ? '#ccfbf1' : '#f1f5f9', color: p.is_active ? '#0f766e' : '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                     {p.is_active ? 'Active' : 'Disabled'}
                   </span>
                </td>
                <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                   <button onClick={() => togglePreset(p.id, p.is_active)} style={{ background: 'white', color: p.is_active ? '#64748b' : '#10b981', border: `1px solid ${p.is_active ? '#e2e8f0' : '#10b981'}`, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
                     {p.is_active ? 'Disable' : 'Enable'}
                   </button>
                   <button onClick={() => deletePreset(p.id)} style={{ background: 'white', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                </td>
              </tr>
            ))}
            {presets.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No dictionary items configured.</td></tr>}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
