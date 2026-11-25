"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localeInfo, locales, type Locale } from "@/lib/i18n";
import type { Dict } from "@/content/en";

type NavKey = "about" | "academics" | "admissions" | "campuses" | "parents" | "news" | "contact";
const links: { key: NavKey; path: string }[] = [
  { key: "about", path: "/about" },
  { key: "academics", path: "/academics" },
  { key: "admissions", path: "/admissions" },
  { key: "campuses", path: "/campuses" },
  { key: "parents", path: "/parents" },
  { key: "news", path: "/news" },
  { key: "contact", path: "/contact" },
];

export default function Header({ locale, nav, logoAlt }: { locale: Locale; nav: Dict["nav"]; logoAlt: string }) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rest = pathname.replace(/^\/(en|ur|ar)/, "");

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const setLang = (l: Locale) => {
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
  };

  const isActive = (path: string) => rest === path || rest.startsWith(path + "/");

  const LangSwitch = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center gap-1 ${compact ? "" : "rounded-full border border-line bg-white p-1"}`} aria-label="Language">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          onClick={() => setLang(l)}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-full px-3 py-0.5 text-sm font-semibold transition ${
            l === locale
              ? compact ? "bg-white/15 text-white" : "bg-forest-800 text-white"
              : compact ? "text-white/80 hover:text-white" : "text-forest-900 hover:bg-lime-100"
          }`}
        >
          {localeInfo[l].name}
        </Link>
      ))}
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled ? "border-line bg-cream/95 backdrop-blur" : "border-transparent bg-cream"
      }`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        {nav.skip}
      </a>
      <div className="hidden bg-forest-900 text-white/85 lg:block">
        <div className="wrap flex h-9 items-center justify-between text-[0.82rem]">
          <p>
            {nav.admissionsLine}{" "}
            <a href="tel:+923342221788" className="ltr font-semibold text-white hover:underline">+92 334 222 1788</a>
            <span className="mx-2 opacity-40">|</span>
            <a href="mailto:admin@thedeenwayschool.net" className="ltr hover:underline">admin@thedeenwayschool.net</a>
          </p>
          <LangSwitch compact />
        </div>
      </div>
      <div className="wrap flex h-[4.5rem] items-center justify-between gap-4">
        <Link href={`/${locale}`} className="shrink-0" aria-label={logoAlt}>
          <img src="/brand/logo.png" alt={logoAlt} width={515} height={170} className="h-11 w-auto sm:h-12" />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {links.map((l) => (
              <li key={l.key}>
                <Link
                  href={`/${locale}${l.path}`}
                  aria-current={isActive(l.path) ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[0.9rem] font-semibold transition hover:bg-lime-100 ${
                    isActive(l.path) ? "text-forest-700" : "text-forest-900"
                  }`}
                >
                  {nav[l.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/admissions/apply`} className="btn btn-primary hidden sm:inline-flex">
            {nav.apply}
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-forest-900 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? nav.close : nav.menu}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-[4.5rem] lg:top-[6.75rem] bottom-0 overflow-y-auto border-t border-line bg-cream xl:hidden">
          <nav aria-label="Mobile" className="wrap py-6">
            <ul className="divide-y divide-line">
              <li>
                <Link href={`/${locale}`} className="block py-3.5 text-lg font-semibold text-forest-900">
                  {nav.home}
                </Link>
              </li>
              {links.map((l) => (
                <li key={l.key}>
                  <Link
                    href={`/${locale}${l.path}`}
                    aria-current={isActive(l.path) ? "page" : undefined}
                    className="block py-3.5 text-lg font-semibold text-forest-900"
                  >
                    {nav[l.key]}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-4">
              <Link href={`/${locale}/admissions/apply`} className="btn btn-primary w-full">
                {nav.apply}
              </Link>
              <LangSwitch />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
