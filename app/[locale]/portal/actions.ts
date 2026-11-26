"use server";

import { redirect } from "next/navigation";
import { DEMO_GUARDIAN_ID, eldermin } from "@/lib/eldermin";
import { isLocale } from "@/lib/i18n";
import { endPortalSession, startPortalSession } from "@/lib/portalAuth";

export async function openPreview(formData: FormData) {
  const locale = String(formData.get("locale"));
  if (!isLocale(locale)) return;
  // Only the sample family can be opened this way, and only while the portal is in demo mode.
  if (eldermin().mode === "demo") await startPortalSession(DEMO_GUARDIAN_ID);
  redirect(`/${locale}/portal`);
}

export async function signOut(formData: FormData) {
  const locale = String(formData.get("locale"));
  await endPortalSession();
  redirect(`/${isLocale(locale) ? locale : "en"}/portal`);
}
