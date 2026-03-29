'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRoomStore } from '@/stores/roomStore';
import type { Notification, ChatMessage } from '@/types';

/**
 * Custom hook for live Supabase Realtime synchronization on TV.
 * Handles incoming notifications and chat alerts.
 */
export function useRealtime(hotelId: string | null, roomId: string | null) {
  const store = useRoomStore();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!hotelId || !roomId) return;

    // 1. Subscribe to Notifications
    const notificationChannel = supabase
      .channel(`room-notifications-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          store.setNotification(payload.new as Notification);
        }
      )
      // Also subscribe to broadcasts (null room_id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `room_id=is.null`,
        },
        (payload) => {
          if (payload.new.hotel_id === hotelId || payload.new.hotel_id === null) {
            store.setNotification(payload.new as Notification);
          }
        }
      )
      .subscribe();

    // 2. Subscribe to Chat Messages
    const chatChannel = supabase
      .channel(`room-chat-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (msg.sender_role === 'frontoffice') {
            store.incrementUnreadChat();
            // Optional: Show temporary toast notification for new chat
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [hotelId, roomId, store, supabase]);
}
