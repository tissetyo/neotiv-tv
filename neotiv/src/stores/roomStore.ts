import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, Promo, Service, Announcement, RoomSession } from '@/types';

interface RoomState extends RoomSession {
  // Live widget data (not persisted)
  latestNotification: Notification | null;
  promos: Promo[];
  services: Service[];
  announcements: Announcement[];
  unreadChatCount: number;

  // Helpers for easier access
  getClockTimezones: () => string[];
  getClockLabels: () => string[];

  // Actions
  hydrate: (session: RoomSession) => void;
  setPromos: (promos: Promo[]) => void;
  setServices: (services: Service[]) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  setNotification: (n: Notification) => void;
  incrementUnreadChat: () => void;
  clearUnreadChat: () => void;
  reset: () => void;
}

const defaultSession: RoomSession = {
  roomId: '',
  hotelId: '',
  roomCode: '',
  hotelSlug: '',
  guestName: null,
  guestPhotoUrl: null,
  backgroundUrl: null,
  hotelName: '',
  hotelTimezone: 'Asia/Jakarta',
  hotelLocation: null,
  wifiSsid: null,
  wifiPassword: null,
  wifiUsername: null,
  clockTimezone1: 'America/New_York',
  clockLabel1: 'New York',
  clockTimezone2: 'Europe/Paris',
  clockLabel2: 'France',
  clockTimezone3: 'Asia/Shanghai',
  clockLabel3: 'China',
  airportIataCode: null,
  latitude: null,
  longitude: null,
  customWelcomeMessage: null,
};

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      ...defaultSession,
      latestNotification: null,
      promos: [],
      services: [],
      announcements: [],
      unreadChatCount: 0,

      getClockTimezones: () => [
        get().clockTimezone1,
        get().clockTimezone2,
        get().clockTimezone3
      ],
      getClockLabels: () => [
        get().clockLabel1,
        get().clockLabel2,
        get().clockLabel3
      ],

      hydrate: (session) => set(session),
      setPromos: (promos) => set({ promos }),
      setServices: (services) => set({ services }),
      setAnnouncements: (announcements) => set({ announcements }),
      setNotification: (n) => set({ latestNotification: n }),
      incrementUnreadChat: () => set((s) => ({ unreadChatCount: s.unreadChatCount + 1 })),
      clearUnreadChat: () => set({ unreadChatCount: 0 }),
      reset: () => set({ ...defaultSession, latestNotification: null, promos: [], services: [], announcements: [], unreadChatCount: 0 }),
    }),
    {
      name: 'neotiv-room-store',
      partialize: (state) => ({
        roomId: state.roomId,
        hotelId: state.hotelId,
        roomCode: state.roomCode,
        hotelSlug: state.hotelSlug,
        guestName: state.guestName,
        guestPhotoUrl: state.guestPhotoUrl,
        backgroundUrl: state.backgroundUrl,
        hotelName: state.hotelName,
        hotelTimezone: state.hotelTimezone,
        hotelLocation: state.hotelLocation,
        wifiSsid: state.wifiSsid,
        wifiPassword: state.wifiPassword,
        wifiUsername: state.wifiUsername,
        clockTimezone1: state.clockTimezone1,
        clockLabel1: state.clockLabel1,
        clockTimezone2: state.clockTimezone2,
        clockLabel2: state.clockLabel2,
        clockTimezone3: state.clockTimezone3,
        clockLabel3: state.clockLabel3,
        airportIataCode: state.airportIataCode,
        latitude: state.latitude,
        longitude: state.longitude,
        customWelcomeMessage: state.customWelcomeMessage,
        services: state.services,
        announcements: state.announcements,
      }),
    }
  )
);
