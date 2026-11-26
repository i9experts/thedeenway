"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/en";
import { img } from "@/lib/site";
import { startHeroScene, type HeroScene } from "@/lib/heroScene";

const DURATION = 9000;

export default function HeroSlider({ slides, ui, locale, rtl }: { slides: Dict["heroSlides"]; ui: Dict["heroUi"]; locale: string; rtl: boolean }) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [ready, setReady] = useState(false); // load the other slides' photos after first paint
  const [touched, setTouched] = useState(false); // hides the hint once the visitor moves the light
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lit = useRef<HTMLCanvasElement>(null);
  const litWrap = useRef<HTMLDivElement>(null);
  const scene = useRef<HeroScene | null>(null);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const href = (h: string) => (h.startsWith("/spd-2026") ? h : `/${locale}${h}`);

  // The new slide opens as a circle of light from `origin` (a click point, or wherever the light is).
  const go = useCallback(
    (i: number, origin?: { x: number; y: number }) => {
      const el = section.current;
      if (el) {
        const o = origin ?? scene.current?.light();
        if (o) {
          el.style.setProperty("--ox", `${o.x}px`);
          el.style.setProperty("--oy", `${o.y}px`);
        }
      }
      const nextIndex = ((i % count) + count) % count;
      setIndex((cur) => {
        setPrevIndex(cur);
        return nextIndex;
      });
      // The colour reveal switches to the new photo and opens with the same circle of light.
      scene.current?.setImage(img(slides[nextIndex].image, 1600));
      if (el && litWrap.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const ox = el.style.getPropertyValue("--ox") || "70%";
        const oy = el.style.getPropertyValue("--oy") || "55%";
        litWrap.current.animate([{ clipPath: `circle(0 at ${ox} ${oy})` }, { clipPath: `circle(150vmax at ${ox} ${oy})` }], { duration: 1600, easing: "cubic-bezier(.65,0,.2,1)" });
      }
      setCycle((c) => c + 1);
    },
    [count, slides],
  );

  const fromEvent = (e: React.MouseEvent) => {
    const r = section.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : undefined;
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setPlaying(false);
    setReady(true);
    if (!section.current || !canvas.current || !lit.current) return;
    scene.current = startHeroScene(section.current, canvas.current, lit.current, { rtl, reduced });
    scene.current.setImage(img(slides[0].image, 1600));
    return () => scene.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtl]);

  const running = playing && !hovered;
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(id);
  }, [running, go, index, cycle]);

  const s = slides[index];
  const words = s.title.split(" ");

  return (
    <section
      ref={section}
      aria-roledescription="carousel"
      aria-label={slides[0].eyebrow}
      className="hero-stage relative isolate h-[calc(100svh-4.75rem)] max-h-[58rem] min-h-[38rem] overflow-hidden bg-forest-950 lg:h-[calc(100svh-7.25rem)]"
      onPointerMove={() => !touched && setTouched(true)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + (rtl ? -1 : 1));
        if (e.key === "ArrowLeft") go(index + (rtl ? 1 : -1));
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 60) return;
        go(index + ((rtl ? dx > 0 : dx < 0) ? 1 : -1));
      }}
    >
      {/* Photos: dim and colourless until the light touches them */}
      {slides.map((sl, i) => {
        const active = i === index;
        const below = i === prevIndex && !active;
        const src = i === 0 || ready ? img(sl.image, 1600) : undefined;
        return (
          <div key={sl.image} aria-hidden="true" className={`absolute inset-0 ${active ? "iris-in z-20" : below ? "z-10" : "invisible z-0"}`}>
            <img src={src} alt="" fetchPriority={i === 0 ? "high" : undefined} className="hero-dim absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-forest-950/60" />
          </div>
        );
      })}

      {/* The same photo in full colour, drawn only inside the light */}
      <div ref={litWrap} className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
        <canvas ref={lit} className="h-full w-full" />
      </div>

      {/* Scrims for legibility */}
      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-forest-950/90 via-forest-950/40 to-transparent rtl:bg-gradient-to-l" />
      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-forest-950 via-transparent to-forest-950/30" />

      {/* The living tree */}
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 h-full w-full opacity-70 lg:opacity-100" />

      {/* Words */}
      <div className="wrap pointer-events-none relative z-40 flex h-full flex-col justify-end pb-36 sm:pb-40">
        <div key={index} className="pointer-events-auto max-w-[44rem]" role="group" aria-roledescription="slide" aria-label={`${ui.slide} ${index + 1} / ${count}`}>
          <p className="eyebrow slide-in !text-gold-300 before:!bg-gold-300" style={{ animationDelay: "250ms" }}>{s.eyebrow}</p>
          {(() => {
            const Tag = index === 0 ? "h1" : "h2";
            return (
              <Tag className="mt-4 text-[2.5rem] font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                {words.map((wd, k) => (
                  <span key={k} className="hero-word" style={{ animationDelay: `${400 + k * 110}ms` }}>
                    {wd}
                    {k < words.length - 1 ? " " : ""}
                  </span>
                ))}
              </Tag>
            );
          })()}
          <p className="slide-in mt-5 max-w-2xl text-lg text-white/85 sm:text-xl" style={{ animationDelay: `${650 + words.length * 110}ms` }}>{s.text}</p>
          <div className="slide-in mt-8 flex flex-wrap items-center gap-4" style={{ animationDelay: `${800 + words.length * 110}ms` }}>
            <Link href={href(s.href)} className="btn btn-gold">
              {s.cta}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:-scale-x-100"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <span className={`hidden items-center gap-2 text-sm text-white/70 transition-opacity duration-700 lg:inline-flex ${touched ? "opacity-0" : "opacity-100"}`} aria-hidden="true">
              <span className="h-2 w-2 animate-ping rounded-full bg-gold-300" />
              {ui.hint}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-20 z-40 sm:bottom-24" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div className="wrap flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label={ui.slide}>
            {slides.map((sl, i) => (
              <button
                key={sl.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${ui.slide} ${i + 1}: ${sl.eyebrow}`}
                onClick={(e) => go(i, fromEvent(e))}
                className="relative h-1.5 w-8 overflow-hidden rounded-full bg-white/30 sm:w-14"
              >
                {i === index && <span key={cycle} className={`absolute inset-y-0 start-0 rounded-full bg-gold-300 ${running ? "hero-progress" : "w-full"}`} style={{ animationDuration: `${DURATION}ms` }} />}
              </button>
            ))}
            <span className="ltr ms-3 hidden font-display text-sm text-white/80 sm:inline">{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPlaying((v) => !v)} aria-label={playing ? ui.pause : ui.play} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/15">
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button type="button" onClick={(e) => go(index - 1, fromEvent(e))} aria-label={ui.prev} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/15">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:-scale-x-100"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button type="button" onClick={(e) => go(index + 1, fromEvent(e))} aria-label={ui.next} className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-forest-950 transition hover:bg-gold-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:-scale-x-100"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
