import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Art } from "@/components/q/Art";
import { QButton } from "@/components/q/QButton";
import { asRoomColor, FREE_PIECE_LIMIT } from "@/lib/artist-studio";
import { usePlan } from "@/lib/plan";
import type { StudioData } from "@/lib/studio";
import { useStudioCopy } from "@/i18n/studio";
import { cn } from "@/lib/utils";
import { ProductEditor, pieceStatuses } from "./ProductEditor";
import { Empty, Panel, SaveButton, Toggle } from "./ui";

type Piece = StudioData["pieces"][number];
const zones = ["honduras", "central_america", "us_canada", "world"] as const;
type Zone = (typeof zones)[number];
type ZoneDraft = { ships: boolean; free: boolean; rate: string };

const money = (amount: number, currency: string) => `${currency === "USD" ? "$" : `${currency} `}${amount.toLocaleString("en-US")}`;
const statusTone: Record<string, string> = { draft: "bg-sun text-ink", available: "bg-[oklch(0.88_0.06_150)] text-ink", sold: "bg-ink text-wall", hidden: "bg-line text-ink" };

/** Shop: every piece the artist has (any status), the Free limit, and shipping rates by zone. */
export function ShopPanel({ data, owner }: { data: StudioData; owner: string }) {
  const c = useStudioCopy();
  const plan = usePlan();
  const [editing, setEditing] = useState<Piece | "new" | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const pieces = [...data.pieces].sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at));
  const atLimit = plan === "free" && pieces.length >= FREE_PIECE_LIMIT;
  const collections = [...new Set(pieces.map((p) => p.collection).filter(Boolean))];

  if (editing) {
    return (
      <ProductEditor key={editing === "new" ? "new" : editing.id} piece={editing === "new" ? null : editing} owner={owner}
        handle={data.room?.handle ?? ""} city={data.profile?.city ?? ""} collections={collections} onClose={() => setEditing(null)} />
    );
  }

  const shown = filter === "all" ? pieces : pieces.filter((p) => p.status === filter);
  return (
    <div className="space-y-6">
      <Panel title={c.nav.shop} hint={c.shop.intro}
        badge={<QButton disabled={atLimit} onClick={() => setEditing("new")} className="btn-primary !py-2"><Plus />{c.shop.add}</QButton>}>
        {plan === "free" && <p className={cn("text-sm", atLimit ? "text-deep-tomato" : "text-stone")}>{atLimit ? c.product.limitReached : c.shop.limit(pieces.length, FREE_PIECE_LIMIT)}</p>}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {(["all", ...pieceStatuses] as const).map((s) => {
            const n = s === "all" ? pieces.length : pieces.filter((p) => p.status === s).length;
            return (
              <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={cn("chip", filter === s && "chip-on")}>
                {s === "all" ? c.shop.all : c.shop.statuses[s]} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
        {shown.length === 0 ? <Empty>{c.shop.empty}</Empty> : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {shown.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => setEditing(p)} className="group block w-full text-left">
                  <div className="relative rounded-xl bg-wall p-2">
                    <Art src={p.images[0]} ratio={Number(p.ratio) || 1} tone={asRoomColor(p.tone)} shape={p.shape} title={p.title} />
                    <span className={cn("label absolute left-3 top-3 rounded-full px-2 py-1", statusTone[p.status] ?? "bg-line")}>{c.shop.statuses[p.status as keyof typeof c.shop.statuses] ?? p.status}</span>
                  </div>
                  <p className="font-display mt-2 leading-tight group-hover:text-deep-tomato">{p.title}</p>
                  <p className="text-sm">
                    {money(Number(p.price), p.currency)}
                    {p.compare_at_price !== null && Number(p.compare_at_price) > Number(p.price) && <s className="ml-2 text-stone">{money(Number(p.compare_at_price), p.currency)}</s>}
                  </p>
                  <p className="text-xs text-stone">{p.quantity === null ? c.shop.madeToOrder : c.shop.stock(p.quantity)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <ShippingZones owner={owner} />
    </div>
  );
}

function ShippingZones({ owner }: { owner: string }) {
  const c = useStudioCopy();
  const qc = useQueryClient();
  const saved = useQuery({
    queryKey: ["shipping-zones", owner],
    enabled: !!owner,
    queryFn: async () => {
      const { data, error } = await supabase.from("artist_shipping_zones").select("*").eq("artist", owner);
      if (error) throw error;
      return data;
    },
  });
  const [draft, setDraft] = useState<Record<Zone, ZoneDraft> | null>(null);
  const [busy, setBusy] = useState(false);
  const current: Record<Zone, ZoneDraft> = draft ?? Object.fromEntries(zones.map((z) => {
    const row = saved.data?.find((r) => r.zone === z);
    return [z, { ships: row ? row.ships : z === "honduras", free: !!row && row.ships && row.rate === null, rate: row?.rate == null ? "" : String(row.rate) }];
  })) as Record<Zone, ZoneDraft>;
  const set = (z: Zone, patch: Partial<ZoneDraft>) => setDraft({ ...current, [z]: { ...current[z], ...patch } });

  async function save() {
    setBusy(true);
    const rows = zones.map((z) => {
      const d = current[z];
      const rate = d.free || d.rate.trim() === "" ? null : Math.max(0, Number(d.rate) || 0);
      return { artist: owner, zone: z, ships: d.ships, rate: d.ships ? rate : null, currency: "USD" };
    });
    const { error } = await supabase.from("artist_shipping_zones").upsert(rows, { onConflict: "artist,zone" });
    setBusy(false);
    if (error) { toast.error(c.error); return; }
    setDraft(null);
    await qc.invalidateQueries({ queryKey: ["shipping-zones", owner] });
    toast.success(c.saved);
  }

  return (
    <Panel title={c.shop.shipping} hint={c.shop.shippingHint}>
      <ul className="space-y-2">
        {zones.map((z) => (
          <li key={z} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-wall px-4 py-3">
            <span className="min-w-40 flex-1 font-medium">{c.shop.zones[z]}</span>
            <span className="flex items-center gap-2 text-sm"><Toggle label={`${c.shop.ships}: ${c.shop.zones[z]}`} checked={current[z].ships} onChange={(v) => set(z, { ships: v })} />{c.shop.ships}</span>
            {current[z].ships && (
              <>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={current[z].free} onChange={(e) => set(z, { free: e.target.checked })} className="size-4 accent-ink" />{c.shop.free}</label>
                {!current[z].free && (
                  <label className="flex items-center gap-2 text-sm">{c.shop.rate} $
                    <input type="number" min={0} step="0.01" value={current[z].rate} onChange={(e) => set(z, { rate: e.target.value })} className="w-24 rounded-lg border border-line bg-card px-2 py-1.5" />
                  </label>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-stone">{c.shop.shippingSoon}</p><SaveButton busy={busy} onClick={() => void save()} /></div>
    </Panel>
  );
}
