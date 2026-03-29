'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ServicesClient({ hotelId, initialServices }: { hotelId: string, initialServices: any[] }) {
  const [services, setServices] = useState(initialServices);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🍽️');
  const [newDesc, setNewDesc] = useState('');
  
  const supabase = createClient();

  const presets = ['🍽️', '🍴', '🚗', '🛵', '💆', '👕', '🧹', '🌊', '🏊', '📞', '🧴', '🥂'];

  const handleAdd = async () => {
    if (!newName) return;
    const nextOrder = services.length > 0 ? Math.max(...services.map(s => s.sort_order || 0)) + 1 : 0;
    const { data } = await supabase.from('services').insert({
      hotel_id: hotelId,
      name: newName,
      icon: newIcon,
      description: newDesc,
      sort_order: nextOrder,
      is_active: true
    }).select().single();
    
    if (data) {
      setServices([...services, data]);
      setShowAdd(false);
      setNewName(''); setNewIcon('🍽️'); setNewDesc('');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('services').update({ is_active: !current }).eq('id', id);
    setServices(services.map(s => s.id === id ? { ...s, is_active: !current } : s));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this service? This may affect pending requests.')) {
      await supabase.from('services').delete().eq('id', id);
      setServices(services.filter(s => s.id !== id));
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newServices = [...services];
    const temp = newServices[index].sort_order;
    newServices[index].sort_order = newServices[index - 1].sort_order;
    newServices[index - 1].sort_order = temp;
    
    // swap in array
    const tempObj = newServices[index];
    newServices[index] = newServices[index - 1];
    newServices[index - 1] = tempObj;
    
    setServices(newServices);
    
    await supabase.from('services').update({ sort_order: newServices[index].sort_order }).eq('id', newServices[index].id);
    await supabase.from('services').update({ sort_order: newServices[index - 1].sort_order }).eq('id', newServices[index - 1].id);
  };

  const moveDown = async (index: number) => {
    if (index === services.length - 1) return;
    const newServices = [...services];
    const temp = newServices[index].sort_order;
    newServices[index].sort_order = newServices[index + 1].sort_order;
    newServices[index + 1].sort_order = temp;
    
    // swap in array
    const tempObj = newServices[index];
    newServices[index] = newServices[index + 1];
    newServices[index + 1] = tempObj;
    
    setServices(newServices);
    
    await supabase.from('services').update({ sort_order: newServices[index].sort_order }).eq('id', newServices[index].id);
    await supabase.from('services').update({ sort_order: newServices[index + 1].sort_order }).eq('id', newServices[index + 1].id);
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Active Services (Reorder via arrows)</h2>
        <button onClick={() => setShowAdd(true)} style={buttonStyle}>+ Add Service</button>
      </div>

      {showAdd && (
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
             <select value={newIcon} onChange={e => setNewIcon(e.target.value)} style={{...inputStyle, width: '80px', fontSize: '20px'}}>
               {presets.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
             <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Service Name (e.g. Room Service)" style={{...inputStyle, flex: 1}} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (Optional)" style={{...inputStyle, flex: 1}} />
             <button onClick={handleAdd} style={buttonStyle}>Save</button>
             <button onClick={() => setShowAdd(false)} style={outlineButtonStyle}>Cancel</button>
          </div>
        </div>
      )}

      <div>
        {services.map((s, idx) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button 
                onClick={() => moveUp(idx)} 
                disabled={idx === 0}
                style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.2 : 1 }}
              >
                ▲
              </button>
              <button 
                onClick={() => moveDown(idx)} 
                disabled={idx === services.length - 1}
                style={{ background: 'none', border: 'none', cursor: idx === services.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === services.length - 1 ? 0.2 : 1 }}
              >
                ▼
              </button>
            </div>
            
            <div style={{ fontSize: '32px' }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>{s.description || 'No description'}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
               <button onClick={() => toggleActive(s.id, s.is_active)} style={{...outlineButtonStyle, borderColor: s.is_active ? '#e2e8f0' : '#10b981', color: s.is_active ? '#64748b' : '#10b981'}}>
                 {s.is_active ? 'Disable' : 'Enable'}
               </button>
               <button onClick={() => handleDelete(s.id)} style={{...outlineButtonStyle, color: '#ef4444', borderColor: '#ef4444'}}>Delete</button>
            </div>
          </div>
        ))}
        {services.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No services configured.</div>}
      </div>
    </div>
  );
}

const inputStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' };
const buttonStyle = { background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' };
const outlineButtonStyle = { background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' };
