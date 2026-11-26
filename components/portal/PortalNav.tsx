"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { PortalDict } from "@/content/portal";

const tabs = [
  ["home", ""],
  ["attendance", "/attendance"],
  ["homework", "/homework"],
  ["results", "/results"],
  ["fees", "/fees"],
  ["notices", "/notices"],
] as const;

export default function PortalNav({ locale, t, students }: { locale: string; t: PortalDict; students: { id: string; name: string; className: string }[] }) {
  const pathname = usePathname() ?? "";
  const search = useSearchParams();
  const base = `/${locale}/portal`;
  const current = students.find((s) => s.id === search.get("child")) ?? students[0];
  const q = `?child=${current.id}`;

  return (
    <div className="sticky top-[4.75rem] z-30 border-b border-line bg-white/95 backdrop-blur lg:top-[7.25rem]">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
        {students.length > 1 && (
          <div className="flex items-center gap-1.5" role="group" aria-label={t.child}>
            {students.map((s) => (
              <Link
                key={s.id}
                href={`${pathname}?child=${s.id}`}
                aria-current={s.id === current.id ? "true" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${s.id === current.id ? "bg-forest-800 text-white" : "bg-cream text-forest-900 hover:bg-lime-100"}`}
              >
                {s.name.split(" ")[0]} <span className="font-normal opacity-75">· {s.className}</span>
              </Link>
            ))}
          </div>
        )}
        <nav aria-label={t.title} className="-mx-1 overflow-x-auto">
          <ul className="flex gap-1 px-1">
            {tabs.map(([key, path]) => {
              const href = base + path;
              const active = pathname === href;
              return (
                <li key={key}>
                  <Link href={href + q} aria-current={active ? "page" : undefined} className={`block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${active ? "bg-gold-100 text-forest-950 ring-1 ring-gold-300" : "text-forest-900 hover:bg-cream"}`}>
                    {t.nav[key]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
