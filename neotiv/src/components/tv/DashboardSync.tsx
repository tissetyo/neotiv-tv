'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRoomStore } from '@/stores/roomStore';
import type { Promo, Service, Announcement, Notification } from '@/types';

interface DashboardSyncProps {
  hotelId: string;
  roomId: string;
}

export default function DashboardSync({ hotelId, roomId }: DashboardSyncProps) {
  const store = useRoomStore();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchData = async () => {
    if (!hotelId || !roomId) return;

    try {
      // 1. Fetch Promos
      const { data: promos } = await supabase
        .from('promos')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (promos) store.setPromos(promos as Promo[]);

      // 2. Fetch Services
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (services) store.setServices(services as Service[]);

      // 3. Fetch Announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('*')
        .or(`hotel_id.eq.${hotelId},hotel_id.is.null`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (announcements) store.setAnnouncements(announcements as Announcement[]);

      // 4. Fetch Latest Notification
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .or(`room_id.eq.${roomId},room_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (notifications && notifications[0]) {
        store.setNotification(notifications[0] as Notification);
      }
    } catch (error) {
      console.error('Error syncing dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh basic data every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [hotelId, roomId]);

  return null; // Side-effect only component
}
