import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PuffMatch',
  slug: 'puffmatch',
  scheme: 'puffmatch',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'cover',
    backgroundColor: '#0b0f0a',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.puffmatch.app',
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'PuffMatch uses your approximate location to show nearby vibes and to suggest a safe meet-up spot. Your exact coordinates are never stored.',
      NSCameraUsageDescription:
        'PuffMatch needs your camera to take profile photos and verify your identity.',
      NSPhotoLibraryUsageDescription:
        'PuffMatch needs access to your photos to set up your profile.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0b0f0a',
    },
    package: 'com.puffmatch.app',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'CAMERA',
      'READ_MEDIA_IMAGES',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow PuffMatch to use your location for nearby discovery.',
      },
    ],
    [
      'expo-build-properties',
      {
        ios: { useFrameworks: 'static' },
        android: { compileSdkVersion: 34, targetSdkVersion: 34, minSdkVersion: 24 },
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    '@react-native-firebase/crashlytics',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: { origin: false },
    eas: {
      projectId: 'REPLACE_WITH_EAS_PROJECT_ID',
    },
    geofence: {
      allowedCountries: ['NL'],
    },
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/REPLACE_WITH_EAS_PROJECT_ID',
  },
});
