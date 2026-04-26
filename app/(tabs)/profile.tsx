import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { signOut } from '@/features/auth/api';
import { useProfile } from '@/features/profile/useProfile';

export default function Profile() {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const onSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      {profile ? (
        <>
          <Text className="text-leaf-400 text-3xl font-bold">{profile.displayName}</Text>
          <Text className="text-haze-200 mt-2 text-center text-base">
            {profile.vibe === 'indica' ? 'Team Indica' : 'Team Sativa'} •{' '}
            {profile.photos.length} {t('tabs.profilePhotos')}
          </Text>
          {profile.bio ? (
            <Text className="text-haze-400 mt-3 text-center text-sm">{profile.bio}</Text>
          ) : null}
        </>
      ) : null}

      <Pressable
        onPress={onSignOut}
        className="border-haze-600 mt-12 rounded-2xl border px-6 py-3"
        accessibilityRole="button"
      >
        <Text className="text-haze-200 text-sm">{t('tabs.signOut')}</Text>
      </Pressable>
    </View>
  );
}
