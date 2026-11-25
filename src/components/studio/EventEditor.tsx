import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { uploadImage } from "@/components/q/AccountProvider";
import { QButton } from "@/components/q/QButton";
import { useTaxonomy } from "@/components/q/TaxonomyProvider";
import { eventTypes, type RoomColor } from "@/data/sample";
import { activeEntries, label } from "@/data/taxonomy";
import { refreshStudio } from "@/lib/artist-studio";
import { inviteBackgrounds, inviteTheme, themeColors, type InviteTheme } from "@/lib/invite";
import type { ArtistPlan } from "@/lib/plan";
import type { StudioData } from "@/lib/studio";
import { useT } from "@/i18n";
import { useStudioCopy } from "@/i18n/studio";
import { cn } from "@/lib/utils";
import { AreaField, Panel, ProBadge, SaveButton, SelectField, TextField } from "./ui";

type Ev = StudioData["events"][number];
type EvInsert = Database["public"]["Tables"]["events"]["Insert"];
export const eventStatuses = ["draft", "published", "cancelled"] as const;

const commonZones = ["America/Tegucigalpa", "America/Guatemala", "America/El_Salvador", "America/Managua", "America/Costa_Rica", "America/Panama", "America/Mexico_City", "America/New_York", "America/Chicago", "America/Los_Angeles", "America/Bogota", "Europe/Madrid", "UTC"];
function timeZones(): string[] {
  try {
    const all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
    return [...new Set([...commonZones, ...all])];
  } catch { return commonZones; }
}

/** Event editor modelled on Eventbrite's: basics, date and time, location, tickets, visibility, status and the invite look. */
export function EventEditor({ event, owner, tone, city, plan, onClose }: {
  event: Ev | null; owner: string; tone: RoomColor; city: string; plan: ArtistPlan; onClose: () => void;
}) {
  const t = useT();
  const c = useStudioCopy();
  const e = c.events;
  const { state, lang } = useTaxonomy();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState(event?.title ?? "");
  const [type, setType] = useState<string>(event?.type ?? "Class");
  const [category, setCategory] = useState(event?.category ?? "");
  const [blurb, setBlurb] = useState(event?.blurb ?? "");
  const [cover, setCover] = useState<string | null>(event?.cover_image ?? null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [date, setDate] = useState(event?.date ?? today);
  const [endDate, setEndDate] = useState(event?.end_date ?? "");
  const [start, setStart] = useState((event?.start_time ?? "17:00").slice(0, 5));
  const [end, setEnd] = useState((event?.end_time ?? "19:00").slice(0, 5));
  const [timezone, setTimezone] = useState(event?.timezone ?? "America/Tegucigalpa");
  const [online, setOnline] = useState(event ? event.city === "Online" : false);
  const [venue, setVenue] = useState(event?.venue_name ?? "");
  const [address, setAddress] = useState(event?.address ?? "");
  const [evCity, setEvCity] = useState(event && event.city !== "Online" ? event.city : city);
  const [link, setLink] = useState(event?.online_link ?? "");
  const [paid, setPaid] = useState(event ? Number(event.price) > 0 : false);
  const [price, setPrice] = useState(event && Number(event.price) > 0 ? String(event.price) : "");
  const [capacity, setCapacity] = useState(String(event?.capacity ?? 20));
  const [bring, setBring] = useState((event?.bring ?? []).join("\n"));
  const [visibility, setVisibility] = useState(event?.visibility ?? "public");
  const [status, setStatus] = useState<string>(event?.status ?? "draft");
  const [theme, setTheme] = useState<InviteTheme>(() => inviteTheme(event?.invite_theme, tone, "pro"));
  const [busy, setBusy] = useState(false);
  const isPro = plan === "pro";

  async function changeCover(file: File | undefined) {
    if (!file) return;
    setCoverBusy(true);
    try { setCover(await uploadImage("event-covers", owner, file, t.account.uploadError)); }
    catch (err) { toast.error(err instanceof Error ? err.message : c.error); }
    finally { setCoverBusy(false); }
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    const spots = Math.floor(Number(capacity));
    const amount = paid ? Number(price) : 0;
    const linkOk = !online || /^https:\/\//.test(link.trim());
    if (!title.trim() || !date || !(spots > 0) || !Number.isFinite(amount) || amount < 0 || !linkOk || (endDate && endDate < date)) { toast.error(c.required); return; }
    setBusy(true);
    const row: EvInsert = {
      artist: owner, title: title.trim(), type, category, blurb: blurb.trim(), cover_image: cover,
      date, end_date: endDate || null, start_time: start, end_time: end, timezone,
      city: online ? "Online" : evCity.trim(), venue_name: online ? "" : venue.trim(), address: online ? "" : address.trim(), online_link: online ? link.trim() : "",
      price: amount, capacity: spots, bring: bring.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 12),
      visibility, status, tone, invite_theme: (isPro ? theme : (event?.invite_theme ?? {})) as Json,
    };
    const { error } = event ? await supabase.from("events").update(row).eq("id", event.id) : await supabase.from("events").insert(row);
    setBusy(false);
    if (error) { toast.error(c.error); return; }
    await refreshStudio(qc);
    toast.success(c.saved);
    onClose();
  }

  async function remove() {
    if (!event || !window.confirm(c.deleteConfirm)) return;
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) { toast.error(c.error); return; }
    await refreshStudio(qc);
    onClose();
  }

  const seg = (on: boolean) => cn("flex-1 rounded-full px-4 py-2.5 text-sm", on ? "bg-ink text-wall" : "hover:bg-line");
  const opt = <T extends string>(value: T, current: T, set: (v: T) => void, text: string) => (
    <button type="button" disabled={!isPro} aria-pressed={current === value} onClick={() => set(value)}
      className={cn("chip", current === value && "chip-on", !isPro && "cursor-not-allowed opacity-60")}>{text}</button>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <QButton onClick={onClose} className="btn-ghost !py-2"><ArrowLeft />{c.cancel}</QButton>
        <h2 className="text-2xl">{event ? c.edit : e.add}</h2>
      </div>

      <Panel title={e.basics}>
        <TextField label={e.title} value={title} onChange={setTitle} required maxLength={120} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label={e.type} value={type} onChange={setType} options={eventTypes.map((x) => ({ value: x, label: t.eventTypes[x] ?? x }))} />
          <SelectField label={`${e.category} (${c.optional.toLowerCase()})`} value={category} onChange={setCategory}
            options={[{ value: "", label: "—" }, ...activeEntries(state.taxonomy, "medium").map((m) => ({ value: m.id, label: label(m, lang) }))]} />
        </div>
        <AreaField label={e.description} value={blurb} onChange={setBlurb} rows={5} maxLength={3000} />
        <div>
          <p className="text-sm font-medium">{e.cover}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {cover && <img src={cover} alt="" className="h-32 rounded-xl object-contain" />}
            <label className={cn("btn btn-ghost cursor-pointer !py-2 text-sm", coverBusy && "opacity-60")}>
              <ImagePlus aria-hidden className="size-4" />{coverBusy ? c.saving : e.cover}
              <input type="file" accept="image/*" className="sr-only" onChange={(x) => void changeCover(x.target.files?.[0])} />
            </label>
            {cover && <QButton onClick={() => setCover(null)} className="btn-ghost !py-2 text-sm text-deep-tomato">{c.delete}</QButton>}
          </div>
        </div>
      </Panel>

      <Panel title={e.when}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={e.date} type="date" value={date} onChange={setDate} required />
          <TextField label={`${e.endDate} (${c.optional.toLowerCase()})`} type="date" value={endDate} onChange={setEndDate} />
          <TextField label={e.start} type="time" value={start} onChange={setStart} required />
          <TextField label={e.end} type="time" value={end} onChange={setEnd} required />
        </div>
        <SelectField label={e.timezone} value={timezone} onChange={setTimezone} options={timeZones().map((z) => ({ value: z, label: z.replace(/_/g, " ") }))} />
      </Panel>

      <Panel title={e.where}>
        <div className="flex rounded-full border border-line bg-wall p-1" role="group" aria-label={e.where}>
          <button type="button" aria-pressed={!online} onClick={() => setOnline(false)} className={seg(!online)}>{e.inPerson}</button>
          <button type="button" aria-pressed={online} onClick={() => setOnline(true)} className={seg(online)}>{e.online}</button>
        </div>
        {online ? (
          <TextField label={e.link} hint={e.linkHint} type="url" value={link} onChange={setLink} placeholder="https://" required />
        ) : (
          <>
            <TextField label={e.venue} value={venue} onChange={setVenue} maxLength={100} />
            <TextField label={e.address} value={address} onChange={setAddress} maxLength={160} />
            <TextField label={e.city} value={evCity} onChange={setEvCity} maxLength={80} required />
          </>
        )}
      </Panel>

      <Panel title={e.tickets}>
        <div className="flex rounded-full border border-line bg-wall p-1" role="group" aria-label={e.tickets}>
          <button type="button" aria-pressed={!paid} onClick={() => setPaid(false)} className={seg(!paid)}>{e.free}</button>
          <button type="button" aria-pressed={paid} onClick={() => setPaid(true)} className={seg(paid)}>{e.paid}</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {paid && <TextField label={`${e.price} (USD)`} type="number" min={0} step="0.01" value={price} onChange={setPrice} required />}
          <TextField label={e.capacity} type="number" min={1} step="1" value={capacity} onChange={setCapacity} required />
        </div>
        {paid && <p className="text-sm text-stone">{e.paidSoon}</p>}
        <AreaField label={e.bring} hint={e.bringHint} value={bring} onChange={setBring} rows={3} />
        <p className="text-sm text-stone">{e.refund}</p>
      </Panel>

      <Panel title={e.invite} hint={isPro ? e.themePro : e.themeFree} badge={<ProBadge />}>
        <fieldset disabled={!isPro} className="space-y-4">
          <div>
            <p className="text-sm font-medium">{e.themeOptions.background}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {inviteBackgrounds.map((bg) => (
                <button key={bg} type="button" aria-pressed={theme.background === bg} onClick={() => setTheme({ ...theme, background: bg })} title={bg}
                  style={themeColors(bg)} className={cn("h-10 w-10 rounded-xl border", theme.background === bg ? "ring-2 ring-ink ring-offset-2 ring-offset-card" : "border-line", !isPro && "cursor-not-allowed opacity-60")}>
                  <span className="sr-only">{bg}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2"><span className="w-28 text-sm font-medium">{e.themeOptions.titleStyle}</span>
            {opt("classic", theme.titleStyle, (v) => setTheme({ ...theme, titleStyle: v }), e.themeOptions.classic)}
            {opt("modern", theme.titleStyle, (v) => setTheme({ ...theme, titleStyle: v }), e.themeOptions.modern)}</div>
          <div className="flex flex-wrap items-center gap-2"><span className="w-28 text-sm font-medium">{e.themeOptions.layout}</span>
            {opt("stacked", theme.layout, (v) => setTheme({ ...theme, layout: v }), e.themeOptions.stacked)}
            {opt("poster", theme.layout, (v) => setTheme({ ...theme, layout: v }), e.themeOptions.poster)}</div>
          <div className="flex flex-wrap items-center gap-2"><span className="w-28 text-sm font-medium">{e.themeOptions.effect}</span>
            {opt("none", theme.effect, (v) => setTheme({ ...theme, effect: v }), e.themeOptions.none)}
            {opt("confetti", theme.effect, (v) => setTheme({ ...theme, effect: v }), e.themeOptions.confetti)}</div>
        </fieldset>
        {!isPro && <p className="text-sm">{c.pro.locked}</p>}
      </Panel>

      <Panel title={e.visibility}>
        <div role="radiogroup" aria-label={e.visibility} className="grid gap-2 sm:grid-cols-2">
          {(["public", "unlisted"] as const).map((v) => (
            <button key={v} type="button" role="radio" aria-checked={visibility === v} onClick={() => setVisibility(v)}
              className={cn("rounded-xl border px-4 py-3 text-left text-sm", visibility === v ? "border-ink bg-ink text-wall" : "border-line bg-wall hover:border-ink")}>{e[v]}</button>
          ))}
        </div>
        <div role="radiogroup" aria-label={e.status} className="flex flex-wrap gap-2">
          {eventStatuses.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={status === s} onClick={() => setStatus(s)} className={cn("chip", status === s && "chip-on")}>{e.statuses[s]}</button>
          ))}
        </div>
      </Panel>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-line bg-card/95 p-3 backdrop-blur">
        <span>{event && <QButton onClick={() => void remove()} className="btn-ghost !py-2 text-deep-tomato"><Trash2 />{c.delete}</QButton>}</span>
        <SaveButton busy={busy || coverBusy} />
      </div>
    </form>
  );
}
