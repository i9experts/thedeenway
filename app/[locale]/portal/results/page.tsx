import { fmtDate, portalContext, type PortalProps } from "@/lib/portal";
import { PageTitle } from "@/components/portal/ui";

export default async function Results(props: PortalProps) {
  const c = await portalContext(props);
  if (!c) return null;
  const { t, locale, api, student } = c;
  const terms = await api.getTerms(student.id);

  return (
    <>
      <PageTitle title={t.results.title} sub={student.name} />
      {terms.length === 0 ? <p className="card p-8 text-center text-muted">{t.results.none}</p> : terms.map((term) => {
        const got = term.results.reduce((s, r) => s + r.marks, 0);
        const total = term.results.reduce((s, r) => s + r.total, 0);
        return (
          <section key={term.id} className="card overflow-hidden">
            <div className="flex flex-wrap items-end justify-between gap-3 p-6">
              <div>
                <h3 className="text-2xl font-semibold">{term.name}</h3>
                <p className="text-sm text-muted">{t.results.published} {fmtDate(term.published, locale, { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <p className="ltr font-display text-4xl font-semibold text-forest-800">{Math.round((got / total) * 100)}%</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem]">
                <thead>
                  <tr className="bg-forest-800 text-white">
                    <th scope="col" className="px-6 py-3 text-start font-semibold">{t.results.subject}</th>
                    <th scope="col" className="px-6 py-3 text-start font-semibold">{t.results.marks}</th>
                    <th scope="col" className="px-6 py-3 text-start font-semibold">{t.results.grade}</th>
                  </tr>
                </thead>
                <tbody>
                  {term.results.map((r) => (
                    <tr key={r.subject} className="border-t border-line even:bg-cream">
                      <th scope="row" className="px-6 py-3.5 text-start font-semibold text-forest-900">{r.subject}</th>
                      <td className="px-6 py-3.5">
                        <span className="ltr">{r.marks} / {r.total}</span>
                        <span className="mt-1.5 block h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-forest-600" style={{ width: `${(r.marks / r.total) * 100}%` }} /></span>
                      </td>
                      <td className="ltr px-6 py-3.5 font-semibold">{r.grade}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-forest-800 font-semibold">
                    <th scope="row" className="px-6 py-3.5 text-start">{t.results.total}</th>
                    <td className="ltr px-6 py-3.5">{got} / {total}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="border-t border-line bg-gold-100 p-6">
              <p className="text-sm font-semibold text-gold-600">{t.results.remark}</p>
              <p className="mt-1 text-forest-950">{term.remark}</p>
            </div>
          </section>
        );
      })}
    </>
  );
}
