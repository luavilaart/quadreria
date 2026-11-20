import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { es } from "@/i18n/es";
import { formatters, pickLang } from "@/i18n";

type Tree = Record<string, unknown>;
const shape = (v: unknown): unknown =>
  typeof v === "function"
    ? "fn"
    : Array.isArray(v)
      ? v.map(shape)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v as Tree)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, x]) => [k, shape(x)]),
          )
        : typeof v;

const strings = (v: unknown): string[] =>
  typeof v === "string"
    ? [v]
    : typeof v === "function"
      ? [String((v as (...a: unknown[]) => unknown)("X", 1, 2))]
      : Array.isArray(v)
        ? v.flatMap(strings)
        : v && typeof v === "object"
          ? Object.values(v as Tree).flatMap(strings)
          : [];

describe("i18n copy", () => {
  it("Spanish has exactly the same keys, list lengths and helper functions as English", () => {
    expect(shape(es)).toEqual(shape(en));
  });

  it("Spanish never leaves a string empty", () => {
    expect(strings(es).filter((s) => s.trim() === "")).toEqual([]);
  });

  it("Spanish uses vos, not tú", () => {
    // Letter-aware boundaries: \b ignores accented letters such as the Ú in Únete.
    const tu =
      /(?<!\p{L})(tú|ti|tienes|puedes|quieres|eres|buscas|haces|llamas|Elige|Agrega|Toca|Cuéntale|Revisa|Entra|Crea|Intenta|Prueba|Vuelve|Conoce|Recorre|Compra|Apoya|Sigue|Recibe|Explora|Contrata|Reserva|Saluda|Abre|Únete|Consigue|Descubre)(?!\p{L})/u;
    expect(strings(es).filter((s) => tu.test(s))).toEqual([]);
  });

  it("covers every medium, event type and city the app offers", async () => {
    const { mediums, cities, eventTypes } = await import("@/data/sample");
    for (const m of mediums) expect(es.mediums[m], m).toBeTruthy();
    for (const c of cities) expect(es.cities[c], c).toBeTruthy();
    for (const e of eventTypes) expect(es.eventTypes[e], e).toBeTruthy();
  });
});

describe("language detection", () => {
  it("picks the first supported language from browser preferences", () => {
    expect(pickLang("es-HN,es;q=0.9,en;q=0.8".split(","))).toBe("es");
    expect(pickLang(["fr-FR", "en-US"])).toBe("en");
    expect(pickLang(["EN-gb"])).toBe("en");
    expect(pickLang(["fr", "de"])).toBeUndefined();
  });
});

describe("formatters", () => {
  it("translates stored values and formats prices per language", () => {
    const f = formatters("es");
    expect(f.medium("Textiles & crochet")).toBe("Textiles y crochet");
    expect(f.city("Online")).toBe("En línea");
    expect(f.eventType("Opening")).toBe("Inauguración");
    expect(f.price(0)).toBe("Gratis");
    expect(f.service({ price: 20, price_type: "consult" })).toBe(
      "Reservá una consulta de $20",
    );
    expect(f.medium("Unknown medium")).toBe("Unknown medium");
    expect(formatters("en").service({ price: 25, price_type: "hourly" })).toBe(
      "$25 / hour",
    );
    expect(formatters("en").price(1560)).toBe("$1,560");
  });
});
