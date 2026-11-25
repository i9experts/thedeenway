import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { downloads } from "@/lib/site";
import { DownloadIcon, PageHero, Section, SectionHead } from "@/components/blocks";

export const generateMetadata = pageMeta("/parents", (t) => ({ title: t.nav.parents, description: t.parents.lead }));

const icons = [
  "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  "M9 12l2 2 4-4M12 3l7 4v5c0 4.5-3 8.3-7 9-4-.7-7-4.5-7-9V7z",
  "M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5z",
  "M2 7h20v12H2zM2 11h20M6 15h4",
  "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
  "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
];

export default async function Parents(props: LocaleParams) {
  const { t } = await load(props);
  const a = t.parents;
  const handbook = downloads[0];

  return (
    <>
      <PageHero eyebrow={a.eyebrow} title={a.title} lead={a.lead} image="circle-time">
        <a href={handbook.file} download className="btn btn-primary"><DownloadIcon /> {t.downloadNames.handbook}</a>
      </PageHero>

      {/* Portal preview */}
      <Section>
        <div className="relative overflow-hidden rounded-[2rem] bg-forest-900 p-7 text-white sm:p-12">
          <div className="pattern-dark absolute inset-0" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-3 py-1 text-sm font-bold text-forest-950">
              <span className="h-2 w-2 animate-pulse rounded-full bg-forest-950" aria-hidden="true" />
              {a.portalStatus}
            </span>
            <h2 className="mt-5 text-3xl font-semibold text-white sm:text-5xl">{a.portalTitle}</h2>
            <p className="mt-4 max-w-2xl text-lg text-white/80">{a.portalText}</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {a.features.map((f, i) => (
                <li key={f.title} className="rounded-[var(--radius-card)] border border-white/15 bg-white/5 p-5">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e9cf7a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[i]} /></svg>
                  <h3 className="mt-3 text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-1 text-white/75">{f.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-3xl text-white/70">{a.portalNote}</p>
          </div>
        </div>
      </Section>

      {/* Essentials */}
      <Section tint>
        <SectionHead title={a.essentialsTitle} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {a.essentials.map((e) => (
            <div key={e.title} className="card p-6">
              <h3 className="text-xl font-semibold">{e.title}</h3>
              <p className="mt-2 text-muted">{e.text}</p>
            </div>
          ))}
        </div>
        <div className="card mt-8 border-s-4 border-s-gold-500 p-6">
          <h3 className="text-xl font-semibold">{a.conductTitle}</h3>
          <p className="mt-2 text-muted">{a.conduct}</p>
        </div>
      </Section>

      {/* Downloads */}
      <Section>
        <SectionHead title={t.admissions.downloadsTitle} />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {downloads.map((d) => (
            <li key={d.id}>
              <a href={d.file} download className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-forest-700"><DownloadIcon /></span>
                <span className="flex-1">
                  <span className="block font-semibold text-forest-900">{t.downloadNames[d.id]}</span>
                  <span className="ltr text-sm text-muted">PDF · {d.size}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
