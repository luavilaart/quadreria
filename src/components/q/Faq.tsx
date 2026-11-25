import { Plus } from "lucide-react";

/** Questions that open one at a time, built on <details> so they work without JavaScript. */
export function Faq({ title, items, className }: { title: string; items: [string, string][]; className?: string }) {
  return (
    <section className={className}>
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
        {items.map(([q, a]) => (
          <details key={q} className="group px-5 py-1 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
              {q}
              <Plus aria-hidden className="size-5 shrink-0 text-deep-tomato transition-transform duration-300 group-open:rotate-45" />
            </summary>
            <p className="pb-5 leading-relaxed text-stone">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
