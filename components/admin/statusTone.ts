import type { AppStatus } from "@/lib/admissionsShared";

export const statusTone: Record<AppStatus, string> = {
  submitted: "bg-gold-100 text-gold-600",
  under_review: "bg-sky-100 text-sky-800",
  documents_requested: "bg-sky-100 text-sky-800",
  assessment_scheduled: "bg-sky-100 text-sky-800",
  offered: "bg-lime-100 text-forest-800",
  enrolled: "bg-forest-800 text-white",
  waitlisted: "bg-line text-forest-900",
  not_offered: "bg-red-100 text-red-800",
  withdrawn: "bg-line text-muted",
};

