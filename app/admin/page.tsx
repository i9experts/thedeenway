import { adminConfigured, isAdmin } from "@/lib/auth";
import { dbConfigured, listReels } from "@/lib/db";
import { embedFor, platformNames, type Reel } from "@/lib/reels";
import { createReel, login, logout, removeReel, reorderReel, saveReel } from "./actions";

export const dynamic = "force-dynamic";

const campusOptions = [
  ["", "All campuses"],
  ["fatima", "Fatima Campus"],
  ["ansari", "A.A. Ansari Campus"],
  ["faisalabad", "Faisalabad Campus"],
] as const;

function Shell({ children, signedIn = false }: { children: React.ReactNode; signedIn?: boolean }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="wrap flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/brand/logo.png" alt="The Deenway School" className="h-9 w-auto" />
            <span className="rounded-full bg-forest-800 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/en" target="_blank" className="font-semibold text-forest-700 hover:underline">View website ↗</a>
            {signedIn && (
              <form action={logout}>
                <button className="rounded-full border border-line px-3 py-1.5 font-semibold hover:bg-cream">Sign out</button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main className="wrap py-10">{children}</main>
    </div>
  );
}

function Notice({ tone, children }: { tone: "ok" | "warn" | "error"; children: React.ReactNode }) {
  const cls = { ok: "border-lime-400 bg-lime-100 text-forest-900", warn: "border-gold-300 bg-gold-100 text-forest-950", error: "border-red-200 bg-red-50 text-red-800" }[tone];
  return <div role="status" className={`mb-6 rounded-xl border px-4 py-3 ${cls}`}>{children}</div>;
}

const errors: Record<string, string> = {
  password: "That password is not correct.",
  locked: "Too many attempts. Please wait 15 minutes and try again.",
  session: "Your session has ended. Please sign in again.",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;

  if (!adminConfigured()) {
    return (
      <Shell>
        <div className="card mx-auto max-w-xl p-8">
          <h1 className="text-2xl font-semibold">Admin panel not switched on yet</h1>
          <p className="mt-3 text-muted">
            In Railway, open the <b>thedeenway</b> service → <b>Variables</b>, and add <code className="rounded bg-cream px-1.5">ADMIN_PASSWORD</code> with a strong password (at least 10 characters). The site redeploys automatically; then come back to this page.
          </p>
        </div>
      </Shell>
    );
  }

  if (!(await isAdmin())) {
    return (
      <Shell>
        <form action={login} className="card mx-auto max-w-md p-8">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-muted">Manage the reels shown on the website.</p>
          {q.e && errors[q.e] && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{errors[q.e]}</p>}
          <label htmlFor="password" className="mt-6 block font-semibold text-forest-900">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" autoFocus className="mt-1.5 block w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-forest-600 focus:ring-4 focus:ring-lime-100" />
          <button className="btn btn-primary mt-6 w-full">Sign in</button>
        </form>
      </Shell>
    );
  }

  if (!dbConfigured()) {
    return (
      <Shell signedIn>
        <div className="card mx-auto max-w-xl p-8">
          <h1 className="text-2xl font-semibold">Connect a database</h1>
          <ol className="mt-4 list-decimal space-y-2 ps-5 text-muted">
            <li>In your Railway project, click <b>+ Create</b> → <b>Database</b> → <b>PostgreSQL</b>.</li>
            <li>Open the <b>thedeenway</b> service → <b>Variables</b> → <b>New variable</b> → <b>Add reference</b> → choose <code className="rounded bg-cream px-1.5">DATABASE_URL</code> from Postgres.</li>
            <li>Wait for the redeploy, then reload this page.</li>
          </ol>
        </div>
      </Shell>
    );
  }

  let reels: Reel[] = [];
  let dbError = false;
  try {
    reels = await listReels();
  } catch (e) {
    console.error(e);
    dbError = true;
  }
  const homeCount = reels.filter((r) => r.showOnHome).length;

  return (
    <Shell signedIn>
      <h1 className="text-3xl font-semibold">Reels</h1>
      <p className="mt-2 text-muted">Paste links to reels you have already published. They appear in the website&apos;s reel gallery, and those marked “Home page” scroll on the home page.</p>

      <div className="mt-6">
        {q.added && <Notice tone="ok">{q.added === "1" ? "Reel added." : `${q.added} reels added.`}{q.rejected ? ` ${q.rejected} link(s) were not recognised — use Facebook, Instagram, YouTube or TikTok reel links.` : ""}</Notice>}
        {!q.added && q.rejected && <Notice tone="error">That link was not recognised. Use a Facebook, Instagram, YouTube or TikTok reel link.</Notice>}
        {q.saved && <Notice tone="ok">Changes saved.</Notice>}
        {q.deleted && <Notice tone="ok">Reel removed.</Notice>}
        {dbError && <Notice tone="error">The database could not be reached. Check the Postgres service in Railway.</Notice>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[24rem_1fr]">
        <form action={createReel} className="card h-fit p-6 lg:sticky lg:top-6">
          <h2 className="text-xl font-semibold">Add reels</h2>
          <label htmlFor="urls" className="mt-4 block font-semibold text-forest-900">Reel link(s)</label>
          <textarea id="urls" name="urls" required rows={4} placeholder={"https://www.facebook.com/reel/…\nhttps://www.instagram.com/reel/…"} className="mt-1.5 block w-full rounded-xl border border-line bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-forest-600 focus:ring-4 focus:ring-lime-100" />
          <p className="mt-1.5 text-xs text-muted">One per line. On Facebook: open the reel → Share → Copy link.</p>
          <label htmlFor="title" className="mt-4 block font-semibold text-forest-900">Title <span className="font-normal text-muted">(optional, single link)</span></label>
          <input id="title" name="title" maxLength={140} className="mt-1.5 block w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-forest-600 focus:ring-4 focus:ring-lime-100" />
          <label htmlFor="campus" className="mt-4 block font-semibold text-forest-900">Campus</label>
          <select id="campus" name="campus" className="mt-1.5 block w-full rounded-xl border border-line bg-white px-3 py-2.5">
            {campusOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <label className="mt-4 flex items-center gap-2.5">
            <input type="checkbox" name="showOnHome" defaultChecked className="h-4 w-4 accent-[#156a3d]" />
            <span className="font-semibold text-forest-900">Show on home page</span>
          </label>
          <button className="btn btn-primary mt-6 w-full">Add</button>
        </form>

        <section>
          <p className="mb-4 text-sm text-muted">{reels.length} reel(s) · {homeCount} on the home page · newest first</p>
          {reels.length === 0 ? (
            <div className="card p-10 text-center text-muted">No reels yet. Paste your first link on the left.</div>
          ) : (
            <ul className="space-y-4">
              {reels.map((r, i) => {
                const { thumb } = embedFor(r);
                return (
                  <li key={r.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                    <div className="flex aspect-[9/16] w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-forest-900 text-xs font-bold text-white">
                      {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : platformNames[r.platform]}
                    </div>
                    <form action={saveReel} className="flex-1 space-y-3">
                      <input type="hidden" name="id" value={r.id} />
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full bg-lime-100 px-2.5 py-0.5 font-semibold text-forest-800">{platformNames[r.platform]}</span>
                        <a href={r.url} target="_blank" rel="noopener" className="truncate text-forest-700 hover:underline">{r.url}</a>
                      </div>
                      <input name="title" defaultValue={r.title} placeholder="Title (optional)" maxLength={140} aria-label="Title" className="block w-full rounded-lg border border-line bg-white px-3 py-2" />
                      <div className="flex flex-wrap items-center gap-4">
                        <select name="campus" defaultValue={r.campus ?? ""} aria-label="Campus" className="rounded-lg border border-line bg-white px-3 py-2 text-sm">
                          {campusOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name="showOnHome" defaultChecked={r.showOnHome} className="h-4 w-4 accent-[#156a3d]" /> Home page
                        </label>
                        <button className="rounded-full bg-forest-800 px-4 py-1.5 text-sm font-semibold text-white hover:bg-forest-900">Save</button>
                      </div>
                    </form>
                    <div className="flex gap-2 sm:flex-col">
                      <form action={reorderReel}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="dir" value="up" /><button disabled={i === 0} aria-label="Move up" className="h-9 w-9 rounded-full border border-line disabled:opacity-30">↑</button></form>
                      <form action={reorderReel}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="dir" value="down" /><button disabled={i === reels.length - 1} aria-label="Move down" className="h-9 w-9 rounded-full border border-line disabled:opacity-30">↓</button></form>
                      <form action={removeReel}><input type="hidden" name="id" value={r.id} /><button aria-label="Delete" className="h-9 w-9 rounded-full border border-red-200 text-red-700 hover:bg-red-50">✕</button></form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Shell>
  );
}
