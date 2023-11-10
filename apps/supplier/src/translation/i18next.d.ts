import { resources } from './i18n';
import { TranslationTyping } from 'shared-translation';

declare module 'i18next' {
  interface CustomTypeOptions extends TranslationTyping {
    resources: TranslationTyping['resources'] & (typeof resources)['en'];
  }
}
