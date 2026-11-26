import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { dbConfigured } from "@/lib/db";
import { createApplication } from "@/lib/admissions";
import { CAMPUS_IDS, DOC_KINDS, DOC_TYPES, MAX_DOC_BYTES, phoneDigits } from "@/lib/admissionsShared";
import { isLocale } from "@/lib/i18n";
import { limited } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: object, status = 200) => Response.json(body, { status });

export async function POST(req: Request) {
  if (!dbConfigured()) return json({ error: "server" }, 503);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (limited(`apply:${ip}`, 6, 60 * 60 * 1000)) return json({ error: "tooMany" }, 429);
  if (Number(req.headers.get("content-length") ?? 0) > 18 * 1024 * 1024) return json({ error: "file" }, 413);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "server" }, 400);
  }
  const get = (k: string, max = 200) => String(form.get(k) ?? "").trim().slice(0, max);

  // Bots fill every field; people never see this one. Pretend it worked.
  if (get("website")) return json({ appNo: "TDS-0000-00000" });

  const fields: Record<string, string> = {};
  const invalid: string[] = [];
  const data = {
    locale: isLocale(get("locale")) ? get("locale") : "en",
    campus: get("campus"),
    grade: get("grade", 60),
    child_name: get("child_name", 120),
    dob: get("dob", 10),
    gender: get("gender"),
    father_name: get("father_name", 120),
    mother_name: get("mother_name", 120),
    phone: get("phone", 20),
    whatsapp: get("whatsapp", 20),
    email: get("email", 160),
    address: get("address", 300),
    prev_school: get("prev_school", 160),
    prev_class: get("prev_class", 60),
    notes: get("notes", 1000),
  };
  Object.assign(fields, data);

  for (const k of ["child_name", "grade", "father_name", "address"] as const) if (!data[k]) invalid.push(k);
  if (!(CAMPUS_IDS as readonly string[]).includes(data.campus)) invalid.push("campus");
  if (!["boy", "girl"].includes(data.gender)) invalid.push("gender");
  const digits = phoneDigits(data.phone);
  if (digits.length < 10 || digits.length > 13) invalid.push("phone");
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) invalid.push("email");
  const dob = /^\d{4}-\d{2}-\d{2}$/.test(data.dob) ? new Date(data.dob + "T00:00:00Z") : null;
  const age = dob ? (Date.now() - dob.getTime()) / (365.25 * 86400000) : -1;
  if (!dob || Number.isNaN(dob.getTime()) || age < 1.5 || age > 20) invalid.push("dob");
  if (form.get("declare") !== "on") invalid.push("declare");
  if (invalid.length) return json({ error: "fix", invalid }, 422);

  // Optional documents: stored privately (served only to signed-in staff).
  const docs: { kind: string; file: string; name: string }[] = [];
  const dir = process.env.UPLOAD_DIR ? path.join(process.env.UPLOAD_DIR, "applications") : null;
  for (const kind of DOC_KINDS) {
    const f = form.get(`doc_${kind}`);
    if (!(f instanceof File) || f.size === 0) continue;
    const ext = DOC_TYPES[f.type];
    if (!ext || f.size > MAX_DOC_BYTES) return json({ error: "file", invalid: [`doc_${kind}`] }, 422);
    if (!dir) continue; // uploads not switched on: accept the application without the file
    await mkdir(dir, { recursive: true });
    const file = `${randomBytes(16).toString("hex")}.${ext}`;
    await pipeline(Readable.fromWeb(f.stream() as import("node:stream/web").ReadableStream), createWriteStream(path.join(dir, file)));
    docs.push({ kind, file, name: f.name.slice(0, 120) });
  }

  try {
    const appNo = await createApplication({ ...data, docs });
    return json({ appNo });
  } catch (e) {
    console.error("admissions: could not save application", e);
    return json({ error: "server" }, 500);
  }
}
