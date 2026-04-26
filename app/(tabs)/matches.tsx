import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useMatches } from '@/features/matching/useMatches';

export default function Matches() {
  const { t } = useTranslation();
  const { matches, isLoading } = useMatches();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#7cd25a" />
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="text-haze-200 text-center text-base">
          {t('matches.empty')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg pt-12">
      <Text className="text-leaf-400 px-6 text-2xl font-bold">{t('matches.title')}</Text>
      <FlatList
        data={matches}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Pressable
            className="rounded-2xl bg-bg-elevated p-4"
            accessibilityRole="button"
          >
            <Text className="text-haze-200 text-base">{item.otherUid.slice(0, 8)}</Text>
            <Text className="text-haze-400 mt-1 text-xs">
              {t('matches.openSoon')}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
