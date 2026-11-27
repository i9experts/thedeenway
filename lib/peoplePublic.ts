import "server-only";
import { dbConfigured } from "./db";
import { listPeople, type Category, type Person } from "./people";

/** For public pages: never throws — an unreachable database just means no profiles yet. */
export async function publicPeople(category: Category): Promise<Person[]> {
  if (!dbConfigured()) return [];
  try {
    return await listPeople(category);
  } catch (e) {
    console.error("people: database error", e);
    return [];
  }
}
