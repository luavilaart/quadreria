import type { RoomColor } from "@/data/sample";
import { cn } from "@/lib/utils";

/** Abstract placeholder artwork at its true aspect ratio (never cropped). */
export function Art({ ratio, tone, shape, className, title, src }: { ratio: number; tone: RoomColor; shape: number; className?: string; title?: string; src?: string | undefined }) {
  if (src) return <img src={src} alt={title ?? ""} className={cn("block h-auto w-full rounded-md object-contain", className)} />;
  const bg = `var(--room-${tone})`;
  const shapes = [
    <circle key="c" cx="62" cy="40" r="22" fill="var(--tomato)" opacity=".85" />,
    <rect key="r" x="18" y="45" width="64" height="30" rx="4" fill="var(--ink)" opacity=".8" />,
    <path key="p" d="M20 80 Q50 10 80 80 Z" fill="var(--sun)" />,
    <g key="g"><rect x="25" y="20" width="22" height="60" rx="11" fill="var(--deep-tomato)" opacity=".8" /><circle cx="66" cy="65" r="14" fill="var(--stone)" opacity=".6" /></g>,
  ];
  return (
    <div className={cn("w-full overflow-hidden rounded-md", className)} style={{ aspectRatio: ratio, background: bg }} role="img" aria-label={title ? `${title} (placeholder artwork)` : "Placeholder artwork"}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">{shapes[shape % 4]}</svg>
    </div>
  );
}
