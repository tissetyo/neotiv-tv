'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HotelsClient({ initialHotels }: { initialHotels: any[] }) {
  const [hotels, setHotels] = useState(initialHotels);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [location, setLocation] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreate = async () => {
    if (!name || !slug) return;
    setLoading(true);
    const res = await fetch('/api/admin/hotels', {
      method: 'POST',
      body: JSON.stringify({ name, slug, location, timezone }),
      headers: { 'Content-Type': 'application/json' }
    });
    const d = await res.json();
    setLoading(false);
    
    if (d.error) {
       alert('Error: ' + d.error);
       return;
    }
    
    alert('Hotel created successfully!');
    setShowAdd(false);
    setName(''); setSlug(''); setLocation('');
    router.refresh();
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Platform Hotels</h2>
        <button onClick={() => setShowAdd(true)} style={buttonStyle}>+ Create Hotel</button>
      </div>

      {showAdd && (
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Provision New Hotel</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
               <label style={labelStyle}>Hotel Name</label>
               <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Amartha Resort" style={inputStyle} />
            </div>
            <div>
               <label style={labelStyle}>URL Slug</label>
               <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. amartha-resort" style={inputStyle} />
               <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>neotiv.com/<b>{slug || 'hotel-slug'}</b>/dashboard</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
               <label style={labelStyle}>Location</label>
               <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" style={inputStyle} />
            </div>
            <div>
               <label style={labelStyle}>Timezone</label>
               <select value={timezone} onChange={e => setTimezone(e.target.value)} style={inputStyle}>
                 <option value="UTC">UTC</option>
                 <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                 <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                 <option value="Europe/London">Europe/London (GMT)</option>
                 <option value="America/New_York">America/New_York (EST)</option>
               </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={handleCreate} style={buttonStyle} disabled={loading}>{loading ? 'Provisioning...' : 'Create & Seed System'}</button>
            <button onClick={() => setShowAdd(false)} style={outlineButtonStyle} disabled={loading}>Cancel</button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Hotel Name</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Slug</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Rooms / Staff</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map(h => (
            <tr key={h.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '16px 20px', fontWeight: 600, color: '#0f172a' }}>{h.name}</td>
              <td style={{ padding: '16px 20px', color: '#64748b', fontFamily: 'monospace' }}>/{h.slug}</td>
              <td style={{ padding: '16px 20px', color: '#64748b' }}>{h.room_count} / {h.staff_count}</td>
              <td style={{ padding: '16px 20px' }}>
                <span style={{ background: h.is_active ? '#ccfbf1' : '#f1f5f9', color: h.is_active ? '#0f766e' : '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                  {h.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={{ padding: '16px 20px' }}>
                <Link href={`/admin/hotels/${h.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>Manage</Link>
              </td>
            </tr>
          ))}
          {hotels.length === 0 && <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No hotels provisioned.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' as const };
const buttonStyle = { background: '#0f172a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' };
const outlineButtonStyle = { background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' };
