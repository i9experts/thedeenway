// Turns a social-media reel link into something the site can embed.
// Only these platforms are accepted, so the admin panel can't be used to embed arbitrary pages.

export type Platform = "facebook" | "instagram" | "youtube" | "tiktok";

export type Reel = {
  id: number;
  url: string;
  platform: Platform;
  title: string;
  campus: string | null;
  showOnHome: boolean;
  position: number;
};

export type PublicReel = Reel & { embed: string; thumb: string | null };

export const platformNames: Record<Platform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

export function parseReelUrl(raw: string): { platform: Platform; url: string } | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^www\.|^m\.|^web\./, "");
  const clean = `https://${u.hostname.replace(/^m\.|^web\./, "www.")}${u.pathname}${u.search}`;
  if (host === "facebook.com" || host === "fb.watch") return { platform: "facebook", url: clean };
  if (host === "instagram.com") return { platform: "instagram", url: clean };
  if (host === "youtube.com" || host === "youtu.be") return { platform: "youtube", url: clean };
  if (host === "tiktok.com" || host === "vm.tiktok.com") return { platform: "tiktok", url: clean };
  return null;
}

function youtubeId(url: string): string | null {
  const u = new URL(url);
  if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0] || null;
  const shorts = u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{6,})/);
  if (shorts) return shorts[1];
  return u.searchParams.get("v");
}

export function embedFor(reel: Pick<Reel, "url" | "platform">): { embed: string; thumb: string | null } {
  const { url, platform } = reel;
  switch (platform) {
    case "facebook":
      return {
        embed: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=360&height=640`,
        thumb: null,
      };
    case "instagram": {
      const m = new URL(url).pathname.match(/\/(reel|reels|p|tv)\/([\w-]+)/);
      return { embed: m ? `https://www.instagram.com/${m[1] === "reels" ? "reel" : m[1]}/${m[2]}/embed` : url, thumb: null };
    }
    case "youtube": {
      const id = youtubeId(url);
      return {
        embed: id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1` : url,
        thumb: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null,
      };
    }
    case "tiktok": {
      const m = new URL(url).pathname.match(/\/video\/(\d+)/);
      return { embed: m ? `https://www.tiktok.com/embed/v2/${m[1]}` : url, thumb: null };
    }
  }
}
