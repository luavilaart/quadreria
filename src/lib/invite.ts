import type { RoomColor } from "@/data/sample";
import type { ArtistPlan } from "./plan";

/** Backgrounds an invite page can use: the seven walls plus two brand colors. */
export const inviteBackgrounds = ["cream", "blush", "butter", "sage", "sky", "lilac", "ink", "tomato", "sun"] as const;
export type InviteBackground = (typeof inviteBackgrounds)[number];
export type InviteTheme = {
  background: InviteBackground;
  titleStyle: "classic" | "modern";
  layout: "stacked" | "poster";
  effect: "none" | "confetti";
};

const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback);

/**
 * The look of an event's invite page. Free events use the room's wall color and the default layout;
 * Pro artists can choose background, title style, layout and effect (stored in events.invite_theme).
 */
export function inviteTheme(raw: unknown, tone: RoomColor, plan: ArtistPlan): InviteTheme {
  const base: InviteTheme = { background: tone, titleStyle: "classic", layout: "stacked", effect: "none" };
  if (plan !== "pro" || !raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  return {
    background: pick(r["background"], inviteBackgrounds, tone),
    titleStyle: pick(r["titleStyle"], ["classic", "modern"] as const, "classic"),
    layout: pick(r["layout"], ["stacked", "poster"] as const, "stacked"),
    effect: pick(r["effect"], ["none", "confetti"] as const, "none"),
  };
}

/** Background and text colors for a theme, using the site's CSS variables. */
export function themeColors(bg: InviteBackground): { background: string; color: string } {
  if (bg === "tomato") return { background: "var(--tomato)", color: "var(--ink)" };
  if (bg === "sun") return { background: "var(--sun)", color: "var(--ink)" };
  return { background: `var(--room-${bg})`, color: bg === "ink" ? "var(--wall)" : "var(--ink)" };
}

/** A random id kept in the browser so page views count visitors without storing anything personal. */
export function visitorId(): string | null {
  try {
    const key = "q-visitor";
    let id = localStorage.getItem(key);
    if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
      id = crypto.randomUUID().replace(/-/g, "");
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return null;
  }
}

type CalEvent = { id: string; title: string; date: string; end_date?: string | null; start_time: string; end_time: string; venue_name?: string; address: string; city: string; blurb: string };
const stamp = (date: string, time: string) => `${date.replace(/-/g, "")}T${time.slice(0, 5).replace(":", "")}00`;
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** An .ics calendar file for the event, in the event's local time (floating time). */
export function icsFor(e: CalEvent, url: string): string {
  const where = [e.venue_name, e.address, e.city].filter(Boolean).join(", ");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//quadreria//invite//EN", "BEGIN:VEVENT",
    `UID:${e.id}@quadreria.art`,
    `DTSTART:${stamp(e.date, e.start_time)}`,
    `DTEND:${stamp(e.end_date || e.date, e.end_time)}`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(where)}`,
    `DESCRIPTION:${esc(`${e.blurb}\n\n${url}`)}`,
    `URL:${url}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

export const inviteUrl = (origin: string, id: string) => `${origin}/invite/${encodeURIComponent(id)}`;
