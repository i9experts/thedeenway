// Small in-memory limiter (per server process). Enough to slow down abuse of public forms.
const hits = new Map<string, { count: number; until: number }>();

/** Returns true when `key` has already used its `max` attempts in the current window. */
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.until < now) {
    hits.set(key, { count: 1, until: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.until < now) hits.delete(k);
    return false;
  }
  h.count++;
  return h.count > max;
}
