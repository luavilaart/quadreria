import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Page, SectionTitle, SampleBadge } from "@/components/q/Shell";
import { HeroVideo } from "@/components/q/HeroVideo";
import { JoinCard } from "@/components/q/JoinCard";
import { RoomCard, ServiceCard, EventCard } from "@/components/q/Cards";
import { galleryQuery } from "@/lib/gallery";
import { useTaxonomy } from "@/components/q/TaxonomyProvider";
import { activeEntries, label } from "@/data/taxonomy";
import { langOf, useT } from "@/i18n";
import { faqJsonLd, pagesCopy, usePagesCopy } from "@/i18n/pages";
import { ArtWall } from "@/components/q/ArtWall";
import { Faq } from "@/components/q/Faq";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  errorComponent: ({ error }) => <p role="alert">{error instanceof Error ? error.message : String(error)}</p>,
  notFoundComponent: Empty,
  head: ({ match }) => ({ scripts: [{ type: "application/ld+json", children: faqJsonLd(pagesCopy[langOf(match.context)].home.faq) }], meta: [
    { title: "quadreria — Hire the artist, not the gig." },
    { name: "description", content: "Walk into artists' rooms. Buy originals and prints, hire artists, and get tickets to their classes and openings." },
    { property: "og:title", content: "quadreria — Hire the artist, not the gig." },
    { property: "og:description", content: "An online gallery where every artist has a room." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Home,
});

function Home() {
  const {state,lang,c}=useTaxonomy();
  const t = useT();
  const pc = usePagesCopy();
  const { data: { artists, services, events } } = useSuspenseQuery(galleryQuery);
  return (
    <Page>
      <HeroVideo label="quadreria" />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div>
        <SampleBadge />
        <p className="font-display mt-6 max-w-2xl text-5xl leading-[1.02] sm:text-6xl xl:text-7xl">{t.tagline}</p>
        <div className="molding mt-5 max-w-md" aria-hidden />
        <p className="mt-5 max-w-md text-lg text-stone">{t.home.intro}</p>
        </div>
        <JoinCard />
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <p className="label mb-3 text-stone">{c.byMedium}</p>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
          {activeEntries(state.taxonomy,"medium").map(m => lang === "es" ? <Link key={m.id} to="/es/medios/$medium" params={{medium:m.slug_es}} className="chip hover:border-ink">{label(m,lang)}</Link> : <Link key={m.id} to="/mediums/$medium" params={{medium:m.slug}} className="chip hover:border-ink">{label(m,lang)}</Link>)}
        </div>
      </section>

      <section className="reveal mx-auto mt-16 max-w-6xl px-5">
        <SectionTitle kicker={t.home.featuredKicker} title={t.home.featured} />
        <div className="grid gap-4 sm:grid-cols-3">{artists.map((a) => <RoomCard key={a.handle} a={a} />)}</div>
      </section>

      <section className="reveal mx-auto mt-16 max-w-6xl px-5">
        <SectionTitle kicker={t.home.hireSub} title={t.home.hire} />
        <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
          {services.map((s) => <div key={s.id} className="w-80 shrink-0 snap-start"><ServiceCard s={s} /></div>)}
        </div>
      </section>

      <section className="reveal mx-auto mt-16 max-w-6xl px-5">
        <SectionTitle title={t.home.thisWeek} action={<Link to="/events" className="link text-sm">{t.home.allEvents}</Link>} />
        <div className="grid gap-3 sm:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div>
      </section>

      <section className="reveal mx-auto mt-16 max-w-6xl px-5">
        <SectionTitle title={t.home.how} />
        <div className="grid gap-4 sm:grid-cols-2">
          <HowCard title={t.home.forArtists} steps={t.home.artistSteps}>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/join" search={{ role: "artist" }} className="btn btn-ghost">{t.home.openRoom}</Link>
              <Link to="/example-room" className="link">{t.preview.seeExample}</Link>
            </div>
          </HowCard>
          <HowCard title={t.home.forCollectors} steps={t.home.collectorSteps}>
            <Link to="/discover" className="btn btn-primary">{t.home.findArt}</Link>
          </HowCard>
        </div>
      </section>

      <section className="reveal mx-auto mt-16 max-w-6xl px-5">
        <SectionTitle kicker={pc.home.galleryKicker} title={pc.home.galleryTitle} />
        <p className="-mt-2 mb-6 text-stone">{pc.home.galleryNote}</p>
        <ArtWall />
      </section>

      <Faq title={pc.home.faqTitle} items={pc.home.faq} className="reveal mx-auto mt-16 max-w-3xl px-5" />
    </Page>
  );
}

function HowCard({ title, steps, children }: { title: string; steps: string[]; children: ReactNode }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-card p-6">
      <h3 className="text-xl">{title}</h3>
      <ol className="mt-4 flex-1 space-y-3">
        {steps.map((s, i) => <li key={s} className="flex gap-3"><span className="font-display text-deep-tomato">{i + 1}</span><span>{s}</span></li>)}
      </ol>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Empty() { return <p>{useT().account.empty}</p>; }
