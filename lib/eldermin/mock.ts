import type { AttendanceDay, ElderminApi, Guardian, Homework, Invoice, Student, Term } from "./types";

// A SAMPLE family for the portal preview. Nothing here is a real student or real record.
// Dates are generated relative to today so the preview always looks current.

const students: Student[] = [
  { id: "demo-s1", name: "Ayesha Ahmed", className: "Grade 3", section: "A", campusId: "fatima", rollNo: "12", classTeacher: "Ms. Sana", stage: "primary" },
  { id: "demo-s2", name: "Yusuf Ahmed", className: "KG", section: "B", campusId: "fatima", rollNo: "07", classTeacher: "Ms. Hira", stage: "preprimary" },
];
const guardian: Guardian = { id: "demo-guardian", name: "Mr. Ahmed", phone: "03XX XXXXXXX", students };

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  // Final mixing so similar strings (consecutive dates) give well-spread values.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function attendance(studentId: string, from: string, to: string): AttendanceDay[] {
  const out: AttendanceDay[] = [];
  const today = iso(new Date());
  for (let d = new Date(from + "T00:00:00Z"); iso(d) <= to && iso(d) <= today; d = addDays(d, 1)) {
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue; // weekend
    const r = hash(studentId + iso(d));
    out.push(
      r < 0.035 ? { date: iso(d), status: "absent", note: "Parent informed the school" }
      : r < 0.08 ? { date: iso(d), status: "late", note: "Arrived after 8:15 AM" }
      : r < 0.1 ? { date: iso(d), status: "leave", note: "Approved leave" }
      : { date: iso(d), status: "present" },
    );
  }
  return out;
}

function homework(s: Student): Homework[] {
  const t = new Date();
  const items: [string, string, number, number][] =
    s.stage === "preprimary"
      ? [
          ["English", "Trace and say the letters M, N and O", -1, 1],
          ["Islamic Studies", "Practise the du'a before eating", -2, 2],
          ["Numeracy", "Count and colour: worksheet 14", 0, 3],
        ]
      : [
          ["Mathematics", "Multiplication tables 6–8: workbook p. 42", -1, 1],
          ["English", "Write five sentences about your weekend", -1, 2],
          ["Urdu", "سبق ۹ کی املا یاد کریں", 0, 2],
          ["General Science", "Draw and label the parts of a plant", -2, 4],
          ["Islamic Studies", "Memorise Hadith 12 with its meaning", 0, 5],
        ];
  return items.map(([subject, title, a, d], i) => ({ id: `${s.id}-hw${i}`, subject, title, assigned: iso(addDays(t, a)), due: iso(addDays(t, d)) }));
}

const grade = (p: number) => (p >= 90 ? "A+" : p >= 80 ? "A" : p >= 70 ? "B" : p >= 60 ? "C" : "D");
function terms(s: Student): Term[] {
  const subjects = s.stage === "preprimary" ? ["English", "Numeracy", "Islamic Foundations", "Understanding the World", "Creative Arts"] : ["English", "Urdu", "Mathematics", "General Science", "Islamic Studies", "General Knowledge"];
  const total = s.stage === "preprimary" ? 50 : 100;
  const year = new Date().getFullYear();
  return [
    {
      id: `${s.id}-t1`,
      name: "First Term",
      published: `${year}-11-14`,
      remark: s.stage === "preprimary" ? "A cheerful learner who shares well and enjoys story time." : "Works carefully and helps classmates. Keep practising multiplication tables.",
      results: subjects.map((subject) => {
        const pct = 68 + Math.round(hash(s.id + subject) * 28);
        return { subject, marks: Math.round((pct / 100) * total), total, grade: grade(pct) };
      }),
    },
  ];
}

function invoices(s: Student): Invoice[] {
  const amount = s.stage === "preprimary" ? 10000 : 12000; // Parents' Handbook 2025–26 schedule
  const now = new Date();
  const out: Invoice[] = [];
  for (let k = 0; k >= -3; k--) {
    const m = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + k + 1, 1));
    const period = iso(m).slice(0, 7);
    const due = `${period}-10`;
    const upcoming = k === 0;
    out.push(
      upcoming
        ? { id: `${s.id}-${period}`, period, amount, dueDate: due, status: "due" }
        : { id: `${s.id}-${period}`, period, amount, dueDate: due, status: "paid", paidOn: `${period}-0${5 + ((k + 9) % 4)}`, receiptNo: `R-${period.replace("-", "")}-${s.rollNo}` },
    );
  }
  return out;
}

export const mockEldermin: ElderminApi = {
  async getGuardian(id) {
    return id === guardian.id ? guardian : null;
  },
  async getAttendance(studentId, from, to) {
    return attendance(studentId, from, to);
  },
  async getHomework(studentId) {
    const s = students.find((x) => x.id === studentId);
    return s ? homework(s) : [];
  },
  async getTerms(studentId) {
    const s = students.find((x) => x.id === studentId);
    return s ? terms(s) : [];
  },
  async getInvoices(studentId) {
    const s = students.find((x) => x.id === studentId);
    return s ? invoices(s) : [];
  },
  async getAnnouncements() {
    const t = new Date();
    return [
      { id: "a1", date: iso(addDays(t, -1)), title: "Students Performance Day 2026 — consent form", body: "SPD 2026 “Nurture on Values” is on Saturday, 19 December 2026, 6:00–10:00 PM. Please complete the participation and media consent form for each child.", href: "/spd-2026/index.html", consent: true },
      { id: "a2", date: iso(addDays(t, -4)), title: "Progress Report Day", body: "Term-wise Progress Report Day: parent–teacher conferences and report card reviews. Your class teacher will share your time slot." },
      { id: "a3", date: iso(addDays(t, -9)), title: "Reminder: labelled belongings", body: "Please label uniform pieces, water bottles and lunch boxes with your child's full name." },
    ];
  },
};
