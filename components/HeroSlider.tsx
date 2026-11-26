"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/en";
import { img } from "@/lib/site";

const DURATION = 7000;

export default function HeroSlider({ slides, ui, locale, rtl }: { slides: Dict["heroSlides"]; ui: Dict["heroUi"]; locale: string; rtl: boolean }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [cycle, setCycle] = useState(0); // restarts the progress animation
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const href = (h: string) => (h.startsWith("/spd-2026") ? h : `/${locale}${h}`);

  const go = useCallback(
    (i: number) => {
      setIndex(((i % count) + count) % count);
      setCycle((c) => c + 1);
    },
    [count],
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Respect reduced-motion: start paused.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  const running = playing && !hovered;
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(next, DURATION);
    return () => clearTimeout(id);
  }, [running, next, cycle]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") (rtl ? prev : next)();
    if (e.key === "ArrowLeft") (rtl ? next : prev)();
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={slides[0].eyebrow}
      className="relative isolate h-[calc(100svh-4.75rem)] max-h-[54rem] min-h-[36rem] overflow-hidden bg-forest-950 lg:h-[calc(100svh-7.25rem)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={onKey}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 50) return;
        const forward = rtl ? dx > 0 : dx < 0;
        (forward ? next : prev)();
      }}
    >
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={s.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${ui.slide} ${i + 1} / ${count}`}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${active ? "z-10 opacity-100" : "z-0 opacity-0"}`}
          >
            <img
              src={img(s.image, 1600)}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              className={`absolute inset-0 h-full w-full object-cover ${active ? "kenburns" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/55 to-forest-950/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-forest-950/20 to-transparent rtl:bg-gradient-to-l" />
            <div className="wrap relative flex h-full flex-col justify-end pb-36 sm:pb-40">
              <div className="max-w-3xl">
                <p className={`eyebrow !text-gold-300 before:!bg-gold-300 ${active ? "slide-in" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>{s.eyebrow}</p>
                {i === 0 ? (
                  <h1 className={`mt-4 text-[2.5rem] font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl ${active ? "slide-in" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>{s.title}</h1>
                ) : (
                  <h2 className={`mt-4 text-[2.5rem] font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl ${active ? "slide-in" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>{s.title}</h2>
                )}
                <p className={`mt-5 max-w-2xl text-lg text-white/85 sm:text-xl ${active ? "slide-in" : "opacity-0"}`} style={{ animationDelay: "450ms" }}>{s.text}</p>
                <div className={`mt-8 flex flex-wrap gap-3 ${active ? "slide-in" : "opacity-0"}`} style={{ animationDelay: "600ms" }}>
                  <Link href={href(s.href)} tabIndex={active ? 0 : -1} className="btn btn-gold">
                    {s.cta}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:-scale-x-100"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-20 z-20 sm:bottom-24">
        <div className="wrap flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label={ui.slide}>
            {slides.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${ui.slide} ${i + 1}: ${s.eyebrow}`}
                onClick={() => go(i)}
                className="group relative h-1.5 w-8 overflow-hidden rounded-full bg-white/30 sm:w-14"
              >
                {i === index && (
                  <span
                    key={cycle}
                    className={`absolute inset-y-0 start-0 rounded-full bg-gold-300 ${running ? "hero-progress" : "w-full"}`}
                    style={{ animationDuration: `${DURATION}ms` }}
                  />
                )}
              </button>
            ))}
            <span className="ms-3 hidden font-display text-sm text-white/80 sm:inline">
              <span className="ltr">{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPlaying((v) => !v)} aria-label={playing ? ui.pause : ui.play} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/15">
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button type="button" onClick={prev} aria-label={ui.prev} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/15">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:-scale-x-100"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button type="button" onClick={next} aria-label={ui.next} className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-forest-950 transition hover:bg-gold-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:-scale-x-100"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
