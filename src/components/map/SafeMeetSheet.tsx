import { Pressable, Text, View } from 'react-native';

import type { SafeMeet } from '@/features/map/safeMeet';

type Props = {
  friendName: string;
  meet: SafeMeet;
  closeLabel: string;
  midpointLabel: string;
  distanceLabel: (meters: number) => string;
  onClose: () => void;
};

export function SafeMeetSheet({
  friendName,
  meet,
  closeLabel,
  midpointLabel,
  distanceLabel,
  onClose,
}: Props) {
  return (
    <View className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-bg-elevated p-6">
      <Text className="text-leaf-400 text-xl font-bold">
        Safe meet • {friendName}
      </Text>
      <Text className="text-haze-200 mt-1 text-sm">
        {midpointLabel}: {meet.midpoint.latitude.toFixed(4)},{' '}
        {meet.midpoint.longitude.toFixed(4)}
      </Text>
      <View className="bg-bg-card mt-4 rounded-2xl p-4">
        <Text className="text-leaf-400 text-base font-semibold">
          {meet.shop.name}
        </Text>
        <Text className="text-haze-200 mt-1 text-sm">{meet.shop.city}</Text>
        <Text className="text-haze-400 mt-1 text-xs">
          {distanceLabel(meet.distanceFromMidpointMeters)}
        </Text>
      </View>
      <Pressable
        onPress={onClose}
        className="border-haze-600 mt-4 items-center rounded-2xl border py-3"
        accessibilityRole="button"
      >
        <Text className="text-haze-200">{closeLabel}</Text>
      </Pressable>
    </View>
  );
}
