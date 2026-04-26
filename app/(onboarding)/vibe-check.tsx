import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { StepHeader } from '@/components/ui/StepHeader';
import { useOnboardingDraft } from '@/features/profile/store';
import type { Vibe } from '@/types';

export default function VibeStep() {
  const { t } = useTranslation();
  const vibe = useOnboardingDraft((s) => s.vibe);
  const setVibe = useOnboardingDraft((s) => s.setVibe);

  const Card = ({
    value,
    title,
    body,
  }: {
    value: Vibe;
    title: string;
    body: string;
  }) => {
    const selected = vibe === value;
    return (
      <Pressable
        onPress={() => setVibe(value)}
        className={`mt-4 rounded-2xl border p-5 ${selected ? 'border-leaf-500 bg-bg-card' : 'border-haze-600 bg-bg-elevated'}`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text className="text-leaf-400 text-xl font-semibold">{title}</Text>
        <Text className="text-haze-200 mt-2 text-sm">{body}</Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <StepHeader current={3} />
      <Text className="text-leaf-400 text-3xl font-bold">{t('onboarding.vibe.title')}</Text>

      <Card
        value="indica"
        title={t('onboarding.vibe.indicaTitle')}
        body={t('onboarding.vibe.indicaBody')}
      />
      <Card
        value="sativa"
        title={t('onboarding.vibe.sativaTitle')}
        body={t('onboarding.vibe.sativaBody')}
      />

      <Pressable
        disabled={!vibe}
        onPress={() => router.push('/(onboarding)/munchies')}
        className={`mt-8 items-center rounded-2xl py-4 ${vibe ? 'bg-leaf-500' : 'bg-haze-600'}`}
        accessibilityRole="button"
      >
        <Text className="text-bg text-base font-semibold">{t('onboarding.next')}</Text>
      </Pressable>
    </View>
  );
}
