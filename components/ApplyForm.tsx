"use client";

import { useState, type FormEvent } from "react";
import type { Dict } from "@/content/en";
import type { CampusId } from "@/lib/site";

type Campus = { id: CampusId; name: string; whatsapp: string };

export default function ApplyForm({ t, campuses }: { t: Dict["apply"]; campuses: Campus[] }) {
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [campus, setCampus] = useState<CampusId>(campuses[0].id);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const required = ["childName", "dob", "grade", "parentName", "phone"];
    const missing = Object.fromEntries(required.map((k) => [k, !get(k)]));
    const phoneOk = /^[+\d][\d\s-]{8,}$/.test(get("phone"));
    if (!phoneOk) missing.phone = true;
    setErrors(missing);
    if (Object.values(missing).some(Boolean)) {
      const first = required.find((k) => missing[k]);
      if (first) (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    const chosen = campuses.find((c) => c.id === campus) ?? campuses[0];
    const lines = [
      t.waIntro,
      "",
      `${t.childName}: ${get("childName")}`,
      `${t.dob}: ${get("dob")}`,
      `${t.grade}: ${get("grade")}`,
      `${t.campus}: ${chosen.name}`,
      `${t.parentName}: ${get("parentName")}`,
      `${t.phone}: ${get("phone")}`,
    ];
    if (get("message")) lines.push(`${t.message}: ${get("message")}`);
    const url = `https://wa.me/${chosen.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  }

  const field = "mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-base text-ink shadow-sm outline-none transition focus:border-forest-600 focus:ring-4 focus:ring-lime-100";
  const cls = (k: string) => `${field} ${errors[k] ? "border-red-500 ring-4 ring-red-100" : "border-line"}`;
  const label = "block font-semibold text-forest-900";

  return (
    <form onSubmit={onSubmit} noValidate className="card p-6 sm:p-8">
      {Object.values(errors).some(Boolean) && (
        <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{t.required}</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="childName" className={label}>{t.childName} *</label>
          <input id="childName" name="childName" autoComplete="off" className={cls("childName")} aria-invalid={errors.childName || undefined} />
        </div>
        <div>
          <label htmlFor="dob" className={label}>{t.dob} *</label>
          <input id="dob" name="dob" type="date" className={cls("dob")} aria-invalid={errors.dob || undefined} />
        </div>
        <div>
          <label htmlFor="grade" className={label}>{t.grade} *</label>
          <select id="grade" name="grade" defaultValue="" className={cls("grade")} aria-invalid={errors.grade || undefined}>
            <option value="" disabled>{t.gradePlaceholder}</option>
            {t.grades.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <fieldset className="sm:col-span-2">
          <legend className={label}>{t.campus} *</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {campuses.map((c) => (
              <label key={c.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${campus === c.id ? "border-forest-700 bg-lime-100" : "border-line bg-white hover:bg-cream"}`}>
                <input type="radio" name="campus" value={c.id} checked={campus === c.id} onChange={() => setCampus(c.id)} className="h-4 w-4 accent-[#156a3d]" />
                <span className="font-semibold text-forest-900">{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="parentName" className={label}>{t.parentName} *</label>
          <input id="parentName" name="parentName" autoComplete="name" className={cls("parentName")} aria-invalid={errors.parentName || undefined} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>{t.phone} *</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" dir="ltr" className={cls("phone")} aria-invalid={errors.phone || undefined} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={label}>{t.message}</label>
          <textarea id="message" name="message" rows={3} className={cls("message")} />
        </div>
      </div>
      <button type="submit" className="btn mt-7 w-full bg-[#1f8a4c] text-white hover:bg-forest-700 sm:w-auto">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.3-.4.8-1.3a.5.5 0 000-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.8 11.9 11.9 0 004.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 001.9-1.3 2.3 2.3 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z" /></svg>
        {t.submit}
      </button>
      <p className="mt-4 text-sm text-muted">{t.privacy}</p>
    </form>
  );
}
