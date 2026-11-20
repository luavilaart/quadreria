import { t } from "@/i18n/en";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/q/Shell";
import { PieceCard, RoomCard, ServiceCard, EventCard } from "@/components/q/Cards";
import { galleryQuery, mediums, cities } from "@/lib/gallery";

type Search = { medium?: string | undefined };
export const Route = createFileRoute("/discover")({
  validateSearch: (s: Record<string, unknown>): Search => ({ medium: typeof s["medium"] === "string" ? s["medium"] : undefined }),
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  errorComponent: ({ error }) => <p role="alert">{error instanceof Error ? error.message : String(error)}</p>,
  notFoundComponent: () => <p>{t.account.empty}</p>,
  head: () => ({ meta: [
    { title: "Discover art, artists and events — quadreria" },
    { name: "description", content: "Browse paintings, prints, crochet, stickers and more from independent artists." },
    { property: "og:title", content: "Discover — quadreria" },
    { property: "og:description", content: "Browse art, artists, services and events." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Discover,
});

const tabs = ["Art", "Artists", "Services", "Events"] as const;
const prices = [{ l: "Any price", max: Infinity }, { l: "Under $50", max: 50 }, { l: "Under $250", max: 250 }, { l: "$250+", max: -250 }];

function Discover() {
  const { data: { artists, pieces, services, events } } = useSuspenseQuery(galleryQuery);
  const { medium: initial } = Route.useSearch();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Art");
  const [medium, setMedium] = useState<string | undefined>(initial);
  const [price, setPrice] = useState(0);
  const [city, setCity] = useState<string | undefined>();
  const max = (prices[price]?.max ?? Infinity);
  const list = pieces.filter((p) => (!medium || p.medium === medium) && (!city || p.city === city) && (max < 0 ? p.price >= -max : p.price < max));
  const cols = [0, 1].map((c) => list.filter((_, i) => i % 2 === c));

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <h1 className="text-4xl">Discover</h1>
        <div className="mt-6 flex gap-1 rounded-full border border-line bg-card p-1" role="tablist">
          {tabs.map((x) => <button key={x} role="tab" aria-selected={tab === x} onClick={() => setTab(x)} className={`flex-1 rounded-full py-2 text-sm ${tab === x ? "bg-ink text-wall" : ""}`}>{x}</button>)}
        </div>

        {tab === "Art" && (<>
          <div className="mt-6 space-y-3">
            <Row><Chip on={!medium} onClick={() => setMedium(undefined)}>All mediums</Chip>{mediums.map((m) => <Chip key={m} on={medium === m} onClick={() => setMedium(m)}>{m}</Chip>)}</Row>
            <Row>{prices.map((p, i) => <Chip key={p.l} on={price === i} onClick={() => setPrice(i)}>{p.l}</Chip>)}</Row>
            <Row><Chip on={!city} onClick={() => setCity(undefined)}>Anywhere</Chip>{cities.map((c) => <Chip key={c} on={city === c} onClick={() => setCity(c)}>{c}</Chip>)}</Row>
          </div>
          {list.length === 0 ? <p className="mt-12 text-center text-stone">Nothing here yet. Try another filter.</p> : (<>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:hidden">{cols.map((c, i) => <div key={i} className="space-y-6">{c.map((p) => <PieceCard key={p.id} p={p} />)}</div>)}</div>
            <div className="mt-8 hidden columns-3 gap-6 sm:block lg:columns-4">{list.map((p) => <div key={p.id} className="mb-8 break-inside-avoid"><PieceCard p={p} /></div>)}</div>
          </>)}
        </>)}
        {tab === "Artists" && <div className="mt-8 grid gap-4 sm:grid-cols-3">{artists.map((a) => <RoomCard key={a.handle} a={a} />)}</div>}
        {tab === "Services" && <div className="mt-8 grid gap-3 sm:grid-cols-2">{services.map((s) => <ServiceCard key={s.id} s={s} />)}</div>}
        {tab === "Events" && <div className="mt-8 grid gap-3 sm:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div>}
      </div>
    </Page>
  );
}
const Row = ({ children }: { children: React.ReactNode }) => <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">{children}</div>;
const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} aria-pressed={on} className={`chip ${on ? "chip-on" : ""}`}>{children}</button>
);
