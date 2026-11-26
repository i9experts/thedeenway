import { fmtDate, portalContext, type PortalProps } from "@/lib/portal";
import { money } from "@/lib/format";
import { PageTitle, Pill } from "@/components/portal/ui";
import PayButton from "@/components/portal/PayButton";

export default async function Fees(props: PortalProps) {
  const c = await portalContext(props);
  if (!c) return null;
  const { t, locale, api, student, site } = c;
  const invoices = await api.getInvoices(student.id);
  const due = invoices.filter((i) => i.status !== "paid");
  const total = due.reduce((s, i) => s + i.amount, 0);
  const tone = { paid: "bg-lime-100 text-forest-800", due: "bg-gold-100 text-gold-600", overdue: "bg-red-100 text-red-800" };

  return (
    <>
      <PageTitle title={t.fees.title} sub={student.name} />
      <div className={`rounded-[var(--radius-card)] p-6 ${total ? "bg-forest-900 text-white" : "card"}`}>
        {total ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-white/75">{t.fees.outstanding}</p>
              <p className="font-display text-4xl font-semibold text-white">{site.common.pkr} <span className="ltr">{money(total, locale)}</span></p>
              <p className="mt-1 text-sm text-white/75">{t.fees.due} {fmtDate(due[due.length - 1].dueDate, locale, { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <PayButton label={t.fees.payNow} title={t.fees.payTitle} text={t.fees.payText} close={t.fees.close} />
          </div>
        ) : <p className="text-lg font-semibold text-forest-800">{t.fees.allPaid}</p>}
      </div>

      <ul className="mt-6 space-y-3">
        {invoices.map((i) => (
          <li key={i.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold text-forest-900">{t.fees.invoice} · {fmtDate(i.period, locale, { month: "long", year: "numeric" })}</p>
              <p className="text-sm text-muted">
                {i.status === "paid" ? <>{t.fees.paidOn} {fmtDate(i.paidOn!, locale, { day: "numeric", month: "short", year: "numeric" })} · {t.fees.receipt} <span className="ltr">{i.receiptNo}</span></> : <>{t.fees.due} {fmtDate(i.dueDate, locale, { day: "numeric", month: "long" })}</>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-display text-xl font-semibold text-forest-800">{site.common.pkr} <span className="ltr">{money(i.amount, locale)}</span></p>
              <Pill className={tone[i.status]}>{t.fees[i.status]}</Pill>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm text-muted">{t.fees.policy}</p>
    </>
  );
}
