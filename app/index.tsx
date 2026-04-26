import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { resolveCountry } from '@/lib/geofence';

type Gate = 'loading' | 'allowed' | 'blocked';

export default function Index() {
  const [gate, setGate] = useState<Gate>('loading');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const country = await resolveCountry();
      if (cancelled) return;
      setGate(country === 'NL' ? 'allowed' : 'blocked');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (gate === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#7cd25a" />
      </View>
    );
  }

  if (gate === 'blocked') {
    return <Redirect href="/(auth)/geo-block" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
