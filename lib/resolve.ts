import "server-only";
import { needsResolving, parseReelUrl } from "./reels";

/**
 * Follows share / short links (facebook.com/share/…, instagram.com/share/…, fb.watch, vm.tiktok.com)
 * to the reel's real address, so embeds work. Returns the original link if it can't be resolved.
 */
export async function resolveReelUrl(raw: string): Promise<ReturnType<typeof parseReelUrl>> {
  const parsed = parseReelUrl(raw);
  if (!parsed || !needsResolving(parsed.url)) return parsed;
  try {
    const res = await fetch(parsed.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "en",
      },
    });
    let final = new URL(res.url);
    // Instagram and Facebook sometimes send visitors to a login page with the real address in ?next=
    const next = final.searchParams.get("next");
    if (next) {
      try {
        final = new URL(next, final.origin);
      } catch {
        /* keep final */
      }
    }
    // Some share pages don't redirect but declare the real address in og:url.
    if (needsResolving(final.toString()) || /\/(login|accounts\/login)/.test(final.pathname)) {
      const html = await res.text();
      const og = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1];
      if (og) final = new URL(og.replace(/&amp;/g, "&"));
    }
    const resolved = parseReelUrl(final.toString());
    if (resolved && resolved.platform === parsed.platform && !needsResolving(resolved.url)) return resolved;
  } catch (e) {
    console.warn("reels: could not resolve share link", parsed.url, e);
  }
  return parsed;
}
