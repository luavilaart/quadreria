import { Art } from "./Art";
import { PlatformIcon } from "./LinkEditor";
import { useTaxonomy } from "./TaxonomyProvider";
import { featureCopy } from "@/i18n/features";
import type { RoomLink } from "@/lib/links";
import { cn } from "@/lib/utils";
import { useFormat, useT } from "@/i18n";
import type { RoomColor } from "@/data/sample";

export type PreviewPiece = { id: string; title: string; ratio: number; tone: RoomColor; shape: number; src?: string | undefined };
export type PreviewService = { id: string; title: string; price: number; priceType: string };
export type PreviewRoomData = {
  name: string;
  handle: string;
  city?: string | undefined;
  tagline?: string | undefined;
  bio?: string | undefined;
  room: RoomColor;
  photo?: string | null | undefined;
  /** Medium labels, already in the viewer's language. */
  mediums?: string[] | undefined;
  pieces?: PreviewPiece[] | undefined;
  services?: PreviewService[] | undefined;
  links?: RoomLink[] | undefined;
};

const salonWidths = ["w-[42%]", "w-[50%]", "w-[38%]", "w-[46%]"];

/**
 * A room drawn inside a phone frame, from plain data. Used at the end of the join quiz,
 * on the example room page and in the Studio's live preview. Scrolls inside the frame.
 */
export function RoomPreview({ data, className, height = "h-[640px]" }: { data: PreviewRoomData; className?: string; height?: string }) {
  const t = useT();
  const f = useFormat();
  const p = t.preview;
  const { lang } = useTaxonomy();
  const pieces = (data.pieces ?? []).slice(0, 8);
  const money = (n: number) => f.price(n === 0 ? 0 : n);
  const servicePrice = (s: PreviewService) =>
    s.priceType === "consult" ? t.service.consult(`$${s.price}`) : s.priceType === "hourly" ? t.service.hourly(`$${s.price}`) : money(s.price);

  return (
    <figure aria-label={p.frameLabel(data.name || t.account.quiz.namePlaceholder)} className={cn("mx-auto w-full max-w-[320px]", className)}>
      <div className={cn("no-scrollbar overflow-y-auto overscroll-contain rounded-[2.25rem] border-[8px] border-ink", height, `room-${data.room}`, "bg-room text-room-fg")}>
        <div className="px-4 pb-8 pt-6">
          <div className="flex items-end gap-3">
            <div className="w-16 shrink-0 overflow-hidden rounded-xl bg-wall">
              {data.photo ? <img src={data.photo} alt="" className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5]" />}
            </div>
            <div className="min-w-0">
              <p className="label truncate text-[10px] opacity-70">@{data.handle || t.account.quiz.you}{data.city ? ` · ${f.city(data.city)}` : ""}</p>
              <p className="font-display mt-1 break-words text-2xl leading-none">{data.name || t.account.quiz.namePlaceholder}</p>
            </div>
          </div>
          {(data.tagline || data.bio) && <p className="mt-3 text-xs leading-relaxed opacity-85">{data.tagline || data.bio}</p>}
          {!!data.mediums?.length && <p className="mt-2 text-[11px]">{data.mediums.join(" · ")}</p>}
          {!!data.links?.length && (
            <ul aria-label={t.room.links} className="mt-3 flex flex-wrap gap-1.5">
              {data.links.map((l, i) => (
                <li key={i}><a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2.5 py-1 text-[11px] text-ink [&_svg]:size-3"><PlatformIcon platform={l.platform} />{l.platform === "custom" ? l.label : featureCopy[lang][l.platform]}</a></li>
              ))}
            </ul>
          )}

          <p className="font-display mt-5 text-lg">{t.room.work}</p>
          <div className="mt-2 flex flex-wrap items-end justify-center gap-x-2 gap-y-3">
            {pieces.length
              ? pieces.map((piece, i) => (
                  <div key={piece.id} className={cn("rounded-md bg-paper p-1", salonWidths[i % 4], i % 2 ? "mt-3" : "")}>
                    <Art src={piece.src} ratio={piece.ratio} tone={piece.tone} shape={piece.shape} title={piece.title} />
                  </div>
                ))
              : [4 / 5, 3 / 2, 1].map((ratio, i) => (
                  <div key={ratio} className={cn("rounded-md bg-paper p-1", salonWidths[i % 4], i % 2 ? "mt-3" : "")}>
                    <div style={{ aspectRatio: ratio }} className="flex items-center justify-center rounded border-[1.5px] border-dashed border-stone p-1 text-center text-[11px] text-stone">
                      {i === 0 ? p.firstPiece : ""}
                    </div>
                  </div>
                ))}
          </div>

          {!!data.services?.length && (
            <>
              <p className="font-display mt-6 text-lg">{t.room.services}</p>
              <div className="mt-2 space-y-2">
                {data.services.slice(0, 3).map((s) => (
                  <div key={s.id} className="rounded-xl bg-card p-3 text-xs text-ink">
                    <span className="font-display text-sm">{s.title}</span>
                    <span className="mt-1 block text-deep-tomato">{servicePrice(s)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {data.bio && data.tagline && (
            <>
              <p className="font-display mt-6 text-lg">{t.room.about}</p>
              <p className="mt-2 text-xs leading-relaxed">{data.bio}</p>
            </>
          )}
        </div>
      </div>
    </figure>
  );
}
