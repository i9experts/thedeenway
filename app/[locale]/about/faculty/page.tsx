import Link from "next/link";
import { load, pageMeta } from "@/lib/page";
import { peopleDict } from "@/content/people";
import { publicPeople } from "@/lib/peoplePublic";
import { campuses } from "@/lib/site";
import PersonCard from "@/components/PersonCard";
import { PageHero, Section } from "@/components/blocks";

export const dynamic = "force-dynamic";
export const generateMetadata = pageMeta("/about/faculty", () => ({ title: "Faculty", description: "The teachers of The Deenway School." }));

export default async function Faculty(props: { params: Promise<{ locale: string }>; searchParams: Promise<{ campus?: string }> }) {
  const { t, locale, p } = await load(props);
  const d = peopleDict(locale);
  const all = await publicPeople("faculty");
  const { campus } = await props.searchParams;
  const used = campuses.filter((c) => all.some((x) => x.campus === c.id));
  const active = used.find((c) => c.id === campus)?.id;
  // Staff with no campus set belong to every campus.
  const shown = active ? all.filter((x) => x.campus === active || x.campus === null) : all;
  const tab = (on: boolean) => `rounded-full border px-4 py-2 text-sm font-semibold transition ${on ? "border-forest-800 bg-forest-800 text-white" : "border-line bg-white text-forest-900 hover:bg-lime-100"}`;

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.faculty.title} lead={d.faculty.lead} />
      <Section>
        {used.length > 1 && (
          <nav aria-label={t.nav.campuses} className="mb-8 flex flex-wrap gap-2">
            <Link href={p("/about/faculty")} aria-current={!active ? "page" : undefined} className={tab(!active)}>{d.allCampuses}</Link>
            {used.map((c) => (
              <Link key={c.id} href={`${p("/about/faculty")}?campus=${c.id}`} aria-current={active === c.id ? "page" : undefined} className={tab(active === c.id)}>{t.campusNames[c.id]}</Link>
            ))}
          </nav>
        )}
        {shown.length === 0 ? (
          <p className="card p-10 text-center text-lg text-muted">{d.empty}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((x) => <PersonCard key={x.id} name={x.name} role={x.role} campus={x.campus ? t.campusNames[x.campus as keyof typeof t.campusNames] : undefined} bio={x.bio} photo={x.photo} />)}
          </div>
        )}
        <div className="pattern mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-sand p-6 sm:p-8">
          <p className="font-display text-xl font-semibold text-forest-900 sm:text-2xl">{d.join}</p>
          <Link href={p("/contact")} className="btn btn-primary">{d.joinCta}</Link>
        </div>
      </Section>
    </>
  );
}
