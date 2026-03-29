import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OfflineQueueItem } from '@/types';

interface OfflineQueueState {
  queue: OfflineQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  addToQueue: (item: Omit<OfflineQueueItem, 'timestamp'>) => void;
  setOnline: (online: boolean) => void;
  removeFromQueue: (timestamp: number) => void;
  clearQueue: () => void;
}

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set) => ({
      queue: [],
      isOnline: true,
      isSyncing: false,
      addToQueue: (item) =>
        set((s) => ({
          queue: [...s.queue, { ...item, timestamp: Date.now() } as OfflineQueueItem],
        })),
      setOnline: (online) => set({ isOnline: online }),
      removeFromQueue: (timestamp) =>
        set((s) => ({ queue: s.queue.filter((i) => i.timestamp !== timestamp) })),
      clearQueue: () => set({ queue: [] }),
    }),
    { name: 'neotiv-offline-queue' }
  )
);
