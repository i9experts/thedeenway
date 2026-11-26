"use client";

import { useState, type FormEvent } from "react";
import type { PortalDict } from "@/content/portal";

export default function ConsentForm({ t, students }: { t: PortalDict["notices"]; students: string[] }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  if (done) return <p role="status" className="mt-4 rounded-xl border border-lime-400 bg-lime-100 px-4 py-3 text-forest-900">{t.thanks}</p>;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("guardian") ?? "").trim();
    if (!name) return setError(true);
    setDone(true);
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4 rounded-2xl border border-line bg-cream p-5">
      <h4 className="text-lg font-semibold">{t.consentTitle}</h4>
      {students.map((s) => (
        <fieldset key={s} className="mt-4">
          <legend className="font-semibold text-forest-900">{t.consentFor} {s}</legend>
          <label className="mt-2 flex items-start gap-2.5"><input type="checkbox" name={`p-${s}`} defaultChecked className="mt-1.5 h-4 w-4 accent-[#156a3d]" /><span>{t.participate}</span></label>
          <label className="mt-1.5 flex items-start gap-2.5"><input type="checkbox" name={`m-${s}`} className="mt-1.5 h-4 w-4 accent-[#156a3d]" /><span>{t.media}</span></label>
        </fieldset>
      ))}
      <label htmlFor="guardian" className="mt-5 block font-semibold text-forest-900">{t.guardianName}</label>
      <input id="guardian" name="guardian" autoComplete="name" aria-invalid={error || undefined} className={`mt-1.5 block w-full max-w-sm rounded-xl border bg-white px-4 py-2.5 outline-none focus:border-forest-600 focus:ring-4 focus:ring-lime-100 ${error ? "border-red-500" : "border-line"}`} />
      {error && <p role="alert" className="mt-1.5 text-sm text-red-700">{t.required}</p>}
      <button className="btn btn-primary mt-5">{t.submit}</button>
    </form>
  );
}
