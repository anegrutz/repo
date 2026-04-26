import { create } from 'zustand';

import type { UserProfile } from '@/types';

type SessionState = {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  reset: () => void;
};

export const useSession = create<SessionState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  reset: () => set({ profile: null }),
}));
