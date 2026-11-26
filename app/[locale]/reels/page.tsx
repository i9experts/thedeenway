import { load, pageMeta, type LocaleParams } from "@/lib/page";
import { PageHero, Section } from "@/components/blocks";
import { ReelsGallery } from "@/components/Reels";

export const generateMetadata = pageMeta("/reels", (t) => ({ title: t.reels.galleryTitle, description: t.reels.galleryLead }));

export default async function ReelsPage(props: LocaleParams) {
  const { t } = await load(props);
  return (
    <>
      <PageHero eyebrow={t.reels.eyebrow} title={t.reels.galleryTitle} lead={t.reels.galleryLead} />
      <Section>
        <ReelsGallery t={t.reels} />
      </Section>
    </>
  );
}
