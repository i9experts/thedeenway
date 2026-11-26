import { fmtDate, portalContext, todayIso, type PortalProps } from "@/lib/portal";
import { PageTitle, Pill, Tile, statusStyle } from "@/components/portal/ui";
import type { AttendanceDay } from "@/lib/eldermin/types";

export default async function Attendance(props: PortalProps) {
  const c = await portalContext(props);
  if (!c) return null;
  const { t, locale, api, student } = c;
  const today = todayIso();
  const start = new Date(today + "T00:00:00Z");
  start.setUTCMonth(start.getUTCMonth() - 2, 1);
  const from = start.toISOString().slice(0, 10);
  const days = await api.getAttendance(student.id, from, today);
  const count = (s: AttendanceDay["status"]) => days.filter((d) => d.status === s).length;
  const rate = days.length ? Math.round(((count("present") + count("late")) / days.length) * 100) : 0;
  const byMonth = new Map<string, AttendanceDay[]>();
  for (const d of days) byMonth.set(d.date.slice(0, 7), [...(byMonth.get(d.date.slice(0, 7)) ?? []), d]);
  const exceptions = days.filter((d) => d.status !== "present").reverse();

  return (
    <>
      <PageTitle title={t.attendance.title} sub={student.name} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Tile label={t.attendance.rate} value={`${rate}%`} sub={`${days.length} ${t.attendance.days}`} />
        {(["present", "late", "absent", "leave"] as const).map((s) => <Tile key={s} label={t.status[s]} value={count(s)} />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[...byMonth.entries()].reverse().map(([month, list]) => {
          const byDate = new Map(list.map((d) => [d.date, d]));
          const first = new Date(month + "-01T00:00:00Z");
          const cells: (AttendanceDay | { date: string; status: null } | null)[] = [];
          for (let d = new Date(first); d.getUTCMonth() === first.getUTCMonth(); d.setUTCDate(d.getUTCDate() + 1)) {
            const dow = d.getUTCDay();
            if (dow === 0 || dow === 6) continue;
            if (cells.length === 0) for (let k = 1; k < dow; k++) cells.push(null);
            const iso = d.toISOString().slice(0, 10);
            cells.push(byDate.get(iso) ?? { date: iso, status: null });
          }
          return (
            <section key={month} className="card p-5">
              <h3 className="text-lg font-semibold">{fmtDate(month, locale, { month: "long", year: "numeric" })}</h3>
              <div className="mt-3 grid grid-cols-5 gap-1.5 text-center text-xs text-muted">
                {t.attendance.weekdays.map((w) => <span key={w}>{w}</span>)}
                {cells.map((cell, i) =>
                  cell === null ? <span key={i} /> : (
                    <span key={i} title={cell.status ? t.status[cell.status] : undefined} className={`ltr flex aspect-square items-center justify-center rounded-lg text-sm font-semibold ${cell.status ? statusStyle[cell.status] : "bg-cream text-muted/60"}`}>
                      {Number(cell.date.slice(8))}
                      {cell.status && <span className="sr-only"> {t.status[cell.status]}</span>}
                    </span>
                  ),
                )}
              </div>
            </section>
          );
        })}
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {(["present", "late", "absent", "leave"] as const).map((s) => <li key={s}><Pill className={statusStyle[s]}>{t.status[s]}</Pill></li>)}
      </ul>

      <section className="card mt-6 p-6">
        <h3 className="text-xl font-semibold">{t.attendance.recent}</h3>
        {exceptions.length === 0 ? <p className="mt-3 text-muted">{t.attendance.none}</p> : (
          <ul className="mt-3 divide-y divide-line">
            {exceptions.map((d) => (
              <li key={d.date} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>{fmtDate(d.date, locale, { weekday: "short", day: "numeric", month: "long" })}</span>
                <Pill className={statusStyle[d.status]}>{t.status[d.status]}</Pill>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm text-muted">{t.attendance.report}</p>
      </section>
    </>
  );
}
