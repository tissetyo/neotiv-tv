'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden font-staff">
      {/* Platform Header */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Instance Manifest</h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{hotels.length} Active Environments</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="px-6 py-3 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          {showAdd ? 'Close Inspector' : '+ Provision Environment'}
        </button>
      </div>

      {/* Provisioning Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-10 bg-slate-50 border-b border-slate-100 overflow-hidden"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <FormLabel>Property Name</FormLabel>
                  <FormInput value={name} onChange={handleNameChange} placeholder="e.g. Paramount Hotel" />
                </div>
                <div>
                  <FormLabel>Namespace / Slug</FormLabel>
                  <FormInput value={slug} onChange={setSlug} placeholder="paramount-hotel" />
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-2 tracking-widest">neotiv.com/<span className="text-rose-500">{slug || '...'}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <FormLabel>Geographic Location</FormLabel>
                  <FormInput value={location} onChange={setLocation} placeholder="City, Country" />
                </div>
                <div>
                  <FormLabel>Temporal Context (Timezone)</FormLabel>
                  <select 
                    value={timezone} onChange={e => setTimezone(e.target.value)} 
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-staff"
                  >
                    <option value="UTC">Universal Coordinated Time (UTC)</option>
                    <option value="Asia/Jakarta">Jakarta (WIB)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Europe/London">London (GMT)</option>
                  </select>
                </div>
              </div>

              <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                   <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-slate-50 text-slate-400 rounded-md">Auth Node</span>
                </div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Initial Administrative Credentials</h4>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <FormLabel>Root Admin Email</FormLabel>
                    <FormInput type="email" value={adminEmail} onChange={setAdminEmail} placeholder="manager@property.com" />
                  </div>
                  <div>
                    <FormLabel>Secure Passkey</FormLabel>
                    <FormInput value={adminPassword} onChange={setAdminPassword} placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleCreate} disabled={loading}
                  className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {loading ? 'Initializing Instance...' : 'Deploy Environment ✓'}
                </button>
                <button 
                  onClick={() => setShowAdd(false)}
                  className="px-10 h-14 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <th className="px-10 py-6">Identity & Namespace</th>
              <th className="px-10 py-6">Operational Scale</th>
              <th className="px-10 py-6">Lifecycle Status</th>
              <th className="px-10 py-6 text-right">Instance Commands</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {hotels.map(h => (
              <tr key={h.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-8">
                  <div className="font-black text-slate-900 leading-none mb-1.5">{h.name}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-rose-500 transition-colors">/{h.slug}</div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Units</span>
                       <span className="text-sm font-black text-slate-900 leading-none mt-1">{h.room_count}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Personnel</span>
                       <span className="text-sm font-black text-slate-900 leading-none mt-1">{h.staff_count}</span>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${
                    h.is_active 
                      ? 'border-emerald-500/20 bg-emerald-50 text-emerald-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${h.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {h.is_active ? 'Production' : 'Suspended'}
                    </span>
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <Link 
                    href={`/admin/hotels/${h.id}`} 
                    className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:border-slate-900 group-hover:text-slate-900 transition-all hover:shadow-lg active:scale-95"
                  >
                    Enter Console &rarr;
                  </Link>
                </td>
              </tr>
            ))}
            {hotels.length === 0 && (
              <tr>
                <td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-bold italic">
                   No properties found in global namespace.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{children}</label>;
}

function FormInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (val: string) => void; placeholder?: string; type?: string }) {
  return (
    <input 
      type={type}
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-staff" 
    />
  );
}
