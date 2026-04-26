import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { mockVerifyAge } from '@/features/auth/api';
import { runOnfidoFlow } from '@/features/auth/onfido';
import { useAuth } from '@/features/auth/store';

export default function AgeGate() {
  const { t } = useTranslation();
  const setAuthenticated = useAuth((s) => s.setAuthenticated);
  const state = useAuth((s) => s.state);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [dob, setDob] = useState('');

  const runOnfido = async () => {
    if (state.kind !== 'authenticated') return;
    if (!first.trim() || !last.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      setError(t('ageGate.fillAll'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const claims = await runOnfidoFlow({
        firstName: first.trim(),
        lastName: last.trim(),
        dob,
      });
      setAuthenticated({ uid: state.uid, email: state.email, claims });
      if (claims.country === 'NL' && claims.ageVerifiedAt) {
        router.replace('/(tabs)');
      } else {
        setError(t('ageGate.notApproved'));
      }
    } catch {
      setError(t('auth.signIn.errors.generic'));
    } finally {
      setBusy(false);
    }
  };

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
    <View className="flex-1 bg-bg px-6 pt-24">
      <Text className="text-leaf-400 text-3xl font-bold">{t('ageGate.title')}</Text>
      <Text className="text-haze-200 mt-2 text-sm">{t('ageGate.body')}</Text>

      <TextInput
        placeholder={t('ageGate.firstName')}
        placeholderTextColor="#8a8a8a"
        autoCapitalize="words"
        value={first}
        onChangeText={setFirst}
        className="border-haze-600 text-haze-200 mt-6 rounded-2xl border bg-bg-elevated px-4 py-3"
      />
      <TextInput
        placeholder={t('ageGate.lastName')}
        placeholderTextColor="#8a8a8a"
        autoCapitalize="words"
        value={last}
        onChangeText={setLast}
        className="border-haze-600 text-haze-200 mt-3 rounded-2xl border bg-bg-elevated px-4 py-3"
      />
      <TextInput
        placeholder={t('ageGate.dobPlaceholder')}
        placeholderTextColor="#8a8a8a"
        autoCapitalize="none"
        value={dob}
        onChangeText={setDob}
        className="border-haze-600 text-haze-200 mt-3 rounded-2xl border bg-bg-elevated px-4 py-3"
      />

      <Pressable
        onPress={runOnfido}
        disabled={busy}
        className={`mt-6 items-center rounded-2xl py-4 ${busy ? 'bg-haze-600' : 'bg-leaf-500'}`}
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator color="#0b0f0a" />
        ) : (
          <Text className="text-bg text-base font-semibold">{t('ageGate.ctaVerify')}</Text>
        )}
      </Pressable>

      {__DEV__ ? (
        <Pressable
          onPress={runMock}
          disabled={busy}
          className="border-haze-600 mt-3 items-center rounded-2xl border py-4"
          accessibilityRole="button"
        >
          <Text className="text-haze-200 text-sm">{t('ageGate.ctaMock')}</Text>
        </Pressable>
      ) : null}

      {error ? <Text className="mt-3 text-sm text-ember-500">{error}</Text> : null}
    </View>
  );
}
