'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function ServicesClient({ hotelId, initialServices }: { hotelId: string, initialServices: any[] }) {
  const [services, setServices] = useState(initialServices);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🍽️');
  const [newDesc, setNewDesc] = useState('');
  
  const supabase = createClient();

  const presets = ['🍽️', '🍴', '🚗', '🛵', '💆', '👕', '🧹', '🌊', '🏊', '📞', '🧴', '🥂', '🔑', '🍳', '🏋️', '🛁'];

  const handleAdd = async () => {
    if (!newName) return;
    const nextOrder = services.length > 0 ? Math.max(...services.map(s => s.sort_order || 0)) + 1 : 0;
    const { data } = await supabase.from('services').insert({
      hotel_id: hotelId,
      name: newName,
      icon: newIcon,
      description: newDesc,
      sort_order: nextOrder,
      is_active: true
    }).select().single();
    
    if (data) {
      setServices([...services, data]);
      setShowAdd(false);
      setNewName(''); setNewIcon('🍽️'); setNewDesc('');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('services').update({ is_active: !current }).eq('id', id);
    setServices(services.map(s => s.id === id ? { ...s, is_active: !current } : s));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this service? This may affect pending requests.')) {
      await supabase.from('services').delete().eq('id', id);
      setServices(services.filter(s => s.id !== id));
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newServices = [...services];
    const temp = newServices[index].sort_order;
    newServices[index].sort_order = newServices[index - 1].sort_order;
    newServices[index - 1].sort_order = temp;
    
    const tempObj = newServices[index];
    newServices[index] = newServices[index - 1];
    newServices[index - 1] = tempObj;
    
    setServices(newServices);
    await supabase.from('services').update({ sort_order: newServices[index].sort_order }).eq('id', newServices[index].id);
    await supabase.from('services').update({ sort_order: newServices[index - 1].sort_order }).eq('id', newServices[index - 1].id);
  };

  const moveDown = async (index: number) => {
    if (index === services.length - 1) return;
    const newServices = [...services];
    const temp = newServices[index].sort_order;
    newServices[index].sort_order = newServices[index + 1].sort_order;
    newServices[index + 1].sort_order = temp;
    
    const tempObj = newServices[index];
    newServices[index] = newServices[index + 1];
    newServices[index + 1] = tempObj;
    
    setServices(newServices);
    await supabase.from('services').update({ sort_order: newServices[index].sort_order }).eq('id', newServices[index].id);
    await supabase.from('services').update({ sort_order: newServices[index + 1].sort_order }).eq('id', newServices[index + 1].id);
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden font-staff mt-8">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
           <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Catalog of Offerings</h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest-facing hotel services</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all"
        >
          + Add New Service
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-8 bg-teal-50 border-b border-teal-100 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex gap-4 flex-1">
                 <div className="relative">
                    <FormLabel>Icon</FormLabel>
                    <select 
                      value={newIcon} 
                      onChange={e => setNewIcon(e.target.value)} 
                      className="w-20 h-14 bg-white border border-teal-200 rounded-2xl text-2xl flex items-center justify-center outline-none focus:ring-4 focus:ring-teal-500/10"
                    >
                      {presets.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <div className="flex-1">
                   <FormLabel>Service Name</FormLabel>
                   <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Room Service" className="w-full h-14 bg-white border border-teal-200 rounded-2xl px-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-teal-500/10" />
                 </div>
              </div>
              <div className="flex-1">
                 <FormLabel>Description</FormLabel>
                 <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Subtitle or brief description..." className="w-full h-14 bg-white border border-teal-200 rounded-2xl px-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-teal-500/10" />
              </div>
              <div className="flex items-end gap-3">
                 <button onClick={handleAdd} className="h-14 px-8 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Save Service</button>
                 <button onClick={() => setShowAdd(false)} className="h-14 px-8 bg-white border border-teal-200 text-teal-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="divide-y divide-slate-50">
        {services.map((s, idx) => (
          <div key={s.id} className="group p-6 flex items-center gap-8 hover:bg-slate-50 transition-colors">
            <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => moveUp(idx)} disabled={idx === 0} className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[10px] hover:border-teal-500 hover:text-teal-600 disabled:opacity-20 transition-all">▲</button>
              <button onClick={() => moveDown(idx)} disabled={idx === services.length - 1} className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[10px] hover:border-teal-500 hover:text-teal-600 disabled:opacity-20 transition-all">▼</button>
            </div>
            
            <div className={`w-16 h-16 rounded-[22px] bg-slate-100 flex items-center justify-center text-3xl border border-slate-200 group-hover:bg-teal-500 group-hover:border-teal-400 group-hover:text-white transition-all shadow-sm ${!s.is_active ? 'grayscale' : ''}`}>
               {s.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                 <h4 className={`text-base font-black tracking-tight ${!s.is_active ? 'text-slate-400 italic strike' : 'text-slate-900'}`}>{s.name}</h4>
                 {!s.is_active && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md">Disabled</span>}
              </div>
              <p className="text-xs text-slate-400 font-medium truncate mt-1">{s.description || 'No subtitle configured'}</p>
            </div>
            
            <div className="flex gap-3 items-center opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                 onClick={() => toggleActive(s.id, s.is_active)} 
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${s.is_active ? 'border-slate-200 text-slate-500 hover:border-amber-400 bg-white' : 'border-teal-200 text-teal-600 bg-teal-50'}`}
               >
                 {s.is_active ? 'Pause Service' : 'Resume Service'}
               </button>
               <button onClick={() => handleDelete(s.id)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 text-rose-300 hover:border-rose-400 hover:text-rose-500 bg-white transition-all">Remove</button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="p-20 text-center">
             <p className="text-4xl mb-4 opacity-20 italic">🛎️</p>
             <p className="text-slate-400 text-sm font-bold">No services configured yet for this property.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{children}</label>;
}
