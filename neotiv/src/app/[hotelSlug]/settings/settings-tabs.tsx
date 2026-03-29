'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsTabs({ hotel, initialAnnouncements }: { hotel: any; initialAnnouncements: any[] }) {
  const [activeTab, setActiveTab] = useState('General');
  const [formData, setFormData] = useState(hotel);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('hotels').update(formData).eq('id', hotel.id);
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const addAnnouncement = async () => {
    if (!newAnnouncement) return;
    const { data } = await supabase.from('announcements').insert({ hotel_id: hotel.id, text: newAnnouncement }).select().single();
    if (data) {
      setAnnouncements([...announcements, data]);
      setNewAnnouncement('');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const toggleAnnouncement = async (id: string, currentStatus: boolean) => {
    await supabase.from('announcements').update({ is_active: !currentStatus }).eq('id', id);
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
  };

  const tabs = ['General', 'Appearance', 'WiFi', 'Clocks', 'Announcements'];

  return (
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden font-staff">
      {/* Tab Navigation */}
      <div className="flex bg-slate-50 border-b border-slate-200 px-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-5 text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'General' && (
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <FormLabel>Hotel Name</FormLabel>
                  <FormInput value={formData.name || ''} onChange={val => setFormData({...formData, name: val})} />
                </div>
                <div>
                  <FormLabel>Location / City</FormLabel>
                  <FormInput value={formData.location || ''} onChange={val => setFormData({...formData, location: val})} />
                </div>
                <div>
                  <FormLabel>Timezone</FormLabel>
                  <FormInput value={formData.timezone || ''} onChange={val => setFormData({...formData, timezone: val})} placeholder="e.g. Asia/Jakarta" />
                </div>
                <div>
                  <FormLabel>Airport IATA Code</FormLabel>
                  <FormInput value={formData.airport_iata_code || ''} onChange={val => setFormData({...formData, airport_iata_code: val})} placeholder="e.g. DPS" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Latitude</FormLabel>
                    <FormInput value={formData.latitude || ''} onChange={val => setFormData({...formData, latitude: val})} type="number" step="0.00000001" />
                  </div>
                  <div>
                    <FormLabel>Longitude</FormLabel>
                    <FormInput value={formData.longitude || ''} onChange={val => setFormData({...formData, longitude: val})} type="number" step="0.00000001" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Appearance' && (
              <div className="space-y-8 max-w-2xl">
                 <div>
                   <FormLabel>Logo URL</FormLabel>
                   <FormInput value={formData.logo_url || ''} onChange={val => setFormData({...formData, logo_url: val})} />
                 </div>
                 <div>
                   <FormLabel>Default Background URL</FormLabel>
                   <FormInput value={formData.default_background_url || ''} onChange={val => setFormData({...formData, default_background_url: val})} />
                 </div>
              </div>
            )}

            {activeTab === 'WiFi' && (
              <div className="grid grid-cols-2 gap-8 max-w-3xl">
                 <div className="col-span-2">
                   <FormLabel>SSID</FormLabel>
                   <FormInput value={formData.wifi_ssid || ''} onChange={val => setFormData({...formData, wifi_ssid: val})} />
                 </div>
                 <div>
                   <FormLabel>Username (optional)</FormLabel>
                   <FormInput value={formData.wifi_username || ''} onChange={val => setFormData({...formData, wifi_username: val})} />
                 </div>
                 <div>
                   <FormLabel>Password</FormLabel>
                   <FormInput type="password" value={formData.wifi_password || ''} onChange={val => setFormData({...formData, wifi_password: val})} />
                 </div>
              </div>
            )}

            {activeTab === 'Clocks' && (
              <div className="grid grid-cols-2 gap-10">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="space-y-4 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Clock {i} Configuration</p>
                      <div>
                        <FormLabel>Label</FormLabel>
                        <FormInput value={formData[`clock_label_${i}`] || ''} onChange={val => setFormData({...formData, [`clock_label_${i}`]: val})} />
                      </div>
                      <div>
                        <FormLabel>Timezone</FormLabel>
                        <FormInput value={formData[`clock_timezone_${i}`] || ''} onChange={val => setFormData({...formData, [`clock_timezone_${i}`]: val})} placeholder="e.g. America/New_York" />
                      </div>
                   </div>
                 ))}
              </div>
            )}

            {activeTab === 'Announcements' && (
              <div className="max-w-4xl">
                <div className="flex gap-4 mb-10 p-2 bg-slate-50 rounded-[32px] border border-slate-100">
                  <input 
                    value={newAnnouncement} 
                    onChange={e => setNewAnnouncement(e.target.value)} 
                    placeholder="New marquee announcement..." 
                    className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-medium" 
                  />
                  <button onClick={addAnnouncement} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">Add Alert</button>
                </div>
                <div className="space-y-3">
                  {announcements.map(a => (
                    <div key={a.id} className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-md transition-shadow group">
                      <span className={`font-medium text-sm ${a.is_active ? 'text-slate-900' : 'text-slate-400 italic'}`}>{a.text}</span>
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleAnnouncement(a.id, a.is_active)} 
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${a.is_active ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-teal-200 text-teal-600 bg-teal-50'}`}
                        >
                          {a.is_active ? 'Pause' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => deleteAnnouncement(a.id)} 
                          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all"
                        >Delete</button>
                      </div>
                    </div>
                  ))}
                  {announcements.length === 0 && <p className="text-center py-10 text-slate-300 font-bold italic">No active announcements</p>}
                </div>
              </div>
            )}

            {activeTab !== 'Announcements' && (
              <div className="mt-12 pt-8 border-t border-slate-100">
                <button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="px-12 py-4 bg-teal-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                >
                  {saving && <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />}
                  {saving ? 'Synchronizing...' : 'Commit Changes ✓'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{children}</label>;
}

function FormInput({ value, onChange, placeholder, type = 'text', step }: { value: string | number; onChange: (val: any) => void; placeholder?: string; type?: string; step?: string }) {
  return (
    <input 
      type={type}
      step={step}
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-900 placeholder:text-slate-300" 
    />
  );
}
