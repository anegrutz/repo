import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { mockVerifyAge } from '@/features/auth/api';
import { useAuth } from '@/features/auth/store';

export default function AgeGate() {
  const { t } = useTranslation();
  const setAuthenticated = useAuth((s) => s.setAuthenticated);
  const state = useAuth((s) => s.state);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runMock = async () => {
    if (state.kind !== 'authenticated') return;
    setBusy(true);
    setError(null);
    try {
      const claims = await mockVerifyAge();
      setAuthenticated({ uid: state.uid, email: state.email, claims });
      router.replace('/(tabs)');
    } catch {
      setError(t('auth.signIn.errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-leaf-400 text-3xl font-bold">{t('ageGate.title')}</Text>
      <Text className="text-haze-200 mt-3 text-center text-base">
        {t('ageGate.body')}
      </Text>

      <Pressable
        className="mt-12 w-full items-center rounded-2xl bg-leaf-500 py-4"
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
      >
        <Text className="text-bg text-base font-semibold opacity-70">
          {t('ageGate.ctaVerify')}
        </Text>
      </Pressable>

      {__DEV__ ? (
        <Pressable
          className="border-haze-600 mt-3 w-full items-center rounded-2xl border py-4"
          accessibilityRole="button"
          onPress={runMock}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#7cd25a" />
          ) : (
            <Text className="text-haze-200 text-base">{t('ageGate.ctaMock')}</Text>
          )}
        </Pressable>
      ) : null}

      {error ? (
        <Text className="mt-3 text-sm text-ember-500">{error}</Text>
      ) : null}
    </View>
  );
}
