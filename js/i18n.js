import pl from './data/locales/pl.js';
import en from './data/locales/en.js';

export const LOCALES = { pl, en };
export const DEFAULT_LOCALE = 'pl';
export const LOCALE_STORAGE_KEY = 'tpm-locale';

/** @typedef {'pl' | 'en'} LocaleCode */

/** @returns {LocaleCode} */
export function getStoredLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'pl' || stored === 'en') return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

/** @param {LocaleCode} code */
export function setStoredLocale(code) {
  localStorage.setItem(LOCALE_STORAGE_KEY, code);
}

/** @param {LocaleCode} code */
export function getLocaleBundle(code) {
  return LOCALES[code] ?? LOCALES[DEFAULT_LOCALE];
}

/** @param {string} template @param {Record<string, string|number>} vars */
export function format(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}
