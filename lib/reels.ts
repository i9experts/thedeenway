// Turns a social-media reel link (or an uploaded video) into something the site can play.
// Only these platforms are accepted, so the admin panel can't be used to embed arbitrary pages.

export type Platform = "facebook" | "instagram" | "youtube" | "tiktok" | "upload";

export type Reel = {
  id: number;
  url: string;
  platform: Platform;
  title: string;
  campus: string | null;
  showOnHome: boolean;
  position: number;
};

/**
 * embed:   player used in the pop-up (with sound, controls)
 * preview: muted, looping version used on cards; null when the platform can't autoplay
 * thumb:   still image, when the platform offers one
 */
export type PublicReel = Reel & { embed: string; preview: string | null; thumb: string | null };

export const platformNames: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  upload: "Deenway",
};

function hostOf(u: URL) {
  return u.hostname.replace(/^(www|m|web|mbasic)\./, "");
}

export function parseReelUrl(raw: string): { platform: Exclude<Platform, "upload">; url: string } | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = hostOf(u);
  // Drop tracking parameters (igsh, mibextid, si, utm_…) — they can break embeds.
  const keep = new URLSearchParams();
  if (host === "youtube.com" && u.searchParams.get("v")) keep.set("v", u.searchParams.get("v")!);
  if (host === "facebook.com" && u.searchParams.get("v")) keep.set("v", u.searchParams.get("v")!);
  const qs = keep.toString() ? `?${keep}` : "";
  const path = u.pathname.replace(/\/+$/, "") + "/";

  if (host === "facebook.com" || host === "fb.watch") return { platform: "facebook", url: `https://${host === "fb.watch" ? "fb.watch" : "www.facebook.com"}${path}${qs}` };
  if (host === "instagram.com") return { platform: "instagram", url: `https://www.instagram.com${path}` };
  if (host === "youtube.com" || host === "youtu.be") return { platform: "youtube", url: `https://${host === "youtu.be" ? "youtu.be" : "www.youtube.com"}${path.replace(/\/$/, "")}${qs}` };
  if (host === "tiktok.com" || host === "vm.tiktok.com" || host === "vt.tiktok.com") return { platform: "tiktok", url: `https://${u.hostname.replace(/^m\./, "www.")}${path}` };
  return null;
}

/** Share/short links that must be followed to reach the real reel address. */
export function needsResolving(url: string) {
  const u = new URL(url);
  const host = hostOf(u);
  return (
    host === "fb.watch" ||
    host === "vm.tiktok.com" ||
    host === "vt.tiktok.com" ||
    (host === "tiktok.com" && u.pathname.startsWith("/t/")) ||
    ((host === "facebook.com" || host === "instagram.com") && u.pathname.startsWith("/share/"))
  );
}

function youtubeId(url: string): string | null {
  const u = new URL(url);
  if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0] || null;
  const m = u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{6,})/);
  if (m) return m[1];
  return u.searchParams.get("v");
}

function instagramCode(url: string): string | null {
  const m = new URL(url).pathname.match(/^\/(?!share\/)(?:[\w.]+\/)?(?:reel|reels|p|tv)\/([\w-]+)/);
  return m ? m[1] : null;
}

function tiktokId(url: string): string | null {
  const m = new URL(url).pathname.match(/\/video\/(\d+)/);
  return m ? m[1] : null;
}

export function embedFor(reel: Pick<Reel, "url" | "platform">): { embed: string; preview: string | null; thumb: string | null } {
  const { url, platform } = reel;
  switch (platform) {
    case "upload":
      return { embed: url, preview: url, thumb: null };
    case "facebook": {
      const base = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=360&height=640`;
      return { embed: `${base}&autoplay=true`, preview: `${base}&autoplay=true&mute=true`, thumb: null };
    }
    case "instagram": {
      const code = instagramCode(url);
      // Instagram does not allow autoplay in embeds; the pop-up shows its own player.
      return { embed: code ? `https://www.instagram.com/p/${code}/embed/` : url, preview: null, thumb: null };
    }
    case "youtube": {
      const id = youtubeId(url);
      if (!id) return { embed: url, preview: null, thumb: null };
      const base = `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&modestbranding=1`;
      return {
        embed: `${base}&autoplay=1`,
        preview: `${base}&autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1`,
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }
    case "tiktok": {
      const id = tiktokId(url);
      if (!id) return { embed: url, preview: null, thumb: null };
      const base = `https://www.tiktok.com/player/v1/${id}?description=0&music_info=0&rel=0`;
      return { embed: `${base}&autoplay=1`, preview: `${base}&autoplay=1&muted=1&loop=1&controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0&timestamp=0`, thumb: null };
    }
  }
}
