import { useQuery } from '@tanstack/react-query';

import { useMatches } from '@/features/matching/useMatches';

import { fetchFriendLocations, type FriendLocation } from './api';

export function useFriendsOnMap(): {
  friends: FriendLocation[];
  isLoading: boolean;
  refetch: () => void;
} {
  const { matches, isLoading: matchesLoading } = useMatches();
  const matchUids = matches.map((m) => m.otherUid);

  const query = useQuery<FriendLocation[]>({
    queryKey: ['friend-locations', matchUids.sort().join(',')],
    queryFn: () => fetchFriendLocations(matchUids),
    enabled: matchUids.length > 0 && !matchesLoading,
    staleTime: 30_000,
  });

  return {
    friends: query.data ?? [],
    isLoading: matchesLoading || query.isPending,
    refetch: () => {
      void query.refetch();
    },
  };
}
