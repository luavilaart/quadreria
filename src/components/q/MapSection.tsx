import { MapPin } from "lucide-react";
import { mapsEmbedUrl, mapsSearchUrl, placeQuery } from "@/lib/maps";
import { usePagesCopy } from "@/i18n/pages";
import { cn } from "@/lib/utils";

/** "Getting there": a small map of the event's place and a button that opens Google Maps. */
export function MapSection({ venue, address, city, className }: { venue?: string | null; address?: string | null; city?: string | null; className?: string }) {
  const c = usePagesCopy().maps;
  const place = placeQuery([venue, address, city]);
  if (!place || city === "Online") return null;
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-line bg-card", className)}>
      <iframe
        title={c.frame(place)}
        src={mapsEmbedUrl(place)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-56 w-full border-0 sm:h-64"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-start gap-2">
          <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-deep-tomato" />
          <div className="min-w-0"><p className="label text-stone">{c.title}</p><p className="mt-0.5">{place}</p></div>
        </div>
        <a href={mapsSearchUrl(place)} target="_blank" rel="noreferrer" className="btn btn-ghost !px-4 !py-2 text-sm">{c.open}</a>
      </div>
    </section>
  );
}
