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

  if (!a) return null;
  return (
    <RoomSections.Provider value={withMediaSection(a.section_order, a.visible_sections)}>
    <div className={`room-${a.room} bg-room text-room-fg`}>
      <SiteHeader />
      {/* Entrance */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-12 sm:grid-cols-[1fr_auto]">
        <div>
          {a.sample && <SampleBadge />}
          <p className="label mt-6 opacity-70">@{a.handle} · {f.city(a.city)}</p>
          <h1 className="mt-2 text-5xl leading-none sm:text-7xl">{a.name}</h1>
          <p className="mt-4 max-w-md text-lg opacity-85">{a.tagline}</p>
          <FollowButton artist={a.handle}/>
          <p className="mt-3 text-sm">{state.artist_specialties.filter(s=>s.artist_id===a.id).map(s=>state.taxonomy.find(t=>t.id===s.specialty_id)).filter(t=>t?.status!=="hidden").map(t=>t?<span key={t.id} className="mr-3">{label(t,lang)}{t.status==="pending"?" · "+c.pending:""}</span>:null)}</p>
          <div className="mt-6 hidden gap-3 sm:flex">
            <a href="#services" className="btn btn-primary">{t.room.hire}</a>
            <a href="#shop" className="btn btn-ghost">{t.room.shop}</a>
          </div>
        </div>
        <div className="w-40 sm:w-56"><Art src={a.photo ?? undefined} ratio={4 / 5} tone="cream" shape={2} title={t.room.portrait(a.name)} className="rounded-2xl" /></div>
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
            {collections.map((c) => <QButton key={c} onClick={() => setCol(c)} className={`chip text-ink ${col === c ? "chip-on" : ""}`}>{c||featureCopy[lang].all}</QButton>)}
          </div>
          <ShopGrid rows={shop} showArtist={false}/>
        </Section>

        <Section id="services" title={t.room.services}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.services.filter(s => s.artist === handle).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl bg-card p-5 text-ink">
                <div><h3 className="text-xl">{s.title}</h3><p className="text-sm text-stone">{s.note}</p></div>
                <button className="btn btn-primary shrink-0 !px-4 !py-2 text-sm">{s.price}</button>
              </div>
            ))}
          </div>
        </Section>

        <Section id="events" title={t.room.events}>
          <div className="grid gap-3 text-ink sm:grid-cols-2">{data.events.filter(e => e.artist === handle).map((e) => <EventCard key={e.id} e={e} />)}</div>
          {data.events.filter(e => e.artist === handle).length === 0 && <p className="opacity-70">{t.room.noEvents}</p>}
        </Section>

        <Section id="about" title={t.room.about}>
          <div className="grid gap-6 sm:grid-cols-[2fr_3fr]">
            <Art ratio={3 / 2} tone="butter" shape={1} title={t.room.studioPhoto} className="rounded-2xl" />
            <div>
              <p className="text-lg leading-relaxed">{a.bio}</p>
              <p className="label mt-6 opacity-70">{t.room.love}</p>
              <div className="mt-2 flex flex-wrap gap-2">{a.loves.map((l) => <span key={l} className="chip text-ink">{l}</span>)}</div>
            </div>
          </div>
        </Section>

        <Section id="links" title={t.room.links}>
          <div className="mx-auto max-w-md space-y-3">{asRoomLinks(a.links).map((l,i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost w-full"><PlatformIcon platform={l.platform}/>{l.platform==='custom'?l.label:featureCopy[lang][l.platform]}</a>)}</div>
        </Section>

        <Section id="faq" title={t.room.faq}>
          <div className="space-y-2">
            {a.faq.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-card p-5 text-ink">
                <summary className="flex cursor-pointer list-none justify-between font-medium">{f.q}<span className="transition-transform group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-stone">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section id="contact" title={t.room.contact}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-3 rounded-2xl bg-card p-5 text-ink">
            <input placeholder={t.room.yourName} className="w-full rounded-xl border border-line bg-wall px-4 py-3" />
            <input placeholder={t.room.email} type="email" className="w-full rounded-xl border border-line bg-wall px-4 py-3" />
            <textarea placeholder={t.room.message(a.name.split(" ")[0] ?? a.name)} rows={4} className="w-full rounded-xl border border-line bg-wall px-4 py-3" />
            <button className="btn btn-primary w-full">{t.room.send}</button>
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
