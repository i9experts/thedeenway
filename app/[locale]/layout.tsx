import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "@fontsource/noto-nastaliq-urdu/400.css";
import "@fontsource/noto-nastaliq-urdu/700.css";
import "@fontsource/noto-naskh-arabic/400.css";
import "@fontsource/noto-naskh-arabic/700.css";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDict } from "@/content";
import { isLocale, localeInfo, locales } from "@/lib/i18n";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0f4d2f",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDict(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: `%s · ${t.meta.siteName}` },
    description: t.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: t.meta.siteName,
      title: t.meta.title,
      description: t.meta.description,
      images: [{ url: "/images/assembly-1600.webp", width: 1156, height: 867 }],
      locale,
    },
    icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
    manifest: "/manifest.webmanifest",
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const info = localeInfo[locale];

  const schema = {
    "@context": "https://schema.org",
    "@type": "School",
    name: "The Deenway School",
    url: site.url,
    logo: `${site.url}/brand/logo.png`,
    email: site.email,
    slogan: "Enlightening the roots of knowledge",
    sameAs: site.facebook.map((f) => f.href),
  };

  return (
    <html lang={info.htmlLang} dir={info.dir}>
      <body>
        <Header locale={locale} t={{ nav: t.nav, menu: t.menu, campusNames: t.campusNames, common: t.common, meta: t.meta }} />
        <main id="main">{children}</main>
        <Footer locale={locale} t={t} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
