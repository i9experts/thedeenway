import { isAdmin } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { listApplications } from "@/lib/admissions";
import { CAMPUS_IDS, STATUSES, statusLabelEn } from "@/lib/admissionsShared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Values starting with = + - @ could run as formulas in Excel; prefix them so they stay text.
const cell = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Sign in required", { status: 401 });
  if (!dbConfigured()) return new Response("Database not configured", { status: 503 });
  const q = new URL(req.url).searchParams;
  const status = q.get("status") ?? "";
  const campus = q.get("campus") ?? "";
  const apps = await listApplications({
    status: (STATUSES as readonly string[]).includes(status) ? status : undefined,
    campus: (CAMPUS_IDS as readonly string[]).includes(campus) ? campus : undefined,
    q: q.get("q")?.slice(0, 60) || undefined,
  });
  const head = ["Number", "Received", "Status", "Child", "Date of birth", "Gender", "Class", "Campus", "Father/guardian", "Mother", "Mobile", "WhatsApp", "Email", "Address", "Previous school", "Last class", "Assessment", "Internal note"];
  const lines = apps.map((a) =>
    [a.app_no, a.created_at.toISOString().slice(0, 10), statusLabelEn[a.status], a.child_name, a.dob, a.gender, a.grade, a.campus, a.father_name, a.mother_name, a.phone, a.whatsapp, a.email, a.address, a.prev_school, a.prev_class, a.assessment_at, a.internal_note].map(cell).join(","),
  );
  // BOM so Excel reads Urdu and Arabic names correctly.
  const csv = "﻿" + [head.map(cell).join(","), ...lines].join("\r\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="deenway-applications-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "private, no-store" },
  });
}
