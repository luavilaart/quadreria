import { cn } from "@/lib/utils";

/** "quadreria" with the i-dot replaced by a tilted square. onTomato swaps the dot to Sun. */
export function Wordmark({ className, onTomato = false }: { className?: string; onTomato?: boolean }) {
  return (
    <span className={cn("font-display inline-block leading-none lowercase", className)} aria-label="quadreria">
      <span aria-hidden>
        quadrer
        <span className="relative inline-block">
          ı
          <span
            className={cn("absolute left-1/2 rounded-[0.04em]", onTomato ? "bg-sun" : "bg-tomato")}
            style={{ width: "0.19em", height: "0.19em", top: "0.2em", transform: "translateX(-50%) rotate(12deg)" }}
          />
        </span>
        a
      </span>
    </span>
  );
}
