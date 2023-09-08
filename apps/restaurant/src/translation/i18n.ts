import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import en from './en';
import fr from './fr';

dayjs.extend(localeData);
dayjs.extend(updateLocale);

export const defaultNS = 'common';
export const resources = {
  fr,
  en,
} as const;

const dayjsLocales = {
  fr: () => import('dayjs/locale/fr'),
  en: () => import('dayjs/locale/en'),
};

dayjs.updateLocale('fr', {
  calendar: {
    sameDay: "[Aujourd'hui à] H:mm",
    nextDay: '[Demain à] H:mm',
    nextWeek: 'dddd [prochain]',
    lastDay: '[Hier à] H:mm',
    lastWeek: 'dddd [dernier]',
    sameElse: 'YYYY-MM-DD',
  },
});

i18next.on('languageChanged', function (lng: 'fr' | 'en') {
  dayjsLocales[lng]().then(() => {
    dayjs.locale(lng);
  });
});

const languageDetector = new LanguageDetector(null, {
  order: ['localStorage', 'querystring', 'navigator'],
  caches: [], // don't cache auto
  convertDetectedLanguage: (lng) => lng.split('-')[0],
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
    ns: ['common', 'language', 'ingredient'],
    defaultNS,
    resources,
    interpolation: {
      escapeValue: false,
    },
    keySeparator: '.',
  });

export default i18next;
