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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-6">
      {/* Filters Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
         <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-xs">
              <select 
                value={roleFilter} 
                onChange={e => setRoleFilter(e.target.value)} 
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all appearance-none"
              >
                <option value="">All Roles</option>
                <option value="manager">🏨 Manager</option>
                <option value="frontoffice">🛎️ Front Office</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</div>
            </div>
            
            <div className="relative flex-1 max-w-xs">
              <select 
                value={hotelFilter} 
                onChange={e => setHotelFilter(e.target.value)} 
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all appearance-none"
              >
                <option value="">All Properties</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</div>
            </div>
         </div>
         <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
            {filtered.length} Users Found
         </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-white border-b border-slate-100 text-[10px] uppercase tracking-[0.15em] text-slate-400 font-black">
          <tr>
            <th className="px-6 py-4">Identity / Access</th>
            <th className="px-6 py-4">Assignment</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Administrative Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {filtered.map(s => (
            <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                    {s.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 leading-none">{s.name}</div>
                    <div className="text-slate-500 text-xs mt-1.5 font-medium">{s.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                 <div className="flex flex-col gap-2">
                    <select 
                      value={s.hotel_id} 
                      onChange={e => changeRoleHotel(s.id, s.role, e.target.value)} 
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 outline-none focus:border-rose-500"
                    >
                      {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                    <select 
                      value={s.role} 
                      onChange={e => changeRoleHotel(s.id, e.target.value, s.hotel_id)} 
                      className={`border px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none ${
                        s.role === 'manager' 
                          ? 'bg-amber-50 text-amber-600 border-amber-200' 
                          : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                      }`}
                    >
                      <option value="frontoffice">Front Office</option>
                      <option value="manager">Manager</option>
                    </select>
                 </div>
              </td>
              <td className="px-6 py-5">
                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  s.is_active 
                    ? 'bg-teal-50 text-teal-600 ring-1 ring-teal-600/20' 
                    : 'bg-rose-50 text-rose-600 ring-1 ring-rose-600/20'
                }`}>
                  {s.is_active ? 'Authorized' : 'Suspended'}
                </span>
              </td>
              <td className="px-6 py-5 text-right flex justify-end gap-2 mt-2">
                <button 
                  onClick={() => toggleAccess(s.id, s.is_active)} 
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    s.is_active 
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                      : 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white'
                  }`}
                >
                  {s.is_active ? 'Suspend' : 'Reinstate'}
                </button>
                <button 
                  onClick={() => resetPassword(s.email)} 
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-bold text-xs active:scale-95"
                >
                  Reset Auth
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🔍</div>
                <p className="font-medium text-slate-900 text-lg">No matching users</p>
                <p className="text-sm mt-1">Adjust your property or role filters</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
