import {zodValidator,fallback} from '@tanstack/zod-adapter';
import {z} from 'zod';
import { isForSale, type TaxonomyEntry } from "./taxonomy";

/**
 * Shop and Discover rules from the taxonomy spec (section 8), as pure helpers so a
 * future server query can reuse them.
 * - Filters: Medium → Specialty and City only.
 * - Sort: recommended, popular, new, rated, price-asc, price-desc.
 * - State lives in the URL; medium and specialty use their English slugs there.
 */
export const browseSearchValidator=zodValidator(z.object({medium:fallback(z.string(),'').optional(),specialty:fallback(z.string(),'').optional(),city:fallback(z.string(),'').optional(),sort:fallback(z.string(),'recommended').optional(),tab:fallback(z.string(),'art').optional()}));
export const browseTabs = ["art", "artists", "services", "events"] as const;
export type BrowseTab = (typeof browseTabs)[number];
export const sortKeys = ["recommended", "popular", "new", "rated", "price-asc", "price-desc"] as const;
export type SortKey = (typeof sortKeys)[number];

export type BrowseSearch = {
  tab?: BrowseTab;
  medium?: string;
  specialty?: string;
  city?: string;
  sort?: SortKey;
};

const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** Reads URL search params. Unknown values are dropped; defaults are left out so URLs stay short. */
export function parseBrowseSearch(s: Record<string, unknown>): BrowseSearch {
  const out: BrowseSearch = {};
  const tab = pick(typeof s["tab"] === "string" ? s["tab"].toLowerCase() : undefined, browseTabs);
  if (tab && tab !== "art") out.tab = tab;
  const medium = text(s["medium"]);
  if (medium) out.medium = medium;
  const specialty = text(s["specialty"]);
  if (specialty) out.specialty = specialty;
  const city = text(s["city"]);
  if (city) out.city = city;
  const sort = pick(s["sort"], sortKeys);
  if (sort && sort !== "recommended") out.sort = sort;
  return out;
}

/** Search params for /mediums/... pages, where medium and specialty come from the path. */
export function pathSearch(s: Record<string, unknown>): Omit<BrowseSearch, "medium" | "specialty"> {
  const { medium: _m, specialty: _s, ...rest } = parseBrowseSearch(s);
  return rest;
}

/** Finds a medium by id, English slug, Spanish slug or English label (old links used labels). */
export function findMedium(rows: TaxonomyEntry[], key: string | undefined) {
  if (!key) return undefined;
  return rows.find(
    (t) => t.kind === "medium" && t.status === "active" && (t.id === key || t.slug === key || t.slug_es === key || t.label_en === key),
  );
}

export function findSpecialty(rows: TaxonomyEntry[], mediumId: string | undefined, key: string | undefined) {
  if (!key || !mediumId) return undefined;
  return rows.find(
    (t) => t.kind === "specialty" && t.parent_id === mediumId && t.status === "active" && (t.id === key || t.slug === key || t.slug_es === key),
  );
}

export type RankablePiece = {
  id: string;
  artist: string;
  medium_id: string;
  format_id: string;
  status?: string;
  price: number;
  created_at: string;
  favorites: number;
  /** Average review rating of the artist; null until reviews exist. */
  rating?: number | null;
};

export type RankContext = {
  /** Medium ids the signed-in person picked in the quiz. */
  interests?: readonly string[];
  /** Artist handles the signed-in person follows. */
  followed?: readonly string[];
};

const newest = (a: RankablePiece, b: RankablePiece) => b.created_at.localeCompare(a.created_at);
const mostFavorited = (a: RankablePiece, b: RankablePiece) => b.favorites - a.favorites || newest(a, b);

/** Popularity and recency blended into one 0–2 score, used by Recommended. */
function blendScores<T extends RankablePiece>(list: T[]) {
  const maxFav = Math.max(1, ...list.map((p) => p.favorites));
  const byAge = [...list].sort(newest);
  const recency = new Map(byAge.map((p, i) => [p.id, list.length > 1 ? 1 - i / (list.length - 1) : 1]));
  return new Map(list.map((p) => [p.id, p.favorites / maxFav + (recency.get(p.id) ?? 0)]));
}

/**
 * Orders pieces for a shop grid. Price sorts drop pieces that are not for sale
 * (showcase only, digital download for now, sold, hidden).
 */
export function sortPieces<T extends RankablePiece>(list: readonly T[], sort: SortKey, ctx: RankContext = {}): T[] {
  const rows = [...list];
  switch (sort) {
    case "popular":
      return rows.sort(mostFavorited);
    case "new":
      return rows.sort(newest);
    case "rated":
      return rows.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || mostFavorited(a, b));
    case "price-asc":
      return rows.filter(isForSale).sort((a, b) => a.price - b.price || newest(a, b));
    case "price-desc":
      return rows.filter(isForSale).sort((a, b) => b.price - a.price || newest(a, b));
    case "recommended": {
      const blend = blendScores(rows);
      const interests = new Set(ctx.interests ?? []);
      const followed = new Set(ctx.followed ?? []);
      // Matches come first (followed artists weigh more than quiz interests), then the blend.
      const match = (p: T) => (followed.has(p.artist) ? 2 : 0) + (interests.has(p.medium_id) ? 1 : 0);
      return rows.sort((a, b) => match(b) - match(a) || (blend.get(b.id) ?? 0) - (blend.get(a.id) ?? 0) || newest(a, b));
    }
  }
}
