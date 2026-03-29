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
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
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
      body: JSON.stringify({ name, slug, location, timezone, adminEmail, adminPassword }),
      headers: { 'Content-Type': 'application/json' }
    });
    const d = await res.json();
    setLoading(false);
    
    if (d.error) {
       alert('Error: ' + d.error);
       return;
    }
    
    alert('Hotel provisioned successfully!');
    setShowAdd(false);
    setName(''); setSlug(''); setLocation(''); setAdminEmail(''); setAdminPassword('');
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Platform Hotels</h2>
          <p className="text-slate-500 text-sm mt-1">Provision and manage all tenant properties</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-teal-600/20 active:scale-95 flex items-center gap-2"
        >
          {showAdd ? 'Close Panel' : '+ Provision Hotel'}
        </button>
      </div>

      {/* Provision Form */}
      <div className={`transition-all duration-300 overflow-hidden ${showAdd ? 'max-h-[800px] border-b border-slate-200' : 'max-h-0 border-transparent'}`}>
        <div className="p-8 bg-slate-50/50">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Hotel Name</label>
                <input 
                  value={name} onChange={e => handleNameChange(e.target.value)} 
                  placeholder="e.g. Amartha Resort" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Public URL Slug</label>
                <input 
                  value={slug} onChange={e => setSlug(e.target.value)} 
                  placeholder="e.g. amartha-resort" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">neotiv.com/<span className="font-semibold text-teal-600">{slug || 'hotel-slug'}</span>/dashboard</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Location</label>
                <input 
                  value={location} onChange={e => setLocation(e.target.value)} 
                  placeholder="City, Country" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Timezone</label>
                <select 
                  value={timezone} onChange={e => setTimezone(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                >
                  <option value="UTC">UTC</option>
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>

            {/* Optional initial admin */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                Manager Credentials
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Optional</span>
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Initial Admin Email</label>
                  <input 
                    type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} 
                    placeholder="manager@resort.com" 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Initial Password</label>
                  <input 
                    type="text" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} 
                    placeholder="Secure password" 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">Provides immediate Front-Office access.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleCreate} disabled={loading}
                className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md active:scale-95 flex-1 max-w-[200px] flex justify-center items-center"
              >
                {loading ? 'Provisioning...' : 'Provision Hotel'}
              </button>
              <button 
                onClick={() => setShowAdd(false)} disabled={loading}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-medium transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left border-collapse">
        <thead className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
          <tr>
            <th className="px-6 py-4">Property</th>
            <th className="px-6 py-4">Operations</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {hotels.map(h => (
            <tr key={h.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-semibold text-slate-900">{h.name}</div>
                <div className="text-slate-500 text-sm mt-0.5 font-mono">/{h.slug}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span title="Active Rooms">🚪 {h.room_count}</span>
                  <span title="Staff Members">🧑‍💼 {h.staff_count}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${h.is_active ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-400/20'}`}>
                  {h.is_active ? 'Active' : 'Suspended'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Link 
                  href={`/admin/hotels/${h.id}`} 
                  className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors py-2 px-4 rounded-lg hover:bg-teal-50 opacity-80 group-hover:opacity-100"
                >
                  Manage Instance &rarr;
                </Link>
              </td>
            </tr>
          ))}
          {hotels.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🏨</div>
                <p>No properties provisioned on this platform.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
