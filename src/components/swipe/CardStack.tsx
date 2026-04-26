import { useCallback } from 'react';
import { Text, View } from 'react-native';

import type { DiscoveryCard } from '@/features/matching/api';

import { SwipeCard, type SwipeOutcome } from './SwipeCard';

type Props = {
  cards: DiscoveryCard[];
  emptyLabel: string;
  onSwiped: (uid: string, outcome: SwipeOutcome) => void;
};

export function CardStack({ cards, emptyLabel, onSwiped }: Props) {
  const top = cards[0];
  const next = cards[1];

  const handleSwiped = useCallback(
    (uid: string) => (outcome: SwipeOutcome) => onSwiped(uid, outcome),
    [onSwiped],
  );

  if (!top) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-haze-200 text-center text-base">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {next ? (
        <SwipeCard
          key={next.uid}
          card={next}
          isTop={false}
          onSwiped={handleSwiped(next.uid)}
        />
      ) : null}
      <SwipeCard key={top.uid} card={top} isTop onSwiped={handleSwiped(top.uid)} />
    </View>
  );
}
