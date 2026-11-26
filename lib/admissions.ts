import "server-only";
import { pool } from "./db";
import { phoneKey, type AppStatus } from "./admissionsShared";

export type Application = {
  id: number;
  app_no: string;
  created_at: Date;
  status: AppStatus;
  locale: string;
  campus: string;
  grade: string;
  child_name: string;
  dob: string;
  gender: string;
  father_name: string;
  mother_name: string;
  phone: string;
  phone_key: string;
  whatsapp: string;
  email: string;
  address: string;
  prev_school: string;
  prev_class: string;
  notes: string;
  assessment_at: string;
  public_message: string;
  internal_note: string;
  docs: { kind: string; file: string; name: string }[];
  history: { at: string; status: AppStatus }[];
};

const g = globalThis as unknown as { admissionsReady?: Promise<void> };
async function ready() {
  if (!g.admissionsReady) {
    g.admissionsReady = pool()
      .query(
        `CREATE TABLE IF NOT EXISTS applications (
          id SERIAL PRIMARY KEY,
          app_no TEXT UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          status TEXT NOT NULL DEFAULT 'submitted',
          locale TEXT NOT NULL DEFAULT 'en',
          campus TEXT NOT NULL,
          grade TEXT NOT NULL,
          child_name TEXT NOT NULL,
          dob TEXT NOT NULL,
          gender TEXT NOT NULL,
          father_name TEXT NOT NULL,
          mother_name TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL,
          phone_key TEXT NOT NULL,
          whatsapp TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          address TEXT NOT NULL DEFAULT '',
          prev_school TEXT NOT NULL DEFAULT '',
          prev_class TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          assessment_at TEXT NOT NULL DEFAULT '',
          public_message TEXT NOT NULL DEFAULT '',
          internal_note TEXT NOT NULL DEFAULT '',
          docs JSONB NOT NULL DEFAULT '[]',
          history JSONB NOT NULL DEFAULT '[]'
        )`,
      )
      .then(() => undefined)
      .catch((e) => {
        g.admissionsReady = undefined;
        throw e;
      });
  }
  return g.admissionsReady;
}

export type NewApplication = Pick<Application, "locale" | "campus" | "grade" | "child_name" | "dob" | "gender" | "father_name" | "mother_name" | "phone" | "whatsapp" | "email" | "address" | "prev_school" | "prev_class" | "notes" | "docs">;

export async function createApplication(a: NewApplication): Promise<string> {
  await ready();
  const history = JSON.stringify([{ at: new Date().toISOString(), status: "submitted" }]);
  const { rows } = await pool().query<{ id: number }>(
    `INSERT INTO applications (locale, campus, grade, child_name, dob, gender, father_name, mother_name, phone, phone_key, whatsapp, email, address, prev_school, prev_class, notes, docs, history)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING id`,
    [a.locale, a.campus, a.grade, a.child_name, a.dob, a.gender, a.father_name, a.mother_name, a.phone, phoneKey(a.phone), a.whatsapp, a.email, a.address, a.prev_school, a.prev_class, a.notes, JSON.stringify(a.docs), history],
  );
  const appNo = `TDS-${new Date().getFullYear()}-${String(rows[0].id).padStart(5, "0")}`;
  await pool().query("UPDATE applications SET app_no = $2 WHERE id = $1", [rows[0].id, appNo]);
  return appNo;
}

/** For parents: both the application number and the phone number must match. */
export async function findForParent(appNo: string, phone: string): Promise<Application | null> {
  await ready();
  const key = phoneKey(phone);
  if (key.length < 10) return null;
  const { rows } = await pool().query<Application>("SELECT * FROM applications WHERE upper(app_no) = upper($1) AND phone_key = $2", [appNo.trim(), key]);
  return rows[0] ?? null;
}

export async function listApplications(f: { status?: string; campus?: string; q?: string }): Promise<Application[]> {
  await ready();
  const where: string[] = [];
  const args: string[] = [];
  if (f.status) where.push(`status = $${args.push(f.status)}`);
  if (f.campus) where.push(`campus = $${args.push(f.campus)}`);
  if (f.q) {
    const i = args.push(`%${f.q}%`);
    where.push(`(child_name ILIKE $${i} OR father_name ILIKE $${i} OR app_no ILIKE $${i} OR phone ILIKE $${i})`);
  }
  const { rows } = await pool().query<Application>(`SELECT * FROM applications ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT 500`, args);
  return rows;
}

export async function getApplication(id: number): Promise<Application | null> {
  await ready();
  const { rows } = await pool().query<Application>("SELECT * FROM applications WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function updateApplication(id: number, u: { status: AppStatus; assessment_at: string; public_message: string; internal_note: string }) {
  await ready();
  const cur = await getApplication(id);
  if (!cur) return;
  const history = cur.status === u.status ? cur.history : [...cur.history, { at: new Date().toISOString(), status: u.status }];
  await pool().query("UPDATE applications SET status=$2, assessment_at=$3, public_message=$4, internal_note=$5, history=$6 WHERE id=$1", [id, u.status, u.assessment_at, u.public_message, u.internal_note, JSON.stringify(history)]);
}

export async function countNew(): Promise<number> {
  await ready();
  const { rows } = await pool().query<{ n: string }>("SELECT count(*) AS n FROM applications WHERE status = 'submitted'");
  return Number(rows[0].n);
}
