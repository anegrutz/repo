import * as Localization from 'expo-localization';
import * as Location from 'expo-location';

const ALLOWED_COUNTRIES = ['NL'] as const;

type AllowedCountry = (typeof ALLOWED_COUNTRIES)[number];

export type CountryCode = AllowedCountry | 'UNKNOWN' | string;

export async function resolveCountry(): Promise<CountryCode> {
  const fromLocale = Localization.getLocales()[0]?.regionCode ?? null;
  if (fromLocale) return fromLocale;

  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') return 'UNKNOWN';

  const pos = await Location.getLastKnownPositionAsync();
  if (!pos) return 'UNKNOWN';

  const [reverse] = await Location.reverseGeocodeAsync({
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  });
  return reverse?.isoCountryCode ?? 'UNKNOWN';
}

export function isAllowed(code: CountryCode): code is AllowedCountry {
  return (ALLOWED_COUNTRIES as readonly string[]).includes(code);
}
