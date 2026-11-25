import {ShopGrid} from '@/components/q/ShopGrid';
import {RoomMediaTile} from '@/components/q/RoomMediaTile';
import {PlatformIcon} from '@/components/q/LinkEditor';
import {asRoomLinks} from '@/lib/links';
import {featureCopy} from '@/i18n/features';
import {shopSearchValidator} from '@/lib/shop';
import {QButton} from '@/components/q/QButton';
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter, SampleBadge } from "@/components/q/Shell";
import {MediaTile} from "@/components/q/MediaTile";
import {useTaxonomy} from "@/components/q/TaxonomyProvider";
import {isForSale,label} from "@/data/taxonomy";
import { Art } from "@/components/q/Art";
import { PieceCard, EventCard } from "@/components/q/Cards";
import { galleryQuery } from "@/lib/gallery";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { useFormat, useT } from "@/i18n";
import { usePagesCopy } from "@/i18n/pages";
import { Plus } from "lucide-react";
import { FavoriteButton, FollowButton } from '@/components/q/SocialActions';

export const Route = createFileRoute("/a/$handle")({
  validateSearch:shopSearchValidator,
  loader: async ({ params, context }) => { const data = await context.queryClient.ensureQueryData(galleryQuery); const a = data.artists.find(a => a.handle === params.handle); if (!a) throw notFound(); return a; },
  errorComponent: ({ error }) => <p role="alert">{error instanceof Error ? error.message : String(error)}</p>,
  notFoundComponent: Empty,
  head: ({ loaderData: a }) => ({ meta: a ? [
    { title: `${a.name}'s room — quadreria` }, { name: "description", content: a.tagline },
    { property: "og:title", content: `${a.name} on quadreria` }, { property: "og:description", content: a.tagline },
    ...(a.photo?.startsWith("https://") ? [{property:"og:image",content:a.photo},{name:"twitter:image",content:a.photo}] : []),
    { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary_large_image" },
  ] : [{ title: "Room not found — quadreria" }, { name: "robots", content: "noindex" }] }),
  component: Room,
});

function Room() {
  const {state,lang,c}=useTaxonomy();
  const t = useT(); const f = useFormat();
  const { handle } = Route.useParams();
  const { data } = useSuspenseQuery(galleryQuery);
  const a = data.artists.find(a => a.handle === handle);
  const all = data.pieces.filter(p => p.artist === handle && p.review_status === "approved");
  // Images hang on the Work wall; audio and video get their own "Listen & watch" section.
  const work = all.filter(p => p.media_type === "image");
  const media = all.filter(p => p.media_type !== "image");
  // "" means every collection, so an artist can still name a collection "All".
  const collections = ["", ...new Set(all.map((p) => p.collection))];
  const {collection:col}=Route.useSearch();
  const navigate=Route.useNavigate();
  const setCol=(collection:string)=>void navigate({search:prev=>({...prev,collection})});
  const [salon, setSalon] = useState(true);
  const shop = all.filter((p) => isForSale(p) && (col === "" || p.collection === col));

  const pc = usePagesCopy();
  const [sent, setSent] = useState(false);
  if (!a) return null;
  const links = asRoomLinks(a.links);
  const specialties = state.artist_specialties.filter(s=>s.artist_id===a.id).map(s=>state.taxonomy.find(t=>t.id===s.specialty_id)).flatMap(t=>t&&t.status!=="hidden"?[label(t,lang)+(t.status==="pending"?` · ${c.pending}`:"")]:[]);
  const sections = withMediaSection(a.section_order, a.visible_sections);
  const canContact = sections.visible.includes("contact");
  const studioPiece = work[0];
  return (
    <RoomSections.Provider value={sections}>
    <div className={`room-${a.room} bg-room text-room-fg`}>
      <SiteHeader />
      {/* Entrance: who they are, then one row of actions. Hire and Shop live in the bottom bar on phones. */}
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:pb-20 sm:pt-14">
        {a.sample && <SampleBadge />}
        <div className="mt-6 grid items-center gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-14">
          <div className="order-2 min-w-0 sm:order-1">
            <p className="label opacity-70">@{a.handle} · {f.city(a.city)}</p>
            <h1 className="mt-3 text-5xl leading-[0.95] sm:text-7xl">{a.name}</h1>
            {a.tagline && <p className="mt-4 max-w-lg text-lg opacity-85 sm:text-xl">{a.tagline}</p>}
            {specialties.length > 0 && <p className="mt-4 text-sm opacity-75">{specialties.join(" · ")}</p>}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#services" className="btn btn-primary hidden !h-11 !py-0 sm:inline-flex">{t.room.hire}</a>
              <a href="#shop" className="btn btn-ghost hidden !h-11 !py-0 sm:inline-flex">{t.room.shop}</a>
              <FollowButton artist={a.handle} className="btn-ghost !h-11 !px-5 !py-0 !text-[0.95rem]" />
              {links.length > 0 && (
                <ul aria-label={t.room.links} className="flex flex-wrap items-center gap-2 sm:ml-2 sm:border-l sm:border-current/20 sm:pl-4">
                  {links.map((l, i) => {
                    const name = l.platform === "custom" ? l.label : featureCopy[lang][l.platform];
                    return (
                      <li key={i}>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={pc.room.linkTo(name)} title={name}
                          className={`flex h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-current/30 transition-colors hover:bg-room-fg hover:text-room ${l.platform === "custom" ? "px-4 text-sm" : "w-11"}`}>
                          <PlatformIcon platform={l.platform} />{l.platform === "custom" && <span className="max-w-[10rem] truncate">{name}</span>}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          <div className="order-1 w-32 rotate-[1.5deg] rounded-2xl bg-paper p-2.5 shadow-[0_24px_40px_-28px_rgba(31,27,22,0.55)] sm:order-2 sm:w-60 lg:w-72">
            <Art src={a.photo ?? undefined} ratio={4 / 5} tone="cream" shape={2} title={t.room.portrait(a.name)} className="rounded-xl" />
          </div>
        </div>
      </section>

      <div className="flex flex-col rounded-t-[2rem] bg-room pb-28 sm:pb-0">
        {work.length > 0 && <Section id="work" title={t.room.work} action={
          <div className="flex rounded-full border border-current p-0.5 text-xs">
            {[true, false].map((s) => <button key={String(s)} onClick={() => setSalon(s)} className={`rounded-full px-3 py-1 ${salon === s ? "bg-room-fg text-room" : ""}`}>{s ? t.room.salon : t.room.tidy}</button>)}
          </div>}>
          {salon ? (
            <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-8">
              {work.map((p, i) => (
                <div key={p.id} style={{ width: `${[38, 52, 30, 44][i % 4]}%`, marginTop: i % 2 ? 24 : 0 }} className="max-w-xs">
                  <div className="rounded-lg bg-paper p-2"><MediaTile p={p}/></div><div className="flex items-start justify-between gap-2"><Link to="/a/$handle/p/$id" params={{handle:a.handle,id:p.id}} className="mt-2 block text-sm">{p.title}</Link><FavoriteButton piece={p.id}/></div><p className="mt-1 text-xs">{state.piece_styles.filter(s=>s.piece_id===p.id).map(s=>state.taxonomy.find(t=>t.id===s.style_id)).filter(t=>t?.status!=="hidden").map(t=>t?<span key={t.id} className="mr-2">{label(t,lang)}</span>:null)}</p>
                </div>
              ))}
            </div>
          ) : <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">{work.map((p) => <PieceCard key={p.id} p={p} showArtist={false} />)}</div>}
        </Section>}

        {(media.length > 0||data.roomMedia.some(m=>m.artist===handle)) && <Section id="media" title={c.listen}>
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
            {data.roomMedia.filter(m=>m.artist===handle).map(m=><RoomMediaTile key={m.id} item={m}/>)}
            {media.map((p) => (
              <div key={p.id}>
                <div className="rounded-lg bg-paper p-2"><MediaTile p={p} /></div>
                <div className="flex items-start justify-between gap-2"><Link to="/a/$handle/p/$id" params={{ handle: a.handle, id: p.id }} className="mt-2 block">{p.title}</Link><FavoriteButton piece={p.id} /></div>
              </div>
            ))}
          </div>
        </Section>}


        <Section id="shop" title={t.room.shop}>
          <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5">
            {collections.map((c) => <QButton key={c} aria-pressed={col === c} onClick={() => setCol(c)} className={`chip ${col === c ? "chip-on" : "text-ink hover:border-ink"}`}>{c||featureCopy[lang].all}</QButton>)}
          </div>
          <ShopGrid rows={shop} showArtist={false} filters={false}/>
        </Section>

        <Section id="services" title={t.room.services}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.services.filter(s => s.artist === handle).map((s) => (
              <div key={s.id} className="flex gap-4 rounded-2xl bg-card p-4 text-ink">
                {s.image && <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-wall p-1.5"><img src={s.image} alt="" loading="lazy" className="max-h-full max-w-full rounded-md object-contain" /></div>}
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-xl leading-tight">{s.title}</h3>
                  {s.note && <p className="mt-1 text-sm text-stone">{s.note}</p>}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <span className="font-medium">{f.service(s.price)}</span>
                    {canContact && <a href="#contact" className="link text-sm">{pc.room.ask}</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="events" title={t.room.events}>
          <div className="grid gap-3 text-ink sm:grid-cols-2">{data.events.filter(e => e.artist === handle).map((e) => <EventCard key={e.id} e={e} />)}</div>
          {data.events.filter(e => e.artist === handle).length === 0 && <p className="opacity-70">{t.room.noEvents}</p>}
        </Section>

        <Section id="about" title={t.room.about}>
          <div className={studioPiece ? "grid items-start gap-8 sm:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)]" : "max-w-2xl"}>
            {studioPiece && <div className="max-w-[15rem] rounded-2xl bg-paper p-3 sm:max-w-none"><Art ratio={studioPiece.ratio} tone={studioPiece.tone} shape={studioPiece.shape} src={studioPiece.images[0]} title={studioPiece.title} className="rounded-xl" /></div>}
            <div>
              <p className="text-lg leading-relaxed">{a.bio}</p>
              <p className="label mt-6 opacity-70">{t.room.love}</p>
              <div className="mt-2 flex flex-wrap gap-2">{a.loves.map((l) => <span key={l} className="chip !py-1.5 text-ink">{l}</span>)}</div>
            </div>
          </div>
        </Section>

        <Section id="links" title={t.room.links}>
          <div className="mx-auto max-w-md space-y-3">{links.map((l,i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost w-full"><PlatformIcon platform={l.platform}/>{l.platform==='custom'?l.label:featureCopy[lang][l.platform]}</a>)}</div>
        </Section>

        <Section id="faq" title={t.room.faq}>
          <div className="space-y-2">
            {a.faq.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-card p-5 text-ink">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">{f.q}<Plus aria-hidden className="size-5 shrink-0 text-deep-tomato transition-transform duration-300 group-open:rotate-45" /></summary>
                <p className="mt-3 text-stone">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section id="contact" title={t.room.contact}>
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mx-auto max-w-2xl space-y-3 rounded-2xl bg-card p-5 text-ink sm:p-6">
            <input placeholder={t.room.yourName} className="w-full rounded-xl border border-line bg-wall px-4 py-3" />
            <input placeholder={t.room.email} type="email" className="w-full rounded-xl border border-line bg-wall px-4 py-3" />
            <textarea placeholder={t.room.message(a.name.split(" ")[0] ?? a.name)} rows={4} className="w-full rounded-xl border border-line bg-wall px-4 py-3" />
            <button className="btn btn-primary w-full">{t.room.send}</button>
            {sent && <p role="status" className="rounded-xl bg-wall p-4 text-sm text-stone">{pc.room.contactSoon(a.name.split(" ")[0] ?? a.name)}</p>}
          </form>
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-line bg-wall p-3 sm:hidden">
        <a href="#services" className="btn btn-primary flex-1">{t.room.hire}</a>
        <a href="#shop" className="btn btn-ghost flex-1 text-ink">{t.room.shop}</a>
      </div>
      <div className="bg-wall text-ink"><SiteFooter /></div>
    </div>
    </RoomSections.Provider>
  );
}

/** Rooms saved before "Listen & watch" existed get it right after the Work wall, shown by default. */
function withMediaSection(order: string[], visible: string[]) {
  if (order.includes("media")) return { order, visible };
  const at = order.indexOf("work") + 1;
  return { order: [...order.slice(0, at), "media", ...order.slice(at)], visible: [...visible, "media"] };
}

const RoomSections = createContext({ visible: [] as string[], order: [] as string[] });
function Section({ id, title, action, children }: { id: string; title: string; action?: ReactNode; children: ReactNode }) {
  const { visible, order } = useContext(RoomSections);
  if (!visible.includes(id)) return null;
  return (
    <section style={{order: order.indexOf(id)}} id={id} className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-12">
      <div className="mb-6 flex items-center justify-between"><h2 className="text-3xl">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

function Empty() { return <p>{useT().account.empty}</p>; }
