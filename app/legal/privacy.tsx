import { ScrollView, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();
  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 24 }}>
      <Stack.Screen
        options={{
          title: t('legal.privacyTitle'),
          headerStyle: { backgroundColor: '#0b0f0a' },
          headerTitleStyle: { color: '#7cd25a' },
          headerTintColor: '#7cd25a',
        }}
      />
      <Text className="text-leaf-400 text-2xl font-bold">{t('legal.privacyTitle')}</Text>
      <Text className="text-haze-200 mt-4 text-sm leading-6">{t('legal.privacyBody')}</Text>
      <Text className="text-haze-400 mt-6 text-xs">{t('legal.placeholderNote')}</Text>
    </ScrollView>
  );
}
