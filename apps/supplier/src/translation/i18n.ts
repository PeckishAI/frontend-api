import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

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

i18next
  .use(initReactI18next)
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
    // lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'language', 'ingredient'],
    defaultNS,
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
