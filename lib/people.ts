import "server-only";
import { pool } from "./db";

export const CATEGORIES = ["leadership", "faculty"] as const;
export type Category = (typeof CATEGORIES)[number];

// Staff photos from the old website, offered in the admin panel as a starting point.
export const OLD_PHOTOS = ["aatika", "adil-riaz", "adila", "ainy", "aisha", "aisha-saad", "atif-aftab", "atiq-ur-rehman", "hassan", "hiba-javed", "mrs-shoaib", "sahar", "shah-sohail", "shahid-mehmud", "shayan", "waleed", "zeenat-fatima"] as const;

export type Person = { id: number; category: Category; name: string; role: string; campus: string | null; bio: string; photo: string; position: number };

const g = globalThis as unknown as { peopleReady?: Promise<void> };
async function ready() {
  if (!g.peopleReady) {
    g.peopleReady = pool()
      .query(
        `CREATE TABLE IF NOT EXISTS people (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT '',
          campus TEXT,
          bio TEXT NOT NULL DEFAULT '',
          photo TEXT NOT NULL DEFAULT '',
          position INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
      )
      .then(() => undefined)
      .catch((e) => {
        g.peopleReady = undefined;
        throw e;
      });
  }
  return g.peopleReady;
}

export async function listPeople(category?: Category): Promise<Person[]> {
  await ready();
  const { rows } = category
    ? await pool().query<Person>("SELECT * FROM people WHERE category = $1 ORDER BY position, id", [category])
    : await pool().query<Person>("SELECT * FROM people ORDER BY category DESC, position, id");
  return rows;
}

export async function getPerson(id: number): Promise<Person | null> {
  await ready();
  return (await pool().query<Person>("SELECT * FROM people WHERE id = $1", [id])).rows[0] ?? null;
}

type Input = Pick<Person, "category" | "name" | "role" | "campus" | "bio"> & { photo?: string };

export async function createPerson(p: Input & { photo: string }) {
  await ready();
  await pool().query(
    `INSERT INTO people (category, name, role, campus, bio, photo, position)
     VALUES ($1,$2,$3,$4,$5,$6, COALESCE((SELECT MAX(position) + 1 FROM people WHERE category = $1), 0))`,
    [p.category, p.name, p.role, p.campus, p.bio, p.photo],
  );
}

/** Leaves the photo unchanged when `photo` is undefined. */
export async function updatePerson(id: number, p: Input) {
  await ready();
  await pool().query("UPDATE people SET category=$2, name=$3, role=$4, campus=$5, bio=$6, photo=COALESCE($7, photo) WHERE id=$1", [id, p.category, p.name, p.role, p.campus, p.bio, p.photo ?? null]);
}

export async function deletePerson(id: number): Promise<Person | null> {
  await ready();
  return (await pool().query<Person>("DELETE FROM people WHERE id = $1 RETURNING *", [id])).rows[0] ?? null;
}

export async function movePerson(id: number, direction: -1 | 1) {
  await ready();
  const me = await getPerson(id);
  if (!me) return;
  const list = await listPeople(me.category);
  const i = list.findIndex((x) => x.id === id);
  const j = i + direction;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    for (let k = 0; k < list.length; k++) await client.query("UPDATE people SET position = $2 WHERE id = $1", [list[k].id, k]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
