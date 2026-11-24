import { useSuspenseQuery } from "@tanstack/react-query";
import { QButton } from "@/components/q/QButton";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Page, SampleBadge } from "@/components/q/Shell";
import {MediaTile} from "@/components/q/MediaTile";
import {useTaxonomy} from "@/components/q/TaxonomyProvider";
import {isForSale,label} from "@/data/taxonomy";
import { Art } from "@/components/q/Art";
import { PieceCard } from "@/components/q/Cards";
import { galleryQuery, usd } from "@/lib/gallery";
import { t } from "@/i18n/en";

export const Route = createFileRoute("/a/$handle_/p/$id")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(galleryQuery);
    const p = data.pieces.find(x => x.id === params.id && x.artist === params.handle);
    const a = data.artists.find(a => a.handle === params.handle);
    if (!p || !a) throw notFound();
    return { p, a };
  },
  errorComponent: ({ error }) => <p role="alert">{error instanceof Error ? error.message : String(error)}</p>,
  notFoundComponent: () => <p>{t.account.empty}</p>,
  head: ({ loaderData: d }) => ({ meta: d ? [
    { title: `${d.p.title} by ${d.a.name} — quadreria` }, { name: "description", content: `${d.p.medium}, ${d.p.size}. ${usd(d.p.price)}.` },
    { property: "og:title", content: `${d.p.title} — ${d.a.name}` }, { property: "og:description", content: `${d.p.medium} on quadreria` },
    ...(d.p.images[0]?.startsWith("https://") ? [{property:"og:image",content:d.p.images[0] ?? ""},{name:"twitter:image",content:d.p.images[0] ?? ""}] : []),
    { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" },
  ] : [{ title: "Piece not found — quadreria" }, { name: "robots", content: "noindex" }] }),
  component: PiecePage,
});

function PiecePage() {
  const {state,lang,c}=useTaxonomy();
  useSuspenseQuery(galleryQuery);
  const { p, a } = Route.useLoaderData();
  const { data } = useSuspenseQuery(galleryQuery);
  return (
    <Page>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 lg:grid-cols-[3fr_2fr]">
        <div className={`room-${a.room} flex items-center justify-center rounded-2xl bg-room p-6 sm:p-12`}>
          <div className="w-full" style={{ maxWidth: `${Math.min(100, p.ratio * 70)}%` }}><MediaTile p={p}/></div>
        </div>
        <div>
          {p.sample && <SampleBadge />}
          <Link to="/a/$handle" params={{ handle: a.handle }} className="link mt-4 block text-sm">{a.name}</Link>
          <h1 className="mt-1 text-4xl">{p.title}</h1>
          <p className="mt-3 text-2xl font-medium">{isForSale(p)?usd(p.price):p.format_id==="format:digital-download"?c.coming:c.showcase}</p>
           <p className="mt-2 text-sm">{state.taxonomy.filter(t=>t.id===p.format_id).map(t=>label(t,lang))}{p.edition?` · ${c.edition}: ${p.edition}`:""}</p>
           <p className="mt-2 text-sm">{state.piece_styles.filter(s=>s.piece_id===p.id).map(s=>state.taxonomy.find(t=>t.id===s.style_id)).filter(t=>t?.status==="active").map(t=>t?<span key={t.id} className="mr-2">{label(t,lang)}</span>:null)}</p>
          <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
            {[[t.piece.medium, p.medium], [t.piece.size, p.size], [t.piece.ships, p.city === "Online" ? "Tegucigalpa, Honduras" : `${p.city}, Honduras`]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3"><dt className="label text-stone">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-stone">Packed by the artist and shipped within 5 days. Shipping is calculated at checkout.</p>
          {isForSale(p)&&<QButton disabled className="btn-primary mt-6 w-full">{t.piece.add} · {t.account.coming}</QButton>}
        </div>
      </div>
      <section className="mx-auto mt-16 max-w-6xl px-5">
        <h2 className="mb-5 text-2xl">{t.piece.more}</h2>
        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">{data.pieces.filter(p => p.artist === a.handle).filter((x) => x.id !== p.id).map((x) => <PieceCard key={x.id} p={x} showArtist={false} />)}</div>
      </section>
    </Page>
  );
}
