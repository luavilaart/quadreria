import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Page, SampleBadge } from "@/components/q/Shell";
import { Art } from "@/components/q/Art";
import { PieceCard } from "@/components/q/Cards";
import { artistBy, pieces, piecesBy, usd } from "@/data/sample";
import { t } from "@/i18n/en";

export const Route = createFileRoute("/a/$handle_/p/$id")({
  loader: ({ params }) => {
    const p = pieces.find((x) => x.id === params.id && x.artist === params.handle);
    if (!p) throw notFound();
    return { p, a: artistBy(p.artist)! };
  },
  head: ({ loaderData: d }) => ({ meta: d ? [
    { title: `${d.p.title} by ${d.a.name} — quadreria` }, { name: "description", content: `${d.p.medium}, ${d.p.size}. ${usd(d.p.price)}.` },
    { property: "og:title", content: `${d.p.title} — ${d.a.name}` }, { property: "og:description", content: `${d.p.medium} on quadreria` },
    { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" },
  ] : [{ title: "Piece not found — quadreria" }, { name: "robots", content: "noindex" }] }),
  component: PiecePage,
});

function PiecePage() {
  const { p, a } = Route.useLoaderData();
  const [added, setAdded] = useState(false);
  return (
    <Page>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 lg:grid-cols-[3fr_2fr]">
        <div className={`room-${a.room} flex items-center justify-center rounded-2xl bg-room p-6 sm:p-12`}>
          <div className="w-full" style={{ maxWidth: `${Math.min(100, p.ratio * 70)}%` }}><Art ratio={p.ratio} tone={p.tone} shape={p.shape} title={p.title} /></div>
        </div>
        <div>
          <SampleBadge />
          <Link to="/a/$handle" params={{ handle: a.handle }} className="link mt-4 block text-sm">{a.name}</Link>
          <h1 className="mt-1 text-4xl">{p.title}</h1>
          <p className="mt-3 text-2xl font-medium">{usd(p.price)}</p>
          <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
            {[[t.piece.medium, p.medium], [t.piece.size, p.size], [t.piece.ships, p.city === "Online" ? "Tegucigalpa, Honduras" : `${p.city}, Honduras`]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3"><dt className="label text-stone">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-stone">Packed by the artist and shipped within 5 days. Shipping is calculated at checkout.</p>
          <button onClick={() => setAdded(true)} className="btn btn-primary mt-6 w-full">{added ? "Added. Nice choice." : t.piece.add}</button>
        </div>
      </div>
      <section className="mx-auto mt-16 max-w-6xl px-5">
        <h2 className="mb-5 text-2xl">{t.piece.more}</h2>
        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">{piecesBy(a.handle).filter((x) => x.id !== p.id).map((x) => <PieceCard key={x.id} p={x} showArtist={false} />)}</div>
      </section>
    </Page>
  );
}
