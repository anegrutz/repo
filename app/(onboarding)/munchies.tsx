import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { StepHeader } from '@/components/ui/StepHeader';
import { useOnboardingDraft } from '@/features/profile/store';
import { MUNCHIES, onboardingDraftSchema } from '@/features/profile/schema';
import { persistDraft } from '@/features/profile/api';
import type { Munchie } from '@/types';

export default function MunchiesStep() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const draft = useOnboardingDraft();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = draft.munchies.length > 0;

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      const parsed = onboardingDraftSchema.parse({
        displayName: draft.displayName,
        bio: draft.bio,
        vibe: draft.vibe,
        munchies: draft.munchies,
        photos: draft.photos,
      });
      await persistDraft(parsed);
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      draft.reset();
      router.replace('/(tabs)');
    } catch {
      setError(t('auth.signIn.errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <StepHeader current={4} />
      <Text className="text-leaf-400 text-3xl font-bold">
        {t('onboarding.munchies.title')}
      </Text>
      <Text className="text-haze-200 mt-2 text-base">
        {t('onboarding.munchies.subtitle')}
      </Text>

      <View className="mt-6 flex-row flex-wrap">
        {MUNCHIES.map((m) => {
          const selected = draft.munchies.includes(m);
          return (
            <Pressable
              key={m}
              onPress={() => draft.toggleMunchie(m as Munchie)}
              className={`m-1 rounded-full border px-4 py-2 ${selected ? 'bg-leaf-500 border-leaf-500' : 'border-haze-600 bg-bg-elevated'}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text className={`text-sm ${selected ? 'text-bg font-semibold' : 'text-haze-200'}`}>
                {t(`onboarding.munchies.options.${m}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text className="mt-4 text-sm text-ember-500">{error}</Text>
      ) : null}

      <Pressable
        disabled={!valid || busy}
        onPress={finish}
        className={`mt-8 items-center rounded-2xl py-4 ${valid && !busy ? 'bg-leaf-500' : 'bg-haze-600'}`}
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator color="#0b0f0a" />
        ) : (
          <Text className="text-bg text-base font-semibold">{t('onboarding.save')}</Text>
        )}
      </Pressable>
    </View>
  );
}
