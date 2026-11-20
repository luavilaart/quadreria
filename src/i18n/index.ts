import { createIsomorphicFn } from "@tanstack/react-start";
import {
  getCookie,
  getRequestHeader,
  setCookie,
} from "@tanstack/react-start/server";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { en, type Copy } from "./en";
import { es } from "./es";

export type { Copy } from "./en";
export type Lang = "es" | "en";
export const langs: readonly Lang[] = ["es", "en"];
/** Launch market is Honduras, so Spanish is the fallback when nothing else tells us. */
export const defaultLang: Lang = "es";
export const LANG_COOKIE = "q-lang";
const copies: Record<Lang, Copy> = { es, en };
const locales: Record<Lang, string> = { es: "es-HN", en: "en-US" };
const ONE_YEAR = 60 * 60 * 24 * 365;

export const isLang = (v: unknown): v is Lang => v === "es" || v === "en";
export const copyFor = (lang: Lang): Copy => copies[lang];

/** Picks the first supported language from an Accept-Language header or navigator.languages. */
export function pickLang(preferred: readonly string[]): Lang | undefined {
  for (const tag of preferred) {
    const base = tag.trim().split(";")[0]?.split("-")[0]?.toLowerCase();
    if (isLang(base)) return base;
  }
  return undefined;
}

function cookieFromDocument(): string | undefined {
  const hit = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${LANG_COOKIE}=`));
  return hit?.slice(LANG_COOKIE.length + 1);
}

/**
 * Order: saved choice (cookie), then the browser's languages, then Spanish.
 * The server also writes the cookie so the client hydrates with the same language.
 */
export const detectLang = createIsomorphicFn()
  .server((): Lang => {
    const saved = getCookie(LANG_COOKIE);
    if (isLang(saved)) return saved;
    const header = getRequestHeader("accept-language");
    const lang = header ? (pickLang(header.split(",")) ?? "en") : defaultLang;
    setCookie(LANG_COOKIE, lang, {
      path: "/",
      maxAge: ONE_YEAR,
      sameSite: "lax",
    });
    return lang;
  })
  .client((): Lang => {
    const saved = cookieFromDocument();
    if (isLang(saved)) return saved;
    return pickLang(navigator.languages ?? [navigator.language]) ?? defaultLang;
  });

/** Reads the language the root route put in router context. Works in head() via match.context. */
export const langOf = (context: unknown): Lang => {
  const lang = (context as { lang?: unknown } | undefined)?.lang;
  return isLang(lang) ? lang : defaultLang;
};

export function useLang(): Lang {
  return useRouterState({ select: (s) => langOf(s.matches[0]?.context) });
}

export function useT(): Copy {
  return copies[useLang()];
}

/** Saves the choice, then re-runs route loading so every page and <head> switch language. */
export function useSetLang() {
  const router = useRouter();
  return async (lang: Lang) => {
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    document.documentElement.lang = lang;
    await router.invalidate();
  };
}

/** Locale-aware labels and formatting for stored values (taxonomy, dates, prices). */
export function formatters(lang: Lang) {
  const t = copies[lang];
  const locale = locales[lang];
  const money = (n: number) => `$${n.toLocaleString(locale)}`;
  return {
    locale,
    price: (n: number) => (n === 0 ? t.event.free : money(n)),
    service: (s: { price: number; price_type: string }) =>
      s.price_type === "consult"
        ? t.service.consult(money(s.price))
        : s.price_type === "hourly"
          ? t.service.hourly(money(s.price))
          : money(s.price),
    date: (
      d: string,
      opts: Intl.DateTimeFormatOptions = {
        weekday: "short",
        month: "short",
        day: "numeric",
      },
    ) => new Date(d + "T12:00:00").toLocaleDateString(locale, opts),
    medium: (m: string) => t.mediums[m] ?? m,
    city: (c: string) => t.cities[c] ?? c,
    eventType: (e: string) => t.eventTypes[e] ?? e,
  };
}

export function useFormat() {
  return formatters(useLang());
}
