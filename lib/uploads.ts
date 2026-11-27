import "server-only";
import { mkdir, stat, unlink } from "node:fs/promises";
import path from "node:path";

// Uploaded reel videos live on a Railway volume mounted at UPLOAD_DIR (e.g. /data/uploads).
// Without a volume, files would vanish on every redeploy, so uploads stay off until it is set.

export const MAX_UPLOAD_BYTES = 150 * 1024 * 1024; // 150 MB
export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MIME_BY_EXT: Record<string, string> = { mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export function uploadsConfigured() {
  return Boolean(process.env.UPLOAD_DIR);
}

export async function uploadDir() {
  const dir = process.env.UPLOAD_DIR;
  if (!dir) throw new Error("UPLOAD_DIR is not set");
  await mkdir(dir, { recursive: true });
  return dir;
}

/** Only names we generated ourselves: 32 hex chars + known extension. */
export function safeFileName(name: string) {
  return /^[a-f0-9]{32}\.(mp4|webm|mov|jpg|png|webp)$/.test(name) ? name : null;
}

export async function filePath(name: string) {
  const safe = safeFileName(name);
  if (!safe || !process.env.UPLOAD_DIR) return null;
  const full = path.join(process.env.UPLOAD_DIR, safe);
  try {
    const s = await stat(full);
    return s.isFile() ? { full, size: s.size, ext: safe.split(".").pop()! } : null;
  } catch {
    return null;
  }
}

export async function removeUpload(url: string) {
  const name = url.replace(/^\/media\//, "");
  const f = await filePath(name);
  if (f) await unlink(f.full).catch(() => undefined);
}
