import Link from "next/link";
import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { peopleDict } from "@/content/people";
import { founderDict } from "@/content/founder";
import { publicPeople } from "@/lib/peoplePublic";
import PersonCard from "@/components/PersonCard";
import { Arrow, PageHero, Section } from "@/components/blocks";

export const dynamic = "force-dynamic";
export const generateMetadata = pageMeta("/about/leadership", () => ({ title: "Leadership team", description: "The leadership team of The Deenway School." }));

export default async function Leadership(props: LocaleParams) {
  const { t, locale, p } = await load(props);
  const d = peopleDict(locale);
  const f = founderDict(locale);
  const people = await publicPeople("leadership");
  const campusName = (c: string | null) => (c ? t.campusNames[c as keyof typeof t.campusNames] : undefined);

  return (
    <>
      <PageHero eyebrow={d.eyebrow} title={d.leadership.title} lead={d.leadership.lead} />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <PersonCard name={f.name} role={d.founderRole} photo="/images/founder.webp" large={false}>
            <Link href={p("/about/founder")} className="inline-flex items-center gap-2 font-semibold text-forest-700 hover:text-forest-900">{d.readProfile} <Arrow /></Link>
          </PersonCard>
          {people.map((x) => <PersonCard key={x.id} name={x.name} role={x.role} campus={campusName(x.campus)} bio={x.bio} photo={x.photo} />)}
        </div>
      </Section>
    </>
  );
}
