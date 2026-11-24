import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Page } from "@/components/q/Shell";
import { RoomPreview, type PreviewRoomData } from "@/components/q/RoomPreview";
import { useTaxonomy } from "@/components/q/TaxonomyProvider";
import { galleryQuery, type Gallery } from "@/lib/gallery";
import { label } from "@/data/taxonomy";
import { pageHead } from "@/lib/head";
import { copyFor, langOf, useT } from "@/i18n";

/** The sample artist shown as the example. Falls back to any room with pieces. */
const EXAMPLE_HANDLE = "mara";

export const Route = createFileRoute("/example-room")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  head: ({ match }) => {
    const t = copyFor(langOf(match.context));
    return pageHead(t.preview.exampleKicker, t.preview.exampleMeta);
  },
  component: ExampleRoom,
});

function pickExample(data: Gallery) {
  return (
    data.artists.find((a) => a.handle === EXAMPLE_HANDLE) ??
    data.artists.find((a) => data.pieces.some((p) => p.artist === a.handle)) ??
    data.artists[0]
  );
}

function ExampleRoom() {
  const t = useT();
  const p = t.preview;
  const { state, lang } = useTaxonomy();
  const { data } = useSuspenseQuery(galleryQuery);
  const a = pickExample(data);

  const preview: PreviewRoomData | null = a
    ? {
        name: a.name,
        handle: a.handle,
        city: a.city,
        tagline: a.tagline,
        bio: a.bio,
        room: a.room,
        photo: a.photo,
        mediums: state.artist_mediums
          .filter((m) => m.artist_id === a.id)
          .map((m) => state.taxonomy.find((x) => x.id === m.medium_id))
          .filter((x) => !!x)
          .map((x) => label(x, lang)),
        pieces: data.pieces
          .filter((x) => x.artist === a.handle && x.media_type === "image")
          .map((x) => ({ id: x.id, title: x.title, ratio: x.ratio, tone: x.tone, shape: x.shape, src: x.images[0] })),
      }
    : null;

  return (
    <Page>
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div>
          <p className="label text-stone">{p.exampleKicker}</p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{p.exampleTitle}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone">{p.exampleIntro}</p>
          <ol className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {p.exampleSections.map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span className="font-display w-6 shrink-0 text-lg text-deep-tomato">{i + 1}</span>
                <div>
                  <h2 className="text-lg">{title}</h2>
                  <p className="mt-1 text-stone">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            {a && <Link to="/a/$handle" params={{ handle: a.handle }} className="btn btn-ghost">{p.walkIn(a.name.split(" ")[0] ?? a.name)}</Link>}
            <Link to="/join" search={{ role: "artist" }} className="btn btn-primary">{p.openYourRoom}<ArrowRight aria-hidden className="size-5" /></Link>
          </div>
        </div>
        {preview && (
          <div>
            <RoomPreview data={preview} />
            <p className="mt-3 text-center text-sm text-stone">{p.scrolls}</p>
          </div>
        )}
      </div>
    </Page>
  );
}
