import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark } from "@/components/q/Wordmark";
import { Art } from "@/components/q/Art";
import { mediums, roomColors, cities, type RoomColor } from "@/data/sample";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [
    { title: "Join quadreria — open your room" }, { name: "description", content: "A quick, friendly quiz to set up your Artist room or Collector profile." },
    { property: "og:title", content: "Join quadreria" }, { property: "og:description", content: "Open your room in a few taps." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Join,
});

type Role = "artist" | "collector";
const wants = ["Sell my art", "Show my portfolio", "Offer services", "Host events"];

function Join() {
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
  const [photo, setPhoto] = useState<string>();

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const inp = "w-full rounded-2xl border border-line bg-card px-5 py-4 text-lg";
  const Big = ({ on, onClick, children }: { on?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} aria-pressed={on} className={`w-full rounded-2xl border px-5 py-5 text-left text-lg transition ${on ? "border-ink bg-ink text-wall" : "border-line bg-card hover:border-ink"}`}>{children}</button>
  );
  const Chips = ({ list, sel, set }: { list: string[]; sel: string[]; set: (v: string[]) => void }) => (
    <div className="flex flex-wrap gap-2">{list.map((m) => <button key={m} onClick={() => toggle(sel, set, m)} aria-pressed={sel.includes(m)} className={`chip !px-4 !py-3 text-base ${sel.includes(m) ? "chip-on" : ""}`}>{m}</button>)}</div>
  );

  const roleStep = { q: "I'm here as…", ok: !!role, body: (
    <div className="space-y-3">
      <Big on={role === "artist"} onClick={() => { setRole("artist"); setI(1); }}><b className="font-display text-2xl">An Artist</b><br /><span className="text-sm opacity-75">I make things and want a room.</span></Big>
      <Big on={role === "collector"} onClick={() => { setRole("collector"); setI(1); }}><b className="font-display text-2xl">A Collector</b><br /><span className="text-sm opacity-75">I'm here to find art and artists.</span></Big>
    </div>) };

  const artist = [
    { q: "What should we call you?", ok: !!name && !!handle, body: (<div className="space-y-3">
      <input className={inp} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="relative"><span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone">quadreria.art/a/</span>
        <input className={`${inp} pl-[9.5rem]`} placeholder="handle" value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} /></div>
    </div>) },
    { q: "Add a profile photo", ok: true, body: (
      <label className="flex aspect-square w-48 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line bg-card text-stone">
        {photo ? <img src={photo} alt="Your profile" className="h-full w-full object-cover" /> : "Tap to upload"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
      </label>) },
    { q: "What do you make?", ok: meds.length > 0, body: <Chips list={mediums} sel={meds} set={setMeds} /> },
    { q: "What do you want to do here?", ok: want.length > 0, body: <div className="space-y-3">{wants.map((w) => <Big key={w} on={want.includes(w)} onClick={() => toggle(want, setWant, w)}>{w}</Big>)}</div> },
    { q: "Pick your wall color", ok: true, body: (
      <div className="grid grid-cols-4 gap-3">{roomColors.map((c) => (
        <button key={c.id} onClick={() => setRoom(c.id)} aria-pressed={room === c.id} className="text-center">
          <span className={`room-${c.id} block aspect-square rounded-2xl border bg-room ${room === c.id ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-wall" : "border-line"}`} />
          <span className="mt-1 block text-xs">{c.name}</span>
        </button>))}</div>) },
    { q: "Tell Collectors about you", ok: bio.length > 0, body: <textarea className={inp} rows={4} maxLength={200} placeholder="One or two sentences. Keep it you." value={bio} onChange={(e) => setBio(e.target.value)} /> },
    { q: "Where else can we find you?", ok: true, body: <textarea className={inp} rows={3} placeholder="Instagram, website, one per line" value={links} onChange={(e) => setLinks(e.target.value)} /> },
    { q: "Your room is ready", ok: true, done: true, body: (
      <div className={`room-${room} rounded-2xl bg-room p-6 text-room-fg`}>
        <p className="label opacity-70">@{handle || "you"}</p>
        <h2 className="mt-1 text-4xl">{name || "Your name"}</h2>
        <p className="mt-2 opacity-85">{bio || "Your bio goes here."}</p>
        <div className="mt-5 grid grid-cols-3 items-end gap-3"><Art ratio={4 / 5} tone="cream" shape={0} /><Art ratio={1} tone="butter" shape={2} /><Art ratio={2 / 3} tone="sky" shape={1} /></div>
        <p className="label mt-5 opacity-70">{meds.join(" · ")}</p>
      </div>) },
  ];
  const collector = [
    { q: "What's your name?", ok: !!name, body: <input className={inp} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} /> },
    { q: "What do you love?", ok: meds.length > 0, body: <Chips list={mediums} sel={meds} set={setMeds} /> },
    { q: "Where are you?", ok: !!city, body: <div className="space-y-3">{[...cities, "Somewhere else"].map((c) => <Big key={c} on={city === c} onClick={() => setCity(c)}>{c}</Big>)}</div> },
    { q: `Welcome in${name ? `, ${name.split(" ")[0]}` : ""}.`, ok: true, done: true, body: <p className="text-lg text-stone">We'll show you rooms full of {meds.slice(0, 2).join(" and ").toLowerCase() || "art"} first.</p> },
  ];
  const steps = [roleStep, ...(role === "collector" ? collector : artist)];
  const s = steps[i]!;
  const done = "done" in s && s.done;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="mx-auto w-full max-w-lg px-5 pt-5">
        <div className="flex items-center justify-between"><Link to="/" className="text-2xl"><Wordmark /></Link><span className="label text-stone">{i + 1} / {role ? steps.length : "—"}</span></div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-tomato transition-all" style={{ width: `${((i + 1) / (role ? steps.length : 8)) * 100}%` }} /></div>
      </header>
      <main key={i} className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-10 animate-in fade-in slide-in-from-right-4">
        <h1 className="text-4xl leading-tight">{s.q}</h1>
        <div className="mt-8 flex-1">{s.body}</div>
        <div className="sticky bottom-0 flex gap-3 bg-wall py-4">
          {i > 0 && <button onClick={() => setI(i - 1)} className="btn btn-ghost">Back</button>}
          {done ? <Link to={role === "artist" ? "/studio" : "/discover"} className="btn btn-primary flex-1">{role === "artist" ? "Go to my studio" : "Start exploring"}</Link>
            : i > 0 && <button disabled={!s.ok} onClick={() => setI(i + 1)} className="btn btn-primary flex-1 disabled:opacity-40">Next</button>}
        </div>
      </main>
    </div>
  );
}
