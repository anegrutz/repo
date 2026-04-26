import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/store';

import type { MatchSummary } from './api';
import { subscribeMatches } from './api';

export function useMatches(): { matches: MatchSummary[]; isLoading: boolean } {
  const authState = useAuth((s) => s.state);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authState.kind !== 'authenticated') return;
    const unsubscribe = subscribeMatches((next) => {
      setMatches(next);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [authState.kind]);

  return { matches, isLoading };
}
