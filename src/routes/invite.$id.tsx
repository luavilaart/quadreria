import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarPlus, Clock, MapPin, Share2, Ticket } from "lucide-react";
import { MapSection } from "@/components/q/MapSection";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/components/q/AccountProvider";
import { QButton } from "@/components/q/QButton";
import { Wordmark } from "@/components/q/Wordmark";
import { asRoomColor } from "@/lib/artist-studio";
import { icsFor, inviteTheme, inviteUrl, themeColors, visitorId } from "@/lib/invite";
import { useFormat } from "@/i18n";
import { studioCopy, useStudioCopy } from "@/i18n/studio";
import { langOf } from "@/i18n";
import { cn } from "@/lib/utils";

async function loadInvite(id: string) {
  const { data: event, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!event) return null;
  const [room, profile, spots, plan] = await Promise.all([
    supabase.from("rooms").select("handle, room_color").eq("id", event.artist).maybeSingle(),
    supabase.from("profiles").select("display_name, photo").eq("id", event.artist).maybeSingle(),
    supabase.rpc("event_spots", { event_id: id }),
    supabase.rpc("artist_plan", { artist_id: event.artist }),
  ]);
  return {
    event,
    host: { name: profile.data?.display_name ?? "", photo: profile.data?.photo ?? null, handle: room.data?.handle ?? "", room: asRoomColor(room.data?.room_color) },
    spots: spots.data ?? 0,
    plan: plan.data === "pro" ? ("pro" as const) : ("free" as const),
  };
}

/** Public invite page for an event (Partiful-style): flyer, details and RSVP. Free uses the wall color; Pro can theme it. */
export const Route = createFileRoute("/invite/$id")({
  loader: async ({ params }) => {
    const data = await loadInvite(params.id);
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData: d, match }) => {
    const c = studioCopy[langOf(match.context)].invite;
    if (!d) return { meta: [{ title: `${c.notFound} — quadreria` }, { name: "robots", content: "noindex" }] };
    const meta = [
      { title: `${d.event.title} — quadreria` },
      { name: "description", content: d.event.blurb.slice(0, 160) },
      { property: "og:title", content: d.event.title },
      { property: "og:description", content: d.event.blurb.slice(0, 160) },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(d.event.cover_image?.startsWith("https://") ? [{ property: "og:image", content: d.event.cover_image }, { name: "twitter:image", content: d.event.cover_image }] : []),
      ...(d.event.visibility === "unlisted" || d.event.status !== "published" ? [{ name: "robots", content: "noindex" }] : []),
    ];
    return { meta };
  },
  notFoundComponent: NotFound,
  component: Invite,
});

function NotFound() {
  const c = useStudioCopy();
  return <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-wall px-5 text-center"><Link to="/" className="text-3xl"><Wordmark /></Link><p className="text-lg">{c.invite.notFound}</p></main>;
}

function Invite() {
  const { event: e, host, spots, plan } = Route.useLoaderData();
  const c = useStudioCopy();
  const i = c.invite;
  const f = useFormat();
  const qc = useQueryClient();
  const { user, role } = useAccount();
  const theme = inviteTheme(e.invite_theme, asRoomColor(e.tone), plan);
  const colors = themeColors(theme.background);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Count the visit (published events only; the database ignores repeats from the same browser on the same day).
  useEffect(() => {
    const visitor = visitorId();
    if (visitor && e.status === "published") void supabase.rpc("record_event_view", { event_id: e.id, visitor });
  }, [e.id, e.status]);

  const mine = useQuery({
    queryKey: ["my-ticket", e.id, user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("tickets").select("status").eq("event", e.id).eq("collector", user?.id ?? "").maybeSingle()).data?.status ?? null,
  });
  const ticket = status ?? mine.data ?? null;

  async function rsvp() {
    if (role !== "collector") { toast.error(i.collectorsOnly); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc("reserve_ticket", { event_id: e.id });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setStatus(data.status);
    await qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  function downloadIcs() {
    const blob = new Blob([icsFor(e, inviteUrl(window.location.origin, e.id))], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${e.title.replace(/[^\w-]+/g, "-").slice(0, 40) || "event"}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function share() {
    const url = inviteUrl(window.location.origin, e.id);
    try {
      if (navigator.share) await navigator.share({ title: e.title, url });
      else { await navigator.clipboard.writeText(url); toast.success(i.copied); }
    } catch { /* the person closed the share sheet */ }
  }

  const when = `${f.date(e.date, { weekday: "long", month: "long", day: "numeric" })}${e.end_date && e.end_date !== e.date ? ` – ${f.date(e.end_date, { month: "long", day: "numeric" })}` : ""}`;
  const time = `${e.start_time.slice(0, 5)} – ${e.end_time.slice(0, 5)} · ${e.timezone.replace(/_/g, " ")}`;
  const where = e.city === "Online" ? i.online : [e.venue_name, e.address, e.city].filter(Boolean).join(", ");
  const cancelled = e.status === "cancelled";
  const paid = Number(e.price) > 0;
  const titleCls = theme.titleStyle === "modern" ? "font-sans font-semibold uppercase tracking-tight" : "font-display";
  const poster = theme.layout === "poster" && !!e.cover_image;

  const action = cancelled ? null
    : ticket === "reserved" || ticket === "checked in" ? <p className="btn w-full bg-card text-ink">{i.going}</p>
    : ticket === "waitlist" ? <p className="btn w-full bg-card text-ink">{i.onWaitlist}</p>
    : paid ? <p className="btn w-full bg-card/80 text-ink">{i.paidSoon}</p>
    : !user ? <Link to="/auth" search={{ next: `/invite/${e.id}` }} className="btn btn-primary w-full">{i.logIn}</Link>
    : <QButton disabled={busy} onClick={() => void rsvp()} className="btn-primary w-full">{spots === 0 ? i.joinWaitlist : i.rsvp}</QButton>;

  return (
    <main style={colors} className="relative min-h-[100dvh] overflow-hidden">
      {theme.effect === "confetti" && <Confetti />}
      {poster && (
        <div aria-hidden className="absolute inset-0">
          <img src={e.cover_image ?? ""} alt="" className="h-full w-full object-cover opacity-35" />
        </div>
      )}
      <div className="relative mx-auto flex max-w-xl flex-col gap-6 px-5 pb-32 pt-6">
        <Link to="/" className="self-center text-xl" style={{ color: colors.color }}><Wordmark /></Link>
        {!poster && e.cover_image && <img src={e.cover_image} alt="" className="w-full rounded-3xl object-contain shadow-none" />}
        <div className="text-center">
          <p className="label opacity-75">{f.eventType(e.type)}</p>
          <h1 className={cn("mt-2 text-5xl leading-[1.05] sm:text-6xl", titleCls)}>{e.title}</h1>
          <p className="mt-4 inline-flex items-center gap-2 text-sm opacity-85">
            {host.photo && <img src={host.photo} alt="" className="h-7 w-7 rounded-full object-cover" />}
            {i.hostedBy(host.name)}
          </p>
        </div>
        {cancelled && <p role="status" className="rounded-2xl bg-card p-4 text-center text-ink">{i.cancelled}</p>}

        <ul className="space-y-3 rounded-3xl bg-card/90 p-5 text-ink">
          <li className="flex gap-3"><Clock aria-hidden className="mt-0.5 size-5 shrink-0" /><span><span className="font-medium">{when}</span><br /><span className="text-sm text-stone">{time}</span></span></li>
          <li className="flex gap-3"><MapPin aria-hidden className="mt-0.5 size-5 shrink-0" /><span>{where}</span></li>
          <li className="flex gap-3"><Ticket aria-hidden className="mt-0.5 size-5 shrink-0" /><span>{paid ? f.price(Number(e.price)) : i.free}{!cancelled && ` · ${spots === 0 ? i.full : i.spotsLeft(spots)}`}</span></li>
        </ul>

        {e.blurb && <section><h2 className={cn("text-2xl", titleCls)}>{i.about}</h2><p className="mt-2 whitespace-pre-line text-lg leading-relaxed opacity-90">{e.blurb}</p></section>}
        {e.city !== "Online" && <MapSection venue={e.venue_name} address={e.address} city={e.city} className="text-ink" />}
        {e.bring.length > 0 && <section><h2 className={cn("text-2xl", titleCls)}>{i.bring}</h2><ul className="mt-2 list-disc space-y-1 pl-5">{e.bring.map((b) => <li key={b}>{b}</li>)}</ul></section>}

        <div className="flex flex-wrap justify-center gap-2">
          <QButton onClick={downloadIcs} className="chip"><CalendarPlus />{i.calendar}</QButton>
          <QButton onClick={() => void share()} className="chip"><Share2 />{i.share}</QButton>
        </div>
        <p className="text-center text-sm opacity-75">{i.refund}</p>
        {host.handle && <Link to="/a/$handle" params={{ handle: host.handle }} className="text-center underline underline-offset-4" style={{ color: colors.color }}>{i.seeRoom(host.name.split(" ")[0] ?? host.name)}</Link>}
      </div>
      {action && <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-xl px-5 pb-5">{action}</div>}
    </main>
  );
}

/** Tilted squares, like the dot on the i, drifting down. Still for people who prefer less motion. */
function Confetti() {
  const bits = Array.from({ length: 24 }, (_, n) => n);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((n) => (
        <span key={n} className="confetti-bit absolute block rounded-[2px]"
          style={{ left: `${(n * 37) % 100}%`, top: `${(n * 53) % 90}%`, width: 10 + (n % 3) * 4, height: 10 + (n % 3) * 4,
            background: n % 3 === 0 ? "var(--tomato)" : n % 3 === 1 ? "var(--sun)" : "var(--deep-tomato)", transform: `rotate(${(n * 29) % 90}deg)`, animationDelay: `${(n % 8) * 0.6}s` }} />
      ))}
    </div>
  );
}
