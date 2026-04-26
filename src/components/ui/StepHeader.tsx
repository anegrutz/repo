import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const TOTAL_STEPS = 4;

export function StepHeader({ current }: { current: 1 | 2 | 3 | 4 }) {
  const { t } = useTranslation();
  return (
    <View className="mb-6">
      <Text className="text-haze-400 text-xs uppercase tracking-widest">
        {t('onboarding.stepLabel', { current, total: TOTAL_STEPS })}
      </Text>
      <View className="bg-haze-600 mt-2 h-1 w-full overflow-hidden rounded-full">
        <View
          className="h-full bg-leaf-500"
          style={{ width: `${(current / TOTAL_STEPS) * 100}%` }}
        />
      </View>
    </View>
  );
}
