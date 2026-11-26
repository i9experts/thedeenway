import Link from "next/link";
import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { Check, PageHero, Photo, Section, SectionHead, Star } from "@/components/blocks";

export const generateMetadata = pageMeta("/about", (t) => ({ title: t.nav.about, description: t.about.lead }));

export default async function About(props: LocaleParams) {
  const { t, p } = await load(props);
  const a = t.about;

  return (
    <>
      <PageHero eyebrow={a.eyebrow} title={a.title} lead={a.lead} image="assembly-2" />

      {/* Vision */}
      <Section id="vision">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">{a.visionTitle}</p>
            <blockquote className="mt-4 font-display text-2xl leading-snug text-forest-900 sm:text-3xl">“{a.vision}”</blockquote>
          </div>
          <ol className="grid gap-4">
            {a.visionPoints.map((v, i) => (
              <li key={v.title} className="card flex gap-5 p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-800 font-display text-lg font-semibold text-white">{i + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold">{v.title}</h3>
                  <p className="mt-1 text-muted">{v.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Mission */}
      <section id="mission" className="relative overflow-hidden bg-forest-900 py-16 text-white sm:py-24">
        <div className="pattern-dark absolute inset-0" />
        <div className="wrap relative">
          <p className="eyebrow !text-gold-300 before:!bg-gold-300">{a.missionTitle}</p>
          <p className="mt-5 max-w-4xl font-display text-2xl leading-snug text-white sm:text-3xl">“{a.mission}”</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {a.missionPoints.map((m) => (
              <div key={m.title} className="rounded-[var(--radius-card)] border border-white/15 bg-white/5 p-6">
                <Star className="h-6 w-6 text-gold-300" />
                <h3 className="mt-4 text-xl font-semibold text-white">{m.title}</h3>
                <p className="mt-2 text-white/75">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <Section id="facilities">
        <SectionHead title={a.facilitiesTitle} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {a.facilities.map((f) => (
            <article key={f.title} className="card overflow-hidden">
              <div className="aspect-[16/9] overflow-hidden">
                <Photo name={f.image} alt="" className="!rounded-none" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-muted">{f.text}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Safety */}
      <Section tint id="safety">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHead title={a.safetyTitle} />
            <ul className="mt-8 space-y-4">
              {a.safety.map((s) => (
                <li key={s} className="flex gap-3 text-lg">
                  <Check />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <Link href={p("/admissions/apply")} className="btn btn-primary mt-10">{t.common.applyNow}</Link>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-lift">
            <Photo name="circle-time" alt="" />
          </div>
        </div>
      </Section>
    </>
  );
}
