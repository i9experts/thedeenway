import type { ReactNode } from "react";
import type { AttendanceStatus } from "@/lib/eldermin/types";

export const statusStyle: Record<AttendanceStatus, string> = {
  present: "bg-lime-100 text-forest-800",
  absent: "bg-red-100 text-red-800",
  late: "bg-gold-100 text-gold-600",
  leave: "bg-sky-100 text-sky-800",
};

export function Pill({ className = "", children }: { className?: string; children: ReactNode }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold ${className}`}>{children}</span>;
}

export function Tile({ label, value, sub, tone = "" }: { label: string; value: ReactNode; sub?: ReactNode; tone?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className={`ltr mt-1 font-display text-3xl font-semibold ${tone || "text-forest-800"}`}>{value}</p>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-3xl font-semibold">{title}</h2>
      <p className="mt-1 text-muted">{sub}</p>
    </div>
  );
}
