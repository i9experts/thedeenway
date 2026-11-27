import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/Shell";
import { isAdmin } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { OLD_PHOTOS, listPeople, type Person } from "@/lib/people";
import { uploadsConfigured } from "@/lib/uploads";
import { removePerson, reorderPerson } from "../actions";

export const dynamic = "force-dynamic";

const campuses = [["", "All campuses / not campus-specific"], ["fatima", "Fatima Campus"], ["ansari", "A.A. Ansari Campus"], ["faisalabad", "Faisalabad Campus"]] as const;
const errors: Record<string, string> = {
  name: "Please enter a name and choose Leadership or Faculty.",
  type: "Please use a JPG, PNG or WebP photo.",
  size: "That photo is larger than 5 MB. Please use a smaller one.",
  uploads: "Photo upload needs the Railway volume (UPLOAD_DIR). Until then, pick a photo from the old website or leave it blank.",
  read: "The upload was interrupted. Please try again.",
  missing: "That profile no longer exists.",
  setup: "The database is not connected.",
};
const input = "mt-1.5 block w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-forest-600 focus:ring-4 focus:ring-lime-100";
const label = "block font-semibold text-forest-900";

function Fields({ p, uploads, idp }: { p?: Person; uploads: boolean; idp: string }) {
  return (
    <>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idp}-cat`} className={label}>Section</label>
          <select id={`${idp}-cat`} name="category" defaultValue={p?.category ?? "faculty"} className={input}>
            <option value="leadership">Leadership team</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${idp}-campus`} className={label}>Campus</label>
          <select id={`${idp}-campus`} name="campus" defaultValue={p?.campus ?? ""} className={input}>
            {campuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${idp}-name`} className={label}>Name</label>
          <input id={`${idp}-name`} name="name" required maxLength={120} defaultValue={p?.name} className={input} />
        </div>
        <div>
          <label htmlFor={`${idp}-role`} className={label}>Role / title</label>
          <input id={`${idp}-role`} name="role" maxLength={120} defaultValue={p?.role} placeholder="e.g. Principal, Grade 3 Teacher" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${idp}-bio`} className={label}>Short profile <span className="font-normal text-muted">(optional)</span></label>
          <textarea id={`${idp}-bio`} name="bio" rows={3} maxLength={1500} defaultValue={p?.bio} placeholder="Qualifications, experience, what they teach…" className={input} />
        </div>
        <div>
          <label htmlFor={`${idp}-photo`} className={label}>Upload a photo <span className="font-normal text-muted">(optional)</span></label>
          <input id={`${idp}-photo`} name="photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={!uploads} className="mt-1.5 block w-full text-sm file:me-3 file:rounded-full file:border-0 file:bg-forest-800 file:px-4 file:py-2 file:font-semibold file:text-white disabled:opacity-50" />
          <p className="mt-1 text-xs text-muted">{uploads ? "JPG, PNG or WebP, up to 5 MB. Square or portrait works best." : "Needs the Railway volume (UPLOAD_DIR) to be set up."}</p>
        </div>
        <div>
          <label htmlFor={`${idp}-old`} className={label}>…or a photo from the old website</label>
          <select id={`${idp}-old`} name="oldPhoto" defaultValue="" className={input}>
            <option value="">— none —</option>
            {OLD_PHOTOS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      {p?.photo && (
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" name="removePhoto" className="h-4 w-4 accent-[#156a3d]" /> Remove the current photo
        </label>
      )}
    </>
  );
}

function Avatar({ p }: { p: Person }) {
  return p.photo ? (
    <img src={p.photo} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover object-top" />
  ) : (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest-800 font-display text-xl font-semibold text-white">{p.name[0]}</span>
  );
}

export default async function AdminPeople({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!(await isAdmin())) redirect("/admin?e=session");
  if (!dbConfigured()) redirect("/admin");
  const q = await searchParams;
  const uploads = uploadsConfigured();
  let people: Person[] = [];
  let failed = false;
  try {
    people = await listPeople();
  } catch (e) {
    console.error(e);
    failed = true;
  }
  const groups = [["leadership", "Leadership team"], ["faculty", "Faculty"]] as const;

  return (
    <AdminShell signedIn tab="people">
      <h1 className="text-3xl font-semibold">People</h1>
      <p className="mt-2 text-muted">Profiles shown on the website under About → Leadership team and About → Faculty. Only add staff who have agreed to appear on the website.</p>
      <div className="mt-6">
        {q.added && <p role="status" className="mb-6 rounded-xl border border-lime-400 bg-lime-100 px-4 py-3 text-forest-900">Profile added.</p>}
        {q.saved && <p role="status" className="mb-6 rounded-xl border border-lime-400 bg-lime-100 px-4 py-3 text-forest-900">Changes saved.</p>}
        {q.deleted && <p role="status" className="mb-6 rounded-xl border border-lime-400 bg-lime-100 px-4 py-3 text-forest-900">Profile removed.</p>}
        {q.error && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{errors[q.error] ?? "That did not work. Please try again."}</p>}
        {failed && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">The database could not be reached.</p>}
      </div>

      <form action="/admin/people/save" method="post" encType="multipart/form-data" className="card p-6">
        <h2 className="mb-4 text-xl font-semibold">Add a person</h2>
        <Fields uploads={uploads} idp="new" />
        <button className="btn btn-primary mt-6">Add profile</button>
      </form>

      {groups.map(([cat, title]) => {
        const list = people.filter((p) => p.category === cat);
        return (
          <section key={cat} className="mt-10">
            <h2 className="text-2xl font-semibold">{title} <span className="font-sans text-base font-normal text-muted">· {list.length}</span></h2>
            {list.length === 0 ? <p className="card mt-4 p-6 text-muted">Nobody added yet.</p> : (
              <ul className="mt-4 space-y-3">
                {list.map((p, i) => (
                  <li key={p.id} className="card p-4">
                    <div className="flex items-center gap-4">
                      <Avatar p={p} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-forest-950" dir="auto">{p.name}</p>
                        <p className="truncate text-sm text-muted" dir="auto">{p.role || "—"}{p.campus ? ` · ${campuses.find(([v]) => v === p.campus)?.[1]}` : ""}</p>
                      </div>
                      <div className="flex gap-2">
                        <form action={reorderPerson}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="up" /><button disabled={i === 0} aria-label="Move up" className="h-9 w-9 rounded-full border border-line disabled:opacity-30">↑</button></form>
                        <form action={reorderPerson}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="down" /><button disabled={i === list.length - 1} aria-label="Move down" className="h-9 w-9 rounded-full border border-line disabled:opacity-30">↓</button></form>
                        <form action={removePerson}><input type="hidden" name="id" value={p.id} /><button aria-label={`Delete ${p.name}`} className="h-9 w-9 rounded-full border border-red-200 text-red-700 hover:bg-red-50">✕</button></form>
                      </div>
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-semibold text-forest-700">Edit</summary>
                      <form action="/admin/people/save" method="post" encType="multipart/form-data" className="mt-4 border-t border-line pt-4">
                        <Fields p={p} uploads={uploads} idp={`p${p.id}`} />
                        <button className="mt-5 rounded-full bg-forest-800 px-5 py-2 text-sm font-semibold text-white hover:bg-forest-900">Save changes</button>
                      </form>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </AdminShell>
  );
}
