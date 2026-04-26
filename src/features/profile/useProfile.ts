import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/store';

import { readProfile } from './api';
import { isProfileComplete, type Profile } from './schema';

export type ProfileStatus = 'loading' | 'missing' | 'incomplete' | 'complete';

export function useProfile(): {
  status: ProfileStatus;
  profile: Profile | null;
} {
  const authState = useAuth((s) => s.state);
  const uid = authState.kind === 'authenticated' ? authState.uid : null;

  const query = useQuery({
    queryKey: ['profile', uid],
    queryFn: () => (uid ? readProfile(uid) : Promise.resolve(null)),
    enabled: Boolean(uid),
    staleTime: 60_000,
  });

  if (!uid) return { status: 'missing', profile: null };
  if (query.isPending) return { status: 'loading', profile: null };
  if (!query.data) return { status: 'missing', profile: null };
  if (!isProfileComplete(query.data)) return { status: 'incomplete', profile: query.data };
  return { status: 'complete', profile: query.data };
}
