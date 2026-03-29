'use client';

import QRCode from 'react-qr-code';

interface WifiCardProps {
  ssid: string;
  password?: string;
  username?: string;
}

export default function WifiCard({ ssid, password = '', username = '' }: WifiCardProps) {
  // WIFI:S:{ssid};T:WPA;P:{password};U:{username};;
  const wifiString = `WIFI:S:${ssid};T:WPA;P:${password}${username ? `;U:${username}` : ''};;`;

  return (
    <div className="tv-widget p-5 flex items-center gap-6 backdrop-blur-3xl bg-slate-900/60 transition-transform duration-300 hover:scale-[1.02] border-white/20">
      {/* QR Code */}
      <div className="p-3 bg-white rounded-2xl shadow-2xl">
        <QRCode 
          value={wifiString} 
          size={100} 
          fgColor="#0f172a" 
          level="H"
        />
      </div>

      {/* Credentials */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">📶</span>
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/40">Wifi Access</p>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-teal-400 tracking-widest leading-none mb-1">SSID</span>
            <span className="text-white text-sm font-bold tracking-tight">{ssid}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-teal-400 tracking-widest leading-none mb-1">Username</span>
            <span className="text-white text-sm font-bold tracking-tight">{username || 'Guest'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-teal-400 tracking-widest leading-none mb-1">Password</span>
            <span className="text-white text-sm font-bold tracking-tight">{password || 'stayinhereforwhile'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
