import { copyFor, langOf, useFormat, useT } from "@/i18n";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/q/Shell";
import { EventCard } from "@/components/q/Cards";
import { Search } from "lucide-react";
import { galleryQuery, eventTypes } from "@/lib/gallery";
import { usePagesCopy } from "@/i18n/pages";

export const Route = createFileRoute("/events")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  errorComponent: ({ error }) => <p role="alert">{error instanceof Error ? error.message : String(error)}</p>,
  notFoundComponent: Empty,
  head: ({ match }) => { const t = copyFor(langOf(match.context)); return { meta: [
    { title: `${t.meta.eventsTitle} — quadreria` }, { name: "description", content: t.meta.eventsDescription },
    { property: "og:title", content: `${t.events.title} — quadreria` }, { property: "og:description", content: t.meta.eventsShare },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }; },
  component: Events,
});

function Events() {
  const { data: { events } } = useSuspenseQuery(galleryQuery);
  const t = useT(); const f = useFormat(); const c = usePagesCopy().events;
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  // Cities come from the events themselves, so a new city shows up as soon as someone hosts there.
  const cityOptions = [...new Set(events.map((e) => e.city).filter(Boolean))].sort((a, b) => (a === "Online" ? 1 : b === "Online" ? -1 : a.localeCompare(b)));
  const q = fold(query.trim());
  const list = events
    .filter((e) => (!city || e.city === city) && (!type || e.type === type))
    .filter((e) => !q || [e.city, f.city(e.city), e.title, e.artistName, e.venue_name ?? "", e.address ?? "", f.eventType(e.type)].some((x) => fold(x).includes(q)))
    .sort((a, b) => a.date.localeCompare(b.date));
  const dates = [...new Set(list.map((e) => e.date))];
  const filtered = !!(q || city || type);
  const select = "mt-1 w-full min-w-0 appearance-none rounded-xl border border-line bg-card bg-[length:1.1rem] bg-[right_0.9rem_center] bg-no-repeat py-3 pl-4 pr-10 text-ink";
  const chevron = { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231F1B16' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" };
  return (
    <Page>
      <div className="mx-auto max-w-3xl px-5 pt-10">
        <h1 className="text-4xl">{t.events.title}</h1>
        <p className="mt-2 text-stone">{t.events.intro}</p>
        <div className="mt-6 rounded-2xl border border-line bg-paper p-4 sm:p-5">
          <label className="relative block">
            <span className="sr-only">{c.search}</span>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.search} className="w-full rounded-full border border-line bg-card py-3.5 pl-12 pr-4 text-base" />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="min-w-0 text-sm">{c.city}
              <select value={city} onChange={(e) => setCity(e.target.value)} className={select} style={chevron}>
                <option value="">{t.events.allCities}</option>
                {cityOptions.map((x) => <option key={x} value={x}>{f.city(x)}</option>)}
              </select>
            </label>
            <label className="min-w-0 text-sm">{c.type}
              <select value={type} onChange={(e) => setType(e.target.value)} className={select} style={chevron}>
                <option value="">{t.events.allTypes}</option>
                {eventTypes.map((x) => <option key={x} value={x}>{f.eventType(x)}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-stone">
            <span aria-live="polite">{c.count(list.length)}</span>
            {filtered && <button type="button" onClick={() => { setQuery(""); setCity(""); setType(""); }} className="link">{c.clear}</button>}
          </div>
        </div>
        {dates.length === 0 && <p className="mt-12 text-center text-stone">{t.events.empty}</p>}
        {dates.map((d) => (
          <section key={d} className="mt-10">
            <h2 className="mb-3 border-b border-line pb-2 text-xl">{f.date(d, { weekday: "long", month: "long", day: "numeric" })}</h2>
            <div className="space-y-3">{list.filter((e) => e.date === d).map((e) => <EventCard key={e.id} e={e} />)}</div>
          </section>
        ))}
      </div>
    </Page>
  );
}
/** Lowercase without accents, so "san pedro" finds "San Pedro Sula" and "medellin" finds "Medellín". */
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function Empty() { return <p>{useT().account.empty}</p>; }
