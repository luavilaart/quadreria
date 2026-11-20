import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/q/Shell";
import { EventCard } from "@/components/q/Cards";
import { events, cities, eventTypes, fmtDate } from "@/data/sample";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [
    { title: "Events calendar — quadreria" }, { name: "description", content: "Classes, openings, markets and online sessions hosted by artists." },
    { property: "og:title", content: "Events — quadreria" }, { property: "og:description", content: "Classes, openings, markets and online sessions." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Events,
});

function Events() {
  const [city, setCity] = useState<string>();
  const [type, setType] = useState<string>();
  const list = events.filter((e) => (!city || e.city === city) && (!type || e.type === type)).sort((a, b) => a.date.localeCompare(b.date));
  const dates = [...new Set(list.map((e) => e.date))];
  return (
    <Page>
      <div className="mx-auto max-w-3xl px-5 pt-10">
        <h1 className="text-4xl">Events</h1>
        <p className="mt-2 text-stone">Meet the artist in person, or from your couch.</p>
        <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5">
          <F on={!city} on2={() => setCity(undefined)}>All cities</F>{cities.map((c) => <F key={c} on={city === c} on2={() => setCity(c)}>{c}</F>)}
        </div>
        <div className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5">
          <F on={!type} on2={() => setType(undefined)}>All types</F>{eventTypes.map((c) => <F key={c} on={type === c} on2={() => setType(c)}>{c}</F>)}
        </div>
        {dates.length === 0 && <p className="mt-12 text-center text-stone">Nothing on that combo yet.</p>}
        {dates.map((d) => (
          <section key={d} className="mt-10">
            <h2 className="mb-3 border-b border-line pb-2 text-xl">{fmtDate(d, { weekday: "long", month: "long", day: "numeric" })}</h2>
            <div className="space-y-3">{list.filter((e) => e.date === d).map((e) => <EventCard key={e.id} e={e} />)}</div>
          </section>
        ))}
      </div>
    </Page>
  );
}
const F = ({ on, on2, children }: { on: boolean; on2: () => void; children: React.ReactNode }) => <button onClick={on2} aria-pressed={on} className={`chip ${on ? "chip-on" : ""}`}>{children}</button>;
