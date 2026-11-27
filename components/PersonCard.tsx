import type { ReactNode } from "react";

export default function PersonCard({ name, role, campus, bio, photo, large = false, children }: { name: string; role: string; campus?: string; bio?: string; photo?: string; large?: boolean; children?: ReactNode }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className={`relative ${large ? "aspect-[4/5]" : "aspect-square"} overflow-hidden bg-forest-900`}>
        {photo ? (
          <img src={photo} alt={name} loading="lazy" className="h-full w-full object-cover object-top" />
        ) : (
          <div className="pattern-dark flex h-full w-full items-center justify-center">
            <span className="font-display text-7xl font-semibold text-gold-300" aria-hidden="true">{name.trim()[0]}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold" dir="auto">{name}</h3>
        {role && <p className="mt-0.5 font-semibold text-gold-600" dir="auto">{role}</p>}
        {campus && <p className="mt-0.5 text-sm text-muted">{campus}</p>}
        {bio && <p className="mt-3 whitespace-pre-line text-[0.95rem] text-muted" dir="auto">{bio}</p>}
        {children && <div className="mt-auto pt-4">{children}</div>}
      </div>
    </article>
  );
}
