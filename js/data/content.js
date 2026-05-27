/** Re-export active locale data (legacy import path). */
export {
  getStoredLocale,
  getLocaleBundle,
  DEFAULT_LOCALE,
} from '../i18n.js';

import { getStoredLocale, getLocaleBundle } from '../i18n.js';

const bundle = getLocaleBundle(getStoredLocale());

export const config = bundle.config;
export const overviewCards = bundle.overviewCards;
export const roles = bundle.roles;
export const roleLabels = bundle.roleLabels;
export const trainingMatrix = bundle.trainingMatrix;
export const trainingHours = bundle.trainingHours;
export const competencyDomains = bundle.competencyDomains;
export const phases = bundle.phases;
export const artifacts = bundle.artifacts;
export const readinessChecklist = bundle.readinessChecklist;
