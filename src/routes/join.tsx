import {LinkEditor,resolveLinks,type LinkDraft} from '@/components/q/LinkEditor';
import {featureCopy} from '@/i18n/features';
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {useTaxonomy} from "@/components/q/TaxonomyProvider";
import { Credentials } from "@/components/q/Credentials";
import {activeEntries,label} from "@/data/taxonomy";
import { QButton } from "@/components/q/QButton";
import { useAccount, completeRegistration } from "@/components/q/AccountProvider";
import { toast } from "sonner";
import { useFormat, useT } from "@/i18n";
import { Wordmark } from "@/components/q/Wordmark";
import { Art } from "@/components/q/Art";
import { RoomPreview } from "@/components/q/RoomPreview";
import { CityPicker } from "@/components/q/CityPicker";
import { normalizeCity } from "@/data/places";
import { X } from "lucide-react";
import { roomColors, cities, type RoomColor } from "@/data/sample";

export const Route = createFileRoute("/join")({
  // ?role=artist or ?role=collector skips the first question (used by the home "Start here" card).
  validateSearch: (s: Record<string, unknown>): { role?: "artist" | "collector" } =>
    s["role"] === "artist" || s["role"] === "collector" ? { role: s["role"] } : {},
  head: () => ({ meta: [
    { title: "Join quadreria — open your room" }, { name: "description", content: "A quick, friendly quiz to set up your Artist room or Collector profile." },
    { property: "og:title", content: "Join quadreria" }, { property: "og:description", content: "Open your room in a few taps." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Join,
});

type Role = "artist" | "collector";
// Stored ids for "what do you want to do here"; labels come from the copy.
const wants = ["sell", "portfolio", "services", "events"] as const;

function Join() {
  const {state,lang,c}=useTaxonomy();
  const t = useT(); const f = useFormat();
  const mediumOptions=activeEntries(state.taxonomy,"medium").map(t=>label(t,lang));
  const { role: chosenRole } = Route.useSearch();
  const [role, setRole] = useState<Role | undefined>(chosenRole);
  const [i, setI] = useState(chosenRole ? 1 : 0);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [meds, setMeds] = useState<string[]>([]);
  const [want, setWant] = useState<string[]>([]);
  const [room, setRoom] = useState<RoomColor>("blush");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<LinkDraft[]>([]);
  const [marketing,setMarketing]=useState(false);
  const [city, setCity] = useState("");
  const { user, refresh } = useAccount();
  const navigate=useNavigate();
  async function enterStudio(){const saved=sessionStorage.getItem('quadreria-next');sessionStorage.removeItem('quadreria-next');await navigate({to:saved?.startsWith('/')&&!saved.startsWith('//')?saved:'/studio'});}
  const [photoFile,setPhotoFile]=useState<File>();
  const [photo, setPhoto] = useState<string>();
  const [popOpen, setPopOpen] = useState(true);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const inp = "w-full rounded-2xl border border-line bg-card px-5 py-4 text-lg";
  const Big = ({ on, onClick, children }: { on?: boolean; onClick: () => void; children: ReactNode }) => (
    <QButton onClick={onClick} aria-pressed={on} className={`!block w-full rounded-2xl border px-5 py-5 text-left text-lg transition ${on ? "border-ink bg-ink text-wall" : "border-line bg-card hover:border-ink"}`}>{children}</QButton>
  );
  const Chips = ({ list, sel, set }: { list: string[]; sel: string[]; set: (v: string[]) => void }) => (
    <div className="flex flex-wrap gap-2">{list.map((m) => <QButton key={m} onClick={() => toggle(sel, set, m)} aria-pressed={sel.includes(m)} className={`chip !px-4 !py-3 text-base ${sel.includes(m) ? "chip-on" : ""}`}>{m}</QButton>)}</div>
  );

  const roleStep = { q: t.account.quiz.role, ok: !!role, body: (
    <div className="space-y-3">
      <Big on={role === "artist"} onClick={() => { setRole("artist"); setI(1); }}><b className="font-display text-2xl">{t.account.quiz.artist}</b><br /><span className="text-sm opacity-75">{t.account.quiz.artistNote}</span></Big>
      <Big on={role === "collector"} onClick={() => { setRole("collector"); setI(1); }}><b className="font-display text-2xl">{t.account.quiz.collector}</b><br /><span className="text-sm opacity-75">{t.account.quiz.collectorNote}</span></Big>
    </div>) };


  // Mediums are picked by label in the current language; accounts store the English name.
  const mediumsEn = meds.map(m => { const e = activeEntries(state.taxonomy,"medium").find(x => label(x,lang) === m); return e ? label(e,"en") : m; });
  const registration = {role: role ?? "collector", name, handle, city: normalizeCity(city), mediums: mediumsEn, room, bio, wants: want, links: resolveLinks(links).filter((l):l is NonNullable<typeof l>=>l!==null),medium_ids:meds.map(m=>activeEntries(state.taxonomy,"medium").find(x=>label(x,lang)===m)?.id??m),marketing_opt_in:marketing};
  const newsletter=<label className="mb-5 flex items-start gap-3 text-sm"><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} className="mt-1 shrink-0 accent-tomato"/><span>{featureCopy[lang].marketing}</span></label>;
  const accountStep = {q:t.account.complete,ok:false,body:<>{newsletter}{user?<QButton className="btn-primary w-full" onClick={async()=>{try{await completeRegistration(registration);await refresh();setI(i+1);}catch(e){toast.error(e instanceof Error?e.message:t.account.error);}}}>{t.account.create}</QButton>:<Credentials registration={registration} photo={photoFile} next="/studio" onSuccess={()=>{void refresh();setI(i+1);}}/>}</>};
  const artist = [
    { q: t.account.quiz.name, ok: !!name && !!handle, body: (<div className="space-y-3">
      <input className={inp} placeholder={t.account.quiz.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
      <div className="relative"><span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone">quadreria.art/a/</span>
        <input className={`${inp} pl-[9.5rem]`} placeholder={t.account.quiz.handlePlaceholder} value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} /></div>
    </div>) },
    { q: t.account.quiz.photo, ok: true, body: (
      <label className="flex aspect-square w-48 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line bg-card text-stone">
        {photo ? <img src={photo} alt={t.account.quiz.profileAlt} className="h-full w-full object-cover" /> : t.account.quiz.upload}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) {setPhotoFile(f);setPhoto(URL.createObjectURL(f));} }} />
      </label>) },
    { q: t.account.quiz.make, ok: meds.length > 0, body: <Chips list={mediumOptions} sel={meds} set={v=>{if(role==="artist"&&v.length>state.settings.free.max_mediums){toast.error(c.limitError);return;}setMeds(v);}} /> },
    { q: t.account.quiz.wants, ok: want.length > 0, body: <div className="space-y-3">{wants.map((w) => <Big key={w} on={want.includes(w)} onClick={() => toggle(want, setWant, w)}>{t.account.quiz.wantOptions[w]}</Big>)}</div> },
    { q: t.account.quiz.color, ok: true, body: (
      <div className="grid grid-cols-4 gap-3">{roomColors.map((c) => (
        <QButton key={c.id} onClick={() => setRoom(c.id)} aria-pressed={room === c.id} className="!block !p-0 text-center">
          <span className={`room-${c.id} block w-full aspect-square rounded-2xl border bg-room ${room === c.id ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-wall" : "border-line"}`} />
          <span className="mt-1 block text-xs">{t.roomColors[c.id]}</span>
        </QButton>))}</div>) },
    { q: t.account.quiz.bio, ok: bio.length > 0, body: <textarea className={inp} rows={4} maxLength={200} placeholder={t.account.quiz.bioPlaceholder} value={bio} onChange={(e) => setBio(e.target.value)} /> },
    { q: t.account.quiz.links, ok: resolveLinks(links).every(Boolean), body: <><LinkEditor value={links} onChange={setLinks}/>{resolveLinks(links).some(l=>!l)&&<p role="alert" className="mt-3 text-stone">{featureCopy[lang].linkInvalid}</p>}</> },
    { q: t.account.city, ok: normalizeCity(city).length >= 2, body: <CityPicker value={city} onChange={setCity} /> },
    accountStep,
    { q: t.account.quiz.ready, ok: true, done: true, preview: true, body: (
      <>
        <p className="-mt-4 mb-6 text-stone">{t.preview.readySub}</p>
        <RoomPreview data={{ name, handle, city: normalizeCity(city), bio, room, photo, mediums: meds, links: resolveLinks(links).filter((l): l is NonNullable<typeof l> => l !== null) }} height="h-[min(560px,62dvh)]" />
      </>) },
  ];
  const collector = [
    { q: t.account.quiz.loves, ok: meds.length > 0, body: <Chips list={mediumOptions} sel={meds} set={setMeds} /> },
    accountStep,
    { q: `${t.account.quiz.welcome}${name ? `, ${name.split(" ")[0]}` : ""}.`, ok: true, done: true, body: <p className="text-lg text-stone">{t.account.quiz.welcomeCopy}</p> },
  ];
  const steps = [roleStep, ...(role === "collector" ? collector : artist)];
  const s = steps[i] ?? roleStep;
  const done = "done" in s && s.done;
  // The artist's last step shows their room with a pop-up pointing to the Studio.
  const showPop = "preview" in s && !!s.preview && popOpen;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="mx-auto w-full max-w-lg px-5 pt-5">
        <div className="flex items-center justify-between"><Link to="/" className="text-2xl"><Wordmark /></Link><span className="label text-stone">{i + 1} / {role ? steps.length : "—"}</span></div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-tomato transition-all" style={{ width: `${((i + 1) / (role ? steps.length : 8)) * 100}%` }} /></div>
      </header>
      <main key={i} className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-10 animate-in fade-in slide-in-from-right-4">
        <h1 className="text-4xl leading-tight">{s.q}</h1>
        <div className="mt-8 flex-1">{s.body}</div>
        {showPop ? (
          <div role="dialog" aria-modal="false" aria-labelledby="room-pop-title" className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-lg rounded-3xl bg-ink p-5 text-wall animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p id="room-pop-title" className="font-display text-2xl">{t.preview.popTitle}</p>
                <p className="mt-1 text-sm opacity-85">{t.preview.popBody}</p>
              </div>
              <QButton aria-label={t.preview.close} title={t.preview.close} onClick={() => setPopOpen(false)} className="-mr-2 -mt-2 !h-11 !w-11 shrink-0 !p-0 text-wall"><X className="!size-5" /></QButton>
            </div>
            <div className="mt-4 flex gap-3">
              {user ? <QButton onClick={() => void enterStudio()} className="btn-primary flex-1">{t.preview.popEdit}</QButton>
                : <Link to="/auth" search={{ next: "/studio" }} className="btn btn-primary flex-1">{t.preview.popEdit}</Link>}
              <QButton onClick={() => setPopOpen(false)} className="btn-ghost text-wall">{t.preview.popLater}</QButton>
            </div>
          </div>
        ) : <div className="sticky bottom-0 flex gap-3 bg-wall py-4">
          {i > 0 && <QButton onClick={() => setI(i - 1)} className="btn btn-ghost">{t.account.quiz.back}</QButton>}
          {done ? user?<QButton onClick={()=>void enterStudio()} className="btn btn-primary flex-1">{t.account.quiz.studio}</QButton>:<Link to="/discover" className="btn btn-primary flex-1">{t.account.quiz.explore}</Link>
            : i > 0 && <QButton disabled={!s.ok} onClick={() => setI(i + 1)} className="btn btn-primary flex-1 disabled:opacity-40">{t.account.quiz.next}</QButton>}
        </div>}
      </main>
    </div>
  );
}
