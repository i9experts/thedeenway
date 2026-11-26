import { fmtDate, portalContext, todayIso, type PortalProps } from "@/lib/portal";
import { PageTitle, Pill } from "@/components/portal/ui";

export default async function HomeworkPage(props: PortalProps) {
  const c = await portalContext(props);
  if (!c) return null;
  const { t, locale, api, student } = c;
  const today = todayIso();
  const tomorrow = new Date(new Date(today + "T00:00:00Z").getTime() + 86400000).toISOString().slice(0, 10);
  const items = (await api.getHomework(student.id)).sort((a, b) => a.due.localeCompare(b.due));

  return (
    <>
      <PageTitle title={t.homework.title} sub={student.name} />
      {items.length === 0 ? <p className="card p-8 text-center text-muted">{t.homework.none}</p> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((h) => (
            <li key={h.id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-gold-600">{h.subject}</p>
                {h.due === today ? <Pill className="bg-red-100 text-red-800">{t.homework.dueToday}</Pill> : h.due === tomorrow ? <Pill className="bg-gold-100 text-gold-600">{t.homework.dueTomorrow}</Pill> : null}
              </div>
              <p className="mt-2 text-lg font-semibold text-forest-900" dir="auto">{h.title}</p>
              <p className="mt-3 text-sm text-muted">{t.homework.assigned} {fmtDate(h.assigned, locale)} · {t.homework.due} {fmtDate(h.due, locale, { weekday: "short", day: "numeric", month: "short" })}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
