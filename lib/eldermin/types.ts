// The data the Parent Portal needs from Eldermin. Mirrors docs/ELDERMIN-INTEGRATION-SPEC.md,
// so the demo source can be swapped for the real API without touching any screen.

export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export type Student = {
  id: string;
  name: string;
  className: string;
  section: string;
  campusId: "fatima" | "ansari" | "faisalabad";
  rollNo: string;
  classTeacher: string;
  stage: "preprimary" | "primary" | "middle" | "secondary";
};

export type Guardian = { id: string; name: string; phone: string; students: Student[] };
export type AttendanceDay = { date: string; status: AttendanceStatus; note?: string };
export type Homework = { id: string; subject: string; title: string; assigned: string; due: string };
export type SubjectResult = { subject: string; marks: number; total: number; grade: string };
export type Term = { id: string; name: string; published: string; results: SubjectResult[]; remark: string };
export type Invoice = { id: string; period: string; amount: number; dueDate: string; status: "paid" | "due" | "overdue"; paidOn?: string; receiptNo?: string };
export type Announcement = { id: string; date: string; title: string; body: string; href?: string; consent?: boolean };

export interface ElderminApi {
  getGuardian(guardianId: string): Promise<Guardian | null>;
  getAttendance(studentId: string, from: string, to: string): Promise<AttendanceDay[]>;
  getHomework(studentId: string): Promise<Homework[]>;
  getTerms(studentId: string): Promise<Term[]>;
  getInvoices(studentId: string): Promise<Invoice[]>;
  getAnnouncements(guardianId: string): Promise<Announcement[]>;
}
