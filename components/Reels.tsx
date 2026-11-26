"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dict } from "@/content/en";
import { platformNames, type Platform, type PublicReel } from "@/lib/reels";
import { site } from "@/lib/site";

type T = Dict["reels"];

function useReels() {
  const [reels, setReels] = useState<PublicReel[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/reels")
      .then((r) => (r.ok ? r.json() : { reels: [] }))
      .then((d) => alive && setReels(d.reels ?? []))
      .catch(() => alive && setReels([]));
    return () => {
      alive = false;
    };
  }, []);
  return reels;
}

function PlatformIcon({ platform, className = "h-4 w-4" }: { platform: Platform; className?: string }) {
  const paths: Record<Platform, string> = {
    facebook: "M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z",
    instagram: "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-3.2a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z",
    youtube: "M23 7.2a3 3 0 00-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 001 7.2 31 31 0 00.5 12a31 31 0 00.5 4.8 3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1 31 31 0 00.5-4.8 31 31 0 00-.5-4.8zM9.8 15.1V8.9l5.4 3.1z",
    tiktok: "M16.5 3c.4 2 1.7 3.4 3.8 3.6v3.2a7.3 7.3 0 01-3.8-1.1v6.6a5.8 5.8 0 11-5.8-5.8c.3 0 .6 0 .9.1v3.3a2.6 2.6 0 10 1.7 2.4V3z",
    upload: "M12 2a10 10 0 100 20 10 10 0 000-20zm-2 6l6 4-6 4z",
  };
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={paths[platform]} />
    </svg>
  );
}

/** A reel card: plays silently while on screen (where the platform allows it); tap opens the player with sound. */
function ReelCard({ reel, t, onOpen, eager = false }: { reel: PublicReel; t: T; onOpen: () => void; eager?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(eager); // mount the preview once the card is close to the screen
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
        setOnScreen(e.intersectionRatio > 0.35);
      },
      { rootMargin: "200px", threshold: [0, 0.35, 0.7] },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // Uploaded videos: play only while visible, to save data and battery.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (onScreen) v.play().catch(() => undefined);
    else v.pause();
  }, [onScreen, near]);

  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const autoplay = Boolean(reel.preview) && !reduced;
  const name = reel.title || platformNames[reel.platform];

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={`${t.play}: ${name}`}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-[1.25rem] bg-forest-900 text-start shadow-soft ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1"
    >
      {reel.thumb && <img src={reel.thumb} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} className="absolute inset-0 h-full w-full object-cover" />}
      {!reel.thumb && !near && <div className="pattern-dark absolute inset-0" />}
      {near && reel.platform === "upload" && (
        <video ref={video} src={reel.preview ?? reel.embed} muted loop playsInline autoPlay={autoplay && onScreen} preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {near && reel.platform !== "upload" && (autoplay ? onScreen : !reel.thumb) && (
        <iframe
          src={autoplay ? reel.preview! : reel.embed}
          title={name}
          tabIndex={-1}
          aria-hidden="true"
          allow="autoplay; encrypted-media; picture-in-picture"
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] border-0"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/85 via-transparent to-forest-950/25" />
      <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
        <PlatformIcon platform={reel.platform} className="h-3.5 w-3.5" />
        {platformNames[reel.platform]}
      </span>
      {autoplay ? (
        <span className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition group-hover:bg-gold-500 group-hover:text-forest-950" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" /></svg>
        </span>
      ) : (
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-forest-900 shadow-lg transition group-hover:scale-110 group-hover:bg-gold-300" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
      )}
      {reel.title && <span className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-[0.95rem] font-semibold leading-snug text-white">{reel.title}</span>}
    </button>
  );
}

function Player({ reel, t, onClose }: { reel: PublicReel; t: T; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={reel.title || platformNames[reel.platform]} className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-950/90 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex max-h-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" onClick={onClose} className="mb-3 self-end rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25">
          ✕ {t.close}
        </button>
        <div className="aspect-[9/16] h-[min(78vh,44rem)] max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl">
          {reel.platform === "upload" ? (
            <video src={reel.embed} controls autoPlay playsInline className="h-full w-full object-contain" />
          ) : (
            <iframe src={reel.embed} title={reel.title || platformNames[reel.platform]} className="h-full w-full border-0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen />
          )}
        </div>
        {reel.platform !== "upload" && (
          <a href={reel.url} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white">
            <PlatformIcon platform={reel.platform} /> {t.watchOn} {platformNames[reel.platform]} ↗
          </a>
        )}
      </div>
    </div>
  );
}

function FollowCards({ t }: { t: T }) {
  return (
    <div className="card flex flex-col items-center gap-5 p-8 text-center sm:p-10">
      <p className="max-w-xl text-lg text-muted">{t.empty}</p>
      <ul className="flex flex-wrap justify-center gap-3">
        {site.facebook.map((f) => (
          <li key={f.href}>
            <a href={f.href} target="_blank" rel="noopener" className="btn btn-primary">
              <PlatformIcon platform="facebook" /> <span className="ltr">{f.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Home-page strip: auto-scrolls slowly, pauses on hover/touch/focus. */
export function ReelsStrip({ t, locale, rtl }: { t: T; locale: string; rtl: boolean }) {
  const all = useReels();
  const reels = useMemo(() => (all ?? []).filter((r) => r.showOnHome).slice(0, 16), [all]);
  const [active, setActive] = useState<PublicReel | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = track.current;
    if (!el || reels.length < 3) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const dir = rtl ? -1 : 1;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!paused.current && !active) {
        el.scrollLeft += dir * dt * 0.035;
        if (Math.abs(el.scrollLeft) + el.clientWidth >= el.scrollWidth - 2) el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reels.length, rtl, active]);

  const nudge = (d: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: (rtl ? -d : d) * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="overflow-hidden bg-forest-950 py-16 text-white sm:py-24">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow !text-gold-300 before:!bg-gold-300">{t.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-3 text-lg text-white/75">{t.lead}</p>
        </div>
        <div className="flex items-center gap-2">
          {reels.length > 2 && (
            <>
              <button type="button" onClick={() => nudge(-1)} aria-label="‹" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 hover:bg-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:-scale-x-100"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <button type="button" onClick={() => nudge(1)} aria-label="›" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 hover:bg-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:-scale-x-100"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </>
          )}
          <Link href={`/${locale}/reels`} className="btn btn-gold">{t.viewAll}</Link>
        </div>
      </div>

      <div className="mt-10">
        {all === null ? (
          <div className="wrap flex gap-5 overflow-hidden" aria-label={t.loading}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] w-56 shrink-0 animate-pulse rounded-[1.25rem] bg-white/10" />
            ))}
          </div>
        ) : reels.length === 0 ? (
          <div className="wrap text-forest-950"><FollowCards t={t} /></div>
        ) : (
          <div
            ref={track}
            className="no-scrollbar flex gap-5 overflow-x-auto px-4 pb-2 sm:px-7 lg:px-[max(1.75rem,calc((100vw-76rem)/2+1.75rem))]"
            onMouseEnter={() => (paused.current = true)}
            onMouseLeave={() => (paused.current = false)}
            onTouchStart={() => (paused.current = true)}
            onTouchEnd={() => setTimeout(() => (paused.current = false), 2500)}
            onFocusCapture={() => (paused.current = true)}
            onBlurCapture={() => (paused.current = false)}
          >
            {reels.map((r, i) => (
              <div key={r.id} className="w-[58vw] max-w-[15rem] shrink-0 sm:w-56">
                <ReelCard reel={r} t={t} onOpen={() => setActive(r)} eager={i < 4} />
              </div>
            ))}
          </div>
        )}
      </div>
      {active && <Player reel={active} t={t} onClose={() => setActive(null)} />}
    </section>
  );
}

/** Full gallery with platform filter. */
export function ReelsGallery({ t }: { t: T }) {
  const reels = useReels();
  const [filter, setFilter] = useState<Platform | "all">("all");
  const [active, setActive] = useState<PublicReel | null>(null);
  const platforms = useMemo(() => Array.from(new Set((reels ?? []).map((r) => r.platform))), [reels]);
  const shown = (reels ?? []).filter((r) => filter === "all" || r.platform === filter);

  if (reels === null) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-label={t.loading}>
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[9/16] animate-pulse rounded-[1.25rem] bg-line" />)}
      </div>
    );
  }
  if (reels.length === 0) return <FollowCards t={t} />;

  return (
    <>
      {platforms.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group">
          {(["all", ...platforms] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={filter === p}
              onClick={() => setFilter(p)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === p ? "border-forest-800 bg-forest-800 text-white" : "border-line bg-white text-forest-900 hover:bg-lime-100"}`}
            >
              {p !== "all" && <PlatformIcon platform={p} />}
              {p === "all" ? t.all : platformNames[p]}
            </button>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {shown.map((r, i) => (
          <li key={r.id}>
            <ReelCard reel={r} t={t} onOpen={() => setActive(r)} eager={i < 8} />
          </li>
        ))}
      </ul>
      {active && <Player reel={active} t={t} onClose={() => setActive(null)} />}
    </>
  );
}
