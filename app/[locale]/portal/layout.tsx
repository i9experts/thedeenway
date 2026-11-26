import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { portalDict } from "@/content/portal";
import { isLocale } from "@/lib/i18n";
import { eldermin } from "@/lib/eldermin";
import { portalGuardianId } from "@/lib/portalAuth";
import PortalNav from "@/components/portal/PortalNav";
import { openPreview, signOut } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Parent Portal", robots: { index: false, follow: false } };

export default async function PortalLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = portalDict(locale);
  const { api, mode } = eldermin();
  const guardianId = await portalGuardianId();
  const guardian = guardianId ? await api.getGuardian(guardianId) : null;

  if (!guardian) {
    return (
      <section className="pattern bg-sand py-16 sm:py-24">
        <div className="wrap">
          <div className="mx-auto max-w-2xl text-center">
            <img src="/brand/emblem.png" alt="" width={256} height={256} className="mx-auto h-20 w-20" />
            <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">{t.signIn.title}</h1>
            <p className="mt-4 text-lg text-muted">{t.signIn.lead}</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            {mode === "demo" && (
              <form action={openPreview} className="card flex flex-col p-7">
                <input type="hidden" name="locale" value={locale} />
                <span className="w-fit rounded-full bg-gold-500 px-3 py-0.5 text-sm font-bold text-forest-950">{t.demoBadge}</span>
                <h2 className="mt-4 text-2xl font-semibold">{t.signIn.demoTitle}</h2>
                <p className="mt-2 flex-1 text-muted">{t.signIn.demoText}</p>
                <button className="btn btn-primary mt-6 w-full">{t.signIn.demoCta}</button>
              </form>
            )}
            <div className="card flex flex-col border-dashed p-7">
              <h2 className="text-2xl font-semibold">{t.signIn.realTitle}</h2>
              <p className="mt-2 text-muted">{t.signIn.realText}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="bg-forest-900 text-white">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-semibold text-white">{t.title}</h1>
            {mode === "demo" && <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-bold text-forest-950">{t.demoBadge}</span>}
          </div>
          <form action={signOut} className="flex items-center gap-3 text-sm">
            <input type="hidden" name="locale" value={locale} />
            <span className="text-white/80">{guardian.name}{mode === "demo" ? ` (${t.sample})` : ""}</span>
            <button className="rounded-full border border-white/30 px-3 py-1 font-semibold hover:bg-white/10">{t.signOut}</button>
          </form>
        </div>
      </div>
      {mode === "demo" && (
        <div className="border-b border-gold-300 bg-gold-100">
          <p className="wrap py-2.5 text-sm text-forest-950">{t.demoBanner}</p>
        </div>
      )}
      <Suspense>
        <PortalNav locale={locale} t={t} students={guardian.students.map((s) => ({ id: s.id, name: s.name, className: s.className }))} />
      </Suspense>
      <div className="wrap min-h-[50vh] py-10">{children}</div>
    </>
  );
}
