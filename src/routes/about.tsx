import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/q/Shell";
import { JoinCard } from "@/components/q/JoinCard";
import { pageHead } from "@/lib/head";
import { copyFor, langOf, useT } from "@/i18n";

export const Route = createFileRoute("/about")({
  head: ({ match }) => {
    const t = copyFor(langOf(match.context));
    return pageHead(t.about.metaTitle, t.about.metaDescription);
  },
  component: About,
});

function About() {
  const t = useT();
  const a = t.about;
  return (
    <Page>
      <div className="mx-auto max-w-6xl px-5 pt-12 sm:pt-16">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="max-w-2xl">
            <h1 className="text-4xl leading-tight sm:text-5xl">{a.title}</h1>
            <p className="font-display mt-6 text-2xl leading-snug sm:text-3xl">{t.tagline}</p>
            <div className="molding mt-6 max-w-md" aria-hidden />
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-stone">
              {a.body.map((p) => <p key={p}>{p}</p>)}
            </div>
            <h2 className="mt-12 text-2xl sm:text-3xl">{a.nameTitle}</h2>
            <p className="mt-4 text-lg leading-relaxed text-stone">{a.name}</p>
            <h2 className="mt-12 text-2xl sm:text-3xl">{a.whyTitle}</h2>
            <div className="mt-4 space-y-5 text-lg leading-relaxed text-stone">
              {a.why.map((p) => <p key={p}>{p}</p>)}
            </div>
            <p className="font-display mt-8 text-xl sm:text-2xl">{a.founders}</p>
            <p className="mt-4 text-lg leading-relaxed text-stone">{a.where}</p>
          </div>
          <div className="space-y-4 lg:pt-4">
            {[[a.forArtistsTitle, a.forArtists], [a.forCollectorsTitle, a.forCollectors]].map(([h, p]) => (
              <div key={h} className="rounded-2xl border border-line bg-card p-6">
                <h2 className="text-xl">{h}</h2>
                <p className="mt-2 text-stone">{p}</p>
              </div>
            ))}
          </div>
        </div>
        <section className="mt-16 max-w-xl">
          <h2 className="mb-5 text-3xl">{a.join}</h2>
          <JoinCard />
        </section>
      </div>
    </Page>
  );
}
