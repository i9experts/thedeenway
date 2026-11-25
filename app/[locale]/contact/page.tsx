import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { campuses, mapsUrl, site } from "@/lib/site";
import { PageHero, Section } from "@/components/blocks";

export const generateMetadata = pageMeta("/contact", (t) => ({ title: t.nav.contact, description: t.contact.lead }));

export default async function Contact(props: LocaleParams) {
  const { t } = await load(props);
  const c = t.contact;

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {campuses.map((cp) => (
            <article key={cp.id} className="card flex flex-col p-6">
              <p className="text-sm font-semibold text-gold-600">{t.common[cp.city]}</p>
              <h2 className="mt-1 text-2xl font-semibold">{t.campusNames[cp.id]}</h2>
              <p className="ltr mt-3 flex-1 text-muted">{cp.address}</p>
              <ul className="mt-4 space-y-1">
                {cp.phones.map((ph) => (
                  <li key={ph.tel}><a href={`tel:${ph.tel}`} className="ltr font-semibold text-forest-800 hover:underline">{ph.display}</a></li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <a href={`https://wa.me/${cp.whatsapp}`} target="_blank" rel="noopener" className="btn btn-primary !min-h-0 !px-4 !py-2 text-sm">{t.common.whatsapp}</a>
                <a href={mapsUrl(cp.mapQuery)} target="_blank" rel="noopener" className="btn btn-ghost !min-h-0 !px-4 !py-2 text-sm">{t.common.directions}</a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">{c.emailTitle}</h2>
            <a href={`mailto:${site.email}`} className="ltr mt-2 block font-semibold text-forest-800 hover:underline">{site.email}</a>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold">{c.hoursTitle}</h2>
            <ul className="mt-2 space-y-1 text-muted">
              {t.apply.hours.map((h) => <li key={h}>{h}</li>)}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold">{c.followTitle}</h2>
            <ul className="mt-2 space-y-1">
              {site.facebook.map((f) => (
                <li key={f.href}><a href={f.href} target="_blank" rel="noopener" className="ltr font-semibold text-forest-800 hover:underline">{f.href.replace("https://", "")}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
