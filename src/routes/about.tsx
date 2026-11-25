import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Page } from "@/components/q/Shell";
import { HeroVideo } from "@/components/q/HeroVideo";
import { JoinCard } from "@/components/q/JoinCard";
import { Art } from "@/components/q/Art";
import { Faq } from "@/components/q/Faq";
import { pageHead } from "@/lib/head";
import { copyFor, langOf, useT } from "@/i18n";
import { faqJsonLd, pagesCopy, usePagesCopy } from "@/i18n/pages";

/** Founder portrait. Put the photo in public/about/ and set the path here; until then a monogram shows. */
const founderPhoto: string | null = null;

export const Route = createFileRoute("/about")({
  head: ({ match }) => {
    const lang = langOf(match.context);
    const t = copyFor(lang);
    return { ...pageHead(t.about.metaTitle, t.about.metaDescription), scripts: [{ type: "application/ld+json", children: faqJsonLd(pagesCopy[lang].about.faq) }] };
  },
  component: About,
});

function About() {
  const t = useT();
  const a = t.about;
  const p = usePagesCopy().about;
  const cards = [
    { title: a.forArtistsTitle, body: a.forArtists, cta: p.artistsCta, role: "artist" as const, cls: "bg-tomato text-ink hover:bg-deep-tomato" },
    { title: a.forCollectorsTitle, body: a.forCollectors, cta: p.collectorsCta, role: "collector" as const, cls: "bg-ink text-wall hover:bg-ink/90" },
  ];
  return (
    <Page>
      <HeroVideo label="quadreria" heading={false} />
      <div className="mx-auto max-w-6xl px-5 pt-12 sm:pt-16">
        <header className="max-w-4xl">
          <h1 className="label text-stone">{a.title}</h1>
          <p className="font-display mt-4 text-5xl leading-[1.02] sm:text-6xl xl:text-7xl">{t.tagline}</p>
          <div className="molding mt-6 max-w-md" aria-hidden />
          <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-stone">{a.body.map((x) => <p key={x}>{x}</p>)}</div>
        </header>

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="max-w-2xl">
            <section className="reveal">
              <h2 className="text-3xl sm:text-4xl">{a.nameTitle}</h2>
              <p className="mt-4 text-lg leading-relaxed text-stone">{a.name}</p>
            </section>
            <section className="reveal mt-14">
              <h2 className="text-3xl sm:text-4xl">{a.whyTitle}</h2>
              <div className="mt-4 space-y-5 text-lg leading-relaxed text-stone">{a.why.map((x) => <p key={x}>{x}</p>)}</div>
              <p className="font-display mt-8 text-2xl sm:text-3xl">{a.founders}</p>
              <p className="mt-4 text-lg leading-relaxed text-stone">{a.where}</p>
            </section>
          </div>
          <div className="space-y-4 lg:sticky lg:top-24">
            {cards.map((x) => (
              <div key={x.role} className="reveal rounded-2xl border border-line bg-card p-6 transition-transform duration-300 hover:-translate-y-1">
                <h2 className="text-2xl">{x.title}</h2>
                <p className="mt-2 text-stone">{x.body}</p>
                <Link to="/join" search={{ role: x.role }} className={`group mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium transition-colors ${x.cls}`}>
                  {x.cta}<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <section className="reveal mt-20 grid items-center gap-10 rounded-3xl border border-line bg-paper p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <p className="label text-stone">{p.exampleKicker}</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">{p.exampleTitle}</h2>
            <p className="mt-4 text-lg leading-relaxed text-stone">{p.exampleBody}</p>
            <p className="mt-6 font-medium">{p.exampleListTitle}</p>
            <ul className="mt-3 space-y-2">
              {p.exampleList.map((x) => <li key={x} className="flex gap-3"><Check aria-hidden className="mt-0.5 size-5 shrink-0 text-deep-tomato" /><span>{x}</span></li>)}
            </ul>
            <Link to="/example-room" className="btn btn-primary group mt-8">{p.exampleCta}<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" /></Link>
          </div>
          <Link to="/example-room" aria-label={p.exampleCta} className="room-sage group block rounded-2xl bg-room p-6 sm:p-8">
            <div className="molding opacity-70" aria-hidden />
            <div className="mt-6 grid grid-cols-3 items-end gap-4">
              {([[0.8, "butter", 0, "-1.5deg"], [1.25, "blush", 2, "1deg"], [1, "sky", 3, "-0.5deg"]] as const).map(([ratio, tone, shape, tilt]) => (
                <div key={tone} className="wall-tile rounded-lg bg-card p-2" style={{ ["--tilt" as string]: tilt }}><Art ratio={ratio} tone={tone} shape={shape} /></div>
              ))}
            </div>
            <div className="mt-6 h-2 rounded-full bg-ink/10" aria-hidden />
          </Link>
        </section>

        <section className="reveal mt-20 max-w-xl">
          <h2 className="mb-5 text-3xl sm:text-4xl">{a.join}</h2>
          <JoinCard />
        </section>

        <section className="reveal mt-20 grid items-center gap-8 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-12">
          <div className="room-blush mx-auto w-48 rotate-[-2deg] rounded-2xl bg-room p-3 shadow-sm transition-transform duration-300 hover:rotate-0 sm:w-full">
            {founderPhoto
              ? <img src={founderPhoto} alt={p.founderPhoto} className="aspect-[4/5] w-full rounded-xl object-cover" />
              : <div role="img" aria-label={p.founderPhoto} className="font-display flex aspect-[4/5] w-full items-center justify-center rounded-xl bg-tomato text-7xl text-ink">L</div>}
          </div>
          <div className="max-w-2xl">
            <p className="label text-stone">{p.founderKicker}</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">{p.founderTitle}</h2>
            <div className="mt-4 space-y-4 text-lg leading-relaxed text-stone">{p.founderBody.map((x) => <p key={x}>{x}</p>)}</div>
          </div>
        </section>

        <Faq title={p.faqTitle} items={p.faq} className="reveal mt-20 max-w-3xl" />
      </div>
    </Page>
  );
}
