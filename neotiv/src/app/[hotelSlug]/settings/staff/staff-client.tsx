'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffClient({ hotelSlug, initialStaff }: { hotelSlug: string, initialStaff: any[] }) {
  const [staff, setStaff] = useState(initialStaff);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('frontoffice');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInvite = async () => {
    if (!email || !name) return;
    setLoading(true);
    const res = await fetch(`/api/hotel/${hotelSlug}/invite-staff`, {
      method: 'POST',
      body: JSON.stringify({ email, name, role }),
      headers: { 'Content-Type': 'application/json' }
    });
    const d = await res.json();
    setLoading(false);
    
    if (d.error) {
       alert('Error: ' + d.error);
       return;
    }
    
    alert('Invite sent to ' + email);
    setShowAdd(false);
    setEmail(''); setName(''); setRole('frontoffice');
    router.refresh(); // Refresh server state
  };

  const changeRole = async (id: string, newRole: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, role: newRole } : s));
    await fetch(`/api/hotel/${hotelSlug}/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'role', role: newRole }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const toggleAccess = async (id: string, currentActive: boolean) => {
    if (!confirm(currentActive ? 'Revoke access for this user?' : 'Restore access for this user?')) return;
    setStaff(staff.map(s => s.id === id ? { ...s, is_active: !currentActive } : s));
    await fetch(`/api/hotel/${hotelSlug}/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'revoke', is_active: !currentActive }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Staff Members</h2>
        <button onClick={() => setShowAdd(true)} style={buttonStyle}>+ Invite Staff</button>
      </div>

      {showAdd && (
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={inputStyle} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" style={inputStyle} />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inputStyle, width: '150px' }}>
            <option value="frontoffice">Front Office</option>
            <option value="manager">Manager</option>
          </select>
          <button onClick={handleInvite} style={buttonStyle} disabled={loading}>{loading ? 'Sending...' : 'Send Invite'}</button>
          <button onClick={() => setShowAdd(false)} style={outlineButtonStyle} disabled={loading}>Cancel</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Name / Email</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Role</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '16px 20px' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{s.email}</div>
              </td>
              <td style={{ padding: '16px 20px' }}>
                <select value={s.role} onChange={(e) => changeRole(s.id, e.target.value)} style={{ ...inputStyle, width: '150px', background: s.role === 'manager' ? '#eff6ff' : 'white' }}>
                  <option value="frontoffice">Front Office</option>
                  <option value="manager">Manager</option>
                  {s.role === 'superadmin' && <option value="superadmin">Superadmin</option>}
                </select>
              </td>
              <td style={{ padding: '16px 20px' }}>
                <span style={{ background: s.is_active ? '#ccfbf1' : '#fee2e2', color: s.is_active ? '#0f766e' : '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={{ padding: '16px 20px' }}>
                <button 
                  onClick={() => toggleAccess(s.id, s.is_active)} 
                  style={{ ...outlineButtonStyle, color: s.is_active ? '#ef4444' : '#10b981', borderColor: s.is_active ? '#ef4444' : '#10b981' }}
                >
                  {s.is_active ? 'Revoke Access' : 'Restore Access'}
                </button>
              </td>
            </tr>
          ))}
          {staff.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No staff found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' };
const buttonStyle = { background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' };
const outlineButtonStyle = { background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' };
