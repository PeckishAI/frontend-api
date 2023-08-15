import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en';
import fr from './fr';

export const defaultNS = 'common';
export const resources = {
  fr,
  en,
} as const;
export const availableLanguages = ['en', 'fr'];

// i18next.on('languageChanged', function (lng) {
//   // localStorage.setItem('lng', lng);
//   console.log('change language');
// });

const languageDetector = new LanguageDetector(null, {
  order: ['localStorage', 'querystring', 'navigator'],
  caches: [], // don't cache auto
});

i18next
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    debug: process.env.NODE_ENV !== 'production',
    // lng: 'fr',
    fallbackLng: 'en',
    ns: ['common', 'language', 'scan'],
    defaultNS,
    resources,
    interpolation: {
      escapeValue: false,
    },
    // detector: {},
  });

export default i18next;
