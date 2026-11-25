import type { QueryClient } from "@tanstack/react-query";
import type { RoomColor } from "@/data/sample";

/** Room sections in the order they appear. Entrance is not a section; About can't be hidden. */
export const roomSections = ["work", "media", "shop", "services", "events", "about", "links", "faq", "contact", "reviews"] as const;
export type RoomSection = (typeof roomSections)[number];
export const lockedSections: readonly RoomSection[] = ["about"];
/** Sections that exist as toggles but don't render in rooms yet. */
export const comingSoonSections: readonly RoomSection[] = ["reviews"];

/** Full section order for a room, adding any section saved before it existed (media after work, the rest at the end). */
export function normalizeOrder(order: readonly string[]): RoomSection[] {
  const known = order.filter((s): s is RoomSection => (roomSections as readonly string[]).includes(s));
  const out = [...new Set(known)];
  for (const s of roomSections) {
    if (out.includes(s)) continue;
    if (s === "media" && out.includes("work")) out.splice(out.indexOf("work") + 1, 0, s);
    else out.push(s);
  }
  return out;
}

/** Turns one section on or off, never hiding a locked one. Keeps the list in room order. */
export function toggleSection(visible: readonly string[], section: RoomSection, on: boolean, order: readonly string[]): string[] {
  const next = new Set(visible);
  if (on || lockedSections.includes(section)) next.add(section);
  else next.delete(section);
  for (const locked of lockedSections) next.add(locked);
  return normalizeOrder(order).filter((s) => next.has(s));
}

/** Rooms saved before "Listen & watch" existed show it by default. */
export function isSectionVisible(visible: readonly string[], order: readonly string[], section: RoomSection): boolean {
  if (lockedSections.includes(section)) return true;
  if (section === "media" && !order.includes("media")) return true;
  return visible.includes(section);
}

export type FaqItem = { q: string; a: string };
export function asFaq(raw: unknown): FaqItem[] {
  return Array.isArray(raw)
    ? raw.flatMap((r) => (r && typeof r === "object" && typeof (r as FaqItem).q === "string" ? [{ q: (r as FaqItem).q, a: String((r as FaqItem).a ?? "") }] : []))
    : [];
}
/** Drops empty questions and trims; a question needs text, an answer may be blank while drafting. */
export const cleanFaq = (items: FaqItem[]): FaqItem[] => items.map((f) => ({ q: f.q.trim(), a: f.a.trim() })).filter((f) => f.q);

export const move = <T,>(list: readonly T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
};

const colors: RoomColor[] = ["cream", "blush", "butter", "sage", "sky", "lilac", "ink"];
export const asRoomColor = (v: unknown): RoomColor => (colors.includes(v as RoomColor) ? (v as RoomColor) : "cream");

/** Tags: trimmed, lower case, no duplicates, at most 20 of up to 30 characters. */
export function addTag(tags: readonly string[], raw: string): string[] {
  const tag = raw.trim().replace(/^#/, "").replace(/\s+/g, " ").toLowerCase().slice(0, 30);
  if (!tag || tags.includes(tag) || tags.length >= 20) return [...tags];
  return [...tags, tag];
}

/** Width ÷ height of an image file, so artwork shows at its true shape. Falls back to 1. */
export function imageRatio(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve(1); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

/** After a Studio save: refresh the Studio, the live preview and public pages. */
export async function refreshStudio(qc: QueryClient) {
  await Promise.all([
    qc.invalidateQueries({ queryKey: ["studio"] }),
    qc.invalidateQueries({ queryKey: ["gallery"] }),
  ]);
}

export const FREE_PIECE_LIMIT = 12;

/** Events split for the Studio list. Dates are ISO yyyy-mm-dd; "today" is the viewer's date. */
export function groupEvents<T extends { date: string; status: string; end_date?: string | null }>(events: T[], today = new Date().toISOString().slice(0, 10)) {
  const drafts = events.filter((e) => e.status === "draft");
  const rest = events.filter((e) => e.status !== "draft");
  const lastDay = (e: T) => e.end_date || e.date;
  return {
    drafts,
    upcoming: rest.filter((e) => lastDay(e) >= today).sort((a, b) => a.date.localeCompare(b.date)),
    past: rest.filter((e) => lastDay(e) < today).sort((a, b) => b.date.localeCompare(a.date)),
  };
}
