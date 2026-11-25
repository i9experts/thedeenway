import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { Arrow, PageHero, Photo, Section } from "@/components/blocks";

export const generateMetadata = pageMeta("/news", (t) => ({ title: t.nav.news, description: t.news.lead }));

export default async function News(props: LocaleParams) {
  const { t } = await load(props);
  const n = t.news;
  const [featured, ...rest] = n.items;

  return (
    <>
      <PageHero eyebrow={n.eyebrow} title={n.title} lead={n.lead} />
      <Section>
        <a href={featured.href} className="card group grid overflow-hidden transition hover:shadow-lift lg:grid-cols-[1.3fr_1fr]">
          <div className="aspect-[16/10] overflow-hidden">
            <Photo name={featured.image} alt="" className="!rounded-none transition duration-500 group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <p className="text-sm font-semibold text-gold-600">{featured.tag} · {featured.date}</p>
            <h2 className="mt-2 text-3xl font-semibold">{featured.title}</h2>
            <p className="mt-3 text-lg text-muted">{featured.text}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-forest-700">{t.home.eventCta} <Arrow /></span>
          </div>
        </a>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {rest.map((item) => (
            <article key={item.title} className="card overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden">
                <Photo name={item.image} alt="" className="!rounded-none" />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-gold-600">{item.tag} · {item.date}</p>
                <h3 className="mt-1 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
