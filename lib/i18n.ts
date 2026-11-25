export const locales = ["en", "ur", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeInfo: Record<Locale, { name: string; dir: "ltr" | "rtl"; htmlLang: string }> = {
  en: { name: "English", dir: "ltr", htmlLang: "en" },
  ur: { name: "اردو", dir: "rtl", htmlLang: "ur" },
  ar: { name: "العربية", dir: "rtl", htmlLang: "ar" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
