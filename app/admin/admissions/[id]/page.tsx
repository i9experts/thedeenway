import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminShell from "@/components/admin/Shell";
import { statusTone } from "@/components/admin/statusTone";
import { isAdmin } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { getApplication } from "@/lib/admissions";
import { STATUSES, phoneDigits, statusLabelEn } from "@/lib/admissionsShared";
import en from "@/content/en";
import { saveApplication } from "../../actions";

export const dynamic = "force-dynamic";

const docLabel: Record<string, string> = { birth: "Birth certificate / B-Form", photo: "Photograph", report: "School report" };
const when = (d: Date | string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Karachi" }).format(new Date(d));

function waLink(phone: string, text: string) {
  let d = phoneDigits(phone);
  if (d.startsWith("0")) d = "92" + d.slice(1);
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

export default async function ApplicationDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  if (!(await isAdmin())) redirect("/admin?e=session");
  if (!dbConfigured()) redirect("/admin");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const a = await getApplication(id);
  if (!a) notFound();
  const { saved } = await searchParams;
  const campus = en.campusNames[a.campus as keyof typeof en.campusNames] ?? a.campus;
  const rows: [string, string][] = [
    ["Date of birth", a.dob],
    ["Gender", a.gender === "girl" ? "Girl" : "Boy"],
    ["Class applying for", a.grade],
    ["Campus", campus],
    ["Father / guardian", a.father_name],
    ["Mother", a.mother_name],
    ["Mobile", a.phone],
    ["WhatsApp", a.whatsapp],
    ["Email", a.email],
    ["Address", a.address],
    ["Previous school", a.prev_school],
    ["Last class", a.prev_class],
    ["Form language", a.locale],
  ];
  const input = "mt-1.5 block w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-forest-600 focus:ring-4 focus:ring-lime-100";
  const greeting = `Assalamu Alaikum. This is The Deenway School admissions office, regarding application ${a.app_no} for ${a.child_name}.`;

  return (
    <AdminShell signedIn tab="admissions">
      <Link href="/admin/admissions" className="text-sm font-semibold text-forest-700 hover:underline">← All applications</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold" dir="auto">{a.child_name}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusTone[a.status]}`}>{statusLabelEn[a.status]}</span>
      </div>
      <p className="mt-1 text-muted">{a.app_no} · received {when(a.created_at)}</p>
      {saved && <p role="status" className="mt-5 rounded-xl border border-lime-400 bg-lime-100 px-4 py-3 text-forest-900">Changes saved. The parent sees the new status on the tracking page.</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-xl font-semibold">Application</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm text-muted">{k}</dt>
                  <dd className="font-semibold text-forest-950" dir="auto">{v}</dd>
                </div>
              ))}
            </dl>
            {a.notes && (
              <div className="mt-5 rounded-xl border border-gold-300 bg-gold-100 p-4">
                <p className="text-sm font-semibold text-gold-600">Medical / support needs (confidential)</p>
                <p className="mt-1 whitespace-pre-line" dir="auto">{a.notes}</p>
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={waLink(a.whatsapp || a.phone, greeting)} target="_blank" rel="noopener" className="rounded-full bg-[#1f8a4c] px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700">WhatsApp the parent</a>
              <a href={`tel:${a.phone}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-cream">Call {a.phone}</a>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-semibold">Documents</h2>
            {a.docs.length === 0 ? <p className="mt-2 text-muted">No documents were uploaded with this application.</p> : (
              <ul className="mt-3 space-y-2">
                {a.docs.map((d) => (
                  <li key={d.file}>
                    <a href={`/admin/admissions/doc/${d.file}`} target="_blank" className="font-semibold text-forest-700 hover:underline">{docLabel[d.kind] ?? d.kind}</a>
                    <span className="text-sm text-muted" dir="auto"> · {d.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-semibold">History</h2>
            <ol className="mt-3 space-y-2">
              {a.history.map((h, i) => (
                <li key={i} className="flex justify-between gap-4"><span className="font-semibold">{statusLabelEn[h.status]}</span><span className="text-sm text-muted">{when(h.at)}</span></li>
              ))}
            </ol>
          </section>
        </div>

        <form action={saveApplication} className="card h-fit p-6 lg:sticky lg:top-6">
          <input type="hidden" name="id" value={a.id} />
          <h2 className="text-xl font-semibold">Update</h2>
          <label htmlFor="status" className="mt-4 block font-semibold text-forest-900">Status</label>
          <select id="status" name="status" defaultValue={a.status} className={input}>
            {STATUSES.map((s) => <option key={s} value={s}>{statusLabelEn[s]}</option>)}
          </select>
          <label htmlFor="assessment_at" className="mt-4 block font-semibold text-forest-900">Assessment date and time</label>
          <input id="assessment_at" name="assessment_at" type="datetime-local" defaultValue={a.assessment_at.slice(0, 16)} className={input} />
          <p className="mt-1 text-xs text-muted">Pakistan time. Shown to the parent on the tracking page.</p>
          <label htmlFor="public_message" className="mt-4 block font-semibold text-forest-900">Message to the parent</label>
          <textarea id="public_message" name="public_message" rows={3} maxLength={1000} defaultValue={a.public_message} className={input} placeholder="e.g. Please bring the B-Form and two photographs." />
          <p className="mt-1 text-xs text-muted">Visible to the parent on the tracking page.</p>
          <label htmlFor="internal_note" className="mt-4 block font-semibold text-forest-900">Internal note</label>
          <textarea id="internal_note" name="internal_note" rows={3} maxLength={2000} defaultValue={a.internal_note} className={input} />
          <p className="mt-1 text-xs text-muted">Staff only. Never shown to the parent.</p>
          <button className="btn btn-primary mt-6 w-full">Save</button>
        </form>
      </div>
    </AdminShell>
  );
}
