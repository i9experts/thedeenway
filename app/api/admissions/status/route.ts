import { dbConfigured } from "@/lib/db";
import { findForParent } from "@/lib/admissions";
import { limited } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Parents check their application with the application number AND the mobile number.
// Only what a parent needs is returned — never internal notes, documents or other details.
export async function POST(req: Request) {
  if (!dbConfigured()) return Response.json({ error: "server" }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (limited(`status:${ip}`, 20, 60 * 60 * 1000)) return Response.json({ error: "tooMany" }, { status: 429 });
  let body: { appNo?: unknown; phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "notFound" }, { status: 404 });
  }
  try {
    const a = await findForParent(String(body.appNo ?? "").slice(0, 30), String(body.phone ?? "").slice(0, 20));
    if (!a) return Response.json({ error: "notFound" }, { status: 404 });
    return Response.json({
      appNo: a.app_no,
      childName: a.child_name,
      grade: a.grade,
      campus: a.campus,
      status: a.status,
      submittedAt: a.created_at,
      assessmentAt: a.assessment_at,
      message: a.public_message,
      history: a.history,
    });
  } catch (e) {
    console.error("admissions: status lookup failed", e);
    return Response.json({ error: "server" }, { status: 500 });
  }
}
