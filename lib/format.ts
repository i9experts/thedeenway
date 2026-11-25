import type { Locale } from "./i18n";

const numberLocale: Record<Locale, string> = { en: "en-PK", ur: "ur-PK", ar: "ar-EG" };

export function money(amount: number, locale: Locale) {
  return new Intl.NumberFormat(numberLocale[locale]).format(amount);
}

export function href(locale: Locale, path = "") {
  return `/${locale}${path}`;
}
