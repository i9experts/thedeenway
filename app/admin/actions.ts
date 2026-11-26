"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearFailures, endSession, isAdmin, passwordMatches, recordFailure, startSession, tooManyAttempts } from "@/lib/auth";
import { addReel, deleteReel, moveReel, updateReel } from "@/lib/db";
import { resolveReelUrl } from "@/lib/resolve";
import { needsResolving } from "@/lib/reels";
import { removeUpload } from "@/lib/uploads";

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin?e=session");
}

export async function login(formData: FormData) {
  const ip = await clientIp();
  if (tooManyAttempts(ip)) redirect("/admin?e=locked");
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    recordFailure(ip);
    redirect("/admin?e=password");
  }
  clearFailures(ip);
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

const CAMPUSES = new Set(["fatima", "ansari", "faisalabad"]);

export async function createReel(formData: FormData) {
  await requireAdmin();
  const urls = String(formData.get("urls") ?? "")
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const title = String(formData.get("title") ?? "").trim().slice(0, 140);
  const campusRaw = String(formData.get("campus") ?? "");
  const campus = CAMPUSES.has(campusRaw) ? campusRaw : null;
  const showOnHome = formData.get("showOnHome") === "on";

  let added = 0;
  const rejected: string[] = [];
  // Add in reverse so the first link pasted ends up first in the list.
  for (const raw of [...urls].reverse()) {
    const parsed = await resolveReelUrl(raw);
    if (!parsed || needsResolving(parsed.url)) {
      rejected.push(raw);
      continue;
    }
    await addReel({ ...parsed, title: urls.length === 1 ? title : "", campus, showOnHome });
    added++;
  }
  revalidatePath("/admin");
  const q = new URLSearchParams({ added: String(added) });
  if (rejected.length) q.set("rejected", String(rejected.length));
  redirect(`/admin?${q}`);
}

export async function saveReel(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const campusRaw = String(formData.get("campus") ?? "");
  await updateReel(id, {
    title: String(formData.get("title") ?? "").trim().slice(0, 140),
    campus: CAMPUSES.has(campusRaw) ? campusRaw : null,
    showOnHome: formData.get("showOnHome") === "on",
  });
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function removeReel(formData: FormData) {
  await requireAdmin();
  const removed = await deleteReel(Number(formData.get("id")));
  if (removed?.platform === "upload") await removeUpload(removed.url);
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}

export async function reorderReel(formData: FormData) {
  await requireAdmin();
  const dir = formData.get("dir") === "up" ? -1 : 1;
  await moveReel(Number(formData.get("id")), dir);
  revalidatePath("/admin");
  redirect("/admin");
}
