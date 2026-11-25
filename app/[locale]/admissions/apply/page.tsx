import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { campuses } from "@/lib/site";
import ApplyForm from "@/components/ApplyForm";
import { Section } from "@/components/blocks";

export const generateMetadata = pageMeta("/admissions/apply", (t) => ({ title: t.apply.title, description: t.apply.lead }));

export default async function Apply(props: LocaleParams) {
  const { t } = await load(props);
  const a = t.apply;

  return (
    <>
      <section className="pattern border-b border-line bg-sand">
        <div className="wrap py-12 sm:py-16">
          <p className="eyebrow">{a.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{a.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{a.lead}</p>
        </div>
      </section>
      <Section className="!pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ApplyForm t={a} campuses={campuses.map((c) => ({ id: c.id, name: t.campusNames[c.id], whatsapp: c.whatsapp }))} />
          <aside className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold">{a.sideTitle}</h2>
              <p className="mt-2 text-muted">{a.sideText}</p>
              <ul className="mt-5 space-y-4">
                {campuses.map((c) => (
                  <li key={c.id}>
                    <p className="font-semibold text-forest-900">{t.campusNames[c.id]}</p>
                    <p className="ltr text-[0.95rem]">
                      {c.phones.map((ph, i) => (
                        <span key={ph.tel}>{i > 0 && " · "}<a href={`tel:${ph.tel}`} className="text-forest-700 underline-offset-4 hover:underline">{ph.display}</a></span>
                      ))}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="text-xl font-semibold">{a.hoursTitle}</h2>
              <ul className="mt-3 space-y-1.5 text-muted">
                {a.hours.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div className="rounded-[var(--radius-card)] border border-dashed border-gold-500 bg-gold-100 p-6">
              <p className="eyebrow">{a.nextTitle}</p>
              <p className="mt-2 text-forest-900">{a.nextText}</p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
