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
import { useFormat, useT } from "@/i18n";
import { FavoriteButton, FollowButton } from '@/components/q/SocialActions';
import { usePagesCopy } from '@/i18n/pages';
import { ArrowRight } from 'lucide-react';

export const Route = createFileRoute("/a/$handle_/p/$id")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(galleryQuery);
    const p = data.pieces.find(x => x.id === params.id && x.artist === params.handle);
    const a = data.artists.find(a => a.handle === params.handle);
    if (!p || !a) throw notFound();
    return { p, a };
  },
  errorComponent: ({ error }) => <p role="alert">{error instanceof Error ? error.message : String(error)}</p>,
  notFoundComponent: Empty,
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
  const t = useT(); const f = useFormat();
  useSuspenseQuery(galleryQuery);
  const { p, a } = Route.useLoaderData();
  const { data } = useSuspenseQuery(galleryQuery);
  const pc = usePagesCopy().piece;
  const specialties = state.artist_specialties.filter(s=>s.artist_id===a.id).map(s=>state.taxonomy.find(t=>t.id===s.specialty_id)).flatMap(t=>t&&t.status==='active'?[label(t,lang)]:[]).slice(0,3);
  return (
    <Page>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 lg:grid-cols-[3fr_2fr]">
        <div className={`room-${a.room} flex items-center justify-center rounded-2xl bg-room p-6 sm:p-12`}>
          <div className="w-full" style={{ maxWidth: `${Math.min(100, p.ratio * 70)}%` }}><MediaTile p={p}/></div>
        </div>
        <div>
          {p.sample && <SampleBadge />}
          <Link to="/a/$handle" params={{ handle: a.handle }} className="link mt-4 block text-sm">{a.name}</Link>
          <div className="mt-1 flex items-start justify-between gap-3"><h1 className="text-4xl">{p.title}</h1><FavoriteButton piece={p.id}/></div>
          <p className="mt-3 text-2xl font-medium">{isForSale(p)?f.price(p.price):p.format_id==="format:digital-download"?c.coming:c.showcase}</p>
           <p className="mt-2 text-sm">{state.taxonomy.filter(t=>t.id===p.format_id).map(t=>label(t,lang))}{p.edition?` · ${c.edition}: ${p.edition}`:""}</p>
           <p className="mt-2 text-sm">{state.piece_styles.filter(s=>s.piece_id===p.id).map(s=>state.taxonomy.find(t=>t.id===s.style_id)).filter(t=>t?.status==="active").map(t=>t?<span key={t.id} className="mr-2">{label(t,lang)}</span>:null)}</p>
          <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
            {[[t.piece.medium, f.medium(p.medium)], [t.piece.size, p.size], [t.piece.ships, p.city === "Online" ? "Tegucigalpa, Honduras" : `${p.city}, Honduras`]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3"><dt className="label text-stone">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-stone">{t.piece.shipping}</p>
          {isForSale(p)&&<QButton disabled className="btn-primary mt-6 w-full">{t.piece.add} · {t.account.coming}</QButton>}
        </div>
      </div>
      <section aria-labelledby="about-artist" className={`room-${a.room} mx-auto mt-16 max-w-6xl px-5`}>
        <div className="grid items-center gap-6 rounded-3xl bg-room p-6 text-room-fg sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10 sm:p-10">
          <Link to="/a/$handle" params={{ handle: a.handle }} className="block w-28 rotate-[-1.5deg] rounded-2xl bg-paper p-2 shadow-[0_20px_36px_-26px_rgba(31,27,22,0.6)] transition-transform hover:rotate-0 sm:w-40" tabIndex={-1} aria-hidden>
            <Art src={a.photo ?? undefined} ratio={4 / 5} tone="cream" shape={2} title={t.room.portrait(a.name)} className="rounded-xl" />
          </Link>
          <div className="min-w-0">
            <p id="about-artist" className="label opacity-70">{pc.aboutArtist}</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">{a.name}</h2>
            <p className="mt-1 text-sm opacity-75">{[f.city(a.city), ...specialties].filter(Boolean).join(" · ")}</p>
            {(a.bio || a.tagline) && <p className="mt-4 line-clamp-4 max-w-2xl text-lg leading-relaxed opacity-90">{a.bio || a.tagline}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/a/$handle" params={{ handle: a.handle }} className="btn btn-primary group !h-11 !py-0">{pc.visitRoom(a.name.split(" ")[0] ?? a.name)}<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" /></Link>
              <FollowButton artist={a.handle} className="btn-ghost !h-11 !px-5 !py-0 !text-[0.95rem]" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto mt-16 max-w-6xl px-5">
        <h2 className="mb-5 text-2xl">{t.piece.more}</h2>
        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">{data.pieces.filter(p => p.artist === a.handle).filter((x) => x.id !== p.id).map((x) => <PieceCard key={x.id} p={x} showArtist={false} />)}</div>
      </section>
    </Page>
  );
}

function Empty() { return <p>{useT().account.empty}</p>; }
