import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserMemory {
  proStatus?: {
    isActive: boolean;
    expiresAt?: string;
    features?: string[];
  };
}

export interface MemoryStore {
  memory: UserMemory;
  setMemory: (memory: UserMemory) => void;
  clearMemory: () => void;
  setProStatus: (status: { isActive: boolean; expiresAt?: string; features?: string[] }) => void;
  checkProStatus: () => { isActive: boolean; expiresAt?: string; features?: string[] };
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      memory: {},
      setMemory: (memory) => set({ memory }),
      clearMemory: () => set({ memory: {} }),
      checkProStatus: () => {
        const store = get();
        return store.memory.proStatus || { isActive: false };
      },
      setProStatus: (status) => {
        set((state) => ({
          memory: {
            ...state.memory,
            proStatus: status,
          },
        }));
      },
    }),
    {
      name: 'memory-storage',
    }
  )
);
