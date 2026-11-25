import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { uploadImage } from "@/components/q/AccountProvider";
import { QButton } from "@/components/q/QButton";
import { useTaxonomy } from "@/components/q/TaxonomyProvider";
import { activeEntries, label } from "@/data/taxonomy";
import { addTag, imageRatio, move, refreshStudio } from "@/lib/artist-studio";
import type { StudioData } from "@/lib/studio";
import { useT } from "@/i18n";
import { useStudioCopy } from "@/i18n/studio";
import { cn } from "@/lib/utils";
import { AreaField, Field, inputClass, Panel, SaveButton, SelectField, TextField, Toggle } from "./ui";

type Piece = StudioData["pieces"][number];
type PieceInsert = Database["public"]["Tables"]["pieces"]["Insert"];
export const pieceStatuses = ["draft", "available", "sold", "hidden"] as const;
const currencies = ["USD", "HNL", "GTQ", "MXN", "CAD", "EUR"];
const num = (v: string) => (v.trim() === "" ? null : Number(v));
const str = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));

/** Loads an image URL just to read its shape, so the cover keeps its real proportions. */
function urlRatio(url: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1);
    img.onerror = () => resolve(1);
    img.src = url;
  });
}

/** Shopify-style piece editor: images, pricing, organization, stock, details and status. */
export function ProductEditor({ piece, owner, handle, city, collections, onClose }: {
  piece: Piece | null; owner: string; handle: string; city: string; collections: string[]; onClose: () => void;
}) {
  const t = useT();
  const c = useStudioCopy();
  const p = c.product;
  const { state, lang } = useTaxonomy();
  const qc = useQueryClient();
  const mediums = activeEntries(state.taxonomy, "medium");

  const [title, setTitle] = useState(piece?.title ?? "");
  const [description, setDescription] = useState(piece?.description ?? "");
  const [images, setImages] = useState<string[]>(piece?.images ?? []);
  const [ratio, setRatio] = useState<number>(Number(piece?.ratio) || 1);
  const [uploading, setUploading] = useState(0);
  const [price, setPrice] = useState(str(piece?.price));
  const [compareAt, setCompareAt] = useState(str(piece?.compare_at_price));
  const [currency, setCurrency] = useState(piece?.currency ?? "USD");
  const [mediumId, setMediumId] = useState(piece?.medium_id ?? mediums[0]?.id ?? "");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [formatId, setFormatId] = useState(piece?.format_id ?? "format:original");
  const [collection, setCollection] = useState(piece?.collection ?? "");
  const [tags, setTags] = useState<string[]>(piece?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [madeToOrder, setMadeToOrder] = useState(piece ? piece.quantity === null : false);
  const [quantity, setQuantity] = useState(str(piece?.quantity ?? 1));
  const [edition, setEdition] = useState(str(piece?.edition_size));
  const [sku, setSku] = useState(piece?.sku ?? "");
  const [size, setSize] = useState(piece?.size ?? "");
  const [year, setYear] = useState(str(piece?.year));
  const [width, setWidth] = useState(str(piece?.width_cm));
  const [height, setHeight] = useState(str(piece?.height_cm));
  const [depth, setDepth] = useState(str(piece?.depth_cm));
  const [weight, setWeight] = useState(str(piece?.weight_kg));
  const [shipsFrom, setShipsFrom] = useState(piece?.ships_from || city);
  const [status, setStatus] = useState<string>(piece?.status ?? "draft");
  const [busy, setBusy] = useState(false);

  // Existing specialties for this piece.
  useEffect(() => {
    if (!piece) return;
    void supabase.from("piece_specialties").select("specialty_id").eq("piece_id", piece.id)
      .then(({ data }) => setSpecialties((data ?? []).map((r) => r.specialty_id)));
  }, [piece]);

  async function addImages(files: FileList | null) {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    setUploading((n) => n + list.length);
    let first = images.length === 0;
    for (const file of list) {
      try {
        const [url, r] = await Promise.all([uploadImage("piece-images", owner, file, t.account.uploadError), imageRatio(file)]);
        if (first) { setRatio(r); first = false; }
        setImages((xs) => [...xs, url]);
      } catch (err) { toast.error(err instanceof Error ? err.message : c.error); }
      finally { setUploading((n) => n - 1); }
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(price);
    if (!title.trim() || !mediumId || price.trim() === "" || !Number.isFinite(amount) || amount < 0) { toast.error(c.required); return; }
    setBusy(true);
    try {
      const coverRatio = images[0] && images[0] !== piece?.images[0] ? await urlRatio(images[0]) : ratio;
      const row: PieceInsert = {
        artist: owner, title: title.trim(), description: description.trim(), images, ratio: coverRatio || 1,
        price: amount, compare_at_price: num(compareAt), currency,
        medium_id: mediumId, medium: mediums.find((m) => m.id === mediumId)?.label_en ?? "", format_id: formatId,
        collection: collection.trim(), tags,
        quantity: madeToOrder ? null : Math.max(0, Math.floor(Number(quantity) || 0)),
        edition_size: formatId === "format:limited-edition" ? num(edition) : null,
        sku: sku.trim(), size: size.trim(), year: num(year),
        width_cm: num(width), height_cm: num(height), depth_cm: num(depth), weight_kg: num(weight),
        ships_from: shipsFrom.trim(), city: shipsFrom.trim() || city, status,
      };
      const result = piece
        ? await supabase.from("pieces").update(row).eq("id", piece.id).select("id").single()
        : await supabase.from("pieces").insert(row).select("id").single();
      if (result.error) throw result.error;
      const { error } = await supabase.rpc("save_piece_specialties", { target_piece: result.data.id, specialty_ids: specialties });
      if (error) throw error;
      await refreshStudio(qc);
      toast.success(c.saved);
      onClose();
    } catch { toast.error(c.error); } finally { setBusy(false); }
  }

  async function remove() {
    if (!piece || !window.confirm(c.deleteConfirm)) return;
    const { error } = await supabase.from("pieces").delete().eq("id", piece.id);
    if (error) { toast.error(c.error); return; }
    await refreshStudio(qc);
    onClose();
  }

  const formats = activeEntries(state.taxonomy, "format").map((x) => ({ value: x.id, label: label(x, lang) }));
  const specOptions = activeEntries(state.taxonomy, "specialty", mediumId);

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <QButton onClick={onClose} className="btn-ghost !py-2"><ArrowLeft />{c.cancel}</QButton>
        <h2 className="text-2xl">{piece ? p.editTitle : p.newTitle}</h2>
      </div>

      <Panel title={p.images} hint={p.imagesHint}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <li key={url} className="rounded-xl border border-line bg-wall p-2">
              <img src={url} alt="" className="aspect-square w-full rounded-lg object-contain" />
              <div className="mt-2 flex items-center justify-between gap-1">
                {i === 0 ? <span className="label inline-flex items-center gap-1 text-deep-tomato"><Star aria-hidden className="size-3" />{p.cover}</span>
                  : <QButton aria-label={p.makeCover} title={p.makeCover} onClick={() => setImages((xs) => move(xs, i, 0))} className="!h-9 !w-9 !p-0"><Star /></QButton>}
                <span className="flex">
                  <QButton aria-label={c.moveUp} title={c.moveUp} disabled={i === 0} onClick={() => setImages((xs) => move(xs, i, i - 1))} className="!h-9 !w-9 !p-0"><ArrowLeft /></QButton>
                  <QButton aria-label={c.moveDown} title={c.moveDown} disabled={i === images.length - 1} onClick={() => setImages((xs) => move(xs, i, i + 1))} className="!h-9 !w-9 !p-0"><ArrowRight /></QButton>
                  <QButton aria-label={p.removeImage} title={p.removeImage} onClick={() => setImages((xs) => xs.filter((x) => x !== url))} className="!h-9 !w-9 !p-0 text-deep-tomato"><Trash2 /></QButton>
                </span>
              </div>
            </li>
          ))}
          <li>
            <label className={cn("flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-stone hover:border-ink hover:text-ink", uploading > 0 && "opacity-60")}>
              <ImagePlus aria-hidden className="size-7" />
              <span className="text-sm">{uploading > 0 ? c.saving : p.addImages}</span>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { void addImages(e.target.files); e.target.value = ""; }} />
            </label>
          </li>
        </ul>
      </Panel>

      <Panel title={p.basics}>
        <TextField label={p.title} value={title} onChange={setTitle} required maxLength={120} />
        <AreaField label={p.description} hint={p.descriptionHint} value={description} onChange={setDescription} rows={5} maxLength={3000} />
      </Panel>

      <Panel title={p.pricing}>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label={p.price} type="number" min={0} step="0.01" value={price} onChange={setPrice} required />
          <TextField label={p.compareAt} hint={p.compareAtHint} type="number" min={0} step="0.01" value={compareAt} onChange={setCompareAt} />
          <SelectField label={p.currency} value={currency} onChange={setCurrency} options={currencies.map((x) => ({ value: x, label: x }))} />
        </div>
      </Panel>

      <Panel title={p.organize}>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label={p.medium} value={mediumId} onChange={(v) => { setMediumId(v); setSpecialties([]); }} options={mediums.map((m) => ({ value: m.id, label: label(m, lang) }))} />
          <SelectField label={p.format} value={formatId} onChange={setFormatId} options={formats} />
        </div>
        {specOptions.length > 0 && (
          <fieldset>
            <legend className="text-sm font-medium">{p.specialties}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {specOptions.map((s) => (
                <QButton key={s.id} aria-pressed={specialties.includes(s.id)} onClick={() => setSpecialties((xs) => (xs.includes(s.id) ? xs.filter((x) => x !== s.id) : [...xs, s.id]))}
                  className={cn("chip", specialties.includes(s.id) && "chip-on")}>{label(s, lang)}</QButton>
              ))}
            </div>
          </fieldset>
        )}
        <Field label={p.collection} hint={p.collectionHint}>
          <input list="studio-collections" value={collection} maxLength={60} onChange={(e) => setCollection(e.target.value)} className={inputClass} />
          <datalist id="studio-collections">{collections.map((x) => <option key={x} value={x} />)}</datalist>
        </Field>
        <Field label={p.tags} hint={p.tagsHint}>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-wall px-3 py-2 focus-within:border-ink">
            {tags.map((tag) => (
              <span key={tag} className="chip !py-1 !pl-3 !pr-1">#{tag}
                <button type="button" aria-label={p.removeTag(tag)} onClick={() => setTags((xs) => xs.filter((x) => x !== tag))} className="rounded-full p-1 hover:bg-line"><X aria-hidden className="size-3.5" /></button>
              </span>
            ))}
            <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} maxLength={30}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); setTags((xs) => addTag(xs, tagDraft)); setTagDraft(""); } }}
              onBlur={() => { if (tagDraft.trim()) { setTags((xs) => addTag(xs, tagDraft)); setTagDraft(""); } }}
              className="min-w-32 flex-1 bg-transparent py-1.5 focus:outline-none" />
          </div>
        </Field>
      </Panel>

      <Panel title={p.inventory}>
        <div className="flex items-center gap-3"><Toggle label={p.madeToOrder} checked={madeToOrder} onChange={setMadeToOrder} /><span>{p.madeToOrder}</span></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {!madeToOrder && <TextField label={p.quantity} type="number" min={0} step="1" value={quantity} onChange={setQuantity} />}
          {formatId === "format:limited-edition" && <TextField label={p.edition} type="number" min={1} step="1" value={edition} onChange={setEdition} />}
          <TextField label={p.sku} value={sku} onChange={setSku} maxLength={40} />
        </div>
      </Panel>

      <Panel title={p.details}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={p.size} hint={p.sizeHint} value={size} onChange={setSize} maxLength={60} />
          <TextField label={p.year} type="number" min={1900} step="1" value={year} onChange={setYear} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <TextField label={p.width} type="number" min={0} step="0.1" value={width} onChange={setWidth} />
          <TextField label={p.height} type="number" min={0} step="0.1" value={height} onChange={setHeight} />
          <TextField label={p.depth} type="number" min={0} step="0.1" value={depth} onChange={setDepth} />
          <TextField label={p.weight} type="number" min={0} step="0.01" value={weight} onChange={setWeight} />
        </div>
        <TextField label={p.shipsFrom} value={shipsFrom} onChange={setShipsFrom} maxLength={80} />
      </Panel>

      <Panel title={p.status}>
        <div role="radiogroup" aria-label={p.status} className="grid gap-2 sm:grid-cols-2">
          {pieceStatuses.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={status === s} onClick={() => setStatus(s)}
              className={cn("rounded-xl border px-4 py-3 text-left", status === s ? "border-ink bg-ink text-wall" : "border-line bg-wall hover:border-ink")}>
              <span className="font-medium">{c.shop.statuses[s]}</span>
              <span className={cn("block text-sm", status === s ? "opacity-80" : "text-stone")}>{c.shop.statusHelp[s]}</span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card/95 p-3 backdrop-blur">
        <span className="flex items-center gap-2">
          {piece && <QButton onClick={() => void remove()} className="btn-ghost !py-2 text-deep-tomato"><Trash2 />{c.delete}</QButton>}
          {piece && (piece.status === "available" || piece.status === "sold") && <Link to="/a/$handle/p/$id" params={{ handle, id: piece.id }} className="link text-sm">{p.viewInRoom}</Link>}
        </span>
        <SaveButton busy={busy || uploading > 0} />
      </div>
    </form>
  );
}
