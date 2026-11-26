import Link from "next/link";
import { logout } from "@/app/admin/actions";

export default function AdminShell({ children, signedIn = false, tab, newApplications = 0 }: { children: React.ReactNode; signedIn?: boolean; tab?: "reels" | "admissions"; newApplications?: number }) {
  const link = (active: boolean) => `rounded-full px-4 py-1.5 text-sm font-semibold ${active ? "bg-forest-800 text-white" : "text-forest-900 hover:bg-cream"}`;
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="wrap flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-3">
            <img src="/brand/logo.png" alt="The Deenway School" className="h-9 w-auto" />
            <span className="rounded-full bg-forest-800 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">Admin</span>
          </div>
          {signedIn && (
            <nav aria-label="Admin" className="flex items-center gap-1">
              <Link href="/admin/admissions" className={link(tab === "admissions")} aria-current={tab === "admissions" ? "page" : undefined}>
                Admissions
                {newApplications > 0 && <span className="ms-2 rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold text-forest-950">{newApplications}</span>}
              </Link>
              <Link href="/admin" className={link(tab === "reels")} aria-current={tab === "reels" ? "page" : undefined}>Reels</Link>
            </nav>
          )}
          <div className="flex items-center gap-4 text-sm">
            <a href="/en" target="_blank" className="font-semibold text-forest-700 hover:underline">View website ↗</a>
            {signedIn && (
              <form action={logout}>
                <button className="rounded-full border border-line px-3 py-1.5 font-semibold hover:bg-cream">Sign out</button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="wrap py-10">{children}</main>
    </div>
  );
}
