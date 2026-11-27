import Link from "next/link";
import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { founderDict } from "@/content/founder";
import { Arrow, Section, SectionHead, Star } from "@/components/blocks";

export const generateMetadata = pageMeta("/about/founder", () => ({
  title: "Atiq ur Rehman Ayubi — Founder",
  description: "The story of Atiq ur Rehman Ayubi, founder of The Deenway School, and how the Tarbiyah-integrated school model began.",
}));

const links = { blog: "https://ayubi.blog/", podcast: "https://www.youtube.com/@theframeworkbyayubi", linkedin: "https://www.linkedin.com/in/atiqurrehmanayubi/" };

export default async function Founder(props: LocaleParams) {
  const { locale, p, t } = await load(props);
  const f = founderDict(locale);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Atiq ur Rehman Ayubi",
    jobTitle: "Founder",
    worksFor: { "@type": "School", name: "The Deenway School" },
    url: links.blog,
    sameAs: [links.linkedin, links.podcast],
    image: "https://www.thedeenwayschool.com/images/founder.webp",
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-950 text-white">
        <div className="pattern-dark absolute inset-0" />
        <div className="wrap relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="reveal">
            <p className="eyebrow !text-gold-300 before:!bg-gold-300">{f.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-6xl">{f.name}</h1>
            <p className="mt-3 text-xl font-semibold text-gold-300">{f.role}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {f.tags.map((tag) => <li key={tag} className="rounded-full border border-white/25 px-3 py-1 text-sm text-white/85">{tag}</li>)}
            </ul>
            <p className="mt-6 max-w-xl text-lg text-white/85">{f.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={links.blog} target="_blank" rel="noopener" className="btn btn-gold">{f.blog} <Arrow /></a>
              <Link href={p("/about")} className="btn btn-light">{t.meta.siteName}</Link>
            </div>
          </div>
          <div className="reveal mx-auto w-full max-w-sm lg:max-w-md">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2.25rem] border border-gold-500/50 rtl:-rotate-2 ltr:rotate-2" aria-hidden="true" />
              <img src="/images/founder.webp" alt={f.name} width={1000} height={1250} className="relative aspect-[4/5] w-full rounded-[2rem] object-cover object-top shadow-lift" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line bg-cream">
        <div className="wrap grid grid-cols-2 lg:grid-cols-4">
          {f.stats.map((s) => (
            <div key={s.label} className="px-2 py-8 sm:px-6">
              <p className="ltr font-display text-3xl font-semibold text-forest-800 rtl:text-end">{s.value}</p>
              <p className="mt-1 text-sm text-muted sm:text-base">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-36 lg:self-start">
            <SectionHead title={f.storyTitle} />
            <blockquote className="mt-8 border-s-4 border-gold-500 ps-5 font-display text-xl leading-snug text-forest-900 sm:text-2xl">“{f.quote}”</blockquote>
            <p className="mt-3 ps-6 text-sm font-semibold text-muted">— {f.name}</p>
          </div>
          <div className="space-y-5 text-lg text-ink">
            {f.story.map((para, i) => <p key={i} className={i === 0 ? "font-display text-2xl text-forest-900" : ""}>{para}</p>)}
          </div>
        </div>
      </Section>

      {/* Journey */}
      <Section tint>
        <SectionHead title={f.journeyTitle} />
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {f.journey.map((j) => (
            <li key={j.title} className="card p-6">
              <p className="font-display text-2xl font-semibold text-gold-600"><span dir="auto">{j.year}</span></p>
              <h3 className="mt-2 text-xl font-semibold">{j.title}</h3>
              <p className="mt-2 text-muted">{j.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Values */}
      <section className="relative overflow-hidden bg-forest-900 py-16 text-white sm:py-24">
        <div className="pattern-dark absolute inset-0" />
        <div className="wrap relative">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{f.valuesTitle}</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {f.values.map((v) => (
              <div key={v.title} className="rounded-[var(--radius-card)] border border-white/15 bg-white/5 p-6">
                <Star className="h-6 w-6 text-gold-300" />
                <h3 className="mt-4 text-xl font-semibold text-white">{v.title}</h3>
                <p className="mt-2 text-white/75">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Welfare + more */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-8">
            <h2 className="text-2xl font-semibold sm:text-3xl">{f.welfareTitle}</h2>
            <p className="mt-3 text-lg text-muted">{f.welfareText}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {f.welfare.map((w) => <li key={w} className="rounded-full bg-lime-100 px-3.5 py-1.5 text-sm font-semibold text-forest-800">{w}</li>)}
            </ul>
            <blockquote className="mt-6 rounded-2xl bg-gold-100 p-5">
              <p className="font-display text-xl text-forest-950">“{f.hadith}”</p>
              <p className="mt-2 text-sm font-semibold text-gold-600">— {f.hadithSource}</p>
            </blockquote>
          </div>
          <div className="pattern flex flex-col rounded-[var(--radius-card)] border border-line bg-sand p-8">
            <h2 className="text-2xl font-semibold sm:text-3xl">{f.moreTitle}</h2>
            <p className="mt-3 flex-1 text-lg text-muted">{f.moreText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={links.blog} target="_blank" rel="noopener" className="btn btn-primary">{f.blog}</a>
              <a href={links.podcast} target="_blank" rel="noopener" className="btn btn-ghost">{f.podcast}</a>
              <a href={links.linkedin} target="_blank" rel="noopener" className="btn btn-ghost">{f.linkedin}</a>
            </div>
          </div>
        </div>
      </Section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
