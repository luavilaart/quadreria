import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { galleryQuery, cities } from "@/lib/gallery";
import { activeEntries, label, type TaxonomyEntry } from "@/data/taxonomy";
import {
  browseTabs,
  findMedium,
  findSpecialty,
  parseBrowseSearch,
  sortKeys,
  sortPieces,
  type BrowseSearch,
  type SortKey,
} from "@/data/discovery";
import { taxonomyCopy, type Language } from "@/i18n/taxonomy";
import { formatters } from "@/i18n";
import { socialQuery } from "@/lib/social";
import { useTaxonomy } from "./TaxonomyProvider";
import { useAccount } from "./AccountProvider";
import { QButton } from "./QButton";
import { PieceCard, RoomCard, ServiceCard, EventCard } from "./Cards";

type Fixed = { medium: TaxonomyEntry; specialty?: TaxonomyEntry | undefined; lang: Language };

/**
 * Discover and medium pages. Filters are Medium → Specialty and City only, plus Sort by
 * on the Art tab (taxonomy spec, section 8). Everything lives in the URL so a view can be shared.
 * On /mediums/... and /es/medios/... pages the medium and specialty come from the path;
 * changing them moves to the matching page.
 */
export function TaxonomyBrowse({ fixed }: { fixed?: Fixed }) {
  const { state, lang: globalLang } = useTaxonomy();
  const lang = fixed?.lang ?? globalLang;
  const c = taxonomyCopy[lang];
  const f = formatters(lang);
  const { data } = useSuspenseQuery(galleryQuery);
  const navigate = useNavigate();
  const search = parseBrowseSearch(useSearch({ strict: false }) as Record<string, unknown>);
  const rows = state.taxonomy;

  const tab = search.tab ?? "art";
  const sort: SortKey = search.sort ?? "recommended";
  const medium = fixed ? fixed.medium : findMedium(rows, search.medium);
  const specialty = fixed ? fixed.specialty : findSpecialty(rows, medium?.id, search.specialty);
  const city = search.city && cities.includes(search.city) ? search.city : "";

  // Recommended puts the signed-in person's quiz mediums and followed artists first.
  const { user, profile } = useAccount();
  const social = useQuery({ ...socialQuery(user?.id ?? ""), enabled: !!user });
  const interests = profile?.interest_medium_ids.length ? profile.interest_medium_ids : (profile?.mediums ?? [])
    .map((m) => rows.find((t) => t.kind === "medium" && (t.label_en === m || t.label_es === m))?.id)
    .filter((id): id is string => !!id);

  function set(patch: BrowseSearch) {
    const next: BrowseSearch = { ...search, ...patch };
    if ("medium" in patch) delete next.specialty;
    for (const k of Object.keys(next) as (keyof BrowseSearch)[]) if (!next[k]) delete next[k];
    if (next.tab === "art") delete next.tab;
    if (next.sort === "recommended") delete next.sort;
    if (!fixed || !("medium" in patch || "specialty" in patch)) {
      void navigate({ to: ".", search: next, replace: true, resetScroll: false });
      return;
    }
    const { medium: mKey, specialty: sKey, ...rest } = next;
    const m = findMedium(rows, mKey ?? fixed.medium.slug);
    const s = findSpecialty(rows, m?.id, "medium" in patch ? undefined : sKey);
    if (!m) void navigate({ to: "/discover", search: rest });
    else if (fixed.lang === "es")
      void (s
        ? navigate({ to: "/es/medios/$medium/$specialty", params: { medium: m.slug_es, specialty: s.slug_es }, search: rest })
        : navigate({ to: "/es/medios/$medium", params: { medium: m.slug_es }, search: rest }));
    else
      void (s
        ? navigate({ to: "/mediums/$medium/$specialty", params: { medium: m.slug, specialty: s.slug }, search: rest })
        : navigate({ to: "/mediums/$medium", params: { medium: m.slug }, search: rest }));
  }

  const artistCity = (handle: string) => data.artists.find((a) => a.handle === handle)?.city ?? "";
  const artistMatches = (id: string) =>
    (!medium || state.artist_mediums.some((m) => m.artist_id === id && m.medium_id === medium.id)) &&
    (!specialty || state.artist_specialties.some((s) => s.artist_id === id && s.specialty_id === specialty.id));

  const pieces = sortPieces(
    data.pieces.filter(
      (p) =>
        p.review_status === "approved" &&
        (!medium || p.medium_id === medium.id) &&
        (!specialty || state.piece_specialties.some((s) => s.piece_id === p.id && s.specialty_id === specialty.id)) &&
        (!city || p.city === city),
    ),
    sort,
    { interests, followed: social.data?.artists ?? [] },
  );
  const artists = data.artists.filter((a) => artistMatches(a.id) && (!city || a.city === city));
  const services = data.services.filter(
    (s) =>
      (!medium || s.medium_id === medium.id) &&
      (!specialty || s.specialty_ids.includes(specialty.id)) &&
      (!city || artistCity(s.artist) === city),
  );
  const events = data.events.filter((e) => artistMatches(data.artists.find(a=>a.handle===e.artist)?.id??e.artist) && (!city || e.city === city));

  const selector = (name: string, value: string, onChange: (v: string) => void, options: { id: string; label: string }[], all = true) => (
    <label className="min-w-0 text-sm">
      {name}
      <select aria-label={name} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3">
        {all && <option value="">{c.all}</option>}
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
  const mediumOptions = activeEntries(rows, "medium").map((t) => ({ id: t.slug, label: label(t, lang) }));
  const specialtyOptions = medium ? activeEntries(rows, "specialty", medium.id).map((t) => ({ id: t.slug, label: label(t, lang) })) : [];
  const sortLabels: Record<SortKey, string> = {
    recommended: c.sortRecommended, popular: c.sortPopular, new: c.sortNew, rated: c.sortRated, "price-asc": c.sortPriceAsc, "price-desc": c.sortPriceDesc,
  };
  const empty = <p className="text-stone">{c.empty}</p>;

  return (
    <>
      <div className="mt-6 flex rounded-full border border-line bg-card p-1" role="tablist">
        {browseTabs.map((x) => (
          <QButton key={x} role="tab" aria-selected={tab === x} onClick={() => set({ tab: x })} className={`flex-1 !px-1 !py-2 text-sm ${tab === x ? "bg-ink text-wall" : ""}`}>
            {c[x]}
          </QButton>
        ))}
      </div>
      <div className={`mt-6 grid grid-cols-2 gap-3 ${tab === "art" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {selector(c.mediums, medium?.slug ?? "", (v) => set({ medium: v }), mediumOptions)}
        
        {selector(c.city, city, (v) => set({ city: v }), cities.map((x) => ({ id: x, label: f.city(x) })))}
        {tab === "art" && selector(c.sortBy, sort, (v) => set({ sort: v as SortKey }), sortKeys.map((k) => ({ id: k, label: sortLabels[k] })), false)}
      </div>
      {medium&&<div className="mt-4 flex flex-wrap gap-2" aria-label={c.specialties}>{[{id:'',label:c.all},...specialtyOptions].map(o=><QButton key={o.id} className={`chip ${specialty?.slug===o.id||!specialty&&o.id===''?'chip-on':''}`} aria-pressed={specialty?.slug===o.id||!specialty&&o.id===''} onClick={()=>set({specialty:o.id})}>{o.label}</QButton>)}</div>}
      <div className="mt-8">
        {tab === "art" && (pieces.length ? <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-4">{pieces.map((p) => <PieceCard key={p.id} p={p} />)}</div> : empty)}
        {tab === "artists" && (artists.length ? <div className="grid gap-4 sm:grid-cols-3">{artists.map((a) => <RoomCard key={a.id} a={a} language={lang} />)}</div> : empty)}
        {tab === "services" && (services.length ? <div className="grid gap-3 sm:grid-cols-2">{services.map((s) => <ServiceCard key={s.id} s={s} />)}</div> : empty)}
        {tab === "events" && (events.length ? <div className="grid gap-3 sm:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div> : empty)}
      </div>
    </>
  );
}
