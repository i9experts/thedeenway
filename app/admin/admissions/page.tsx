import Link from "next/link";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/Shell";
import { isAdmin } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { countNew, listApplications, type Application } from "@/lib/admissions";
import { CAMPUS_IDS, STATUSES, statusLabelEn } from "@/lib/admissionsShared";
import en from "@/content/en";
import { statusTone } from "@/components/admin/statusTone";

export const dynamic = "force-dynamic";

export default async function AdminAdmissions({ searchParams }: { searchParams: Promise<{ status?: string; campus?: string; q?: string }> }) {
  if (!(await isAdmin())) redirect("/admin?e=session");
  if (!dbConfigured()) redirect("/admin");
  const f = await searchParams;
  const filters = {
    status: (STATUSES as readonly string[]).includes(f.status ?? "") ? f.status : undefined,
    campus: (CAMPUS_IDS as readonly string[]).includes(f.campus ?? "") ? f.campus : undefined,
    q: f.q?.trim().slice(0, 60) || undefined,
  };
  let apps: Application[] = [];
  let fresh = 0;
  let failed = false;
  try {
    [apps, fresh] = await Promise.all([listApplications(filters), countNew()]);
  } catch (e) {
    console.error(e);
    failed = true;
  }
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();
  const select = "rounded-lg border border-line bg-white px-3 py-2 text-sm";

  return (
    <AdminShell signedIn tab="admissions" newApplications={fresh}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Admissions</h1>
          <p className="mt-1 text-muted">Applications sent through the website. {fresh > 0 ? `${fresh} new, waiting for a first look.` : "No new applications waiting."}</p>
        </div>
        <a href={`/admin/admissions/export${qs ? `?${qs}` : ""}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-cream">Download as spreadsheet (CSV)</a>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-3">
        <input name="q" defaultValue={filters.q} placeholder="Search name, phone or number" aria-label="Search" className={`${select} w-64`} />
        <select name="status" defaultValue={filters.status ?? ""} aria-label="Status" className={select}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabelEn[s]}</option>)}
        </select>
        <select name="campus" defaultValue={filters.campus ?? ""} aria-label="Campus" className={select}>
          <option value="">All campuses</option>
          {CAMPUS_IDS.map((c) => <option key={c} value={c}>{en.campusNames[c]}</option>)}
        </select>
        <button className="rounded-full bg-forest-800 px-4 py-2 text-sm font-semibold text-white">Filter</button>
        {qs && <Link href="/admin/admissions" className="text-sm font-semibold text-forest-700 hover:underline">Clear</Link>}
      </form>

      {failed ? (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">The database could not be reached. Check the Postgres service in Railway.</p>
      ) : apps.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-muted">{qs ? "No applications match these filters." : "No applications yet. They will appear here as parents apply on the website."}</div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="bg-forest-800 text-start text-white">
                {["Number", "Received", "Child", "Class", "Campus", "Parent", "Status"].map((h) => <th key={h} scope="col" className="px-4 py-3 text-start font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} className="border-t border-line hover:bg-cream">
                  <td className="px-4 py-3"><Link href={`/admin/admissions/${a.id}`} className="font-semibold text-forest-700 hover:underline">{a.app_no}</Link></td>
                  <td className="px-4 py-3 text-muted">{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Karachi" }).format(a.created_at)}</td>
                  <td className="px-4 py-3 font-semibold" dir="auto">{a.child_name}</td>
                  <td className="px-4 py-3" dir="auto">{a.grade}</td>
                  <td className="px-4 py-3">{en.campusNames[a.campus as keyof typeof en.campusNames] ?? a.campus}</td>
                  <td className="px-4 py-3"><span dir="auto">{a.father_name}</span><br /><span className="text-muted">{a.phone}</span></td>
                  <td className="px-4 py-3"><span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 font-semibold ${statusTone[a.status]}`}>{statusLabelEn[a.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
