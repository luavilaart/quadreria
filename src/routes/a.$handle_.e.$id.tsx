import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Page, SampleBadge } from "@/components/q/Shell";
import { Art } from "@/components/q/Art";
import { artistBy, events, fmtDate, usd } from "@/data/sample";
import { t } from "@/i18n/en";

export const Route = createFileRoute("/a/$handle_/e/$id")({
  loader: ({ params }) => {
    const e = events.find((x) => x.id === params.id && x.artist === params.handle);
    if (!e) throw notFound();
    return { e, a: artistBy(e.artist)! };
  },
  head: ({ loaderData: d }) => ({ meta: d ? [
    { title: `${d.e.title} — quadreria` }, { name: "description", content: d.e.blurb },
    { property: "og:title", content: `${d.e.title} with ${d.a.name}` }, { property: "og:description", content: d.e.blurb },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] : [{ title: "Event not found — quadreria" }, { name: "robots", content: "noindex" }] }),
  component: EventPage,
});

function EventPage() {
  const { e, a } = Route.useLoaderData();
  const full = e.spots === 0;
  const [done, setDone] = useState(false);
  return (
    <Page>
      <div className="mx-auto max-w-3xl px-5 pt-8">
        <Art ratio={3 / 2} tone={e.tone} shape={0} title={e.title} className="rounded-2xl" />
        <div className="mt-6"><SampleBadge /></div>
        <p className="label mt-4 text-stone">{e.type}</p>
        <h1 className="mt-1 text-4xl leading-tight">{e.title}</h1>
        <p className="mt-2">with <Link to="/a/$handle" params={{ handle: a.handle }} className="link">{a.name}</Link></p>
        <p className="mt-4 text-lg">{e.blurb}</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <Info k="When" v={`${fmtDate(e.date, { weekday: "long", month: "long", day: "numeric" })} · ${e.time}`} />
          <Info k="Where" v={e.city === "Online" ? "Online — link sent with your ticket" : `${e.address}, ${e.city}`} />
          <Info k="Price" v={usd(e.price)} />
          <Info k="Spots" v={full ? `${t.event.full} (${e.capacity} people)` : `${e.spots} of ${e.capacity} left`} />
        </dl>
        <h2 className="mt-8 text-2xl">{t.event.bring}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">{e.bring.map((b) => <li key={b}>{b}</li>)}</ul>
        <div className="mt-8 rounded-2xl border border-line bg-card p-5">
          <h2 className="text-xl">{t.event.refundTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone">{t.event.refund.map((r) => <li key={r}>— {r}</li>)}</ul>
        </div>
        <button onClick={() => setDone(true)} className={`btn mt-8 w-full ${full ? "btn-ghost" : "btn-primary"}`}>
          {done ? (full ? "You're on the waitlist." : "Ticket saved (sample).") : full ? t.event.waitlist : `${t.event.get} · ${usd(e.price)}`}
        </button>
      </div>
    </Page>
  );
}
const Info = ({ k, v }: { k: string; v: string }) => <div className="rounded-2xl border border-line bg-card p-4"><dt className="label text-stone">{k}</dt><dd className="mt-1">{v}</dd></div>;
