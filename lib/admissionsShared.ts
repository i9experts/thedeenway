// Shared by the public form, the status page and the admin panel (safe for the browser).

export const STATUSES = ["submitted", "under_review", "documents_requested", "assessment_scheduled", "offered", "enrolled", "waitlisted", "not_offered", "withdrawn"] as const;
export type AppStatus = (typeof STATUSES)[number];

export const statusLabelEn: Record<AppStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  documents_requested: "Documents requested",
  assessment_scheduled: "Assessment scheduled",
  offered: "Place offered",
  enrolled: "Enrolled",
  waitlisted: "Waiting list",
  not_offered: "Not offered",
  withdrawn: "Withdrawn",
};

export const CAMPUS_IDS = ["fatima", "ansari", "faisalabad"] as const;
export const DOC_KINDS = ["birth", "photo", "report"] as const;
export const DOC_TYPES: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" };
export const MAX_DOC_BYTES = 5 * 1024 * 1024;

export function phoneDigits(raw: string) {
  return raw.replace(/\D/g, "");
}
/** Last 10 digits, so 0334…, +92334… and 92334… all match. */
export function phoneKey(raw: string) {
  return phoneDigits(raw).slice(-10);
}
