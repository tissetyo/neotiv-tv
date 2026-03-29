'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RoomsClient({ hotelId, initialRooms, roomTypes }: { hotelId: string, initialRooms: any[], roomTypes: any[] }) {
  const [rooms, setRooms] = useState(initialRooms);
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('');
  const [newPin, setNewPin] = useState('');
  const supabase = createClient();
  
  const [selectedRooms, setSelectedRooms] = useState<Record<string, boolean>>({});

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleAdd = async () => {
    if (!newCode) return;
    const { data } = await supabase.from('rooms').insert({
      hotel_id: hotelId,
      room_code: newCode,
      room_type_id: newType || null,
      pin: newPin || null
    }).select('*, room_types(name)').single();
    if (data) {
      setRooms([...rooms, data].sort((a,b) => a.room_code.localeCompare(b.room_code)));
      setShowAdd(false);
      setNewCode(''); setNewType(''); setNewPin('');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Permanently delete Room ${code} and all its data?`)) {
      await supabase.from('rooms').delete().eq('id', id);
      setRooms(rooms.filter(r => r.id !== id));
      const newSelected = {...selectedRooms};
      delete newSelected[id];
      setSelectedRooms(newSelected);
    }
  };

  const handleBulkReset = async () => {
    const ids = Object.keys(selectedRooms).filter(k => selectedRooms[k]);
    if (ids.length === 0) return;
    if (confirm(`Reset guest info and set checkout for ${ids.length} rooms?`)) {
      await supabase.from('rooms').update({
        is_occupied: false,
        guest_name: null,
        guest_photo_url: null,
        custom_welcome_message: null,
        checkin_date: null,
        checkout_date: null
      }).in('id', ids);
      setRooms(rooms.map(r => ids.includes(r.id) ? { 
        ...r, is_occupied: false, guest_name: null, guest_photo_url: null, custom_welcome_message: null, checkin_date: null, checkout_date: null 
      } : r));
      setSelectedRooms({});
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedRooms({...selectedRooms, [id]: !selectedRooms[id]});
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowAdd(true)} style={buttonStyle}>+ Add Room</button>
          <button onClick={handleBulkReset} style={outlineButtonStyle} disabled={Object.values(selectedRooms).filter(Boolean).length === 0}>
            Bulk Reset Info
          </button>
        </div>
      </div>

      {showAdd && (
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="Code (e.g. 101)" style={inputStyle} />
          <select value={newType} onChange={e => setNewType(e.target.value)} style={inputStyle}>
            <option value="">No Type</option>
            {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="PIN" style={{...inputStyle, width: '80px'}} />
            <button onClick={() => setNewPin(generatePin())} style={outlineButtonStyle}>Generate</button>
          </div>
          <button onClick={handleAdd} style={buttonStyle}>Save</button>
          <button onClick={() => setShowAdd(false)} style={outlineButtonStyle}>Cancel</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', width: '40px' }}>
              <input type="checkbox" onChange={(e) => {
                const checked = e.target.checked;
                const newSelection: Record<string, boolean> = {};
                rooms.forEach(r => newSelection[r.id] = checked);
                setSelectedRooms(newSelection);
              }} checked={rooms.length > 0 && Object.values(selectedRooms).filter(Boolean).length === rooms.length} />
            </th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Code</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Type</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Guest</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>PIN</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '16px 20px' }}>
                <input type="checkbox" checked={!!selectedRooms[r.id]} onChange={() => toggleSelect(r.id)} />
              </td>
              <td style={{ padding: '16px 20px', fontWeight: 600 }}>{r.room_code}</td>
              <td style={{ padding: '16px 20px', color: '#64748b' }}>{r.room_types?.name || '—'}</td>
              <td style={{ padding: '16px 20px' }}>
                <span style={{ background: r.is_occupied ? '#ccfbf1' : '#f1f5f9', color: r.is_occupied ? '#0f766e' : '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                  {r.is_occupied ? 'Occupied' : 'Vacant'}
                </span>
              </td>
              <td style={{ padding: '16px 20px', color: '#64748b' }}>{r.guest_name || '—'}</td>
              <td style={{ padding: '16px 20px', fontFamily: 'monospace', letterSpacing: '1px' }}>{r.pin || 'None'}</td>
              <td style={{ padding: '16px 20px' }}>
                <button onClick={() => handleDelete(r.id, r.room_code)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Delete</button>
              </td>
            </tr>
          ))}
          {rooms.length === 0 && <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No rooms added yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' };
const buttonStyle = { background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' };
const outlineButtonStyle = { background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' };
