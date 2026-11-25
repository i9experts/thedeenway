import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { campuses, mapsUrl } from "@/lib/site";
import { PageHero, Photo, Section } from "@/components/blocks";

export const generateMetadata = pageMeta("/campuses", (t) => ({ title: t.nav.campuses, description: t.campusesPage.lead }));

export default async function Campuses(props: LocaleParams) {
  const { t } = await load(props);
  const c = t.campusesPage;

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      <Section>
        <div className="space-y-10">
          {campuses.map((cp, i) => (
            <article key={cp.id} id={cp.id} className="card grid scroll-mt-28 overflow-hidden lg:grid-cols-2">
              <div className={`aspect-[16/10] overflow-hidden lg:aspect-auto ${i % 2 ? "lg:order-2" : ""}`}>
                <Photo name={cp.image} alt="" className="!rounded-none" />
              </div>
              <div className="p-7 sm:p-10">
                <p className="text-sm font-semibold text-gold-600">{t.common[cp.city]}</p>
                <h2 className="mt-1 text-3xl font-semibold sm:text-4xl">{t.campusNames[cp.id]}</h2>
                <p className="ltr mt-4 text-lg text-muted">{cp.address}</p>
                <ul className="mt-6 space-y-2">
                  {cp.phones.map((ph) => (
                    <li key={ph.tel}>
                      <a href={`tel:${ph.tel}`} className="ltr inline-flex items-center gap-2 text-lg font-semibold text-forest-800 hover:text-forest-950">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" /></svg>
                        {ph.display}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={mapsUrl(cp.mapQuery)} target="_blank" rel="noopener" className="btn btn-primary">{t.common.directions}</a>
                  <a href={`https://wa.me/${cp.whatsapp}`} target="_blank" rel="noopener" className="btn btn-ghost">{t.common.whatsapp}</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
