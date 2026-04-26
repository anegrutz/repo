import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function GeoBlock() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-leaf-400 text-3xl font-bold">{t('geoBlock.title')}</Text>
      <Text className="text-haze-200 mt-3 text-center text-base">
        {t('geoBlock.body')}
      </Text>
      <Text className="text-haze-400 mt-6 text-center text-sm">
        {t('geoBlock.footer')}
      </Text>
    </View>
  );
}
