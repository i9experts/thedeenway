import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { pdf: "application/pdf", jpg: "image/jpeg", png: "image/png" };

// Applicants' documents are private: only signed-in staff can open them.
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!(await isAdmin())) return new Response("Sign in required", { status: 401 });
  const { file } = await params;
  const m = /^[a-f0-9]{32}\.(pdf|jpg|png)$/.exec(file);
  if (!m || !process.env.UPLOAD_DIR) return new Response("Not found", { status: 404 });
  const full = path.join(process.env.UPLOAD_DIR, "applications", file);
  try {
    if (!(await stat(full)).isFile()) throw new Error("not a file");
    return new Response(new Uint8Array(await readFile(full)), {
      headers: { "Content-Type": TYPES[m[1]], "Content-Disposition": "inline", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
