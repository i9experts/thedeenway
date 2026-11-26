"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { localeInfo, locales, type Locale } from "@/lib/i18n";
import type { Dict } from "@/content/en";
import { campuses, img, site } from "@/lib/site";

type MenuKey = "about" | "academics" | "admissions" | "campuses" | "parents" | "media";
type MenuLink = { label: string; desc: string; href: string };

export type HeaderText = Pick<Dict, "nav" | "menu" | "campusNames" | "common" | "meta">;

const menuImages: Record<MenuKey, string> = {
  about: "assembly-2",
  academics: "classroom-primary",
  admissions: "reading",
  campuses: "circle-time",
  parents: "quran-girls",
  media: "cocurricular",
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Header({ locale, t }: { locale: Locale; t: HeaderText }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(en|ur|ar)/, "");
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileSection, setMobileSection] = useState<MenuKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const p = (path: string) => (path.startsWith("/spd-2026") ? path : `/${locale}${path}`);

  const menus: { key: MenuKey; label: string; intro: string; links: MenuLink[]; base: string }[] = [
    { key: "about", label: t.nav.about, intro: t.menu.about.intro, links: t.menu.about.links, base: "/about" },
    { key: "academics", label: t.nav.academics, intro: t.menu.academics.intro, links: t.menu.academics.links, base: "/academics" },
    { key: "admissions", label: t.nav.admissions, intro: t.menu.admissions.intro, links: t.menu.admissions.links, base: "/admissions" },
    {
      key: "campuses",
      label: t.nav.campuses,
      intro: t.menu.campuses.intro,
      links: campuses.map((c) => ({ label: t.campusNames[c.id], desc: t.common[c.city], href: `/campuses#${c.id}` })),
      base: "/campuses",
    },
    { key: "parents", label: t.nav.parents, intro: t.menu.parents.intro, links: t.menu.parents.links, base: "/parents" },
    { key: "media", label: t.menu.media.label, intro: t.menu.media.intro, links: t.menu.media.links, base: "/reels" },
  ];

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const hoverOpen = (k: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(k);
  };
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(close, 160);
  };

  const setLang = (l: Locale) => {
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
  };

  const LangLinks = ({ dark = false }: { dark?: boolean }) => (
    <ul className="flex items-center gap-1" aria-label={t.common.language}>
      {locales.map((l) => (
        <li key={l}>
          <Link
            href={`/${l}${rest}`}
            hrefLang={l}
            lang={l}
            onClick={() => setLang(l)}
            aria-current={l === locale ? "true" : undefined}
            className={`block rounded-full px-3 py-0.5 text-[0.8rem] font-semibold transition ${
              l === locale
                ? dark ? "bg-white/15 text-white" : "bg-forest-800 text-white"
                : dark ? "text-white/75 hover:text-white" : "text-forest-900 hover:bg-lime-100"
            }`}
          >
            {localeInfo[l].name}
          </Link>
        </li>
      ))}
    </ul>
  );

  const current = menus.find((m) => m.key === open);
  const isActive = (base: string) => rest === base || rest.startsWith(base + "/");

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        {t.nav.skip}
      </a>

      {/* Utility bar */}
      <div className="hidden bg-forest-950 text-white/80 lg:block">
        <div className="wrap flex h-10 items-center justify-between text-[0.82rem]">
          <div className="flex items-center gap-5">
            <a href="tel:+923342221788" className="inline-flex items-center gap-1.5 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" /></svg>
              <span>{t.nav.admissionsLine}</span> <span className="ltr font-semibold text-white">+92 334 222 1788</span>
            </a>
            <a href={`mailto:${site.email}`} className="ltr hidden hover:text-white xl:inline">{site.email}</a>
          </div>
          <div className="flex items-center gap-5">
            <Link href={p("/reels")} className="hover:text-white">{t.menu.utility.reels}</Link>
            <Link href={p("/parents#portal")} className="inline-flex items-center gap-1.5 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>
              {t.menu.utility.portal}
            </Link>
            <span className="h-4 w-px bg-white/20" aria-hidden="true" />
            <LangLinks dark />
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className={`border-b bg-white transition-shadow ${scrolled || open ? "border-line shadow-[0_6px_24px_rgb(6_40_26/0.08)]" : "border-transparent"}`}>
        <div className="wrap flex h-[4.75rem] items-center justify-between gap-4">
          <Link href={`/${locale}`} className="shrink-0" aria-label={t.meta.siteName}>
            <img src="/brand/logo.png" alt={t.meta.siteName} width={515} height={170} className="h-11 w-auto sm:h-[3.1rem]" />
          </Link>

          <nav aria-label="Main" className="hidden h-full xl:block">
            <ul className="flex h-full items-stretch">
              {menus.map((m) => (
                <li key={m.key} className="relative flex" onMouseEnter={() => hoverOpen(m.key)} onMouseLeave={hoverClose}>
                  <button
                    type="button"
                    aria-expanded={open === m.key}
                    aria-controls="mega-panel"
                    onClick={() => setOpen((o) => (o === m.key ? null : m.key))}
                    className={`relative flex items-center gap-1.5 px-3 text-[0.93rem] font-semibold transition-colors ${
                      open === m.key || isActive(m.base) ? "text-forest-700" : "text-forest-950 hover:text-forest-700"
                    }`}
                  >
                    {m.label}
                    <Chevron open={open === m.key} />
                    <span className={`absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-gold-500 transition-transform duration-200 ${open === m.key ? "scale-x-100" : "scale-x-0"}`} aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li className="flex">
                <Link href={p("/contact")} className={`flex items-center px-3 text-[0.93rem] font-semibold ${isActive("/contact") ? "text-forest-700" : "text-forest-950 hover:text-forest-700"}`}>
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href={p("/admissions/apply")} className="btn btn-gold hidden !px-5 sm:inline-flex">
              {t.nav.apply}
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-forest-900 xl:hidden"
              aria-expanded={mobile}
              aria-controls="mobile-menu"
              onClick={() => setMobile((v) => !v)}
            >
              <span className="sr-only">{mobile ? t.nav.close : t.nav.menu}</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {mobile ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mega panel */}
        <div
          id="mega-panel"
          onMouseEnter={() => current && hoverOpen(current.key)}
          onMouseLeave={hoverClose}
          className={`absolute inset-x-0 top-full hidden origin-top border-t border-line bg-white shadow-[0_24px_48px_rgb(6_40_26/0.14)] transition duration-200 xl:block ${
            current ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          {current && (
            <div className="wrap grid grid-cols-[19rem_1fr] gap-10 py-9">
              <div className="relative overflow-hidden rounded-2xl bg-forest-900 text-white">
                <img src={img(menuImages[current.key], 800)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/60 to-transparent" />
                <div className="relative flex h-full min-h-[15rem] flex-col justify-end p-6">
                  <p className="font-display text-2xl font-semibold text-white">{current.label}</p>
                  <p className="mt-2 text-sm text-white/85">{current.intro}</p>
                  <Link href={p(current.base)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-gold-300 hover:text-white">
                    {t.menu.viewAll}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:-scale-x-100"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>
                </div>
              </div>

              {current.key === "campuses" ? (
                <ul className="grid grid-cols-3 gap-5">
                  {campuses.map((c) => (
                    <li key={c.id}>
                      <Link href={p(`/campuses#${c.id}`)} className="group block overflow-hidden rounded-2xl border border-line transition hover:shadow-soft">
                        <div className="aspect-[16/10] overflow-hidden">
                          <img src={img(c.image, 800)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-gold-600">{t.common[c.city]}</p>
                          <p className="mt-0.5 font-semibold text-forest-900">{t.campusNames[c.id]}</p>
                          <p className="ltr mt-1 text-sm text-muted">{c.phones[0].display}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="grid grid-cols-2 content-start gap-x-6 gap-y-1">
                  {current.links.map((l) => (
                    <li key={l.href}>
                      <Link href={p(l.href)} className="group flex items-start gap-3 rounded-xl p-3 transition hover:bg-cream">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rotate-45 bg-gold-500 transition group-hover:bg-forest-700" aria-hidden="true" />
                        <span>
                          <span className="block font-semibold text-forest-950 group-hover:text-forest-700">{l.label}</span>
                          <span className="block text-sm text-muted">{l.desc}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobile && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[4.75rem] overflow-y-auto bg-white lg:top-[7.25rem] xl:hidden">
          <nav aria-label="Mobile" className="wrap pb-10 pt-2">
            <ul className="divide-y divide-line">
              {menus.map((m) => (
                <li key={m.key}>
                  <button
                    type="button"
                    aria-expanded={mobileSection === m.key}
                    onClick={() => setMobileSection((s) => (s === m.key ? null : m.key))}
                    className="flex w-full items-center justify-between py-4 text-start text-lg font-semibold text-forest-950"
                  >
                    {m.label}
                    <Chevron open={mobileSection === m.key} />
                  </button>
                  {mobileSection === m.key && (
                    <ul className="mb-4 space-y-1 rounded-2xl bg-cream p-2">
                      {m.links.map((l) => (
                        <li key={l.href}>
                          <Link href={p(l.href)} className="block rounded-xl px-3 py-2.5 hover:bg-white">
                            <span className="block font-semibold text-forest-900">{l.label}</span>
                            <span className="block text-sm text-muted">{l.desc}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li>
                <Link href={p("/contact")} className="block py-4 text-lg font-semibold text-forest-950">{t.nav.contact}</Link>
              </li>
            </ul>
            <div className="mt-6 grid gap-3">
              <Link href={p("/admissions/apply")} className="btn btn-gold w-full">{t.nav.apply}</Link>
              <Link href={p("/parents#portal")} className="btn btn-ghost w-full">{t.menu.utility.portal}</Link>
              <a href="tel:+923342221788" className="btn btn-ghost w-full"><span className="ltr">+92 334 222 1788</span></a>
            </div>
            <div className="mt-6 flex justify-center">
              <LangLinks />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
