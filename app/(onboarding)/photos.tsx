import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { StepHeader } from '@/components/ui/StepHeader';
import { useOnboardingDraft } from '@/features/profile/store';
import { MAX_PHOTOS, MIN_PHOTOS } from '@/features/profile/schema';
import { deletePhoto, pickAndUploadPhoto } from '@/features/profile/api';

export default function PhotosStep() {
  const { t } = useTranslation();
  const photos = useOnboardingDraft((s) => s.photos);
  const addPhoto = useOnboardingDraft((s) => s.addPhoto);
  const removePhoto = useOnboardingDraft((s) => s.removePhoto);
  const [busy, setBusy] = useState(false);

  const valid = photos.length >= MIN_PHOTOS;
  const canAdd = photos.length < MAX_PHOTOS;

  const onAdd = async () => {
    setBusy(true);
    try {
      const photo = await pickAndUploadPhoto();
      if (photo) addPhoto(photo);
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (!target) return;
    removePhoto(id);
    try {
      await deletePhoto(target);
    } catch {
      // best-effort cleanup; resize Cloud Function will handle orphans separately
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <StepHeader current={2} />
      <Text className="text-leaf-400 text-3xl font-bold">
        {t('onboarding.photos.title')}
      </Text>
      <Text className="text-haze-200 mt-2 text-base">
        {t('onboarding.photos.subtitle')}
      </Text>

      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        numColumns={3}
        className="mt-6"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onRemove(item.id)}
            className="m-1 aspect-[4/5] flex-1 items-center justify-center rounded-2xl bg-bg-elevated"
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
          >
            <Text className="text-haze-400 text-xs">{item.id.slice(0, 6)}</Text>
          </Pressable>
        )}
      />

      <Pressable
        onPress={onAdd}
        disabled={!canAdd || busy}
        className={`mt-4 items-center rounded-2xl py-4 ${canAdd && !busy ? 'bg-bg-elevated border-haze-600 border' : 'bg-haze-600'}`}
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator color="#7cd25a" />
        ) : (
          <Text className="text-haze-200 text-base">
            {photos.length}/{MAX_PHOTOS} • {t('onboarding.photos.addCta')}
          </Text>
        )}
      </Pressable>

      <Pressable
        disabled={!valid}
        onPress={() => router.push('/(onboarding)/vibe-check')}
        className={`mt-4 items-center rounded-2xl py-4 ${valid ? 'bg-leaf-500' : 'bg-haze-600'}`}
        accessibilityRole="button"
      >
        <Text className="text-bg text-base font-semibold">{t('onboarding.next')}</Text>
      </Pressable>
    </View>
  );
}
