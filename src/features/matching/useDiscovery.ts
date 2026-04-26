import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchDiscoveryDeck, recordSwipe } from './api';
import type { DiscoveryCard } from './api';
import type { SwipeDirection } from '@/types';

export function useDiscovery() {
  const queryClient = useQueryClient();
  const query = useQuery<DiscoveryCard[]>({
    queryKey: ['discovery'],
    queryFn: fetchDiscoveryDeck,
    staleTime: 30_000,
  });

  const swipe = useCallback(
    async (targetUid: string, direction: SwipeDirection) => {
      await recordSwipe(targetUid, direction);
      queryClient.setQueryData<DiscoveryCard[]>(['discovery'], (prev) =>
        (prev ?? []).filter((c) => c.uid !== targetUid),
      );
    },
    [queryClient],
  );

  return {
    cards: query.data ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    swipe,
  };
}
