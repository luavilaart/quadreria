import { Link } from "@tanstack/react-router";
import {MediaTile} from "./MediaTile";
import {useTaxonomy} from "./TaxonomyProvider";
import {label,isForSale,activeEntries} from "@/data/taxonomy";
import type {Language} from "@/i18n/taxonomy";
import { Art } from "./Art";
import { type Event, type Piece, type Service, type Artist } from "@/lib/gallery";
import { useFormat, useT } from "@/i18n";
import { FavoriteButton } from './SocialActions';

export function PieceCard({ p, showArtist = true }: { p: Piece; showArtist?: boolean }) {
  const f = useFormat();
  return (
    <div className="group block">
      {p.media_type === "image" ? <Link to="/a/$handle/p/$id" params={{handle:p.artist,id:p.id}}><MediaTile p={p}/></Link> : <MediaTile p={p}/>}
      <div className="flex items-start justify-between gap-1"><Link className="min-w-0 flex-1" to="/a/$handle/p/$id" params={{ handle: p.artist, id: p.id }}>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <h3 className="text-base leading-tight">{p.title}</h3>
        <span className="text-sm font-medium">{isForSale(p) ? f.price(p.price) : ""}</span>
      </div>
      {showArtist && <p className="text-xs text-stone">{p.artistName}</p>}
      </Link><FavoriteButton piece={p.id}/></div>
    </div>
  );
}

export function RoomCard({ a, language }: { a: Artist; language?:Language }) {
  const {state,lang:globalLang}=useTaxonomy();const lang=language??globalLang;
  const main=state.artist_mediums.find(m=>m.artist_id===a.id&&m.is_main);
  const names=activeEntries(state.taxonomy,"medium").filter(t=>t.id===main?.medium_id).map(t=>label(t,lang));
  const specialties=activeEntries(state.taxonomy,"specialty").filter(t=>state.artist_specialties.some(s=>s.artist_id===a.id&&s.specialty_id===t.id)).slice(0,2).map(t=>label(t,lang));
  const first = a.firstPiece;
  return (
    <Link to="/a/$handle" params={{ handle: a.handle }} className={`room-${a.room} block rounded-2xl bg-room p-5 text-room-fg`}>
      <div className="mx-auto w-3/5">{first ? <Art ratio={first.ratio} tone={first.tone} shape={first.shape} src={first.images[0]} /> : <Art ratio={1} tone={a.room} shape={0} src={a.photo ?? undefined} />}</div>
      <h3 className="mt-5 text-2xl">{a.name}</h3>
      <p className="mt-1 text-sm opacity-80">{a.tagline}</p>
      <p className="label mt-4 opacity-70">{[...names,...specialties].join(" · ")}</p>
    </Link>
  );
}

export function ServiceCard({ s }: { s: Service }) {
  const f = useFormat();
  const a = { handle: s.artist, name: s.artistName };
  return (
    <Link to="/a/$handle" params={{ handle: a.handle }} hash="services" className="block rounded-2xl border border-line bg-card p-5">
      <p className="label text-stone">{a.name}</p>
      <h3 className="mt-2 text-xl">{s.title}</h3>
      <p className="mt-1 text-sm text-stone">{s.note}</p>
      <p className="mt-4 font-medium">{f.service(s.price)}</p>
    </Link>
  );
}

export function EventCard({ e }: { e: Event }) {
  const t = useT(); const f = useFormat();
  const a = { name: e.artistName };
  return (
    <Link to="/a/$handle/e/$id" params={{ handle: e.artist, id: e.id }} className="flex gap-4 rounded-2xl border border-line bg-card p-4">
      <div className={`room-${e.tone} flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-room py-2 text-room-fg`}>
        <span className="label">{f.date(e.date, { month: "short" })}</span>
        <span className="font-display text-2xl">{f.date(e.date, { day: "numeric" })}</span>
      </div>
      <div className="min-w-0">
        <p className="label text-stone">{f.eventType(e.type)} · {f.city(e.city)}</p>
        <h3 className="text-lg leading-tight">{e.title}</h3>
        <p className="mt-1 text-sm text-stone">{a.name} · {f.price(e.price)} · {e.spots === 0 ? t.event.full : `${e.spots} ${t.event.spots}`}</p>
      </div>
    </Link>
  );
}
