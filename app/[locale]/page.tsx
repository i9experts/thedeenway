import Link from "next/link";
import { getDict } from "@/content";
import { isLocale, localeInfo, type Locale } from "@/lib/i18n";
import HeroSlider from "@/components/HeroSlider";
import { ReelsStrip } from "@/components/Reels";
import { campuses } from "@/lib/site";
import { Arrow, Photo, Section, SectionHead, Star, TextLink } from "@/components/blocks";
import { notFound } from "next/navigation";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale: Locale = l;
  const t = getDict(locale);
  const h = t.home;
  const p = (path: string) => `/${locale}${path}`;

  return (
    <>
      <HeroSlider slides={t.heroSlides} ui={t.heroUi} locale={locale} rtl={localeInfo[locale].dir === "rtl"} />

      {/* Quick links */}
      <nav aria-label={t.nav.menu} className="relative z-20 -mt-14 sm:-mt-16">
        <div className="wrap">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.25rem] bg-line shadow-lift ring-1 ring-line sm:grid-cols-3 lg:grid-cols-5">
            {t.quickLinks.map((q, i) => (
              <li key={q.href} className={`bg-white ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
                <Link href={q.href.startsWith("/spd") ? q.href : p(q.href)} className={`group flex h-full items-center gap-3 px-4 py-4 transition hover:bg-cream sm:px-5 sm:py-5 ${i === 0 ? "bg-gold-100" : ""}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition group-hover:scale-110 ${i === 0 ? "bg-gold-500 text-forest-950" : "bg-lime-100 text-forest-700"}`}>
                    <QuickIcon name={q.icon} />
                  </span>
                  <span className="text-[0.95rem] font-semibold leading-tight text-forest-950">{q.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Stats */}
      <section className="border-b border-line bg-cream pt-6">
        <div className="wrap grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-4">
          {h.stats.map((s) => (
            <div key={s.label} className="px-2 py-8 sm:px-6">
              <p className="font-display text-2xl font-semibold text-forest-800 sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted sm:text-base">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <SectionHead eyebrow={h.pillarsEyebrow} title={h.pillarsTitle} lead={h.pillarsLead} />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {h.pillars.map((pl, i) => (
                <div key={pl.title} className="card p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-lime-100 text-forest-700">
                    <Star className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">{pl.title}</h3>
                  <p className="mt-2 text-muted">{pl.text}</p>
                  <span className="sr-only">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-lift">
              <Photo name="reading" alt="" />
            </div>
            <div className="mt-12 aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-lift">
              <Photo name="quran-girls" alt="" />
            </div>
          </div>
        </div>
      </Section>

      {/* Programmes */}
      <Section tint>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={h.programmesEyebrow} title={h.programmesTitle} />
          <TextLink href={p("/academics")}>{t.common.learnMore}</TextLink>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {h.programmes.map((pr) => (
            <Link key={pr.stage} href={p("/academics") + `#${pr.stage}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
              <div className="aspect-[4/3] overflow-hidden">
                <Photo name={pr.image} alt="" className="!rounded-none transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-gold-600">{pr.ages}</p>
                <h3 className="mt-1 text-2xl font-semibold">{t.stageNames[pr.stage as keyof typeof t.stageNames]}</h3>
                <p className="mt-3 text-muted">{pr.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Tahfiz */}
      <section className="relative overflow-hidden bg-forest-900 py-16 text-white sm:py-24">
        <div className="pattern-dark absolute inset-0" />
        <div className="wrap relative grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 grid grid-cols-5 gap-4 lg:order-1">
            <div className="col-span-3 aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <Photo name="tahfiz" alt="" />
            </div>
            <div className="col-span-2 mt-16 aspect-[3/4] overflow-hidden rounded-[1.5rem]">
              <Photo name="tahfiz-2" alt="" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="eyebrow !text-gold-300 before:!bg-gold-300">{h.tahfizEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">{h.tahfizTitle}</h2>
            <p className="mt-5 text-lg text-white/80">{h.tahfizText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={p("/admissions/apply")} className="btn btn-gold">{t.common.applyNow}</Link>
              <Link href={p("/academics") + "#tahfiz"} className="btn btn-light">{t.common.learnMore}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* School life */}
      <Section>
        <SectionHead eyebrow={h.lifeEyebrow} title={h.lifeTitle} />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {h.life.map((li) => (
            <figure key={li.title} className="group relative overflow-hidden rounded-[1.5rem]">
              <div className="aspect-[16/10] overflow-hidden">
                <Photo name={li.image} alt="" className="!rounded-none transition duration-500 group-hover:scale-105" />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/90 via-forest-950/50 to-transparent p-6 pt-16 text-white">
                <h3 className="text-2xl font-semibold text-white">{li.title}</h3>
                <p className="mt-1 text-white/85">{li.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Reels */}
      <ReelsStrip t={t.reels} locale={locale} rtl={localeInfo[locale].dir === "rtl"} />

      {/* Event */}
      <section className="py-16 sm:py-24">
        <div className="wrap">
          <div className="pattern relative grid items-center gap-8 overflow-hidden rounded-[2rem] border border-gold-300 bg-gold-100 p-8 sm:p-12 lg:grid-cols-[auto_1fr_auto]">
            <img src="/brand/tree.png" alt="" width={660} height={740} className="mx-auto w-28 sm:w-36" />
            <div>
              <p className="eyebrow">{h.eventEyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{h.eventTitle}</h2>
              <p className="mt-3 text-muted">{h.eventText}</p>
            </div>
            <a href="/spd-2026/index.html" className="btn btn-primary justify-self-start">
              {h.eventCta} <Arrow />
            </a>
          </div>
        </div>
      </section>

      {/* Campuses */}
      <Section tint>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={h.campusesEyebrow} title={h.campusesTitle} />
          <TextLink href={p("/campuses")}>{t.common.learnMore}</TextLink>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {campuses.map((c) => (
            <Link key={c.id} href={p("/campuses") + `#${c.id}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
              <div className="aspect-[16/10] overflow-hidden">
                <Photo name={c.image} alt="" className="!rounded-none transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-gold-600">{t.common[c.city]}</p>
                <h3 className="mt-1 text-2xl font-semibold">{t.campusNames[c.id]}</h3>
                <p className="ltr mt-2 text-sm text-muted">{c.address}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Portal + Admissions */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card flex flex-col p-8 sm:p-10">
            <p className="eyebrow">{h.portalEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold">{h.portalTitle}</h2>
            <p className="mt-4 flex-1 text-lg text-muted">{h.portalText}</p>
            <div className="mt-8">
              <TextLink href={p("/parents")}>{h.portalCta}</TextLink>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-forest-800 p-8 text-white sm:p-10">
            <div className="pattern-dark absolute inset-0" />
            <div className="relative">
              <p className="eyebrow !text-gold-300 before:!bg-gold-300">{h.admissionsEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{h.admissionsTitle}</h2>
              <p className="mt-4 text-lg text-white/80">{h.admissionsText}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={p("/admissions/apply")} className="btn btn-gold">{t.common.applyNow} <Arrow /></Link>
                <Link href={p("/admissions")} className="btn btn-light">{t.nav.admissions}</Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function QuickIcon({ name }: { name: string }) {
  const d: Record<string, string> = {
    apply: "M14 3v4a1 1 0 001 1h4M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2zM9 13h6M9 17h4",
    fees: "M3 7h18v10H3zM3 11h18M7 15h3",
    campus: "M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
    portal: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
    reels: "M4 4h16v16H4zM4 9h16M9 4l2 5M15 4l2 5M10.5 12.5v5l4-2.5z",
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d[name] ?? d.apply} />
    </svg>
  );
}
