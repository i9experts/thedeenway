import Link from "next/link";
import { load, pageMeta } from "@/lib/page";
import { admissionsDict } from "@/content/admissions";
import StatusChecker from "@/components/StatusChecker";
import { Section } from "@/components/blocks";

export const generateMetadata = pageMeta("/admissions/status", (t) => ({ title: t.nav.admissions, description: t.admissions.lead }));

const dateLocale = { en: "en-GB", ur: "ur-PK", ar: "ar-EG" } as const;

export default async function Status(props: { params: Promise<{ locale: string }>; searchParams: Promise<{ no?: string }> }) {
  const { t, locale, p } = await load(props);
  const a = admissionsDict(locale);
  const { no } = await props.searchParams;

  return (
    <>
      <section className="pattern border-b border-line bg-sand">
        <div className="wrap py-12 text-center sm:py-16">
          <p className="eyebrow">{t.nav.admissions}</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{a.status.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{a.status.lead}</p>
        </div>
      </section>
      <Section className="!pt-10">
        <StatusChecker t={a} campusNames={t.campusNames} dateLocale={dateLocale[locale]} initialNo={(no ?? "").slice(0, 30)} />
        <p className="mt-8 text-center">
          <Link href={p("/admissions/apply")} className="font-semibold text-forest-700 underline-offset-4 hover:underline">{a.status.applyLink}</Link>
        </p>
      </Section>
    </>
  );
}
