"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearFailures, endSession, isAdmin, passwordMatches, recordFailure, startSession, tooManyAttempts } from "@/lib/auth";
import { addReel, deleteReel, moveReel, updateReel } from "@/lib/db";
import { resolveReelUrl } from "@/lib/resolve";
import { needsResolving } from "@/lib/reels";
import { updateApplication } from "@/lib/admissions";
import { STATUSES, type AppStatus } from "@/lib/admissionsShared";
import { removeUpload } from "@/lib/uploads";
import { deletePerson, movePerson } from "@/lib/people";

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

export async function saveApplication(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || !(STATUSES as readonly string[]).includes(status)) redirect("/admin/admissions");
  const at = String(formData.get("assessment_at") ?? "");
  await updateApplication(id, {
    status: status as AppStatus,
    // datetime-local value is school local time (Pakistan, UTC+5)
    assessment_at: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(at) ? `${at}:00+05:00` : "",
    public_message: String(formData.get("public_message") ?? "").trim().slice(0, 1000),
    internal_note: String(formData.get("internal_note") ?? "").trim().slice(0, 2000),
  });
  revalidatePath("/admin/admissions");
  redirect(`/admin/admissions/${id}?saved=1`);
}

export async function removePerson(formData: FormData) {
  await requireAdmin();
  const gone = await deletePerson(Number(formData.get("id")));
  if (gone?.photo.startsWith("/media/")) await removeUpload(gone.photo);
  revalidatePath("/admin/people");
  redirect("/admin/people?deleted=1");
}

export async function reorderPerson(formData: FormData) {
  await requireAdmin();
  await movePerson(Number(formData.get("id")), formData.get("dir") === "up" ? -1 : 1);
  revalidatePath("/admin/people");
  redirect("/admin/people");
}
