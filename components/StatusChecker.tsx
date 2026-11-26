"use client";

import { useState, type FormEvent } from "react";
import type { AdmissionsDict } from "@/content/admissions";
import type { AppStatus } from "@/lib/admissionsShared";

type Result = { appNo: string; childName: string; grade: string; campus: string; status: AppStatus; submittedAt: string; assessmentAt: string; message: string; history: { at: string; status: AppStatus }[] };

const tone: Partial<Record<AppStatus, string>> = { offered: "bg-lime-100 text-forest-800", enrolled: "bg-lime-100 text-forest-800", not_offered: "bg-red-100 text-red-800", withdrawn: "bg-line text-muted" };

export default function StatusChecker({ t, campusNames, dateLocale, initialNo }: { t: AdmissionsDict; campusNames: Record<string, string>; dateLocale: string; initialNo: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [r, setR] = useState<Result | null>(null);
  const date = (iso: string, withTime = false) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "long", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) }).format(d);
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setR(null);
    try {
      const res = await fetch("/api/admissions/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appNo: f.get("appNo"), phone: f.get("phone") }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setR(data);
      else setError(data.error === "tooMany" ? t.errors.tooMany : data.error === "notFound" ? t.status.notFound : t.errors.server);
    } catch {
      setError(t.errors.server);
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-1.5 block w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-forest-600 focus:ring-4 focus:ring-lime-100";
  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={submit} className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <label htmlFor="appNo" className="block font-semibold text-forest-900">{t.status.appNo}</label>
          <input id="appNo" name="appNo" required defaultValue={initialNo} placeholder="TDS-2026-00001" dir="ltr" autoCapitalize="characters" className={field} />
        </div>
        <div>
          <label htmlFor="sphone" className="block font-semibold text-forest-900">{t.status.phone}</label>
          <input id="sphone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="03XX XXXXXXX" dir="ltr" className={field} />
        </div>
        <button disabled={busy} className="btn btn-primary sm:col-span-2 disabled:opacity-60">{busy ? t.status.checking : t.status.check}</button>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 sm:col-span-2">{error}</p>}
      </form>

      {r && (
        <section className="card mt-6 overflow-hidden" aria-live="polite">
          <div className="bg-forest-900 p-6 text-white sm:p-8">
            <p className="ltr text-sm text-white/70">{r.appNo}</p>
            <h2 className="mt-1 text-2xl font-semibold text-white" dir="auto">{r.childName}</h2>
            <p className="mt-1 text-white/80"><span dir="auto">{r.grade}</span> · {campusNames[r.campus] ?? r.campus}</p>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold text-muted">{t.status.current}</p>
            <p className={`mt-1.5 inline-block rounded-full px-4 py-1.5 text-lg font-semibold ${tone[r.status] ?? "bg-gold-100 text-gold-600"}`}>{t.statuses[r.status]}</p>
            <p className="mt-3 text-lg">{t.statusHelp[r.status]}</p>

            {r.assessmentAt && (
              <div className="mt-5 rounded-2xl border border-gold-300 bg-gold-100 p-4">
                <p className="text-sm font-semibold text-gold-600">{t.status.assessment}</p>
                <p className="mt-0.5 text-lg font-semibold text-forest-950">{date(r.assessmentAt, true)}</p>
              </div>
            )}
            {r.message && (
              <div className="mt-5 rounded-2xl border border-line bg-cream p-4">
                <p className="text-sm font-semibold text-muted">{t.status.message}</p>
                <p className="mt-1 whitespace-pre-line" dir="auto">{r.message}</p>
              </div>
            )}

            <h3 className="mt-7 text-lg font-semibold">{t.status.timeline}</h3>
            <ol className="mt-3 space-y-3 border-s-2 border-line ps-5">
              {r.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -start-[1.72rem] top-1.5 h-3 w-3 rounded-full ${i === r.history.length - 1 ? "bg-gold-500" : "bg-forest-700"}`} aria-hidden="true" />
                  <p className="font-semibold text-forest-900">{t.statuses[h.status]}</p>
                  <p className="text-sm text-muted">{date(h.at)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
