import i18next, { addRessources } from 'shared-translation';

import en from './en';
import fr from './fr';

export const resources = {
  fr,
  en,
} as const;

addRessources(resources);

export default i18next;
