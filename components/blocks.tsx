import Link from "next/link";
import type { ReactNode } from "react";
import { img } from "@/lib/site";

export function Photo({ name, alt, className = "", priority = false, sizes = "(min-width: 1024px) 50vw, 100vw" }: { name: string; alt: string; className?: string; priority?: boolean; sizes?: string }) {
  return (
    <img
      src={img(name, 1600)}
      srcSet={`${img(name, 800)} 800w, ${img(name, 1600)} 1600w`}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`photo ${className}`}
    />
  );
}

export function PageHero({ eyebrow, title, lead, image, children }: { eyebrow: string; title: string; lead: string; image?: string; children?: ReactNode }) {
  return (
    <section className="pattern relative overflow-hidden border-b border-line bg-sand">
      <div className={`wrap grid items-center gap-10 py-14 sm:py-20 ${image ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
        <div className="reveal max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl lg:text-[3.4rem]">{title}</h1>
          <p className="mt-5 text-lg text-muted sm:text-xl">{lead}</p>
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        {image && (
          <div className="reveal aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-lift">
            <Photo name={image} alt="" priority />
          </div>
        )}
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, lead, center = false }: { eyebrow?: string; title: string; lead?: string; center?: boolean }) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
      {lead && <p className="mt-4 text-lg text-muted">{lead}</p>}
    </div>
  );
}

export function Section({ children, tint = false, id, className = "" }: { children: ReactNode; tint?: boolean; id?: string; className?: string }) {
  return (
    <section id={id} className={`${tint ? "bg-sand" : ""} py-16 sm:py-24 ${className}`}>
      <div className="wrap">{children}</div>
    </section>
  );
}

export function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:-scale-x-100">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-semibold text-forest-700 hover:text-forest-900">
      {children} <Arrow />
    </Link>
  );
}

export function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-1 shrink-0">
      <circle cx="12" cy="12" r="11" fill="#eef7df" />
      <path d="M7 12.5l3 3 7-7" stroke="#156a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 1.5l3 7.3 7.5-.6-5.9 4.8 2.2 7.3L12 16l-6.8 4.3 2.2-7.3L1.5 8.2 9 8.8z" fill="currentColor" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  );
}
