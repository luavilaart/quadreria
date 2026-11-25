import { describe, expect, it } from "vitest";
import { addTag, asFaq, cleanFaq, groupEvents, isSectionVisible, move, normalizeOrder, toggleSection } from "@/lib/artist-studio";
import { icsFor, inviteTheme } from "@/lib/invite";
import { studioCopy } from "@/i18n/studio";

type Tree = Record<string, unknown>;
const shape = (v: unknown): unknown =>
  typeof v === "function" ? "fn" : Array.isArray(v) ? v.length : v && typeof v === "object"
    ? Object.fromEntries(Object.entries(v as Tree).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, shape(x)])) : typeof v;
const strings = (v: unknown): string[] =>
  typeof v === "string" ? [v] : typeof v === "function" ? [String((v as (...a: unknown[]) => unknown)("X", 1, 2))]
    : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v as Tree).flatMap(strings) : [];

describe("room sections", () => {
  const legacy = ["work", "shop", "services", "events", "about", "links", "faq", "contact"];

  it("adds sections a room saved before they existed, Listen & watch right after the work wall", () => {
    expect(normalizeOrder(legacy)).toEqual(["work", "media", "shop", "services", "events", "about", "links", "faq", "contact", "reviews"]);
  });

  it("never hides About", () => {
    const next = toggleSection(legacy, "about", false, legacy);
    expect(next).toContain("about");
    expect(toggleSection([], "shop", true, legacy)).toEqual(["shop", "about"]);
  });

  it("hides and shows a section, keeping room order", () => {
    expect(toggleSection(legacy, "shop", false, legacy)).not.toContain("shop");
    expect(toggleSection(["faq", "about"], "work", true, legacy)).toEqual(["work", "about", "faq"]);
  });

  it("shows Listen & watch by default on older rooms", () => {
    expect(isSectionVisible(legacy, legacy, "media")).toBe(true);
    expect(isSectionVisible(["work"], [...legacy, "media"], "media")).toBe(false);
    expect(isSectionVisible([], legacy, "about")).toBe(true);
  });
});

describe("FAQ, tags and lists", () => {
  it("reads only well-formed FAQ items and drops empty questions", () => {
    expect(asFaq([{ q: "Q", a: "A" }, { nope: 1 }, "x", { q: "Only" }])).toEqual([{ q: "Q", a: "A" }, { q: "Only", a: "" }]);
    expect(cleanFaq([{ q: "  Hi ", a: " there " }, { q: " ", a: "x" }])).toEqual([{ q: "Hi", a: "there" }]);
  });

  it("normalizes tags and skips duplicates", () => {
    expect(addTag(["oil"], " #Acrylic ")).toEqual(["oil", "acrylic"]);
    expect(addTag(["oil"], "OIL")).toEqual(["oil"]);
    expect(addTag([], "   ")).toEqual([]);
  });

  it("moves items and ignores moves off the ends", () => {
    expect(move(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(move(["a", "b"], 0, -1)).toEqual(["a", "b"]);
  });
});

describe("events", () => {
  it("splits drafts, upcoming and past, counting multi-day events as upcoming until they end", () => {
    const g = groupEvents([
      { id: "a", date: "2026-11-20", status: "published", end_date: null },
      { id: "b", date: "2026-11-24", status: "published", end_date: "2026-11-27" },
      { id: "c", date: "2026-12-01", status: "published", end_date: null },
      { id: "d", date: "2026-12-05", status: "draft", end_date: null },
    ], "2026-11-25");
    expect(g.upcoming.map((e) => e.id)).toEqual(["b", "c"]);
    expect(g.past.map((e) => e.id)).toEqual(["a"]);
    expect(g.drafts.map((e) => e.id)).toEqual(["d"]);
  });

  it("only applies a custom invite theme on Pro", () => {
    const custom = { background: "tomato", titleStyle: "modern", layout: "poster", effect: "confetti" };
    expect(inviteTheme(custom, "sage", "free")).toEqual({ background: "sage", titleStyle: "classic", layout: "stacked", effect: "none" });
    expect(inviteTheme(custom, "sage", "pro")).toEqual(custom);
    expect(inviteTheme({ background: "neon", effect: "lasers" }, "sky", "pro")).toEqual({ background: "sky", titleStyle: "classic", layout: "stacked", effect: "none" });
  });

  it("writes a calendar file with escaped text", () => {
    const ics = icsFor({ id: "e1", title: "Draw, paint; talk", date: "2026-12-01", start_time: "17:00:00", end_time: "19:30:00", venue_name: "Casa", address: "Col. Palmira", city: "Tegucigalpa", blurb: "Bring paper" }, "https://quadreria.art/invite/e1");
    expect(ics).toContain("DTSTART:20261201T170000");
    expect(ics).toContain("DTEND:20261201T193000");
    expect(ics).toContain("SUMMARY:Draw\\, paint\\; talk");
  });
});

describe("Studio copy", () => {
  it("Spanish matches English key for key", () => {
    expect(shape(studioCopy.es)).toEqual(shape(studioCopy.en));
  });
  it("Spanish uses vos, not tú", () => {
    const tu = /(?<!\p{L})(tú|tienes|puedes|quieres|eres|Elige|Agrega|Escribe|Empieza|Responde|Prepara|Prende|Revisa|Intenta|Usa|Cambia|Completa|Envía|Pones|Elijes)(?!\p{L})/u;
    expect(strings(studioCopy.es).filter((s) => tu.test(s))).toEqual([]);
  });
});
