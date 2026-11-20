import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter, SampleBadge } from "@/components/q/Shell";
import { Art } from "@/components/q/Art";
import { PieceCard, EventCard } from "@/components/q/Cards";
import { galleryQuery } from "@/lib/gallery";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { copyFor, langOf, useFormat, useT } from "@/i18n";

export const Route = createFileRoute("/a/$handle")({
  loader: async ({ params, context }) => { const data = await context.queryClient.ensureQueryData(galleryQuery); const a = data.artists.find(a => a.handle === params.handle); if (!a) throw notFound(); return a; },
  errorComponent: ({ error }) => <p role="alert">{error instanceof Error ? error.message : String(error)}</p>,
  notFoundComponent: Empty,
  head: ({ loaderData: a, match }) => { const t = copyFor(langOf(match.context)); return { meta: a ? [
    { title: `${t.meta.roomTitle(a.name)} — quadreria` }, { name: "description", content: a.tagline },
    { property: "og:title", content: t.meta.roomShare(a.name) }, { property: "og:description", content: a.tagline },
    ...(a.photo?.startsWith("https://") ? [{property:"og:image",content:a.photo},{name:"twitter:image",content:a.photo}] : []),
    { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary_large_image" },
  ] : [{ title: `${t.meta.roomMissing} — quadreria` }, { name: "robots", content: "noindex" }] }; },
  component: Room,
});

function Room() {
  const { handle } = Route.useParams();
  const { data } = useSuspenseQuery(galleryQuery);
  const a = data.artists.find(a => a.handle === handle);
  const work = data.pieces.filter(p => p.artist === handle);
  const t = useT(); const f = useFormat();
  // "" means every collection, so an artist can still name a collection "All".
  const collections = ["", ...new Set(work.map((p) => p.collection))];
  const [col, setCol] = useState("");
  const [salon, setSalon] = useState(true);
  const shop = work.filter((p) => col === "" || p.collection === col);

  if (!a) return null;
  return (
    <RoomSections.Provider value={{ visible: a.visible_sections, order: a.section_order }}>
    <div className={`room-${a.room} bg-room text-room-fg`}>
      <SiteHeader />
      {/* Entrance */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-12 sm:grid-cols-[1fr_auto]">
        <div>
          {a.sample && <SampleBadge />}
          <p className="label mt-6 opacity-70">@{a.handle} · {f.city(a.city)}</p>
          <h1 className="mt-2 text-5xl leading-none sm:text-7xl">{a.name}</h1>
          <p className="mt-4 max-w-md text-lg opacity-85">{a.tagline}</p>
          <div className="mt-6 hidden gap-3 sm:flex">
            <a href="#services" className="btn btn-primary">{t.room.hire}</a>
            <a href="#shop" className="btn btn-ghost">{t.room.shop}</a>
          </div>
        </div>
        <div className="w-40 sm:w-56"><Art src={a.photo ?? undefined} ratio={4 / 5} tone="cream" shape={2} title={t.room.portrait(a.name)} className="rounded-2xl" /></div>
      </section>

      <div className="flex flex-col rounded-t-[2rem] bg-room pb-28 sm:pb-0">
        <Section id="work" title={t.room.work} action={
          <div className="flex rounded-full border border-current p-0.5 text-xs">
            {[true, false].map((s) => <button key={String(s)} onClick={() => setSalon(s)} className={`rounded-full px-3 py-1 ${salon === s ? "bg-room-fg text-room" : ""}`}>{s ? t.room.salon : t.room.tidy}</button>)}
          </div>}>
          {salon ? (
            <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-8">
              {work.map((p, i) => (
                <Link key={p.id} to="/a/$handle/p/$id" params={{ handle: a.handle, id: p.id }} style={{ width: `${[38, 52, 30, 44][i % 4]}%`, marginTop: i % 2 ? 24 : 0 }} className="max-w-xs">
                  <div className="rounded-lg bg-paper p-2"><Art src={p.images[0]} ratio={p.ratio} tone={p.tone} shape={p.shape} title={p.title} /></div>
                </Link>
              ))}
            </div>
          ) : <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">{work.map((p) => <PieceCard key={p.id} p={p} showArtist={false} />)}</div>}
        </Section>

        <Section id="shop" title={t.room.shop}>
          <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5">
            {collections.map((c) => <button key={c} onClick={() => setCol(c)} className={`chip text-ink ${col === c ? "chip-on" : ""}`}>{c || t.room.all}</button>)}
          </div>
          <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">
            {shop.map((p) => <div key={p.id}><PieceCard p={p} showArtist={false} /><div className="mt-2 flex flex-wrap gap-1">{p.tags.map((tg) => <span key={tg} className="label opacity-60">#{tg}</span>)}</div></div>)}
          </div>
        </Section>

        <Section id="services" title={t.room.services}>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.services.filter(s => s.artist === handle).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl bg-card p-5 text-ink">
                <div><h3 className="text-xl">{s.title}</h3><p className="text-sm text-stone">{s.note}</p></div>
                <button className="btn btn-primary shrink-0 !px-4 !py-2 text-sm">{f.service(s)}</button>
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
          <div className="mx-auto max-w-md space-y-3">{a.links.map((l) => <a key={l.label} href={l.url} className="btn btn-ghost w-full">{l.label}</a>)}</div>
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
