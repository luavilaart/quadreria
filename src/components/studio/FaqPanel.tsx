import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { QButton } from "@/components/q/QButton";
import { asFaq, cleanFaq, move, refreshStudio, type FaqItem } from "@/lib/artist-studio";
import type { StudioData } from "@/lib/studio";
import { useStudioCopy } from "@/i18n/studio";
import { inputClass, Panel, SaveButton } from "./ui";

/** FAQ: suggested starters to add in one tap, plus the artist's own questions (edit, reorder, delete). */
export function FaqPanel({ data }: { data: StudioData }) {
  const c = useStudioCopy();
  const qc = useQueryClient();
  const room = data.room;
  const [items, setItems] = useState<FaqItem[]>(() => asFaq(room?.faq));
  const [busy, setBusy] = useState(false);
  if (!room) return null;

  const update = (i: number, patch: Partial<FaqItem>) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const unused = c.faq.samples.filter(([q]) => !items.some((x) => x.q.trim().toLowerCase() === q.toLowerCase()));

  async function save() {
    if (!room) return;
    setBusy(true);
    const faq = cleanFaq(items);
    const { error } = await supabase.from("rooms").update({ faq: faq as unknown as Json }).eq("id", room.id);
    setBusy(false);
    if (error) { toast.error(c.error); return; }
    setItems(faq);
    await refreshStudio(qc);
    toast.success(c.saved);
  }

  return (
    <div className="space-y-6">
      <Panel title={c.nav.faq} hint={c.faq.intro}>
        {items.length === 0 && <p className="text-stone">{c.faq.empty}</p>}
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="rounded-2xl border border-line bg-wall p-4">
              <div className="flex items-start gap-2">
                <span className="font-display mt-3 w-5 shrink-0 text-deep-tomato">{i + 1}</span>
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="block text-sm font-medium">{c.faq.question}
                    <input value={item.q} maxLength={160} onChange={(e) => update(i, { q: e.target.value })} className={inputClass} />
                  </label>
                  <label className="block text-sm font-medium">{c.faq.answer}
                    <textarea value={item.a} rows={3} maxLength={800} onChange={(e) => update(i, { a: e.target.value })} className={inputClass} />
                  </label>
                </div>
                <div className="flex shrink-0 flex-col">
                  <QButton aria-label={c.moveUp} title={c.moveUp} disabled={i === 0} onClick={() => setItems((xs) => move(xs, i, i - 1))} className="!h-10 !w-10 !p-0"><ArrowUp /></QButton>
                  <QButton aria-label={c.moveDown} title={c.moveDown} disabled={i === items.length - 1} onClick={() => setItems((xs) => move(xs, i, i + 1))} className="!h-10 !w-10 !p-0"><ArrowDown /></QButton>
                  <QButton aria-label={c.delete} title={c.delete} onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))} className="!h-10 !w-10 !p-0 text-deep-tomato"><Trash2 /></QButton>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <QButton onClick={() => setItems((xs) => [...xs, { q: "", a: "" }])} className="btn-ghost"><Plus />{c.faq.add}</QButton>
          <SaveButton busy={busy} onClick={() => void save()} />
        </div>
      </Panel>

      {unused.length > 0 && (
        <Panel title={c.faq.starters}>
          <ul className="space-y-2">
            {unused.map(([q, a]) => (
              <li key={q} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-wall p-4">
                <div><p className="font-medium">{q}</p><p className="mt-1 text-sm text-stone">{a}</p></div>
                <QButton onClick={() => setItems((xs) => [...xs, { q, a }])} className="chip shrink-0"><Plus />{c.faq.useStarter}</QButton>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
