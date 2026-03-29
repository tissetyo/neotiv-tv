'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RoomTypesClient({ hotelId, initialRoomTypes }: { hotelId: string, initialRoomTypes: any[] }) {
  const [roomTypes, setRoomTypes] = useState(initialRoomTypes);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  const supabase = createClient();

  const handleAdd = async () => {
    if (!newName) return;
    const { data } = await supabase.from('room_types').insert({
      hotel_id: hotelId,
      name: newName,
      description: newDesc
    }).select().single();
    
    if (data) {
      setRoomTypes([{ ...data, room_count: 0 }, ...roomTypes]);
      setShowAdd(false);
      setNewName('');
      setNewDesc('');
    }
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      alert(`Cannot delete. Reassign ${count} rooms first.`);
      return;
    }
    if (confirm('Delete this room type?')) {
      await supabase.from('room_types').delete().eq('id', id);
      setRoomTypes(roomTypes.filter(rt => rt.id !== id));
    }
  };

  const startEdit = (rt: any) => {
    setEditingId(rt.id);
    setEditName(rt.name);
    setEditDesc(rt.description || '');
  };

  const saveEdit = async () => {
    await supabase.from('room_types').update({ name: editName, description: editDesc }).eq('id', editingId);
    setRoomTypes(roomTypes.map(rt => rt.id === editingId ? { ...rt, name: editName, description: editDesc } : rt));
    setEditingId(null);
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Manage Room Categories</h2>
        <button onClick={() => setShowAdd(true)} style={buttonStyle}>+ Add Room Type</button>
      </div>
      
      {showAdd && (
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', gap: '12px' }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name (e.g. Deluxe)" style={{...inputStyle, flex: 1}} />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description" style={{...inputStyle, flex: 2}} />
          <button onClick={handleAdd} style={buttonStyle}>Save</button>
          <button onClick={() => setShowAdd(false)} style={outlineButtonStyle}>Cancel</button>
        </div>
      )}

      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Name</th>
              <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Description</th>
              <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Rooms</th>
              <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.map((rt) => (
              <tr key={rt.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px 20px' }}>
                  {editingId === rt.id ? (
                    <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                  ) : (
                    <span style={{ fontWeight: 500 }}>{rt.name}</span>
                  )}
                </td>
                <td style={{ padding: '16px 20px', color: '#64748b' }}>
                  {editingId === rt.id ? (
                    <input value={editDesc} onChange={e => setEditDesc(e.target.value)} style={inputStyle} />
                  ) : (
                    rt.description || '—'
                  )}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                    {rt.room_count}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {editingId === rt.id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={saveEdit} style={{...buttonStyle, padding: '6px 12px'}}>Save</button>
                      <button onClick={() => setEditingId(null)} style={outlineButtonStyle}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => startEdit(rt)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Edit</button>
                      <button onClick={() => handleDelete(rt.id, rt.room_count)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: rt.room_count > 0 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 500, opacity: rt.room_count > 0 ? 0.5 : 1 }}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {roomTypes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No room types found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' };
const buttonStyle = { background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' };
const outlineButtonStyle = { background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' };
