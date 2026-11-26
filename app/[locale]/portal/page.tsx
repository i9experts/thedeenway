import Link from "next/link";
import { fmtDate, portalContext, todayIso, type PortalProps } from "@/lib/portal";
import { money } from "@/lib/format";
import { Pill, Tile, statusStyle } from "@/components/portal/ui";

export default async function PortalHome(props: PortalProps) {
  const c = await portalContext(props);
  if (!c) return null;
  const { t, locale, api, student, guardian, site, q } = c;
  const today = todayIso();
  const [att, hw, terms, invoices, notices] = await Promise.all([
    api.getAttendance(student.id, today.slice(0, 8) + "01", today),
    api.getHomework(student.id),
    api.getTerms(student.id),
    api.getInvoices(student.id),
    api.getAnnouncements(guardian.id),
  ]);
  const attended = att.filter((d) => d.status === "present" || d.status === "late").length;
  const rate = att.length ? Math.round((attended / att.length) * 100) : null;
  const todayRec = att.find((d) => d.date === today);
  const due = invoices.filter((i) => i.status !== "paid");
  const dueTotal = due.reduce((s, i) => s + i.amount, 0);
  const pending = hw.filter((h) => h.due >= today).sort((a, b) => a.due.localeCompare(b.due));
  const term = terms[0];
  const avg = term ? Math.round((term.results.reduce((s, r) => s + r.marks / r.total, 0) / term.results.length) * 100) : null;
  const p = (path: string) => `/${locale}/portal${path}${q}`;

  return (
    <>
      <div className="card flex flex-wrap items-center gap-5 p-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-800 font-display text-2xl font-semibold text-white">{student.name[0]}</span>
        <div className="flex-1">
          <p className="text-sm text-muted">{t.greeting}, {guardian.name}</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">{student.name}</h2>
          <p className="mt-1 text-muted">
            {t.classLabel}: {student.className}-{student.section} · {t.rollNo} <span className="ltr">{student.rollNo}</span> · {t.teacher}: {student.classTeacher} · {site.campusNames[student.campusId]}
          </p>
        </div>
        <div className="text-end">
          <p className="text-sm text-muted">{t.home.today} · {fmtDate(today, locale, { weekday: "long", day: "numeric", month: "long" })}</p>
          {todayRec ? <Pill className={`mt-1 ${statusStyle[todayRec.status]}`}>{t.status[todayRec.status]}</Pill> : <p className="mt-1 text-sm font-semibold text-muted">{t.home.notMarked}</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label={t.home.attendanceMonth} value={rate === null ? "—" : `${rate}%`} sub={`${attended} / ${att.length} ${t.attendance.days}`} />
        <Tile label={t.home.homeworkDue} value={pending.length} />
        <Tile label={t.home.feesDue} value={dueTotal ? `${money(dueTotal, locale)}` : "0"} sub={dueTotal ? `${site.common.pkr} · ${t.fees.due} ${fmtDate(due[0].dueDate, locale)}` : t.home.nothingDue} tone={dueTotal ? "text-gold-600" : ""} />
        <Tile label={t.home.termAverage} value={avg === null ? "—" : `${avg}%`} sub={term?.name} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{t.home.upcomingHomework}</h3>
            <Link href={p("/homework")} className="text-sm font-semibold text-forest-700 hover:underline">{t.viewAll}</Link>
          </div>
          {pending.length === 0 ? <p className="mt-4 text-muted">{t.homework.none}</p> : (
            <ul className="mt-3 divide-y divide-line">
              {pending.slice(0, 4).map((h) => (
                <li key={h.id} className="flex items-start justify-between gap-4 py-3">
                  <div><p className="text-sm font-semibold text-gold-600">{h.subject}</p><p dir="auto">{h.title}</p></div>
                  <p className="shrink-0 text-sm text-muted">{t.homework.due} {fmtDate(h.due, locale)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{t.home.latestNotices}</h3>
            <Link href={p("/notices")} className="text-sm font-semibold text-forest-700 hover:underline">{t.viewAll}</Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {notices.slice(0, 3).map((n) => (
              <li key={n.id} className="py-3">
                <p className="text-sm text-muted">{fmtDate(n.date, locale)}</p>
                <Link href={p("/notices")} className="font-semibold text-forest-900 hover:underline" dir="auto">{n.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
