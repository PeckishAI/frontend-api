import i18next, { Resource } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';

import en from './translations/en';
import fr from './translations/fr';

type Languages = 'fr' | 'en';

export const defaultNS = 'common';
export const resources = {
  fr,
  en,
} as const;

// Configure dayjs
dayjs.extend(localeData);
dayjs.extend(updateLocale);

// Lazy loading of dayjs locales
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

i18next.on('languageChanged', function (lng: Languages) {
  // Update dayjs locale when i18next language change
  if (!dayjsLocales[lng]) return;

  dayjsLocales[lng]().then(() => {
    dayjs.locale(lng);
  });
});

// Detect language using navigator. First from localStorage, then from querystring, otherwise from navigator
// Convert the detected language to the first part of the language (e.g. 'fr-FR' => 'fr')
// Local storage is used to store the language if the user has changed it (not yet implemented)
// You can use the querystring to force the language (e.g. ?lng=fr) for testing purposes
const languageDetector = new LanguageDetector(null, {
  order: ['localStorage', 'querystring', 'navigator'],
  lookupQuerystring: 'lng',
  caches: [], // don't cache auto
  convertDetectedLanguage: (lng) => lng.split('-')[0],
});

i18next
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    debug: process.env.NODE_ENV !== 'production',
    // lng: 'fr',
    fallbackLng: 'en',
    ns: ['common', 'language'],
    defaultNS,
    resources,
    interpolation: {
      escapeValue: false,
    },
    keySeparator: '.',
  });

export default i18next;

/**
 * This function is used to add resources to i18next. It add the new namespaces for each language provided.
 * The namespaces are merged if they already exist.
 * @param resources The resources to add. It must be an object that contains the languages as keys of the first level, and the namespaces as keys of the second level (like the resources object in i18next)
 */
export const addRessources = (resources: Resource) => {
  Object.keys(resources).forEach((language) => {
    // For each namespace in resources[language]
    const lng = language as Languages;
    Object.keys(resources[lng]).forEach((namespace) => {
      // Add the resource bundle for the current lng and namespace
      i18next.addResourceBundle(lng, namespace, resources[lng][namespace]);
    });
  });
};

/**
 * This type is used to add shared resources to i18next module declaration.
 *
 * Here is an example of how to declare the module overloading (it allow the the type completion of the translations key):
 * @example
 *  declare module 'i18next' {
 *    interface CustomTypeOptions extends TranslationTyping {
 *      resources: TranslationTyping['resources'] & (typeof resources)['en'];
 *    }
 *  }
 *
 * @description with "resources" variable that is the resources object of the app
 */
export interface TranslationTyping {
  defaultNS: typeof defaultNS;
  resources: (typeof resources)['en'];
}
