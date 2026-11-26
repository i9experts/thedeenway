import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { site } from "@/lib/site";

const paths = ["", "/about", "/academics", "/admissions", "/admissions/apply", "/campuses", "/parents", "/news", "/reels", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    locales.map((l) => ({
      url: `${site.url}/${l}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${site.url}/${x}${path}`])) },
    })),
  );
}
