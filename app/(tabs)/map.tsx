import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';

import { SafeMeetSheet } from '@/components/map/SafeMeetSheet';
import { setCouchLock, updateMyLocation, type FriendLocation } from '@/features/map/api';
import { avatarFor, COUCH_LOCK_AVATAR } from '@/features/map/avatars';
import { safeMeetForPair, type SafeMeet } from '@/features/map/safeMeet';
import { useFriendsOnMap } from '@/features/map/useFriendsOnMap';
import { fuzz, type LatLng } from '@/lib/location';

const AMSTERDAM: LatLng = { latitude: 52.3676, longitude: 4.9041 };

export default function MapScreen() {
  const { t } = useTranslation();
  const { friends, isLoading, refetch } = useFriendsOnMap();
  const [myLocation, setMyLocation] = useState<LatLng | null>(null);
  const [couchLock, setCouchLockState] = useState(false);
  const [activeMeet, setActiveMeet] = useState<{ name: string; meet: SafeMeet } | null>(null);

  useEffect(() => {
    if (couchLock) return;
    let cancelled = false;
    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('map.permissionTitle'), t('map.permissionBody'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (cancelled) return;
      const here: LatLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setMyLocation(fuzz(here));
      try {
        await updateMyLocation(here);
        refetch();
      } catch {
        // Best-effort; the next mount tries again
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [couchLock, refetch, t]);

  const toggleCouchLock = async (next: boolean) => {
    setCouchLockState(next);
    await setCouchLock(next);
    refetch();
  };

  const onTapFriend = (friend: FriendLocation) => {
    if (!myLocation || !friend.fuzzy || friend.couchLockMode) return;
    const meet = safeMeetForPair(myLocation, friend.fuzzy);
    if (!meet) return;
    setActiveMeet({ name: friend.displayName, meet });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#7cd25a" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: (myLocation ?? AMSTERDAM).latitude,
          longitude: (myLocation ?? AMSTERDAM).longitude,
          latitudeDelta: 0.6,
          longitudeDelta: 0.6,
        }}
      >
        {couchLock && myLocation ? (
          <Marker coordinate={myLocation} title={t('map.youCouchLocked')}>
            <Text style={{ fontSize: 28 }}>{COUCH_LOCK_AVATAR}</Text>
          </Marker>
        ) : myLocation ? (
          <Marker coordinate={myLocation} title={t('map.youHere')}>
            <Text style={{ fontSize: 28 }}>🌿</Text>
          </Marker>
        ) : null}

        {friends.map((f) =>
          f.couchLockMode ? null : f.fuzzy ? (
            <Marker
              key={f.uid}
              coordinate={f.fuzzy}
              title={f.displayName}
              onPress={() => onTapFriend(f)}
            >
              <Text style={{ fontSize: 26 }}>{avatarFor(f.uid)}</Text>
            </Marker>
          ) : null,
        )}
      </MapView>

      <Pressable
        onPress={() => toggleCouchLock(!couchLock)}
        className={`absolute right-4 top-12 rounded-full px-4 py-2 ${couchLock ? 'bg-leaf-500' : 'bg-bg-elevated'}`}
        accessibilityRole="switch"
        accessibilityState={{ checked: couchLock }}
      >
        <Text className={couchLock ? 'text-bg' : 'text-haze-200'}>
          {COUCH_LOCK_AVATAR} {t('map.couchLock')}
        </Text>
      </Pressable>

      {activeMeet ? (
        <SafeMeetSheet
          friendName={activeMeet.name}
          meet={activeMeet.meet}
          closeLabel={t('map.close')}
          midpointLabel={t('map.midpoint')}
          distanceLabel={(m) => t('map.metersFromMidpoint', { meters: Math.round(m) })}
          onClose={() => setActiveMeet(null)}
        />
      ) : null}
    </View>
  );
}
