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

// i18next.on('languageChanged', function (lng) {
// localStorage.setItem('lng', lng);
// });
const languageDetector = new LanguageDetector(null, {
  order: ['localStorage', 'querystring', 'navigator'],
  caches: [], // don't cache auto
});

i18next
  .use(initReactI18next)
  .use(languageDetector)

  // .use({
  //   type: 'languageDetector',
  //   init: () => {},
  //   detect: () => {
  //     const [languageCode] = Localization.locale.split('-');
  //     return languageCode;
  //   },
  // })
  .init({
    debug: process.env.NODE_ENV !== 'production',
    // lng: 'fr',
    fallbackLng: 'en',
    ns: ['common', 'language', 'scan', 'overview'],
    defaultNS,
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
