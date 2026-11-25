import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { uploadImage } from "@/components/q/AccountProvider";
import { CityPicker } from "@/components/q/CityPicker";
import { LinkEditor, linkDrafts, resolveLinks, type LinkDraft } from "@/components/q/LinkEditor";
import { roomColors } from "@/data/sample";
import { normalizeCity } from "@/data/places";
import { asRoomLinks } from "@/lib/links";
import { asRoomColor, refreshStudio } from "@/lib/artist-studio";
import type { StudioData } from "@/lib/studio";
import { useT } from "@/i18n";
import { useStudioCopy } from "@/i18n/studio";
import { featureCopy } from "@/i18n/features";
import { useTaxonomy } from "@/components/q/TaxonomyProvider";
import { cn } from "@/lib/utils";
import { AreaField, Field, Panel, SaveButton, TextField } from "./ui";

/** Entrance (name, photo, tagline, city, wall, links) and About (bio, things I love). Both always show. */
export function RoomPanel({ data }: { data: StudioData }) {
  const t = useT();
  const c = useStudioCopy();
  const { lang } = useTaxonomy();
  const qc = useQueryClient();
  const profile = data.profile;
  const room = data.room;
  const [name, setName] = useState(profile?.display_name ?? "");
  const [tagline, setTagline] = useState(room?.tagline ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [wall, setWall] = useState(asRoomColor(room?.room_color));
  const [links, setLinks] = useState<LinkDraft[]>(() => linkDrafts(asRoomLinks(room?.links)));
  const [bio, setBio] = useState(room?.bio ?? "");
  const [loves, setLoves] = useState((room?.loves ?? []).join("\n"));
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  if (!profile || !room) return null;

  const resolved = resolveLinks(links);
  const linksOk = resolved.every(Boolean);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !room) return;
    if (!name.trim() || !linksOk) { toast.error(!linksOk ? featureCopy[lang].linkInvalid : c.required); return; }
    setBusy(true);
    try {
      const [p, r] = await Promise.all([
        supabase.from("profiles").update({ display_name: name.trim(), city: normalizeCity(city) }).eq("id", profile.id),
        supabase.from("rooms").update({
          tagline: tagline.trim(), bio: bio.trim(), room_color: wall,
          loves: loves.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 12),
          links: resolved.filter((l): l is NonNullable<typeof l> => l !== null) as unknown as Json,
        }).eq("id", room.id),
      ]);
      if (p.error) throw p.error;
      if (r.error) throw r.error;
      await refreshStudio(qc);
      toast.success(c.saved);
    } catch { toast.error(c.error); } finally { setBusy(false); }
  }

  async function changePhoto(file: File | undefined) {
    if (!file || !profile) return;
    setPhotoBusy(true);
    try {
      const url = await uploadImage("profile-photos", profile.id, file, t.account.uploadError);
      const { error } = await supabase.from("profiles").update({ photo: url }).eq("id", profile.id);
      if (error) throw error;
      await refreshStudio(qc);
      toast.success(c.saved);
    } catch (err) { toast.error(err instanceof Error ? err.message : c.error); } finally { setPhotoBusy(false); }
  }

  const always = <span className="label rounded-full border border-line px-2.5 py-1 text-stone">{c.room.always}</span>;
  return (
    <form onSubmit={save} className="space-y-6">
      <Panel title={c.room.entrance} hint={c.room.entranceHint} badge={always}>
        <div className="flex items-center gap-4">
          <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-wall">
            {profile.photo ? <img src={profile.photo} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <label className={cn("btn btn-ghost cursor-pointer !px-4 !py-2 text-sm", photoBusy && "opacity-60")}>
            <Camera aria-hidden className="size-4" />{photoBusy ? c.saving : profile.photo ? c.room.changePhoto : c.room.photo}
            <input type="file" accept="image/*" className="sr-only" disabled={photoBusy} onChange={(e) => void changePhoto(e.target.files?.[0])} />
          </label>
        </div>
        <TextField label={c.room.name} value={name} onChange={setName} required maxLength={80} />
        <TextField label={c.room.tagline} value={tagline} onChange={setTagline} maxLength={140} />
        <Field label={c.room.city}><div className="mt-2"><CityPicker value={city} onChange={setCity} /></div></Field>
        <fieldset>
          <legend className="text-sm font-medium">{c.room.wall}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {roomColors.map((color) => (
              <button key={color.id} type="button" aria-pressed={wall === color.id} onClick={() => setWall(color.id)} title={t.roomColors[color.id]}
                className={cn(`room-${color.id} flex h-12 w-12 items-center justify-center rounded-xl border bg-room`, wall === color.id ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-card" : "border-line")}>
                <span className="sr-only">{t.roomColors[color.id]}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <p className="text-sm font-medium">{c.room.links}</p>
          <div className="mt-2"><LinkEditor value={links} onChange={setLinks} /></div>
          {!linksOk && <p role="alert" className="mt-2 text-sm text-deep-tomato">{featureCopy[lang].linkInvalid}</p>}
        </div>
      </Panel>

      <Panel title={c.room.about} hint={c.room.aboutHint} badge={always}>
        <AreaField label={c.room.bio} value={bio} onChange={setBio} rows={5} maxLength={1200} />
        <AreaField label={c.room.loves} hint={c.room.lovesHint} value={loves} onChange={setLoves} rows={4} />
      </Panel>

      <div className="sticky bottom-4 z-10 flex justify-end"><SaveButton busy={busy} /></div>
    </form>
  );
}
