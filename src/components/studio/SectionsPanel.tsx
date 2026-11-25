import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { comingSoonSections, isSectionVisible, lockedSections, normalizeOrder, refreshStudio, toggleSection, type RoomSection } from "@/lib/artist-studio";
import type { StudioData } from "@/lib/studio";
import { useStudioCopy } from "@/i18n/studio";
import { cn } from "@/lib/utils";
import { Panel, ProBadge, Toggle } from "./ui";

/** Show or hide each room section. Entrance and About always show. Reordering is Pro (shown locked). */
export function SectionsPanel({ data }: { data: StudioData }) {
  const c = useStudioCopy();
  const qc = useQueryClient();
  const room = data.room;
  const [visible, setVisible] = useState<string[]>(room?.visible_sections ?? []);
  const [savedOrder, setSavedOrder] = useState<string[]>(room?.section_order ?? []);
  const [busy, setBusy] = useState<string | null>(null);
  if (!room) return null;
  const order = normalizeOrder(savedOrder);

  async function flip(section: RoomSection, on: boolean) {
    if (!room) return;
    const before = visible;
    // Start from what shows now (older rooms show "Listen & watch" without having saved it).
    const showing = order.filter((s) => isSectionVisible(visible, savedOrder, s));
    const next = toggleSection(showing, section, on, order);
    setVisible(next);
    setSavedOrder(order);
    setBusy(section);
    const { error } = await supabase.from("rooms").update({ visible_sections: next, section_order: order }).eq("id", room.id);
    setBusy(null);
    if (error) { setVisible(before); setSavedOrder(room.section_order); toast.error(c.error); return; }
    await refreshStudio(qc);
    toast.success(c.saved);
  }

  const row = (section: RoomSection | "entrance") => {
    const locked = section === "entrance" || lockedSections.includes(section as RoomSection);
    const soon = section !== "entrance" && comingSoonSections.includes(section);
    const on = section === "entrance" || isSectionVisible(visible, savedOrder, section);
    const label = section === "entrance" ? c.sections.entrance : c.sections.labels[section];
    const note = section === "entrance" ? c.sections.entranceNote : c.sections.notes[section];
    return (
      <li key={section} className={cn("flex items-center gap-3 rounded-2xl border border-line px-4 py-3", on ? "bg-card" : "bg-wall")}>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight">{label}</p>
          <p className="text-sm text-stone">{note}</p>
        </div>
        {section !== "entrance" && (
          <div className="hidden items-center gap-1 sm:flex" title={c.pro.reorder}>
            <button type="button" disabled aria-label={`${c.moveUp}: ${label}`} className="rounded-full p-2 text-stone/50"><ArrowUp aria-hidden className="size-4" /></button>
            <button type="button" disabled aria-label={`${c.moveDown}: ${label}`} className="rounded-full p-2 text-stone/50"><ArrowDown aria-hidden className="size-4" /></button>
          </div>
        )}
        {locked ? (
          <span className="label inline-flex shrink-0 items-center gap-1.5 text-stone"><Lock aria-hidden className="size-3.5" />{c.sections.always}</span>
        ) : (
          <span className="flex shrink-0 items-center gap-2">
            <span className="label hidden w-16 text-right text-stone sm:inline">{soon ? "" : on ? c.sections.shown : c.sections.hidden}</span>
            <Toggle label={label} checked={on && !soon} disabled={soon || busy === section} onChange={(v) => void flip(section as RoomSection, v)} />
          </span>
        )}
      </li>
    );
  };

  return (
    <Panel title={c.nav.sections} hint={c.sections.intro} badge={<span className="flex items-center gap-2 text-xs text-stone">{c.pro.reorder}<ProBadge /></span>}>
      <ol className="space-y-2">
        {row("entrance")}
        {order.map((s) => row(s))}
      </ol>
    </Panel>
  );
}
