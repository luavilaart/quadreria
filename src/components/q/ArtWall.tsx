import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { galleryQuery } from "@/lib/gallery";
import { Art } from "./Art";

const tilts = ["-1.2deg", "0.8deg", "-0.6deg", "1.1deg"];

/**
 * The home "wall of work": images only, a piece from each artist (two when there are few
 * artists), hung in uneven columns like a salon wall. Never cropped.
 */
export function ArtWall({ max = 12 }: { max?: number }) {
  const { data } = useSuspenseQuery(galleryQuery);
  const shown = data.pieces.filter((p) => p.media_type === "image" && p.status !== "hidden" && p.status !== "draft");
  const perArtist = data.artists.length >= max / 2 ? 1 : 2;
  const picks = data.artists.flatMap((a) => shown.filter((p) => p.artist === a.handle).slice(0, perArtist)).slice(0, max);
  if (!picks.length) return null;
  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
      {picks.map((p, i) => (
        <Link
          key={p.id}
          to="/a/$handle/p/$id"
          params={{ handle: p.artist, id: p.id }}
          aria-label={`${p.title} · ${p.artistName}`}
          style={{ ["--tilt" as string]: tilts[i % tilts.length] }}
          className="wall-tile group relative mb-4 block break-inside-avoid rounded-xl border border-line bg-card p-2.5"
        >
          <Art ratio={p.ratio} tone={p.tone} shape={p.shape} src={p.images[0]} title={p.title} />
          <span className="pointer-events-none absolute inset-x-2.5 bottom-2.5 rounded-b-md bg-ink/75 px-3 py-2 text-xs text-wall opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {p.artistName}
          </span>
        </Link>
      ))}
    </div>
  );
}
