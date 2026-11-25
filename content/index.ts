import type { Locale } from "@/lib/i18n";
import en, { type Dict } from "./en";
import ur from "./ur";
import ar from "./ar";

const dicts: Record<Locale, Dict> = { en, ur, ar };

export function getDict(locale: Locale): Dict {
  return dicts[locale];
}
export type { Dict };
