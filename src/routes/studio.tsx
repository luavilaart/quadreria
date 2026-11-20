import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, SampleBadge } from "@/components/q/Shell";
import { Art } from "@/components/q/Art";
import { piecesBy, servicesBy, eventsBy, fmtDate, usd, roomColors } from "@/data/sample";

export const Route = createFileRoute("/studio")({
  head: () => ({ meta: [
    { title: "Studio — quadreria" }, { name: "description", content: "Manage your room, products, services, events, orders and payouts." },
    { property: "og:title", content: "Artist studio — quadreria" }, { property: "og:description", content: "Your room's back office." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Studio,
});

const tabs = ["Edit room", "Products", "Collections", "Services", "Events", "Orders", "Payouts"] as const;
const attendees = ["Ana M.", "Carlos R.", "Dani P.", "Fer L.", "Gabi S.", "Iris T."];

function Studio() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Edit room");
  const h = "mara";
  const [checked, setChecked] = useState<string[]>([]);
  const card = "rounded-2xl border border-line bg-card p-5";
  return (
    <Page>
      <div className="mx-auto max-w-5xl px-5 pt-10">
        <SampleBadge />
        <h1 className="mt-3 text-4xl">Hi, Mara.</h1>
        <p className="text-stone">Here's your studio. Everything below is sample data.</p>
        <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5">
          {tabs.map((x) => <button key={x} onClick={() => setTab(x)} aria-pressed={tab === x} className={`chip ${tab === x ? "chip-on" : ""}`}>{x}</button>)}
        </div>
        <div className="mt-8 space-y-3">
          {tab === "Edit room" && <div className={card}>
            <p className="label text-stone">Wall color</p>
            <div className="mt-3 flex flex-wrap gap-2">{roomColors.map((c) => <span key={c.id} className={`room-${c.id} h-10 w-10 rounded-xl border border-line bg-room`} title={c.name} />)}</div>
            <p className="label mt-6 text-stone">Sections</p>
            <ul className="mt-2 divide-y divide-line">{["Entrance", "Work wall", "Shop", "Services", "Events", "About", "Links", "FAQ", "Contact"].map((s) => <li key={s} className="flex justify-between py-3"><span>{s}</span><span className="text-sm text-stone">Edit</span></li>)}</ul>
          </div>}
          {tab === "Products" && piecesBy(h).map((p) => <div key={p.id} className={`${card} flex items-center gap-4`}><div className="w-14"><Art ratio={p.ratio} tone={p.tone} shape={p.shape} /></div><div className="flex-1"><h3>{p.title}</h3><p className="text-sm text-stone">{p.medium}</p></div><span className="font-medium">{usd(p.price)}</span></div>)}
          {tab === "Collections" && [...new Set(piecesBy(h).map((p) => p.collection))].map((c) => <div key={c} className={card}><h3 className="text-xl">{c}</h3><p className="text-sm text-stone">{piecesBy(h).filter((p) => p.collection === c).length} pieces</p></div>)}
          {tab === "Services" && servicesBy(h).map((s) => <div key={s.id} className={card}><h3 className="text-xl">{s.title}</h3><p className="text-sm text-stone">{s.price}</p></div>)}
          {tab === "Events" && eventsBy(h).map((e) => <div key={e.id} className={card}>
            <div className="flex items-start justify-between gap-3"><div><h3 className="text-xl">{e.title}</h3><p className="text-sm text-stone">{fmtDate(e.date)} · {e.capacity - e.spots} going</p></div><button className="btn btn-primary !px-4 !py-2 text-sm">Check in · QR</button></div>
            <p className="label mt-5 text-stone">Attendees</p>
            <ul className="mt-2 divide-y divide-line">{attendees.map((n) => <li key={n} className="flex items-center justify-between py-2.5"><span>{n}</span>
              <button onClick={() => setChecked((c) => c.includes(n) ? c.filter((x) => x !== n) : [...c, n])} className={`chip !py-1 text-xs ${checked.includes(n) ? "chip-on" : ""}`}>{checked.includes(n) ? "Checked in" : "Check in"}</button></li>)}</ul>
          </div>)}
          {tab === "Orders" && [["#1042", "Mango study", "Paid · ship by Nov 24"], ["#1041", "Two chairs", "Shipped"]].map(([n, p, s]) => <div key={n} className={`${card} flex justify-between`}><div><h3>{p}</h3><p className="text-sm text-stone">{n}</p></div><span className="text-sm">{s}</span></div>)}
          {tab === "Payouts" && <div className={card}><p className="label text-stone">Next payout</p><p className="font-display mt-1 text-4xl">$465</p><p className="mt-2 text-sm text-stone">Payouts will be connected in a later version.</p></div>}
        </div>
      </div>
    </Page>
  );
}
