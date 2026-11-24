import { useTaxonomy } from "@/components/q/TaxonomyProvider";
import type { Language } from "./taxonomy";
import { en, type Copy } from "./en";
import { es } from "./es";

export type { Copy } from "./en";
/** The language is owned by Lovable's TaxonomyProvider (the ES/EN toggle in the header). */
export type Lang = Language;
const copies: Record<Lang, Copy> = { es, en };
const locales: Record<Lang, string> = { es: "es-HN", en: "en-US" };

export const isLang = (v: unknown): v is Lang => v === "es" || v === "en";
export const copyFor = (lang: Lang): Copy => copies[lang];

/**
 * Language for route head() functions, which run outside React.
 * Uses router context `lang` when present; otherwise English, matching the provider's default.
 */
export const langOf = (context: unknown): Lang => {
  const lang = (context as { lang?: unknown } | undefined)?.lang;
  return isLang(lang) ? lang : "en";
};

export function useLang(): Lang {
  return useTaxonomy().lang;
}

export function useT(): Copy {
  return copies[useLang()];
}

/** Locale-aware labels and formatting for stored values (cities, event types, dates, prices). */
export function formatters(lang: Lang) {
  const t = copies[lang];
  const locale = locales[lang];
  const money = (n: number) => `$${n.toLocaleString(locale)}`;
  return {
    locale,
    price: (n: number) => (n === 0 ? t.event.free : money(n)),
    /**
     * Sample services store their price as English text ("Book a $20 consult", "$25 / hour").
     * Translate those two shapes until services carry a price type from the database.
     */
    service: (price: string | number) => {
      if (typeof price === "number") return money(price);
      const consult = /^Book a (\$[\d.,]+) consult$/.exec(price);
      if (consult?.[1]) return t.service.consult(consult[1]);
      const hourly = /^(\$[\d.,]+) \/ hour$/.exec(price);
      if (hourly?.[1]) return t.service.hourly(hourly[1]);
      return price;
    },
    date: (
      d: string,
      opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" },
    ) => new Date(d + "T12:00:00").toLocaleDateString(locale, opts),
    medium: (m: string) => t.mediums[m] ?? m,
    city: (c: string) => t.cities[c] ?? c,
    eventType: (e: string) => t.eventTypes[e] ?? e,
  };
}

export function useFormat() {
  return formatters(useLang());
}
