import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QButton } from "@/components/q/QButton";
import { refreshStudio } from "@/lib/artist-studio";
import type { StudioData } from "@/lib/studio";
import { useFormat } from "@/i18n";
import { useStudioCopy } from "@/i18n/studio";
import { AreaField, Empty, Panel, SaveButton, SelectField, TextField, Toggle } from "./ui";

type Service = StudioData["services"][number];
type Draft = { id?: string; title: string; description: string; price_type: string; price: string; published: boolean };
const blank: Draft = { title: "", description: "", price_type: "fixed", price: "", published: true };

/** Services: what people can hire the artist for. Fixed, hourly or a paid consult. */
export function ServicesPanel({ data, owner }: { data: StudioData; owner: string }) {
  const c = useStudioCopy();
  const f = useFormat();
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
    const row = { artist: owner, title: draft.title.trim(), description: draft.description.trim(), price_type: draft.price_type, price, published: draft.published };
    const { error } = draft.id ? await supabase.from("services").update(row).eq("id", draft.id) : await supabase.from("services").insert(row);
    setBusy(false);
    if (error) { toast.error(c.error); return; }
    setDraft(null);
    await refreshStudio(qc);
    toast.success(c.saved);
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
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight">{s.title}</p>
                <p className="text-sm text-stone">{label(s)}{s.published ? "" : ` · ${c.shop.statuses.hidden}`}</p>
              </div>
              <QButton aria-label={`${c.edit}: ${s.title}`} onClick={() => setDraft({ id: s.id, title: s.title, description: s.description, price_type: s.price_type, price: String(s.price), published: s.published })} className="!h-10 !w-10 !p-0"><Pencil /></QButton>
              <QButton aria-label={`${c.delete}: ${s.title}`} onClick={() => void remove(s.id)} className="!h-10 !w-10 !p-0 text-deep-tomato"><Trash2 /></QButton>
            </li>
          ))}
        </ul>
      </Panel>

      {draft && (
        <form onSubmit={save}>
          <Panel title={draft.id ? c.edit : c.services.add}>
            <TextField label={c.services.title} value={draft.title} onChange={(v) => set({ title: v })} required maxLength={100} />
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
