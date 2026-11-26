import type { NextRequest } from "next/server";
import { createWriteStream } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { addReel, dbConfigured } from "@/lib/db";
import { MAX_UPLOAD_BYTES, VIDEO_TYPES, uploadDir, uploadsConfigured } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAMPUSES = new Set(["fatima", "ansari", "faisalabad"]);

// Relative redirect: behind Railway's proxy, req.url carries the internal host, not the public domain.
function back(_req: NextRequest, query: string) {
  return new Response(null, { status: 303, headers: { Location: `/admin?${query}` } });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return back(req, "e=session");
  if (!dbConfigured() || !uploadsConfigured()) return back(req, "uploadError=setup");
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 1024 * 1024) return back(req, "uploadError=size");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return back(req, "uploadError=read");
  }
  const file = form.get("video");
  if (!(file instanceof File) || file.size === 0) return back(req, "uploadError=missing");
  const ext = VIDEO_TYPES[file.type];
  if (!ext) return back(req, "uploadError=type");
  if (file.size > MAX_UPLOAD_BYTES) return back(req, "uploadError=size");

  const name = `${randomBytes(16).toString("hex")}.${ext}`;
  const dir = await uploadDir();
  await pipeline(Readable.fromWeb(file.stream() as import("node:stream/web").ReadableStream), createWriteStream(path.join(dir, name)));

  const campusRaw = String(form.get("campus") ?? "");
  await addReel({
    url: `/media/${name}`,
    platform: "upload",
    title: String(form.get("title") ?? "").trim().slice(0, 140),
    campus: CAMPUSES.has(campusRaw) ? campusRaw : null,
    showOnHome: form.get("showOnHome") === "on",
  });
  revalidatePath("/admin");
  return back(req, "added=1");
}
