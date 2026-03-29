'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HotelDetailClient({ hotelId, isActive, staffCount, roomsCount }: { hotelId: string, isActive: boolean, staffCount: number, roomsCount: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    if (!confirm(isActive ? `Suspend this hotel? This visually restricts access for ${staffCount} staff members.` : 'Reactivate hotel and restore staff access?')) return;
    
    setLoading(true);
    await fetch(`/api/admin/hotels/${hotelId}`, {
       method: 'PATCH',
       body: JSON.stringify({ is_active: !isActive }),
       headers: { 'Content-Type': 'application/json' }
    });
    setLoading(false);
    router.refresh();
  };

  const deleteHotel = () => {
     alert('Hard deletion is restricted in this environment. Soft-deactivate the hotel instead.');
  };

  return (
    <div>
       <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Danger Zone</h3>
       <div style={{ display: 'flex', gap: '16px' }}>
          <button 
             onClick={toggleStatus}
             disabled={loading}
             style={{ background: isActive ? '#fffbfa' : '#f0fdf4', color: isActive ? '#f43f5e' : '#16a34a', border: `1px solid ${isActive ? '#fecdd3' : '#bbf7d0'}`, padding: '10px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
          >
             {loading ? 'Processing...' : (isActive ? 'Deactivate Hotel' : 'Reactivate Hotel')}
          </button>
          <button 
             onClick={deleteHotel}
             style={{ background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
          >
             Delete Hotel
          </button>
       </div>
    </div>
  );
}
