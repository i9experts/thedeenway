import "server-only";
import { notFound } from "next/navigation";
import { getDict } from "@/content";
import { portalDict } from "@/content/portal";
import { isLocale, type Locale } from "@/lib/i18n";
import { eldermin } from "@/lib/eldermin";
import { portalGuardianId } from "@/lib/portalAuth";

export type PortalProps = { params: Promise<{ locale: string }>; searchParams: Promise<{ child?: string }> };

const dateLocale: Record<Locale, string> = { en: "en-GB", ur: "ur-PK", ar: "ar-EG" };

export function fmtDate(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat(dateLocale[locale], { timeZone: "UTC", ...opts }).format(new Date(iso + (iso.length === 7 ? "-01" : "") + "T00:00:00Z"));
}
export const todayIso = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());

/** Everything a portal page needs. Returns null when nobody is signed in (the layout shows sign-in). */
export async function portalContext(props: PortalProps) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const guardianId = await portalGuardianId();
  if (!guardianId) return null;
  const { api, mode } = eldermin();
  const guardian = await api.getGuardian(guardianId);
  if (!guardian || guardian.students.length === 0) return null;
  const { child } = await props.searchParams;
  // Only ever a child that belongs to this guardian.
  const student = guardian.students.find((s) => s.id === child) ?? guardian.students[0];
  return { locale, t: portalDict(locale), site: getDict(locale), api, mode, guardian, student, q: `?child=${student.id}` };
}
