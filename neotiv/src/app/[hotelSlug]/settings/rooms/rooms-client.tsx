'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoomsClient({ hotelId, initialRooms, roomTypes }: { hotelId: string, initialRooms: any[], roomTypes: any[] }) {
  const [rooms, setRooms] = useState(initialRooms);
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('');
  const [newPin, setNewPin] = useState('');
  const supabase = createClient();
  
  const [selectedRooms, setSelectedRooms] = useState<Record<string, boolean>>({});

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleAdd = async () => {
    if (!newCode) return;
    const { data } = await supabase.from('rooms').insert({
      hotel_id: hotelId,
      room_code: newCode,
      room_type_id: newType || null,
      pin: newPin || null
    }).select('*, room_types(name)').single();
    if (data) {
      setRooms([...rooms, data].sort((a,b) => a.room_code.localeCompare(b.room_code, undefined, { numeric: true })));
      setShowAdd(false);
      setNewCode(''); setNewType(''); setNewPin('');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Permanently delete Room ${code} and all its data?`)) {
      await supabase.from('rooms').delete().eq('id', id);
      setRooms(rooms.filter(r => r.id !== id));
      const newSelected = {...selectedRooms};
      delete newSelected[id];
      setSelectedRooms(newSelected);
    }
  };

  const handleBulkReset = async () => {
    const ids = Object.keys(selectedRooms).filter(k => selectedRooms[k]);
    if (ids.length === 0) return;
    if (confirm(`Reset guest info and set checkout for ${ids.length} rooms?`)) {
      await supabase.from('rooms').update({
        is_occupied: false,
        guest_name: null,
        guest_photo_url: null,
        custom_welcome_message: null,
        checkin_date: null,
        checkout_date: null
      }).in('id', ids);
      setRooms(rooms.map(r => ids.includes(r.id) ? { 
        ...r, is_occupied: false, guest_name: null, guest_photo_url: null, custom_welcome_message: null, checkin_date: null, checkout_date: null 
      } : r));
      setSelectedRooms({});
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedRooms({...selectedRooms, [id]: !selectedRooms[id]});
  };

  const selectedCount = Object.values(selectedRooms).filter(Boolean).length;

  return (
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden font-staff mt-8">
      {/* Table Header / Actions */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Room Assets</h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rooms.length} Total Units</p>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.button 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={handleBulkReset}
                className="px-6 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"
              >
                Reset {selectedCount} Selected
              </motion.button>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setShowAdd(true)} 
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all"
          >
            + New Asset
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-8 bg-slate-50 border-b border-slate-100 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-6 items-end">
               <div className="flex-1">
                  <FormLabel>Room Code</FormLabel>
                  <FormInput value={newCode} onChange={setNewCode} placeholder="e.g. 101" />
               </div>
               <div className="flex-1">
                  <FormLabel>Type</FormLabel>
                  <select 
                    value={newType} 
                    onChange={e => setNewType(e.target.value)}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-teal-500/10"
                  >
                    <option value="">No Type</option>
                    {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                  </select>
               </div>
               <div className="flex-1 flex gap-2">
                  <div className="flex-1">
                     <FormLabel>PIN Code</FormLabel>
                     <FormInput value={newPin} onChange={setNewPin} placeholder="4 Digits" />
                  </div>
                  <div className="flex items-end">
                     <button onClick={() => setNewPin(generatePin())} className="h-14 px-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:text-slate-900 transition-colors">Generate</button>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={handleAdd} className="h-14 px-8 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Create</button>
                 <button onClick={() => setShowAdd(false)} className="h-14 px-8 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <th className="px-8 py-6 w-20">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-lg border-2 border-slate-200 text-teal-500 focus:ring-teal-500 transition-all cursor-pointer"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newSelection: Record<string, boolean> = {};
                    rooms.forEach(r => newSelection[r.id] = checked);
                    setSelectedRooms(newSelection);
                  }} 
                  checked={rooms.length > 0 && Object.values(selectedRooms).filter(Boolean).length === rooms.length} 
                />
              </th>
              <th className="px-8 py-6">Identity</th>
              <th className="px-8 py-6">Classification</th>
              <th className="px-8 py-6">Current State</th>
              <th className="px-8 py-6">Access PIN</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rooms.map(r => (
              <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <input 
                    type="checkbox" 
                    checked={!!selectedRooms[r.id]} 
                    onChange={() => toggleSelect(r.id)} 
                    className="w-5 h-5 rounded-lg border-2 border-slate-200 text-teal-500 focus:ring-teal-500 transition-all cursor-pointer"
                  />
                </td>
                <td className="px-8 py-6">
                   <p className="text-base font-black text-slate-900 leading-none">{r.room_code}</p>
                   {r.guest_name && <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase truncate max-w-[140px]">{r.guest_name}</p>}
                </td>
                <td className="px-8 py-6">
                   <span className="text-xs font-bold text-slate-500">{r.room_types?.name || 'Standard'}</span>
                </td>
                <td className="px-8 py-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${
                    r.is_occupied 
                      ? 'border-teal-500/20 bg-teal-50 text-teal-700' 
                      : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${r.is_occupied ? 'bg-teal-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {r.is_occupied ? 'Occupied' : 'Vacant'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <code className="text-xs font-black tracking-[4px] bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500">{r.pin || '----'}</code>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => handleDelete(r.id, r.room_code)} 
                    className="p-3 bg-white border border-rose-100 text-rose-300 rounded-xl hover:border-rose-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                   <p className="text-4xl mb-4 opacity-20">🏢</p>
                   <p className="text-slate-400 text-sm font-bold">No assets found in your property manifest.</p>
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

function FormInput({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder?: string }) {
  return (
    <input 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all" 
    />
  );
}
