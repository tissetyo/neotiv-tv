'use client';

import { motion } from 'framer-motion';

export interface Service {
  id: string;
  name: string;
  icon: string;
}

interface HotelServiceProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

export default function HotelService({ services, onSelect }: HotelServiceProps) {
  const displayServices = services.length > 0 ? services : [
    { id: '1', name: 'Room Service', icon: '🍽️' },
    { id: '2', name: 'Restaurant', icon: '🍴' },
    { id: '3', name: 'Car Rental', icon: '🚗' },
    { id: '4', name: 'Bike Rental', icon: '🛵' },
    { id: '5', name: 'Spa', icon: '💆' },
    { id: '6', name: 'Laundry', icon: '👕' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">🛎️</span>
        <span className="text-white/60 text-[12px] font-black uppercase tracking-[0.2em]">Hotel Service</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {displayServices.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className="tv-focusable h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl transition-all hover:bg-white/10 active:scale-95"
            data-focusable="true"
            title={service.name}
          >
            {service.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
