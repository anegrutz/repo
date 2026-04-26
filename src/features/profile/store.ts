import { create } from 'zustand';

import type { Munchie, Vibe } from '@/types';

import type { Photo } from './schema';

type Draft = {
  displayName: string;
  bio: string;
  vibe: Vibe | null;
  munchies: Munchie[];
  photos: Photo[];
};

type DraftStore = Draft & {
  setName: (name: string) => void;
  setBio: (bio: string) => void;
  setVibe: (vibe: Vibe) => void;
  toggleMunchie: (m: Munchie) => void;
  addPhoto: (p: Photo) => void;
  removePhoto: (id: string) => void;
  reset: () => void;
};

const empty: Draft = {
  displayName: '',
  bio: '',
  vibe: null,
  munchies: [],
  photos: [],
};

export const useOnboardingDraft = create<DraftStore>((set) => ({
  ...empty,
  setName: (displayName) => set({ displayName }),
  setBio: (bio) => set({ bio }),
  setVibe: (vibe) => set({ vibe }),
  toggleMunchie: (m) =>
    set((s) => ({
      munchies: s.munchies.includes(m)
        ? s.munchies.filter((x) => x !== m)
        : [...s.munchies, m],
    })),
  addPhoto: (p) => set((s) => ({ photos: [...s.photos, p] })),
  removePhoto: (id) => set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),
  reset: () => set(empty),
}));
