import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Check, CircleHelp, ExternalLink, Eye, Film, House, LayoutList, Palette, ShoppingBag, Tags, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { Page } from "@/components/q/Shell";
import { RoomMediaStudio } from "@/components/q/RoomMediaStudio";
import { ArtistTaxonomyEditor } from "@/components/q/ArtistTaxonomyEditor";
import { useAccount } from "@/components/q/AccountProvider";
import { StudioRoomPreview } from "@/components/q/StudioRoomPreview";
import { studioQuery, type StudioData } from "@/lib/studio";
import { socialCountsQuery } from "@/lib/social";
import { asFaq, comingSoonSections, groupEvents, isSectionVisible, normalizeOrder } from "@/lib/artist-studio";
import { asRoomLinks } from "@/lib/links";
import { useStudioCopy } from "@/i18n/studio";
import { cn } from "@/lib/utils";
import { RoomPanel } from "./RoomPanel";
import { SectionsPanel } from "./SectionsPanel";
import { FaqPanel } from "./FaqPanel";
import { ServicesPanel } from "./ServicesPanel";
import { ShopPanel } from "./ShopPanel";
import { EventsPanel } from "./EventsPanel";
import { Panel } from "./ui";

export const studioTabs = ["overview", "room", "sections", "shop", "media", "services", "events", "faq", "mediums"] as const;
export type StudioTab = (typeof studioTabs)[number];
const icons: Record<StudioTab, ReactNode> = {
  overview: <House />, room: <Palette />, sections: <LayoutList />, shop: <ShoppingBag />, media: <Film />,
  services: <Wrench />, events: <CalendarDays />, faq: <CircleHelp />, mediums: <Tags />,
};

/** The artist's Studio: one place to edit every part of their room. */
export function ArtistStudio({ tab }: { tab: StudioTab }) {
  const c = useStudioCopy();
  const navigate = useNavigate();
  const studio = useQuery(studioQuery);
  const data = studio.data;
  const go = (t: StudioTab) => void navigate({ to: "/studio", search: t === "overview" ? {} : { tab: t }, resetScroll: false });

  return (
    <Page>
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl">{c.title}</h1>
            {data?.room && (
              <p className="mt-2 inline-flex items-center gap-2 text-sm">
                <span className={cn("h-2.5 w-2.5 rounded-full", data.room.published ? "bg-[oklch(0.6_0.13_150)]" : "bg-sun")} aria-hidden />
                {data.room.published ? c.status.live : c.status.draft}
              </p>
            )}
          </div>
          {data?.room && (
            <div className="flex flex-wrap gap-2">
              <StudioRoomPreview inline />
              <Link to="/a/$handle" params={{ handle: data.room.handle }} className="btn btn-ghost !py-2 text-sm"><ExternalLink aria-hidden className="size-4" />{c.viewRoom}</Link>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label={c.title} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0">
            {studioTabs.map((t) => (
              <button key={t} type="button" onClick={() => go(t)} aria-current={tab === t ? "page" : undefined}
                className={cn("flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors [&_svg]:size-4 lg:rounded-xl",
                  tab === t ? "bg-ink text-wall" : "border border-line bg-card hover:border-ink lg:border-transparent lg:bg-transparent lg:hover:bg-card")}>
                {icons[t]}{c.nav[t]}
              </button>
            ))}
          </nav>

          <div className="min-w-0 pb-24">
            {studio.isPending && <p role="status" className="text-stone">{c.loading}</p>}
            {studio.isError && <p role="alert">{c.error}</p>}
            {data && <TabBody tab={tab} data={data} go={go} />}
          </div>
        </div>
      </div>
    </Page>
  );
}

function TabBody({ tab, data, go }: { tab: StudioTab; data: StudioData; go: (t: StudioTab) => void }) {
  const owner = data.profile?.id ?? "";
  switch (tab) {
    case "overview": return <Overview data={data} go={go} />;
    case "room": return <RoomPanel key={data.room?.id} data={data} />;
    case "sections": return <SectionsPanel key={data.room?.id} data={data} />;
    case "shop": return <ShopPanel data={data} owner={owner} />;
    case "media": return <RoomMediaStudio />;
    case "services": return <ServicesPanel data={data} owner={owner} />;
    case "events": return <EventsPanel data={data} owner={owner} />;
    case "faq": return <FaqPanel key={data.room?.id} data={data} />;
    case "mediums": return <ArtistTaxonomyEditor />;
  }
}

function Overview({ data, go }: { data: StudioData; go: (t: StudioTab) => void }) {
  const c = useStudioCopy();
  const { user } = useAccount();
  const social = useQuery({ ...socialCountsQuery(user?.id ?? ""), enabled: !!user });
  const room = data.room;
  const order = normalizeOrder(room?.section_order ?? []);
  const hidden = room ? order.filter((s) => !comingSoonSections.includes(s) && !isSectionVisible(room.visible_sections, room.section_order, s)).length : 0;
  const shown = data.pieces.filter((p) => p.status !== "hidden" && p.status !== "draft").length;
  const checks: { key: keyof typeof c.overview.checks; done: boolean; tab: StudioTab }[] = [
    { key: "photo", done: !!data.profile?.photo, tab: "room" },
    { key: "bio", done: !!room?.bio.trim(), tab: "room" },
    { key: "pieces", done: shown >= 3, tab: "shop" },
    { key: "links", done: asRoomLinks(room?.links).length > 0, tab: "room" },
    { key: "faq", done: asFaq(room?.faq).length > 0, tab: "faq" },
  ];
  const counts: [string, number, StudioTab][] = [
    [c.overview.counts.pieces, data.pieces.length, "shop"],
    [c.overview.counts.events, groupEvents(data.events).upcoming.length, "events"],
    [c.overview.counts.services, data.services.length, "services"],
    [c.overview.counts.hidden, hidden, "sections"],
  ];
  const followers = social.data?.followers;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">{c.overview.hello(data.profile?.display_name.split(" ")[0] ?? "")}</h2>
        <p className="mt-1 text-stone">{c.overview.intro}</p>
      </div>
      {followers !== undefined && <p className="text-sm text-stone"><span className="font-display text-lg text-ink">{followers}</span> {c.overview.followers}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map(([label, n, t]) => (
          <button key={label} type="button" onClick={() => go(t)} className="rounded-2xl border border-line bg-card p-4 text-left hover:border-ink">
            <span className="font-display block text-3xl">{n}</span>
            <span className="text-sm text-stone">{label}</span>
          </button>
        ))}
      </div>
      <Panel title={c.overview.checklist}>
        {checks.every((x) => x.done) ? <p className="text-stone">{c.overview.done}</p> : (
          <ul className="space-y-2">
            {checks.map((x) => (
              <li key={x.key}>
                <button type="button" onClick={() => go(x.tab)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-wall">
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", x.done ? "border-ink bg-ink text-wall" : "border-line")}>
                    {x.done && <Check aria-hidden className="size-4" />}
                  </span>
                  <span className={x.done ? "text-stone line-through" : ""}>{c.overview.checks[x.key]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <p className="flex items-center gap-2 text-sm text-stone"><Eye aria-hidden className="size-4" />{c.viewRoom}: <Link to="/a/$handle" params={{ handle: room?.handle ?? "" }} className="link">quadreria.art/a/{room?.handle}</Link></p>
    </div>
  );
}
