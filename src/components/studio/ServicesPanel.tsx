import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QButton } from "@/components/q/QButton";
import { uploadImage } from "@/components/q/AccountProvider";
import { refreshStudio } from "@/lib/artist-studio";
import type { StudioData } from "@/lib/studio";
import { useFormat, useT } from "@/i18n";
import { useStudioCopy } from "@/i18n/studio";
import { useTaxonomy } from '@/components/q/TaxonomyProvider';
import { activeEntries, label as taxonomyLabel } from '@/data/taxonomy';
import { serviceTypeCopy } from '@/i18n/taxonomy';
import { ServiceTypeLink } from '@/components/q/ServiceTypeLink';
import { AreaField, Empty, Panel, SaveButton, SelectField, TextField, Toggle } from "./ui";

type Service = StudioData["services"][number];
type Draft = { id?: string; title: string; description: string; price_type: string; price: string; published: boolean; image: string | null; service_type_id: string | null };
const blank: Draft = { title: "", description: "", price_type: "fixed", price: "", published: true, image: null, service_type_id: null };

/** Services: what people can hire the artist for. Fixed, hourly or a paid consult, each with an optional small picture. */
export function ServicesPanel({ data, owner }: { data: StudioData; owner: string }) {
  const c = useStudioCopy();
  const { state, lang } = useTaxonomy();
  const types = activeEntries(state.taxonomy, 'service');
  const tc = serviceTypeCopy[lang];
  const t = useT();
  const f = useFormat();
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const label = (s: Service) =>
    s.price_type === "consult" ? `${c.services.types.consult} · $${s.price}` : s.price_type === "hourly" ? `$${s.price} · ${c.services.types.hourly}` : f.price(Number(s.price));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const price = Number(draft.price);
    if (!draft.title.trim() || !Number.isFinite(price) || price < 0) { toast.error(c.required); return; }
    setBusy(true);
    const row = { artist: owner, title: draft.title.trim(), description: draft.description.trim(), price_type: draft.price_type, price, published: draft.published, image: draft.image, service_type_id: draft.service_type_id };
    const { error } = draft.id ? await supabase.from("services").update(row).eq("id", draft.id) : await supabase.from("services").insert(row);
    setBusy(false);
    if (error) { toast.error(c.error); return; }
    setDraft(null);
    await refreshStudio(qc);
    toast.success(c.saved);
  }

  async function pickImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try { set({ image: await uploadImage("piece-images", owner, file, t.account.uploadError) }); }
    catch (err) { toast.error(err instanceof Error ? err.message : c.error); }
    finally { setUploading(false); }
  }

  async function remove(id: string) {
    if (!window.confirm(c.deleteConfirm)) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(c.error); return; }
    await refreshStudio(qc);
  }

  return (
    <div className="space-y-6">
      <Panel title={c.nav.services} hint={c.services.intro} badge={!draft && <QButton onClick={() => setDraft(blank)} className="btn-primary !py-2"><Plus />{c.services.add}</QButton>}>
        {data.services.length === 0 && !draft && <Empty>{c.services.empty}</Empty>}
        <ul className="space-y-2">
          {data.services.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-line bg-wall px-4 py-3">
              <div className="flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card">{s.image ? <img src={s.image} alt="" className="max-h-full max-w-full object-contain" /> : <ImagePlus aria-hidden className="size-5 text-stone/60" />}</div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight">{s.title}</p>
                <ServiceTypeLink typeId={s.service_type_id} />
                <p className="text-sm text-stone">{label(s)}{s.published ? "" : ` · ${c.shop.statuses.hidden}`}</p>
              </div>
              <QButton aria-label={`${c.edit}: ${s.title}`} onClick={() => setDraft({ id: s.id, title: s.title, description: s.description, price_type: s.price_type, price: String(s.price), published: s.published, image: s.image, service_type_id: s.service_type_id })} className="!h-10 !w-10 !p-0"><Pencil /></QButton>
              <QButton aria-label={`${c.delete}: ${s.title}`} onClick={() => void remove(s.id)} className="!h-10 !w-10 !p-0 text-deep-tomato"><Trash2 /></QButton>
            </li>
          ))}
        </ul>
      </Panel>

      {draft && (
        <form onSubmit={save}>
          <Panel title={draft.id ? c.edit : c.services.add}>
            <TextField label={c.services.title} value={draft.title} onChange={(v) => set({ title: v })} required maxLength={100} />
            <SelectField label={tc.type} value={draft.service_type_id ?? ''} onChange={v => set({ service_type_id: v || null })}
              options={[{ value: '', label: tc.untyped }, ...types.map(type => ({ value: type.id, label: taxonomyLabel(type, lang) })), ...(!types.some(type => type.id === draft.service_type_id) && draft.service_type_id ? [{ value: draft.service_type_id, label: tc.untyped }] : [])]} />
            <ServiceTypeLink typeId={draft.service_type_id} />
            <div>
              <p className="text-sm font-medium">{c.services.image}</p>
              <p className="mt-0.5 text-xs text-stone">{c.services.imageHint}</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-wall p-1.5">
                  {draft.image ? <img src={draft.image} alt="" className="max-h-full max-w-full rounded-md object-contain" /> : <ImagePlus aria-hidden className="size-6 text-stone/60" />}
                </div>
                <label className={`btn btn-ghost cursor-pointer !px-4 !py-2 text-sm ${uploading ? "opacity-60" : ""}`}>
                  {uploading ? c.saving : draft.image ? c.services.changeImage : c.services.addImage}
                  <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => void pickImage(e.target.files?.[0])} />
                </label>
                {draft.image && <QButton onClick={() => set({ image: null })} className="!px-3 !py-2 text-sm text-deep-tomato">{c.services.removeImage}</QButton>}
              </div>
            </div>
            <AreaField label={c.services.description} value={draft.description} onChange={(v) => set({ description: v })} rows={3} maxLength={600} />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label={c.services.priceType} value={draft.price_type} onChange={(v) => set({ price_type: v })}
                options={(["fixed", "hourly", "consult"] as const).map((v) => ({ value: v, label: c.services.types[v] }))} />
              <TextField label={`${c.services.price} (USD)`} type="number" min={0} step="0.01" value={draft.price} onChange={(v) => set({ price: v })} required />
            </div>
            <div className="flex items-center gap-3"><Toggle label={c.services.published} checked={draft.published} onChange={(v) => set({ published: v })} /><span>{c.services.published}</span></div>
            <div className="flex justify-end gap-3">
              <QButton onClick={() => setDraft(null)} className="btn-ghost">{c.cancel}</QButton>
              <SaveButton busy={busy} />
            </div>
          </Panel>
        </form>
      )}
    </div>
  );
}
