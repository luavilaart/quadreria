import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { es } from "@/i18n/es";
import { taxonomyCopy, taxonomyIntro } from "@/i18n/taxonomy";
import { formatters } from "@/i18n";

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

// Letter-aware boundaries: \b ignores accented letters such as the Ú in Únete.
const tu =
  /(?<!\p{L})(tú|ti|tienes|puedes|quieres|eres|buscas|haces|llamas|Elige|Agrega|Toca|Cuéntale|Revisa|Entra|Crea|Intenta|Prueba|Vuelve|Conoce|conoce|Recorre|Compra|Apoya|Sigue|Recibe|Explora|Contrata|Reserva|Saluda|Abre|Únete|Consigue|Descubre|Clasifica|Completa|Usa)(?!\p{L})/u;

describe("i18n copy", () => {
  it("Spanish has exactly the same keys, list lengths and helper functions as English", () => {
    expect(shape(es)).toEqual(shape(en));
  });

  it("Spanish never leaves a string empty", () => {
    expect(strings(es).filter((s) => s.trim() === "")).toEqual([]);
  });

  it("all Spanish copy uses vos, not tú (ours and the taxonomy copy)", () => {
    const all = [...strings(es), ...strings(taxonomyCopy.es), taxonomyIntro("Painting", "Pintura").intro_es];
    expect(all.filter((s) => tu.test(s))).toEqual([]);
  });

  it("covers every city and event type the app offers", async () => {
    const { cities, eventTypes } = await import("@/data/sample");
    for (const c of cities) expect(es.cities[c], c).toBeTruthy();
    for (const e of eventTypes) expect(es.eventTypes[e], e).toBeTruthy();
  });
});

describe("formatters", () => {
  it("translates stored values and formats prices per language", () => {
    const f = formatters("es");
    expect(f.city("Online")).toBe("En línea");
    expect(f.eventType("Opening")).toBe("Inauguración");
    expect(f.price(0)).toBe("Gratis");
    expect(f.service("Book a $20 consult")).toBe("Reservá una consulta de $20");
    expect(f.service("$25 / hour")).toBe("$25 / hora");
    expect(f.service("$350")).toBe("$350");
    expect(f.medium("Unknown medium")).toBe("Unknown medium");
    expect(formatters("en").service("Book a $20 consult")).toBe("Book a $20 consult");
    expect(formatters("en").price(1560)).toBe("$1,560");
  });
});
