import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, type Dict } from "@/content";
import { isLocale, locales, type Locale } from "@/lib/i18n";

export type LocaleParams = { params: Promise<{ locale: string }> };

export async function load({ params }: LocaleParams): Promise<{ locale: Locale; t: Dict; p: (path: string) => string }> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale, t: getDict(locale), p: (path: string) => `/${locale}${path}` };
}

export function pageMeta(path: string, pick: (t: Dict) => { title: string; description: string }) {
  return async ({ params }: LocaleParams): Promise<Metadata> => {
    const { locale } = await params;
    if (!isLocale(locale)) return {};
    const { title, description } = pick(getDict(locale));
    return {
      title,
      description,
      alternates: {
        canonical: `/${locale}${path}`,
        languages: Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      },
      openGraph: { title, description },
    };
  };
}
