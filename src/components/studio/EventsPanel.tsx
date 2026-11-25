import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, ExternalLink, Pencil, Plus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QButton } from "@/components/q/QButton";
import { asRoomColor, groupEvents, refreshStudio } from "@/lib/artist-studio";
import { inviteUrl } from "@/lib/invite";
import { usePlan } from "@/lib/plan";
import type { StudioData } from "@/lib/studio";
import { useFormat } from "@/i18n";
import { useStudioCopy } from "@/i18n/studio";
import { cn } from "@/lib/utils";
import { EventEditor } from "./EventEditor";
import { Empty, Panel, ProLock } from "./ui";

type Ev = StudioData["events"][number];

/** Events: lists by upcoming, drafts and past; each with guests, invite link and (Pro) stats. */
export function EventsPanel({ data, owner }: { data: StudioData; owner: string }) {
  const c = useStudioCopy();
  const plan = usePlan();
  const [editing, setEditing] = useState<Ev | "new" | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const tone = asRoomColor(data.room?.room_color);

  if (editing) {
    return <EventEditor key={editing === "new" ? "new" : editing.id} event={editing === "new" ? null : editing} owner={owner} tone={tone}
      city={data.profile?.city ?? ""} plan={plan} onClose={() => setEditing(null)} />;
  }

  const groups = groupEvents(data.events);
  const list = (title: string, events: Ev[]) => events.length > 0 && (
    <div>
      <h3 className="label mb-2 text-stone">{title}</h3>
      <ul className="space-y-3">
        {events.map((ev) => <EventRow key={ev.id} ev={ev} data={data} plan={plan} expanded={open === ev.id}
          onToggle={() => setOpen(open === ev.id ? null : ev.id)} onEdit={() => setEditing(ev)} />)}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6">
      <Panel title={c.nav.events} hint={c.events.intro} badge={<QButton onClick={() => setEditing("new")} className="btn-primary !py-2"><Plus />{c.events.add}</QButton>}>
        {data.events.length === 0 ? <Empty>{c.events.empty}</Empty> : (
          <div className="space-y-6">
            {list(c.events.upcoming, groups.upcoming)}
            {list(c.events.drafts, groups.drafts)}
            {list(c.events.past, groups.past)}
          </div>
        )}
      </Panel>
      <ProLock title={c.events.followUps} items={c.events.followUpsList}><p className="mt-3 text-sm text-stone">{c.events.followUpsSoon}</p></ProLock>
    </div>
  );
}

function EventRow({ ev, data, plan, expanded, onToggle, onEdit }: { ev: Ev; data: StudioData; plan: "free" | "pro"; expanded: boolean; onToggle: () => void; onEdit: () => void }) {
  const c = useStudioCopy();
  const f = useFormat();
  const qc = useQueryClient();
  const guests = data.tickets.filter((tk) => tk.event === ev.id && tk.status !== "cancelled");
  const going = guests.filter((g) => g.status === "reserved" || g.status === "checked in").length;
  const shareable = ev.status === "published";
  const url = typeof window === "undefined" ? `/invite/${ev.id}` : inviteUrl(window.location.origin, ev.id);

  async function copy() {
    try { await navigator.clipboard.writeText(url); toast.success(c.events.copied); } catch { toast.error(c.error); }
  }
  async function checkIn(id: string) {
    const { error } = await supabase.rpc("check_in_ticket", { ticket_id: id });
    if (error) { toast.error(error.message); return; }
    await refreshStudio(qc);
  }

  return (
    <li className="rounded-2xl border border-line bg-wall">
      <div className="flex items-center gap-4 p-4">
        <div className={`room-${asRoomColor(ev.tone)} flex w-16 shrink-0 flex-col items-center rounded-xl border border-line bg-room py-2 text-room-fg`}>
          <span className="label">{f.date(ev.date, { month: "short" })}</span>
          <span className="font-display text-2xl leading-none">{f.date(ev.date, { day: "numeric" })}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-lg leading-tight">{ev.title}</p>
          <p className="text-sm text-stone">
            {c.events.statuses[ev.status as keyof typeof c.events.statuses] ?? ev.status} · {f.eventType(ev.type)} · {f.price(Number(ev.price))} · {going}/{ev.capacity}
            {ev.visibility === "unlisted" ? ` · ${c.events.unlisted.split(":")[0]}` : ""}
          </p>
        </div>
        <QButton aria-label={`${c.events.guests}: ${ev.title}`} aria-expanded={expanded} onClick={onToggle} className="!h-10 !w-10 !p-0"><Users /></QButton>
        <QButton aria-label={`${c.edit}: ${ev.title}`} onClick={onEdit} className="!h-10 !w-10 !p-0"><Pencil /></QButton>
      </div>
      {expanded && (
        <div className="space-y-5 border-t border-line p-4">
          <div>
            <p className="font-medium">{c.events.invite}</p>
            <p className="text-sm text-stone">{shareable ? c.events.inviteHint : c.events.noLink}</p>
            {shareable && (
              <div className="mt-3 flex flex-wrap gap-2">
                <QButton onClick={() => void copy()} className="chip"><Copy />{c.events.copy}</QButton>
                <Link to="/invite/$id" params={{ id: ev.id }} target="_blank" className="chip"><ExternalLink aria-hidden className="size-4" />{c.events.open}</Link>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{c.events.guests}</p>
            {guests.length === 0 ? <p className="text-sm text-stone">{c.events.noGuests}</p> : (
              <ul className="mt-2 divide-y divide-line">
                {guests.map((g) => (
                  <li key={g.id} className="flex items-center justify-between gap-3 py-2">
                    <span>{g.profiles?.display_name || "—"} <span className="text-sm text-stone">· {g.status === "waitlist" ? c.events.waitlist : g.status === "checked in" ? c.events.checkedIn : c.events.reserved}</span></span>
                    <QButton disabled={g.status !== "reserved"} onClick={() => void checkIn(g.id)} className={cn("chip", g.status === "checked in" && "chip-on")}>
                      {g.status === "checked in" ? c.events.checkedIn : c.events.checkIn}
                    </QButton>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {plan === "pro" ? <EventStats id={ev.id} /> : <ProLock title={c.events.stats} items={c.events.statsList} />}
        </div>
      )}
    </li>
  );
}

function EventStats({ id }: { id: string }) {
  const c = useStudioCopy();
  const s = c.events.statLabels;
  const stats = useQuery({
    queryKey: ["event-stats", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_event_stats", { event_id: id });
      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    },
  });
  const d = stats.data;
  if (!d) return <p role="status" className="text-sm text-stone">{stats.isError ? c.error : c.loading}</p>;
  const going = Number(d.reserved) + Number(d.checked_in);
  const full = d.capacity ? Math.round((going / Number(d.capacity)) * 100) : 0;
  const tiles: [string, string | number][] = [[s.views, d.views], [s.visitors, d.unique_visitors], [s.going, going], [s.waitlist, d.waitlist], [s.checkedIn, d.checked_in], [s.full, `${full}%`]];
  return (
    <div>
      <p className="font-medium">{c.events.stats}</p>
      <dl className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {tiles.map(([k, v]) => <div key={k} className="rounded-xl bg-card p-3"><dt className="text-xs text-stone">{k}</dt><dd className="font-display text-xl">{v}</dd></div>)}
      </dl>
    </div>
  );
}
