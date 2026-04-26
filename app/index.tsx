import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { resolveCountry } from '@/lib/geofence';
import { deriveGate, useAuth } from '@/features/auth/store';
import { useProfile } from '@/features/profile/useProfile';
import { nextIncompleteStep } from '@/features/profile/schema';

export default function Index() {
  const authState = useAuth((s) => s.state);
  const { status: profileStatus, profile } = useProfile();
  const [deviceCountry, setDeviceCountry] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const country = await resolveCountry();
      if (!cancelled) setDeviceCountry(country);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (authState.kind === 'loading' || deviceCountry === null) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#7cd25a" />
      </View>
    );
  }

  if (deviceCountry !== 'NL' && authState.kind === 'unauthenticated') {
    return <Redirect href="/(auth)/geo-block" />;
  }

  const gate = deriveGate(authState);
  switch (gate) {
    case 'unauthenticated':
      return <Redirect href="/(auth)/welcome" />;
    case 'wrong-country':
      return <Redirect href="/(auth)/geo-block" />;
    case 'age-unverified':
      return <Redirect href="/(auth)/age-gate" />;
    case 'allowed':
      break;
    default:
      return null;
  }

  if (profileStatus === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#7cd25a" />
      </View>
    );
  }

  if (profileStatus === 'missing') {
    return <Redirect href="/(onboarding)/name" />;
  }

  if (profileStatus === 'incomplete') {
    const step = nextIncompleteStep(profile ?? {});
    if (step !== 'complete') {
      return <Redirect href={`/(onboarding)/${step === 'vibe-check' ? 'vibe-check' : step}`} />;
    }
  }

  return <Redirect href="/(tabs)" />;
}
