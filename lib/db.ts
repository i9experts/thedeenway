import "server-only";
import { Pool } from "pg";
import { embedFor, type Platform, type PublicReel, type Reel } from "./reels";

// One pool per server process. Railway's Postgres plugin provides DATABASE_URL.
const globalForDb = globalThis as unknown as { pgPool?: Pool; reelsReady?: Promise<void> };

export function dbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function pool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!globalForDb.pgPool) {
    const url = process.env.DATABASE_URL;
    // Railway's internal network (*.railway.internal) does not use TLS; its public proxy does.
    const internal = /\.railway\.internal|localhost|127\.0\.0\.1/.test(url);
    globalForDb.pgPool = new Pool({
      connectionString: url,
      ssl: internal ? false : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return globalForDb.pgPool;
}

async function ready() {
  if (!globalForDb.reelsReady) {
    globalForDb.reelsReady = pool()
      .query(
        `CREATE TABLE IF NOT EXISTS reels (
          id SERIAL PRIMARY KEY,
          url TEXT NOT NULL UNIQUE,
          platform TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT '',
          campus TEXT,
          show_on_home BOOLEAN NOT NULL DEFAULT TRUE,
          position INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
      )
      .then(() => undefined)
      .catch((e) => {
        globalForDb.reelsReady = undefined;
        throw e;
      });
  }
  return globalForDb.reelsReady;
}

type Row = { id: number; url: string; platform: Platform; title: string; campus: string | null; show_on_home: boolean; position: number };
const toReel = (r: Row): Reel => ({ id: r.id, url: r.url, platform: r.platform, title: r.title, campus: r.campus, showOnHome: r.show_on_home, position: r.position });

export async function listReels(): Promise<Reel[]> {
  await ready();
  const { rows } = await pool().query<Row>("SELECT * FROM reels ORDER BY position ASC, created_at DESC");
  return rows.map(toReel);
}

export async function listPublicReels(): Promise<PublicReel[]> {
  return (await listReels()).map((r) => ({ ...r, ...embedFor(r) }));
}

export async function addReel(input: { url: string; platform: Platform; title: string; campus: string | null; showOnHome: boolean }) {
  await ready();
  // New reels go to the front.
  await pool().query(
    `INSERT INTO reels (url, platform, title, campus, show_on_home, position)
     VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT MIN(position) - 1 FROM reels), 0))
     ON CONFLICT (url) DO UPDATE SET title = EXCLUDED.title, campus = EXCLUDED.campus, show_on_home = EXCLUDED.show_on_home`,
    [input.url, input.platform, input.title, input.campus, input.showOnHome],
  );
}

export async function updateReel(id: number, fields: { title?: string; campus?: string | null; showOnHome?: boolean }) {
  await ready();
  const current = (await pool().query<Row>("SELECT * FROM reels WHERE id = $1", [id])).rows[0];
  if (!current) return;
  await pool().query("UPDATE reels SET title = $2, campus = $3, show_on_home = $4 WHERE id = $1", [
    id,
    fields.title ?? current.title,
    fields.campus === undefined ? current.campus : fields.campus,
    fields.showOnHome ?? current.show_on_home,
  ]);
}

export async function deleteReel(id: number) {
  await ready();
  await pool().query("DELETE FROM reels WHERE id = $1", [id]);
}

export async function moveReel(id: number, direction: -1 | 1) {
  await ready();
  const reels = await listReels();
  const i = reels.findIndex((r) => r.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= reels.length) return;
  const order = [...reels];
  [order[i], order[j]] = [order[j], order[i]];
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    for (let k = 0; k < order.length; k++) await client.query("UPDATE reels SET position = $2 WHERE id = $1", [order[k].id, k]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
