import Link from "next/link";
import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { Check, PageHero, Photo, Section, SectionHead, Star } from "@/components/blocks";

export const generateMetadata = pageMeta("/academics", (t) => ({ title: t.nav.academics, description: t.academics.lead }));

export default async function Academics(props: LocaleParams) {
  const { t, p } = await load(props);
  const a = t.academics;

  return (
    <>
      <PageHero eyebrow={a.eyebrow} title={a.title} lead={a.lead} image="classroom-primary" />

      {/* Stage navigation */}
      <nav aria-label={a.eyebrow} className="sticky top-[4.5rem] lg:top-[6.75rem] z-30 border-b border-line bg-cream/95 backdrop-blur">
        <ul className="wrap flex gap-2 overflow-x-auto py-3">
          {a.stages.map((s) => (
            <li key={s.stage}>
              <a href={`#${s.stage}`} className="block whitespace-nowrap rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-forest-900 hover:bg-lime-100">
                {t.stageNames[s.stage as keyof typeof t.stageNames]}
              </a>
            </li>
          ))}
          <li>
            <a href="#tahfiz" className="block whitespace-nowrap rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-forest-900 hover:bg-lime-100">{a.tahfizTitle}</a>
          </li>
        </ul>
      </nav>

      {/* Stages */}
      <Section>
        <div className="space-y-20">
          {a.stages.map((s, i) => (
            <article key={s.stage} id={s.stage} className="grid scroll-mt-40 items-center gap-10 lg:grid-cols-2">
              <div className={`aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-lift ${i % 2 ? "lg:order-2" : ""}`}>
                <Photo name={s.image} alt="" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gold-600">{s.grades}</p>
                <h2 className="mt-1 text-3xl font-semibold sm:text-4xl">{t.stageNames[s.stage as keyof typeof t.stageNames]}</h2>
                <p className="mt-4 text-lg text-muted">{s.text}</p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {s.subjects.map((sub) => (
                    <li key={sub} className="flex gap-2.5"><Check /><span>{sub}</span></li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Tarbiyah */}
      <Section tint>
        <SectionHead title={a.tarbiyahTitle} />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {a.tarbiyah.map((x, i) => (
            <li key={x.title} className="card p-6">
              <p className="font-display text-4xl font-semibold text-gold-500">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-xl font-semibold">{x.title}</h3>
              <p className="mt-2 text-muted">{x.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Tahfiz */}
      <section id="tahfiz" className="relative scroll-mt-40 overflow-hidden bg-forest-900 py-16 text-white sm:py-24">
        <div className="pattern-dark absolute inset-0" />
        <div className="wrap relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Star className="h-8 w-8 text-gold-300" />
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">{a.tahfizTitle}</h2>
            <p className="mt-5 text-lg text-white/80">{a.tahfizText}</p>
            <Link href={p("/admissions/apply")} className="btn btn-gold mt-8">{t.common.applyNow}</Link>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-[1.75rem]">
            <Photo name="tahfiz" alt="" />
          </div>
        </div>
      </section>

      {/* Co-curricular */}
      <Section>
        <SectionHead title={a.cocurricularTitle} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {a.cocurricular.map((c) => (
            <div key={c.title} className="card p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 text-gold-600"><Star className="h-5 w-5" /></span>
              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-[0.95rem] text-muted">{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Partnership */}
      <Section tint>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-lift">
            <Photo name="science-2" alt="" />
          </div>
          <div>
            <SectionHead title={a.partnershipTitle} />
            <ul className="mt-8 space-y-4">
              {a.partnership.map((x) => (
                <li key={x} className="flex gap-3 text-lg"><Check /><span>{x}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
