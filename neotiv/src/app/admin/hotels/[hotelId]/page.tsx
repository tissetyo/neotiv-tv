import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import HotelDetailClient from './hotel-detail-client';

export default async function AdminHotelDetailPage({ params }: { params: Promise<{ hotelId: string }> }): Promise<JSX.Element> {
  const { hotelId } = await params;
  const supabase = await createClient();
  
  const { data: hotel } = await supabase
    .from('hotels')
    .select('*, rooms(id), staff(id), services(id)')
    .eq('id', hotelId)
    .single();

  if (!hotel) return <div>Hotel not found</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
         <Link href="/admin/hotels" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>← Back to Hotels</Link>
      </div>
      
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
               <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{hotel.name}</h1>
               <p style={{ color: '#64748b', fontFamily: 'monospace', marginTop: '4px' }}>/{hotel.slug}</p>
            </div>
            <span style={{ background: hotel.is_active ? '#ccfbf1' : '#f1f5f9', color: hotel.is_active ? '#0f766e' : '#64748b', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
              {hotel.is_active ? 'Active' : 'Deactivated'}
            </span>
         </div>
         
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <div>
               <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Location</p>
               <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{hotel.location || 'N/A'}</p>
            </div>
            <div>
               <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Timezone</p>
               <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{hotel.timezone || 'UTC'}</p>
            </div>
            <div>
               <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Rooms Assigned</p>
               <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{hotel.rooms?.length || 0}</p>
            </div>
            <div>
               <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Configured Services</p>
               <p style={{ fontSize: '15px', color: '#0f172a', fontWeight: 500 }}>{hotel.services?.length || 0}</p>
            </div>
         </div>
         
         <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 32px 0' }} />
         
         <HotelDetailClient hotelId={hotel.id} isActive={hotel.is_active} staffCount={hotel.staff?.length || 0} roomsCount={hotel.rooms?.length || 0} />
      </div>
    </div>
  );
}
