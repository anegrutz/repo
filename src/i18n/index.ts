import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import nl from './nl.json';
import en from './en.json';

let initialized = false;

export function initI18n(): typeof i18n {
  if (initialized) return i18n;
  const locale = Localization.getLocales()[0]?.languageCode ?? 'nl';
  void i18n.use(initReactI18next).init({
    resources: {
      nl: { translation: nl },
      en: { translation: en },
    },
    lng: locale.startsWith('nl') ? 'nl' : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });
  initialized = true;
  return i18n;
}
