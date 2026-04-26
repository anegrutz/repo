import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CardStack } from '@/components/swipe/CardStack';
import { directionToFirestore } from '@/features/matching/api';
import { useDiscovery } from '@/features/matching/useDiscovery';

export default function Discover() {
  const { t } = useTranslation();
  const { cards, isLoading, isError, refetch, swipe } = useDiscovery();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#7cd25a" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="text-haze-200 text-center text-base">
          {t('discover.error')}
        </Text>
        <Text className="text-leaf-400 mt-2 text-sm" onPress={() => refetch()}>
          {t('discover.retry')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg p-4">
      <CardStack
        cards={cards}
        emptyLabel={t('discover.empty')}
        onSwiped={(uid, outcome) => {
          void swipe(uid, directionToFirestore(outcome));
        }}
      />
    </View>
  );
}
