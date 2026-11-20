import { useSuspenseQuery } from "@tanstack/react-query";
import { QButton } from "@/components/q/QButton";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/components/q/AccountProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Page, SampleBadge } from "@/components/q/Shell";
import { Art } from "@/components/q/Art";
import { galleryQuery, fmtDate, usd } from "@/lib/gallery";
import { t } from "@/i18n/en";

export const Route = createFileRoute("/a/$handle_/e/$id")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(galleryQuery);
    const e = data.events.find(x => x.id === params.id && x.artist === params.handle);
    const a = data.artists.find(a => a.handle === params.handle);
    if (!e || !a) throw notFound();
    return { e, a };
  },
  errorComponent: ({ error }) => <p role="alert">{error instanceof Error ? error.message : String(error)}</p>,
  notFoundComponent: () => <p>{t.account.empty}</p>,
  head: ({ loaderData: d }) => ({ meta: d ? [
    { title: `${d.e.title} — quadreria` }, { name: "description", content: d.e.blurb },
    { property: "og:title", content: `${d.e.title} with ${d.a.name}` }, { property: "og:description", content: d.e.blurb },
    ...(d.e.cover_image?.startsWith("https://") ? [{property:"og:image",content:d.e.cover_image ?? ""},{name:"twitter:image",content:d.e.cover_image ?? ""}] : []),
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] : [{ title: "Event not found — quadreria" }, { name: "robots", content: "noindex" }] }),
  component: EventPage,
});

function EventPage() {
  useSuspenseQuery(galleryQuery);
  const { e, a } = Route.useLoaderData();
  const full = e.spots === 0;
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, role } = useAccount();
  const qc = useQueryClient();
  const router = useRouter();
  async function reserve() {
    if(role !== "collector") { toast.error(t.account.collectorOnly); return; }
    setBusy(true);
    const {data,error} = await supabase.rpc("reserve_ticket", {event_id:e.id});
    setBusy(false);
    if(error) { toast.error(error.message);return; }
    setDone(data.status === "waitlist" ? t.account.waitlist : t.account.reserved);
    await qc.invalidateQueries({queryKey:["gallery"]}); await router.invalidate();
  }
  return (
    <Page>
      <div className="mx-auto max-w-3xl px-5 pt-8">
        <Art src={e.cover_image ?? undefined} ratio={3 / 2} tone={e.tone} shape={0} title={e.title} className="rounded-2xl" />
        <div className="mt-6">{e.sample && <SampleBadge />}</div>
        <p className="label mt-4 text-stone">{e.type}</p>
        <h1 className="mt-1 text-4xl leading-tight">{e.title}</h1>
        <p className="mt-2">with <Link to="/a/$handle" params={{ handle: a.handle }} className="link">{a.name}</Link></p>
        <p className="mt-4 text-lg">{e.blurb}</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <Info k="When" v={`${fmtDate(e.date, { weekday: "long", month: "long", day: "numeric" })} · ${e.time}`} />
          <Info k="Where" v={e.city === "Online" ? "Online — link sent with your ticket" : `${e.address}, ${e.city}`} />
          <Info k="Price" v={usd(e.price)} />
          <Info k="Spots" v={full ? `${t.event.full} (${e.capacity} people)` : `${e.spots} of ${e.capacity} left`} />
        </dl>
        <h2 className="mt-8 text-2xl">{t.event.bring}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">{e.bring.map((b) => <li key={b}>{b}</li>)}</ul>
        <div className="mt-8 rounded-2xl border border-line bg-card p-5">
          <h2 className="text-xl">{t.event.refundTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone">{t.event.refund.map((r) => <li key={r}>— {r}</li>)}</ul>
        </div>
        {e.price > 0 ? <QButton disabled className="btn-primary mt-8 w-full">{t.event.get} · {t.account.coming}</QButton>
          : !user ? <Link to="/auth" search={{ next: `/a/${a.handle}/e/${e.id}` }} className="btn btn-primary mt-8 w-full">{t.account.login} · {t.event.get}</Link>
          : <QButton disabled={busy || !!done || role !== "collector"} onClick={reserve} className="btn-primary mt-8 w-full">{done || (role !== "collector" ? t.account.collectorOnly : full ? t.event.waitlist : t.event.get)}</QButton>}

      </div>
    </Page>
  );
}
const Info = ({ k, v }: { k: string; v: string }) => <div className="rounded-2xl border border-line bg-card p-4"><dt className="label text-stone">{k}</dt><dd className="mt-1">{v}</dd></div>;
