import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { signOut } from '@/features/auth/api';
import { useProfile } from '@/features/profile/useProfile';

export default function Home() {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const onSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-leaf-400 text-3xl font-bold">{t('tabs.home.title')}</Text>
      {profile ? (
        <Text className="text-haze-200 mt-3 text-center text-base">
          {profile.displayName} • {profile.vibe} • {profile.photos.length} foto&apos;s
        </Text>
      ) : null}
      <Text className="text-haze-400 mt-3 text-center text-sm">
        {t('tabs.home.body')}
      </Text>

      <Pressable
        onPress={onSignOut}
        className="border-haze-600 mt-12 rounded-2xl border px-6 py-3"
        accessibilityRole="button"
      >
        <Text className="text-haze-200 text-sm">Sign out</Text>
      </Pressable>
    </View>
  );
}
