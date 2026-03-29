'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountsClient({ initialStaff, hotels }: { initialStaff: any[], hotels: any[] }) {
  const [staff, setStaff] = useState(initialStaff);
  const [roleFilter, setRoleFilter] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');
  const router = useRouter();

  const filtered = staff.filter(s => {
     if (roleFilter && s.role !== roleFilter) return false;
     if (hotelFilter && s.hotel_id !== hotelFilter) return false;
     return true;
  });

  const toggleAccess = async (id: string, currentActive: boolean) => {
    if (!confirm(currentActive ? 'Suspend this user across the entire platform?' : 'Restore user access?')) return;
    
    setStaff(staff.map(s => s.id === id ? { ...s, is_active: !currentActive } : s));
    
    await fetch(`/api/admin/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'suspend', is_active: !currentActive }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const changeRoleHotel = async (id: string, newRole: string, newHotelId: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, role: newRole, hotel_id: newHotelId, hotels: hotels.find(h => h.id === newHotelId) || s.hotels } : s));
    
    await fetch(`/api/admin/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'update', role: newRole, hotel_id: newHotelId }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const resetPassword = async (email: string) => {
     if (!confirm(`Generate and send a password reset link to ${email}?`)) return;
     const res = await fetch(`/api/admin/accounts/reset`, {
         method: 'POST',
         body: JSON.stringify({ email }),
         headers: { 'Content-Type': 'application/json' }
     });
     const d = await res.json();
     if (d.error) alert('Error: ' + d.error);
     else alert('Password reset link successfully sent via Supabase Auth.');
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
         <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={inputStyle}>
            <option value="">All Roles</option>
            <option value="manager">Manager</option>
            <option value="frontoffice">Front Office</option>
         </select>
         <select value={hotelFilter} onChange={e => setHotelFilter(e.target.value)} style={inputStyle}>
            <option value="">All Hotels</option>
            {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
         </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Name / Email</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Target Hotel</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Role</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '16px 20px' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{s.email}</div>
              </td>
              <td style={{ padding: '16px 20px' }}>
                 <select value={s.hotel_id} onChange={e => changeRoleHotel(s.id, s.role, e.target.value)} style={inputStyle}>
                    {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                 </select>
              </td>
              <td style={{ padding: '16px 20px' }}>
                 <select value={s.role} onChange={e => changeRoleHotel(s.id, e.target.value, s.hotel_id)} style={inputStyle}>
                    <option value="frontoffice">Front Office</option>
                    <option value="manager">Manager</option>
                 </select>
              </td>
              <td style={{ padding: '16px 20px' }}>
                <span style={{ background: s.is_active ? '#ccfbf1' : '#fee2e2', color: s.is_active ? '#0f766e' : '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                  {s.is_active ? 'Active' : 'Suspended'}
                </span>
              </td>
              <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                <button onClick={() => toggleAccess(s.id, s.is_active)} style={{...outlineButtonStyle, color: s.is_active ? '#ef4444' : '#10b981', borderColor: s.is_active ? '#ef4444' : '#10b981'}}>
                   {s.is_active ? 'Suspend' : 'Restore'}
                </button>
                <button onClick={() => resetPassword(s.email)} style={outlineButtonStyle}>Reset Password</button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No accounts found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: 'white' };
const outlineButtonStyle = { background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 };
