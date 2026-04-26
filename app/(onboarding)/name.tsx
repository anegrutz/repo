import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { StepHeader } from '@/components/ui/StepHeader';
import { useOnboardingDraft } from '@/features/profile/store';
import { MAX_NAME, MIN_NAME } from '@/features/profile/schema';

export default function NameStep() {
  const { t } = useTranslation();
  const displayName = useOnboardingDraft((s) => s.displayName);
  const setName = useOnboardingDraft((s) => s.setName);

  const valid = displayName.trim().length >= MIN_NAME;

  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <StepHeader current={1} />
      <Text className="text-leaf-400 text-3xl font-bold">{t('onboarding.name.title')}</Text>
      <Text className="text-haze-200 mt-2 text-base">{t('onboarding.name.subtitle')}</Text>

      <TextInput
        autoFocus
        autoCapitalize="words"
        maxLength={MAX_NAME}
        placeholder={t('onboarding.name.placeholder')}
        placeholderTextColor="#8a8a8a"
        value={displayName}
        onChangeText={setName}
        className="border-haze-600 text-haze-200 mt-8 rounded-2xl border bg-bg-elevated px-4 py-3"
      />

      <Pressable
        disabled={!valid}
        onPress={() => router.push('/(onboarding)/photos')}
        className={`mt-8 items-center rounded-2xl py-4 ${valid ? 'bg-leaf-500' : 'bg-haze-600'}`}
        accessibilityRole="button"
      >
        <Text className="text-bg text-base font-semibold">{t('onboarding.next')}</Text>
      </Pressable>
    </View>
  );
}
