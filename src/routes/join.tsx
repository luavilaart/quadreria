import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Credentials } from "@/components/q/Credentials";
import { QButton } from "@/components/q/QButton";
import { useAccount, completeRegistration } from "@/components/q/AccountProvider";
import { toast } from "sonner";
import { LangSwitch } from "@/components/q/Shell";
import { copyFor, langOf, useFormat, useT } from "@/i18n";
import { Wordmark } from "@/components/q/Wordmark";
import { Art } from "@/components/q/Art";
import { mediums, roomColors, cities, type RoomColor } from "@/data/sample";

export const Route = createFileRoute("/join")({
  head: ({ match }) => { const t = copyFor(langOf(match.context)); return { meta: [
    { title: t.meta.joinTitle }, { name: "description", content: t.meta.joinDescription },
    { property: "og:title", content: t.meta.joinShareTitle }, { property: "og:description", content: t.meta.joinShare },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }; },
  component: Join,
});

type Role = "artist" | "collector";
// Stored ids for "what do you want to do here"; labels come from the copy.
const wants = ["sell", "portfolio", "services", "events"] as const;

function Join() {
  const t = useT(); const f = useFormat();
  const [role, setRole] = useState<Role>();
  const [i, setI] = useState(0);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [meds, setMeds] = useState<string[]>([]);
  const [want, setWant] = useState<string[]>([]);
  const [room, setRoom] = useState<RoomColor>("blush");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState("");
  const [city, setCity] = useState("");
  const { user, refresh } = useAccount();
  const [photoFile,setPhotoFile]=useState<File>();
  const [photo, setPhoto] = useState<string>();

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const inp = "w-full rounded-2xl border border-line bg-card px-5 py-4 text-lg";
  const Big = ({ on, onClick, children }: { on?: boolean; onClick: () => void; children: ReactNode }) => (
    <QButton onClick={onClick} aria-pressed={on} className={`!block w-full rounded-2xl border px-5 py-5 text-left text-lg transition ${on ? "border-ink bg-ink text-wall" : "border-line bg-card hover:border-ink"}`}>{children}</QButton>
  );
  const Chips = ({ list, sel, set }: { list: string[]; sel: string[]; set: (v: string[]) => void }) => (
    <div className="flex flex-wrap gap-2">{list.map((m) => <QButton key={m} onClick={() => toggle(sel, set, m)} aria-pressed={sel.includes(m)} className={`chip !px-4 !py-3 text-base ${sel.includes(m) ? "chip-on" : ""}`}>{f.medium(m)}</QButton>)}</div>
  );

  const roleStep = { q: t.account.quiz.role, ok: !!role, body: (
    <div className="space-y-3">
      <Big on={role === "artist"} onClick={() => { setRole("artist"); setI(1); }}><b className="font-display text-2xl">{t.account.quiz.artist}</b><br /><span className="text-sm opacity-75">{t.account.quiz.artistNote}</span></Big>
      <Big on={role === "collector"} onClick={() => { setRole("collector"); setI(1); }}><b className="font-display text-2xl">{t.account.quiz.collector}</b><br /><span className="text-sm opacity-75">{t.account.quiz.collectorNote}</span></Big>
    </div>) };

  const registration = {role: role ?? "collector", name, handle, city, mediums: meds, room, bio, wants: want, links: links.split("\n").filter(Boolean).map(url=>({label:url,url:url.startsWith("https://")?url:`https://${url}`}))};
  const accountStep = {q:t.account.complete,ok:false,body:user?<QButton className="btn-primary w-full" onClick={async()=>{try{await completeRegistration(registration);await refresh();setI(i+1);}catch(e){toast.error(e instanceof Error?e.message:t.account.error);}}}>{t.account.create}</QButton>:<Credentials registration={registration} photo={photoFile} next={role==="artist"?"/studio":"/discover"} onSuccess={()=>{void refresh();setI(i+1);}}/>};
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
    { q: t.account.quiz.make, ok: meds.length > 0, body: <Chips list={mediums} sel={meds} set={setMeds} /> },
    { q: t.account.quiz.wants, ok: want.length > 0, body: <div className="space-y-3">{wants.map((w) => <Big key={w} on={want.includes(w)} onClick={() => toggle(want, setWant, w)}>{t.account.quiz.wantOptions[w]}</Big>)}</div> },
    { q: t.account.quiz.color, ok: true, body: (
      <div className="grid grid-cols-4 gap-3">{roomColors.map((c) => (
        <QButton key={c.id} onClick={() => setRoom(c.id)} aria-pressed={room === c.id} className="!block !p-0 text-center">
          <span className={`room-${c.id} block w-full aspect-square rounded-2xl border bg-room ${room === c.id ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-wall" : "border-line"}`} />
          <span className="mt-1 block text-xs">{t.roomColors[c.id]}</span>
        </QButton>))}</div>) },
    { q: t.account.quiz.bio, ok: bio.length > 0, body: <textarea className={inp} rows={4} maxLength={200} placeholder={t.account.quiz.bioPlaceholder} value={bio} onChange={(e) => setBio(e.target.value)} /> },
    { q: t.account.quiz.links, ok: true, body: <textarea className={inp} rows={3} placeholder={t.account.quiz.linksPlaceholder} value={links} onChange={(e) => setLinks(e.target.value)} /> },
    { q: t.account.city, ok: !!city, body: <div className="space-y-3">{cities.map(c => <Big key={c} on={city===c} onClick={()=>setCity(c)}>{f.city(c)}</Big>)}</div> },
    accountStep,
    { q: t.account.quiz.ready, ok: true, done: true, body: (
      <div className={`room-${room} rounded-2xl bg-room p-6 text-room-fg`}>
        <p className="label opacity-70">@{handle || t.account.quiz.you}</p>
        <h2 className="mt-1 text-4xl">{name || t.account.quiz.namePlaceholder}</h2>
        <p className="mt-2 opacity-85">{bio || t.account.quiz.bioEmpty}</p>
        <div className="mt-5 grid grid-cols-3 items-end gap-3"><Art ratio={4 / 5} tone="cream" shape={0} /><Art ratio={1} tone="butter" shape={2} /><Art ratio={2 / 3} tone="sky" shape={1} /></div>
        <p className="label mt-5 opacity-70">{meds.map(f.medium).join(" · ")}</p>
      </div>) },
  ];
  const collector = [
    { q: t.account.quiz.collectorName, ok: !!name, body: <input className={inp} placeholder={t.account.quiz.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} /> },
    { q: t.account.quiz.loves, ok: meds.length > 0, body: <Chips list={mediums} sel={meds} set={setMeds} /> },
    { q: t.account.quiz.where, ok: !!city, body: <div className="space-y-3">{[...cities, t.account.quiz.elsewhere].map((c) => <Big key={c} on={city === c} onClick={() => setCity(c)}>{f.city(c)}</Big>)}</div> },
    accountStep,
    { q: `${t.account.quiz.welcome}${name ? `, ${name.split(" ")[0]}` : ""}.`, ok: true, done: true, body: <p className="text-lg text-stone">{t.account.quiz.welcomeCopy}</p> },
  ];
  const steps = [roleStep, ...(role === "collector" ? collector : artist)];
  const s = steps[i] ?? roleStep;
  const done = "done" in s && s.done;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="mx-auto w-full max-w-lg px-5 pt-5">
        <div className="flex items-center justify-between"><Link to="/" className="text-2xl"><Wordmark /></Link><div className="flex items-center gap-3"><LangSwitch /><span className="label text-stone">{i + 1} / {role ? steps.length : "—"}</span></div></div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-tomato transition-all" style={{ width: `${((i + 1) / (role ? steps.length : 8)) * 100}%` }} /></div>
      </header>
      <main key={i} className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-10 animate-in fade-in slide-in-from-right-4">
        <h1 className="text-4xl leading-tight">{s.q}</h1>
        <div className="mt-8 flex-1">{s.body}</div>
        <div className="sticky bottom-0 flex gap-3 bg-wall py-4">
          {i > 0 && <QButton onClick={() => setI(i - 1)} className="btn btn-ghost">{t.account.quiz.back}</QButton>}
          {done ? <Link to={role === "artist" ? "/studio" : "/discover"} className="btn btn-primary flex-1">{role === "artist" ? t.account.quiz.studio : t.account.quiz.explore}</Link>
            : i > 0 && <QButton disabled={!s.ok} onClick={() => setI(i + 1)} className="btn btn-primary flex-1 disabled:opacity-40">{t.account.quiz.next}</QButton>}
        </div>
      </main>
    </div>
  );
}
