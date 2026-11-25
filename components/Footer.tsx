import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Dict } from "@/content/en";
import { campuses, site } from "@/lib/site";

export default function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  const year = new Date().getFullYear();
  const explore = [
    ["about", "/about"],
    ["academics", "/academics"],
    ["campuses", "/campuses"],
    ["news", "/news"],
  ] as const;
  const families = [
    ["admissions", "/admissions"],
    ["apply", "/admissions/apply"],
    ["parents", "/parents"],
    ["contact", "/contact"],
  ] as const;

  return (
    <footer className="pattern-dark mt-24 bg-forest-950 text-white/80">
      <div className="wrap grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <div className="inline-block rounded-2xl bg-cream p-3">
            <img src="/brand/logo.png" alt={t.meta.siteName} width={515} height={170} className="h-12 w-auto" />
          </div>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed">{t.footer.tagline}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {site.facebook.map((f) => (
              <li key={f.href}>
                <a href={f.href} rel="noopener" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z" /></svg>
                  <span className="ltr">{f.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-gold-300">{t.footer.explore}</h2>
          <ul className="mt-4 space-y-2.5">
            {explore.map(([k, p]) => (
              <li key={k}><Link href={`/${locale}${p}`} className="hover:text-white">{t.nav[k]}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-gold-300">{t.footer.families}</h2>
          <ul className="mt-4 space-y-2.5">
            {families.map(([k, p]) => (
              <li key={k}><Link href={`/${locale}${p}`} className="hover:text-white">{t.nav[k]}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-gold-300">{t.nav.campuses}</h2>
          <ul className="mt-4 space-y-4 text-[0.92rem]">
            {campuses.map((c) => (
              <li key={c.id}>
                <p className="font-semibold text-white">{t.campusNames[c.id]}</p>
                <p className="ltr text-white/70">
                  {c.phones.map((p, i) => (
                    <span key={p.tel}>
                      {i > 0 && " · "}
                      <a href={`tel:${p.tel}`} className="hover:text-white">{p.display}</a>
                    </span>
                  ))}
                </p>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className="ltr hover:text-white">{site.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© <span className="ltr">{year}</span> {t.meta.siteName}. {t.footer.rights}</p>
          <p className="ltr">www.thedeenwayschool.com</p>
        </div>
      </div>
    </footer>
  );
}
