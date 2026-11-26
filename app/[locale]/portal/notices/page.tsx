import { fmtDate, portalContext, type PortalProps } from "@/lib/portal";
import { PageTitle } from "@/components/portal/ui";
import ConsentForm from "@/components/portal/ConsentForm";

export default async function Notices(props: PortalProps) {
  const c = await portalContext(props);
  if (!c) return null;
  const { t, locale, api, guardian } = c;
  const notices = await api.getAnnouncements(guardian.id);

  return (
    <>
      <PageTitle title={t.notices.title} sub={guardian.name} />
      <ul className="space-y-4">
        {notices.map((n) => (
          <li key={n.id} className="card p-6">
            <p className="text-sm text-muted">{fmtDate(n.date, locale, { weekday: "long", day: "numeric", month: "long" })}</p>
            <h3 className="mt-1 text-xl font-semibold" dir="auto">{n.title}</h3>
            <p className="mt-2 text-muted" dir="auto">{n.body}</p>
            {n.href && <a href={n.href} className="mt-3 inline-block font-semibold text-forest-700 hover:underline">{t.notices.details} →</a>}
            {n.consent && <ConsentForm t={t.notices} students={guardian.students.map((s) => s.name)} />}
          </li>
        ))}
      </ul>
    </>
  );
}
