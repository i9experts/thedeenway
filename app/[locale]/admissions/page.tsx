import Link from "next/link";
import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { downloads, fees } from "@/lib/site";
import { money } from "@/lib/format";
import { Arrow, Check, DownloadIcon, PageHero, Section, SectionHead } from "@/components/blocks";

export const generateMetadata = pageMeta("/admissions", (t) => ({ title: t.nav.admissions, description: t.admissions.lead }));

export default async function Admissions(props: LocaleParams) {
  const { locale, t, p } = await load(props);
  const a = t.admissions;

  return (
    <>
      <PageHero eyebrow={a.eyebrow} title={a.title} lead={a.lead} image="reading">
        <Link href={p("/admissions/apply")} className="btn btn-primary">{t.common.applyNow} <Arrow /></Link>
        <a href="#fees" className="btn btn-ghost">{a.feesTitle}</a>
      </PageHero>

      {/* Steps */}
      <Section>
        <SectionHead title={a.stepsTitle} />
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {a.steps.map((s, i) => (
            <li key={s.title} className="card relative p-6 pt-8">
              <span className="absolute -top-4 start-6 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-display font-semibold text-forest-950">{i + 1}</span>
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 rounded-2xl border border-line bg-white px-5 py-4 text-muted">{a.confirmNote}</p>
      </Section>

      {/* Fees */}
      <Section tint id="fees">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHead title={a.feesTitle} lead={a.feesYear} />
            <div className="card mt-8 overflow-x-auto">
              <table className="w-full min-w-[30rem] text-start">
                <thead>
                  <tr className="bg-forest-800 text-white">
                    <th scope="col" className="px-5 py-3.5 text-start font-semibold">&nbsp;</th>
                    <th scope="col" className="px-5 py-3.5 text-start font-semibold">{a.feeAdmission}</th>
                    <th scope="col" className="px-5 py-3.5 text-start font-semibold">{a.feeMonthly}</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((f) => (
                    <tr key={f.stage} className="border-t border-line even:bg-cream">
                      <th scope="row" className="px-5 py-4 text-start font-semibold text-forest-900">{t.stageNames[f.stage]}</th>
                      <td className="px-5 py-4">{t.common.pkr} <span className="ltr">{money(f.admission, locale)}</span></td>
                      <td className="px-5 py-4">{t.common.pkr} <span className="ltr">{money(f.monthly, locale)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-8 space-y-3">
              {a.feePolicies.map((x) => (
                <li key={x} className="flex gap-3"><Check /><span>{x}</span></li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-xl font-semibold">{a.extrasTitle}</h3>
              <ul className="mt-4 divide-y divide-line">
                {a.extras.map((e) => (
                  <li key={e.item} className="flex justify-between gap-4 py-3">
                    <span>{e.item}</span>
                    <span className="font-semibold text-forest-800">{e.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-semibold">{a.timingsTitle}</h3>
              <ul className="mt-4 divide-y divide-line">
                {a.timings.map((x) => (
                  <li key={x.stage} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-3">
                    <span>{x.stage}</span>
                    <span className="ltr font-semibold text-forest-800">{x.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Downloads */}
      <Section>
        <SectionHead title={a.downloadsTitle} />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {downloads.map((d) => (
            <li key={d.id}>
              <a href={d.file} download className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-forest-700"><DownloadIcon /></span>
                <span className="flex-1">
                  <span className="block font-semibold text-forest-900">{t.downloadNames[d.id]}</span>
                  <span className="ltr text-sm text-muted">PDF · {d.size}</span>
                </span>
                <span className="text-sm font-semibold text-forest-700">{t.common.download}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* FAQ */}
      <Section tint>
        <div className="mx-auto max-w-3xl">
          <SectionHead title={a.faqTitle} center />
          <div className="mt-10 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
            {a.faqs.map((f) => (
              <details key={f.q} className="faq group p-5 sm:p-6">
                <summary className="flex items-start justify-between gap-4 text-lg font-semibold text-forest-900">
                  {f.q}
                  <span className="faq-icon mt-1 text-2xl leading-none text-gold-600 transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={p("/admissions/apply")} className="btn btn-primary">{t.common.applyNow} <Arrow /></Link>
          </div>
        </div>
      </Section>
    </>
  );
}
