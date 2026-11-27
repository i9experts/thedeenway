import type { NextRequest } from "next/server";
import { createWriteStream } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { CATEGORIES, OLD_PHOTOS, createPerson, getPerson, updatePerson, type Category } from "@/lib/people";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, removeUpload, uploadDir, uploadsConfigured } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAMPUSES = new Set(["fatima", "ansari", "faisalabad"]);
const back = (query: string) => new Response(null, { status: 303, headers: { Location: `/admin/people?${query}` } });

// Creates a person, or updates one when `id` is present. Photo: an uploaded image, or one from the old website.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return new Response(null, { status: 303, headers: { Location: "/admin?e=session" } });
  if (!dbConfigured()) return back("error=setup");
  if (Number(req.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES + 1024 * 1024) return back("error=size");
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return back("error=read");
  }
  const get = (k: string, max: number) => String(form.get(k) ?? "").trim().slice(0, max);
  const category = get("category", 20) as Category;
  const name = get("name", 120);
  if (!CATEGORIES.includes(category) || !name) return back("error=name");
  const campusRaw = get("campus", 20);
  const idRaw = get("id", 12);
  const id = idRaw ? Number(idRaw) : null;
  const existing = id ? await getPerson(id) : null;
  if (id && !existing) return back("error=missing");

  let photo: string | undefined;
  const file = form.get("photo");
  const old = get("oldPhoto", 40);
  if (file instanceof File && file.size > 0) {
    const ext = IMAGE_TYPES[file.type];
    if (!ext) return back("error=type");
    if (file.size > MAX_IMAGE_BYTES) return back("error=size");
    if (!uploadsConfigured()) return back("error=uploads");
    const fileName = `${randomBytes(16).toString("hex")}.${ext}`;
    await pipeline(Readable.fromWeb(file.stream() as import("node:stream/web").ReadableStream), createWriteStream(path.join(await uploadDir(), fileName)));
    photo = `/media/${fileName}`;
  } else if ((OLD_PHOTOS as readonly string[]).includes(old)) {
    photo = `/staff-photos/${old}.webp`;
  } else if (form.get("removePhoto") === "on") {
    photo = "";
  }

  const data = { category, name, role: get("role", 120), campus: CAMPUSES.has(campusRaw) ? campusRaw : null, bio: get("bio", 1500) };
  if (existing) {
    await updatePerson(existing.id, { ...data, photo });
    if (photo !== undefined && existing.photo.startsWith("/media/") && existing.photo !== photo) await removeUpload(existing.photo);
  } else {
    await createPerson({ ...data, photo: photo ?? "" });
  }
  revalidatePath("/admin/people");
  return back(existing ? "saved=1" : "added=1");
}
