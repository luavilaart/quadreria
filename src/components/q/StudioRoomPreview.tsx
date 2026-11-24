import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { studioQuery } from "@/lib/studio";
import { label } from "@/data/taxonomy";
import { asRoomLinks } from "@/lib/links";
import type { RoomColor } from "@/data/sample";
import { useT } from "@/i18n";
import { QButton } from "./QButton";
import { RoomPreview, type PreviewRoomData } from "./RoomPreview";
import { useTaxonomy } from "./TaxonomyProvider";

const roomColors: RoomColor[] = ["cream", "blush", "butter", "sage", "sky", "lilac", "ink"];
const asRoomColor = (v: string | null | undefined): RoomColor => (roomColors.includes(v as RoomColor) ? (v as RoomColor) : "cream");

/**
 * Studio "Preview my room": a floating button that opens the artist's own room in a side panel.
 * Reads the owner-only studio query (drafts and unpublished rooms included), which the Studio's
 * editors refresh after each save, so the preview follows the edits.
 */
export function StudioRoomPreview() {
  const t = useT();
  const p = t.preview;
  const { state, lang } = useTaxonomy();
  const [open, setOpen] = useState(false);
  const studio = useQuery({ ...studioQuery, enabled: open });

  const d = studio.data;
  const preview: PreviewRoomData | null =
    d?.profile && d.room
      ? {
          name: d.profile.display_name,
          handle: d.room.handle,
          city: d.profile.city,
          tagline: d.room.tagline,
          bio: d.room.bio,
          room: asRoomColor(d.room.room_color),
          photo: d.profile.photo,
          links: asRoomLinks(d.room.links),
          mediums: d.profile.mediums.map((m) => {
            const entry = state.taxonomy.find((x) => x.kind === "medium" && (x.label_en === m || x.label_es === m || x.id === m));
            return entry ? label(entry, lang) : m;
          }),
          pieces: d.pieces
            .filter((x) => x.status !== "hidden")
            .map((x) => ({ id: x.id, title: x.title, ratio: Number(x.ratio) || 1, tone: asRoomColor(x.tone), shape: x.shape, src: x.images[0] })),
          services: d.services.map((s) => ({ id: s.id, title: s.title, price: Number(s.price), priceType: s.price_type })),
        }
      : null;

  return (
    <>
      <QButton onClick={() => setOpen(true)} className="btn-primary fixed bottom-5 right-5 z-40">
        <Eye aria-hidden className="!size-5" />
        {p.studioButton}
      </QButton>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto bg-card sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">{p.studioTitle}</SheetTitle>
            <SheetDescription>{p.studioNote}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {studio.isPending && <p role="status" className="text-stone">{t.account.saving}</p>}
            {studio.isError && <p role="alert">{t.account.error}</p>}
            {preview && (
              <>
                <RoomPreview data={preview} height="h-[min(640px,70dvh)]" />
                <Link to="/a/$handle" params={{ handle: preview.handle }} className="link mt-4 block text-center">{p.openRoom}</Link>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
