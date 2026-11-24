import { describe, expect, it } from "vitest";
import { findMedium, findSpecialty, parseBrowseSearch, pathSearch, sortPieces, type RankablePiece } from "@/data/discovery";
import { defaultSettings, taxonomy, validatePiece, type PieceMedia } from "@/data/taxonomy";
import { sampleGallery } from "@/data/sample-gallery";

const piece = (id: string, over: Partial<RankablePiece> = {}): RankablePiece => ({
  id, artist: "mara", medium_id: "medium:painting", format_id: "format:original", status: "available",
  price: 100, created_at: "2026-10-01T00:00:00.000Z", favorites: 0, ...over,
});

describe("browse URL", () => {
  it("keeps known values, drops defaults and junk", () => {
    expect(parseBrowseSearch({ tab: "Artists", medium: "painting", sort: "new", city: "Tegucigalpa", extra: 1 }))
      .toEqual({ tab: "artists", medium: "painting", sort: "new", city: "Tegucigalpa" });
    expect(parseBrowseSearch({ tab: "art", sort: "recommended" })).toEqual({});
    expect(parseBrowseSearch({ tab: "nope", sort: "cheapest", medium: "  " })).toEqual({});
    expect(pathSearch({ medium: "painting", specialty: "oil", sort: "popular" })).toEqual({ sort: "popular" });
  });

  it("finds mediums by slug, Spanish slug, id or old English label, and specialties under them", () => {
    for (const key of ["photography", "fotografia", "medium:photography", "Photography"]) expect(findMedium(taxonomy, key)?.id).toBe("medium:photography");
    expect(findSpecialty(taxonomy, "medium:photography", "events-weddings")?.label_es).toBe("Eventos y bodas");
    expect(findSpecialty(taxonomy, "medium:painting", "events-weddings")).toBeUndefined();
  });
});

describe("sorting", () => {
  const list = [
    piece("a", { favorites: 5, created_at: "2026-10-03T00:00:00.000Z", price: 300 }),
    piece("b", { favorites: 50, created_at: "2026-10-01T00:00:00.000Z", price: 40 }),
    piece("c", { favorites: 10, created_at: "2026-10-09T00:00:00.000Z", price: 0, format_id: "format:showcase-only", artist: "nora", medium_id: "medium:music-sound" }),
    piece("d", { favorites: 1, created_at: "2026-10-05T00:00:00.000Z", price: 80, status: "sold" }),
  ];
  const ids = (xs: RankablePiece[]) => xs.map((x) => x.id);

  it("ranks by favorites, date and price", () => {
    expect(ids(sortPieces(list, "popular"))).toEqual(["b", "c", "a", "d"]);
    expect(ids(sortPieces(list, "new"))).toEqual(["c", "d", "a", "b"]);
  });

  it("leaves showcase-only and sold pieces out of price sorts", () => {
    expect(ids(sortPieces(list, "price-asc"))).toEqual(["b", "a"]);
    expect(ids(sortPieces(list, "price-desc"))).toEqual(["a", "b"]);
  });

  it("falls back to favorites for top rated until reviews exist", () => {
    expect(ids(sortPieces(list, "rated"))).toEqual(ids(sortPieces(list, "popular")));
    expect(ids(sortPieces([...list, piece("e", { rating: 4.8 })], "rated"))[0]).toBe("e");
  });

  it("puts followed artists, then quiz interests, first for Recommended", () => {
    expect(ids(sortPieces(list, "recommended", { followed: ["nora"] }))[0]).toBe("c");
    const byInterest = sortPieces(list, "recommended", { interests: ["medium:music-sound"] });
    expect(byInterest[0]?.id).toBe("c");
    expect(sortPieces(list, "recommended")).toHaveLength(4);
  });

  it("gives every sample piece a date and a favorites count", () => {
    for (const p of sampleGallery.pieces) {
      expect(Number.isNaN(Date.parse(p.created_at)), p.id).toBe(false);
      expect(p.favorites, p.id).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("plan limits", () => {
  const video = (size_mb: number): PieceMedia => ({ id: "m", piece_id: "p", kind: "video", url: "", provider: "upload", poster_url: null, duration_s: 30, size_mb });

  it("caps Free at 12 pieces and leaves Pro unlimited", () => {
    expect(validatePiece(12, [], "free", defaultSettings)).toBe("pieceError");
    expect(validatePiece(500, [], "pro", defaultSettings)).toBeNull();
  });

  it("rejects uploads over the plan's size limit", () => {
    expect(validatePiece(0, [video(99)], "free", defaultSettings)).toBeNull();
    expect(validatePiece(0, [video(101)], "free", defaultSettings)).toBe("sizeError");
    expect(validatePiece(0, [{ ...video(30), kind: "audio" }], "free", defaultSettings)).toBe("sizeError");
  });
});
