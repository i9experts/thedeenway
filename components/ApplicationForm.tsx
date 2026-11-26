"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { AdmissionsDict } from "@/content/admissions";
import { DOC_KINDS, DOC_TYPES, MAX_DOC_BYTES, phoneDigits } from "@/lib/admissionsShared";

type Campus = { id: string; name: string };
type Values = Record<
  "child_name" | "dob" | "gender" | "grade" | "campus" | "father_name" | "mother_name" | "phone" | "whatsapp" | "email" | "address" | "prev_school" | "prev_class" | "notes",
  string
>;
type DocKind = (typeof DOC_KINDS)[number];

const empty: Values = { child_name: "", dob: "", gender: "", grade: "", campus: "", father_name: "", mother_name: "", phone: "", whatsapp: "", email: "", address: "", prev_school: "", prev_class: "", notes: "" };

const stepFields: (keyof Values)[][] = [
  ["child_name", "dob", "gender", "grade", "campus"],
  ["father_name", "phone", "email", "address"],
  [],
];

export default function ApplicationForm({ t, grades, campuses, locale, uploads }: { t: AdmissionsDict; grades: string[]; campuses: Campus[]; locale: string; uploads: boolean }) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Values>(empty);
  const [files, setFiles] = useState<Partial<Record<DocKind, File>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [declare, setDeclare] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [appNo, setAppNo] = useState("");
  const top = useRef<HTMLDivElement>(null);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV((s) => ({ ...s, [k]: e.target.value }));

  function check(fields: (keyof Values)[]) {
    const e: Record<string, string> = {};
    for (const k of fields) {
      const val = v[k].trim();
      if (k === "email") {
        if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) e[k] = t.errors.email;
      } else if (!val) e[k] = t.errors.required;
      else if (k === "phone" && (phoneDigits(val).length < 10 || phoneDigits(val).length > 13)) e[k] = t.errors.phone;
      else if (k === "dob") {
        const age = (Date.now() - new Date(val + "T00:00:00Z").getTime()) / (365.25 * 86400000);
        if (!(age >= 1.5 && age <= 20)) e[k] = t.errors.dob;
      }
    }
    return e;
  }

  function scrollTop() {
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    const e = check(stepFields[step] ?? []);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setStep((s) => s + 1);
    scrollTop();
  }

  function pickFile(kind: DocKind, f: File | undefined) {
    setErrors((e) => ({ ...e, [`doc_${kind}`]: "" }));
    if (!f) return setFiles((s) => ({ ...s, [kind]: undefined }));
    if (!DOC_TYPES[f.type] || f.size > MAX_DOC_BYTES) {
      setErrors((e) => ({ ...e, [`doc_${kind}`]: t.errors.file }));
      return;
    }
    setFiles((s) => ({ ...s, [kind]: f }));
  }

  async function submit() {
    if (!declare) return setErrors({ declare: t.errors.declare });
    setErrors({});
    setServerError("");
    setSending(true);
    const body = new FormData();
    body.set("locale", locale);
    for (const [k, val] of Object.entries(v)) body.set(k, val);
    body.set("declare", "on");
    body.set("website", "");
    for (const k of DOC_KINDS) if (files[k]) body.set(`doc_${k}`, files[k]!);
    try {
      const res = await fetch("/api/admissions", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.appNo) {
        setAppNo(data.appNo);
        scrollTop();
      } else if (data.error === "fix" && Array.isArray(data.invalid)) {
        const e: Record<string, string> = {};
        for (const k of data.invalid) e[k] = k === "phone" ? t.errors.phone : k === "dob" ? t.errors.dob : k === "email" ? t.errors.email : t.errors.required;
        setErrors(e);
        const s = stepFields.findIndex((f) => f.some((k) => e[k]));
        if (s >= 0) setStep(s);
        setServerError(t.errors.fix);
      } else setServerError(data.error === "tooMany" ? t.errors.tooMany : data.error === "file" ? t.errors.file : t.errors.server);
    } catch {
      setServerError(t.errors.server);
    } finally {
      setSending(false);
    }
  }

  const input = (k: string) => `mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-forest-600 focus:ring-4 focus:ring-lime-100 ${errors[k] ? "border-red-500" : "border-line"}`;
  const label = "block font-semibold text-forest-900";
  const Err = ({ k }: { k: string }) => (errors[k] ? <p id={`e-${k}`} role="alert" className="mt-1.5 text-sm text-red-700">{errors[k]}</p> : null);
  const Opt = () => <span className="font-normal text-muted"> ({t.optional})</span>;
  const text = (k: keyof Values, lab: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, optional = false, help?: string) => (
    <div>
      <label htmlFor={`f-${k}`} className={label}>{lab}{optional ? <Opt /> : " *"}</label>
      <input id={`f-${k}`} value={v[k]} onChange={set(k)} aria-invalid={!!errors[k] || undefined} aria-describedby={errors[k] ? `e-${k}` : undefined} className={input(k)} {...props} />
      {help && <p className="mt-1.5 text-sm text-muted">{help}</p>}
      <Err k={k} />
    </div>
  );

  if (appNo) {
    return (
      <div ref={top} className="card scroll-mt-40 p-8 text-center sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 text-forest-700">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <h2 className="mt-5 text-3xl font-semibold">{t.success.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted">{t.success.text}</p>
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border-2 border-dashed border-gold-500 bg-gold-100 p-5">
          <p className="text-sm font-semibold text-gold-600">{t.success.appNo}</p>
          <p className="ltr mt-1 select-all font-display text-3xl font-semibold tracking-wide text-forest-950">{appNo}</p>
        </div>
        <p className="mx-auto mt-4 max-w-md text-muted">{t.success.keep}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/${locale}/admissions/status?no=${encodeURIComponent(appNo)}`} className="btn btn-primary">{t.success.track}</Link>
          <button type="button" className="btn btn-ghost" onClick={() => { setAppNo(""); setV({ ...empty, father_name: v.father_name, mother_name: v.mother_name, phone: v.phone, whatsapp: v.whatsapp, email: v.email, address: v.address, campus: v.campus }); setFiles({}); setDeclare(false); setStep(0); }}>{t.success.another}</button>
        </div>
      </div>
    );
  }

  const campusName = campuses.find((c) => c.id === v.campus)?.name ?? "";
  const summary: [number, string, [string, string][]][] = [
    [0, t.steps[0], [[t.child.name, v.child_name], [t.child.dob, v.dob], [t.child.gender, v.gender ? t.child[v.gender as "boy" | "girl"] : ""], [t.child.grade, v.grade], [t.child.campus, campusName]]],
    [1, t.steps[1], [[t.parents.father, v.father_name], [t.parents.mother, v.mother_name], [t.parents.phone, v.phone], [t.parents.whatsapp, v.whatsapp], [t.parents.email, v.email], [t.parents.address, v.address]]],
    [2, t.steps[2], [[t.background.prevSchool, v.prev_school], [t.background.prevClass, v.prev_class], [t.background.notes, v.notes], ...DOC_KINDS.filter((k) => files[k]).map((k): [string, string] => [t.background[k], files[k]!.name])]],
  ];

  return (
    <div ref={top} className="card scroll-mt-40 p-6 sm:p-8">
      {/* Progress */}
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label={t.title}>
        {t.steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <span className={`block h-1.5 rounded-full ${i <= step ? "bg-forest-700" : "bg-line"}`} />
            <span className={`mt-2 block text-sm font-semibold ${i === step ? "text-forest-900" : "text-muted"}`}><span className="ltr">{i + 1}.</span> {s}</span>
          </li>
        ))}
      </ol>

      {serverError && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{serverError}</p>}

      {step === 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">{text("child_name", t.child.name, { autoComplete: "off" })}</div>
          {text("dob", t.child.dob, { type: "date" })}
          <fieldset>
            <legend className={label}>{t.child.gender} *</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              {(["boy", "girl"] as const).map((gk, i) => (
                <label key={gk} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${v.gender === gk ? "border-forest-700 bg-lime-100" : errors.gender ? "border-red-500 bg-white" : "border-line bg-white"}`}>
                  <input id={i === 0 ? "f-gender" : undefined} type="radio" name="gender" value={gk} checked={v.gender === gk} onChange={set("gender")} className="h-4 w-4 accent-[#156a3d]" />
                  <span className="font-semibold text-forest-900">{t.child[gk]}</span>
                </label>
              ))}
            </div>
            <Err k="gender" />
          </fieldset>
          <div>
            <label htmlFor="f-grade" className={label}>{t.child.grade} *</label>
            <select id="f-grade" value={v.grade} onChange={set("grade")} aria-invalid={!!errors.grade || undefined} className={input("grade")}>
              <option value="" disabled>{t.child.gradePlaceholder}</option>
              {grades.map((gr) => <option key={gr} value={gr}>{gr}</option>)}
            </select>
            <Err k="grade" />
          </div>
          <div>
            <label htmlFor="f-campus" className={label}>{t.child.campus} *</label>
            <select id="f-campus" value={v.campus} onChange={set("campus")} aria-invalid={!!errors.campus || undefined} className={input("campus")}>
              <option value="" disabled>—</option>
              {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Err k="campus" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-5 sm:grid-cols-2">
          {text("father_name", t.parents.father, { autoComplete: "name" })}
          {text("mother_name", t.parents.mother, {}, true)}
          {text("phone", t.parents.phone, { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "03XX XXXXXXX", dir: "ltr" }, false, t.parents.phoneHelp)}
          {text("whatsapp", t.parents.whatsapp, { type: "tel", inputMode: "tel", dir: "ltr" }, true)}
          <div className="sm:col-span-2">{text("email", t.parents.email, { type: "email", autoComplete: "email", dir: "ltr" }, true)}</div>
          <div className="sm:col-span-2">{text("address", t.parents.address, { autoComplete: "street-address" })}</div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 sm:grid-cols-2">
          {text("prev_school", t.background.prevSchool, {}, true)}
          {text("prev_class", t.background.prevClass, {}, true)}
          <div className="sm:col-span-2">
            <label htmlFor="f-notes" className={label}>{t.background.notes}<Opt /></label>
            <textarea id="f-notes" rows={3} value={v.notes} onChange={set("notes")} maxLength={1000} className={input("notes")} />
            <p className="mt-1.5 text-sm text-muted">{t.background.notesHelp}</p>
          </div>
          {uploads && (
            <fieldset className="sm:col-span-2">
              <legend className={label}>{t.background.docsTitle}<Opt /></legend>
              <p className="mt-1 text-sm text-muted">{t.background.docsHelp}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {DOC_KINDS.map((k) => (
                  <div key={k} className={`rounded-xl border bg-cream p-3 ${errors[`doc_${k}`] ? "border-red-500" : "border-line"}`}>
                    <label htmlFor={`doc-${k}`} className="block text-sm font-semibold text-forest-900">{t.background[k]}</label>
                    <input id={`doc-${k}`} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => pickFile(k, e.target.files?.[0])} className="mt-2 block w-full text-xs file:me-2 file:rounded-full file:border-0 file:bg-forest-800 file:px-3 file:py-1.5 file:font-semibold file:text-white" />
                    {files[k] && <p className="mt-1.5 truncate text-xs text-forest-700" dir="auto">✓ {files[k]!.name}</p>}
                    <Err k={`doc_${k}`} />
                  </div>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-semibold">{t.review.title}</h2>
          <div className="mt-5 space-y-5">
            {summary.map(([s, title, rows]) => (
              <section key={title} className="rounded-2xl border border-line bg-cream p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <button type="button" onClick={() => setStep(s)} className="text-sm font-semibold text-forest-700 underline-offset-4 hover:underline">{t.review.edit}</button>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {rows.filter(([, val]) => val).map(([k, val]) => (
                    <div key={k}>
                      <dt className="text-sm text-muted">{k}</dt>
                      <dd className="font-semibold text-forest-950" dir="auto">{val}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
          <label className="mt-6 flex items-start gap-3">
            <input type="checkbox" checked={declare} onChange={(e) => setDeclare(e.target.checked)} aria-invalid={!!errors.declare || undefined} className="mt-1.5 h-5 w-5 accent-[#156a3d]" />
            <span>{t.review.declare}</span>
          </label>
          <Err k="declare" />
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? <button type="button" onClick={() => { setStep((s) => s - 1); scrollTop(); }} className="btn btn-ghost">{t.back}</button> : <span />}
        {step < 3 ? (
          <button type="button" onClick={next} className="btn btn-primary">{t.next}</button>
        ) : (
          <button type="button" onClick={submit} disabled={sending} className="btn btn-gold disabled:opacity-60">{sending ? t.submitting : t.submit}</button>
        )}
      </div>
    </div>
  );
}
