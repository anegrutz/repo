import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function Welcome() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-leaf-400 text-5xl font-bold">{t('welcome.title')}</Text>
      <Text className="text-haze-200 mt-3 text-center text-base">
        {t('welcome.subtitle')}
      </Text>

      <View className="mt-12 w-full">
        <Link href="/(auth)/sign-up" asChild>
          <Pressable
            className="w-full items-center rounded-2xl bg-leaf-500 py-4"
            accessibilityRole="button"
            accessibilityLabel={t('welcome.ctaPrimary')}
          >
            <Text className="text-bg text-base font-semibold">
              {t('welcome.ctaPrimary')}
            </Text>
          </Pressable>
        </Link>

        <Link href="/(auth)/sign-in" asChild>
          <Pressable
            className="border-haze-600 mt-3 w-full items-center rounded-2xl border py-4"
            accessibilityRole="button"
            accessibilityLabel={t('welcome.ctaSecondary')}
          >
            <Text className="text-haze-200 text-base">{t('welcome.ctaSecondary')}</Text>
          </Pressable>
        </Link>
      </View>

      <Text className="text-haze-400 mt-6 text-center text-xs">{t('welcome.legal')}</Text>
    </View>
  );
}
