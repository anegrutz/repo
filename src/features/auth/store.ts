import { create } from 'zustand';

export type AuthClaims = {
  country: string | null;
  ageVerifiedAt: number | null;
};

export type AuthState =
  | { kind: 'loading' }
  | { kind: 'unauthenticated' }
  | { kind: 'authenticated'; uid: string; email: string | null; claims: AuthClaims };

export type GateDecision =
  | 'loading'
  | 'unauthenticated'
  | 'wrong-country'
  | 'age-unverified'
  | 'allowed';

type AuthStore = {
  state: AuthState;
  setLoading: () => void;
  setUnauthenticated: () => void;
  setAuthenticated: (input: {
    uid: string;
    email: string | null;
    claims: AuthClaims;
  }) => void;
};

export const useAuth = create<AuthStore>((set) => ({
  state: { kind: 'loading' },
  setLoading: () => set({ state: { kind: 'loading' } }),
  setUnauthenticated: () => set({ state: { kind: 'unauthenticated' } }),
  setAuthenticated: ({ uid, email, claims }) =>
    set({ state: { kind: 'authenticated', uid, email, claims } }),
}));

export function deriveGate(state: AuthState): GateDecision {
  if (state.kind === 'loading') return 'loading';
  if (state.kind === 'unauthenticated') return 'unauthenticated';
  if (state.claims.country !== 'NL') return 'wrong-country';
  if (!state.claims.ageVerifiedAt) return 'age-unverified';
  return 'allowed';
}
