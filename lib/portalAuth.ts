import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

// Parent session: a signed cookie holding the guardian id. Set SESSION_SECRET in Railway
// before the portal carries real family data.
const COOKIE = "tds_portal";
const MAX_AGE = 60 * 60 * 24 * 7;
const secret = () => process.env.SESSION_SECRET || "tds-portal-demo";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");

export async function startPortalSession(guardianId: string) {
  const value = `${guardianId}.${Date.now() + MAX_AGE * 1000}`;
  (await cookies()).set(COOKIE, `${value}.${sign(value)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE });
}

export async function endPortalSession() {
  (await cookies()).delete(COOKIE);
}

export async function portalGuardianId(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  const value = raw.slice(0, i), mac = raw.slice(i + 1);
  const a = Buffer.from(mac), b = Buffer.from(sign(value));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [guardianId, expires] = value.split(".");
  return Number(expires) > Date.now() ? guardianId : null;
}
