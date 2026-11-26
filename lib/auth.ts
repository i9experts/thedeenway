import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

// Admin access is a single password set in Railway as ADMIN_PASSWORD.
// The session cookie is an HMAC-signed expiry time; changing the password signs everyone out.

const COOKIE = "tds_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 10);
}

function secret() {
  return `${process.env.ADMIN_PASSWORD ?? ""}|${process.env.SESSION_SECRET ?? "tds"}`;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function passwordMatches(input: string) {
  if (!adminConfigured()) return false;
  const a = createHmac("sha256", "cmp").update(input).digest();
  const b = createHmac("sha256", "cmp").update(process.env.ADMIN_PASSWORD!).digest();
  return timingSafeEqual(a, b);
}

export async function startSession() {
  const expires = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [expires, mac] = raw.split(".");
  if (!expires || !mac || !safeEqual(mac, sign(expires))) return false;
  return Number(expires) > Date.now();
}

// Simple in-memory brute-force brake: 8 failed attempts per IP per 15 minutes.
const attempts = new Map<string, { count: number; until: number }>();
export function tooManyAttempts(ip: string) {
  const a = attempts.get(ip);
  return Boolean(a && a.count >= 8 && a.until > Date.now());
}
export function recordFailure(ip: string) {
  const a = attempts.get(ip);
  if (!a || a.until < Date.now()) attempts.set(ip, { count: 1, until: Date.now() + 15 * 60 * 1000 });
  else a.count++;
}
export function clearFailures(ip: string) {
  attempts.delete(ip);
}
