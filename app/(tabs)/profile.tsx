import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { signOut } from '@/features/auth/api';
import { deleteMyAccount, requestDataExport } from '@/features/account/api';
import { useProfile } from '@/features/profile/useProfile';

export default function Profile() {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const onSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const onExport = async () => {
    try {
      const data = await requestDataExport();
      Alert.alert(
        t('account.exportTitle'),
        t('account.exportBody', { size: JSON.stringify(data).length }),
      );
    } catch {
      Alert.alert(t('moderation.errorTitle'), t('moderation.errorBody'));
    }
  };

  const onDelete = () => {
    Alert.alert(t('account.deleteTitle'), t('account.deleteBody'), [
      { text: t('moderation.cancel'), style: 'cancel' },
      {
        text: t('account.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMyAccount();
            router.replace('/');
          } catch {
            Alert.alert(t('moderation.errorTitle'), t('moderation.errorBody'));
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerStyle={{ padding: 24 }}>
      {profile ? (
        <View className="mt-12 items-center">
          <Text className="text-leaf-400 text-3xl font-bold">{profile.displayName}</Text>
          <Text className="text-haze-200 mt-2 text-base">
            {profile.vibe === 'indica' ? 'Team Indica' : 'Team Sativa'} •{' '}
            {profile.photos.length} {t('tabs.profilePhotos')}
          </Text>
          {profile.bio ? (
            <Text className="text-haze-400 mt-3 text-center text-sm">{profile.bio}</Text>
          ) : null}
        </View>
      ) : null}

      <View className="mt-12">
        <Text className="text-haze-400 text-xs uppercase tracking-widest">
          {t('account.section')}
        </Text>

        <Pressable
          onPress={onExport}
          className="border-haze-600 mt-3 rounded-2xl border px-4 py-4"
          accessibilityRole="button"
        >
          <Text className="text-haze-200">{t('account.export')}</Text>
        </Pressable>

        <Link href="/legal/privacy" asChild>
          <Pressable
            className="border-haze-600 mt-3 rounded-2xl border px-4 py-4"
            accessibilityRole="link"
          >
            <Text className="text-haze-200">{t('legal.privacyTitle')}</Text>
          </Pressable>
        </Link>

        <Link href="/legal/terms" asChild>
          <Pressable
            className="border-haze-600 mt-3 rounded-2xl border px-4 py-4"
            accessibilityRole="link"
          >
            <Text className="text-haze-200">{t('legal.termsTitle')}</Text>
          </Pressable>
        </Link>

        <Pressable
          onPress={onSignOut}
          className="border-haze-600 mt-3 rounded-2xl border px-4 py-4"
          accessibilityRole="button"
        >
          <Text className="text-haze-200">{t('tabs.signOut')}</Text>
        </Pressable>

        <Pressable
          onPress={onDelete}
          className="bg-ember-500 mt-6 items-center rounded-2xl px-4 py-4"
          accessibilityRole="button"
        >
          <Text className="text-bg font-semibold">{t('account.delete')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
