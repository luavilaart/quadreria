import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { citySuggestions, normalizeCity } from "@/data/places";
import { useFormat, useT } from "@/i18n";
import { cn } from "@/lib/utils";

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/**
 * One searchable dropdown for the city. The list suggests common spellings (Honduran cities first,
 * then the world), and anything typed is accepted, so artists can live in any city.
 */
export function CityPicker({ value, onChange, label }: { value: string; onChange: (city: string) => void; label?: string }) {
  const t = useT();
  const f = useFormat();
  const id = useId();
  const listId = `${id}-list`;
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // Filter only once the person types; opening the list on a saved city shows every city.
  const [typing, setTyping] = useState(false);

  const typed = value.trim();
  const q = typing ? fold(typed) : "";
  const current = normalizeCity(value);
  const matches = q
    ? citySuggestions.filter((c) => fold(c).includes(q)).sort((a, b) => Number(!fold(a).startsWith(q)) - Number(!fold(b).startsWith(q)))
    : citySuggestions;
  const options = [
    ...matches.slice(0, 60).map((c) => ({ value: c, label: f.city(c) })),
    ...(q && !matches.some((m) => fold(m) === q) ? [{ value: typed, label: t.cityPicker.useTyped(typed) }] : []),
  ];
  const openList = () => {
    setOpen(true);
    if (!open) { setTyping(false); setActive(Math.max(0, citySuggestions.indexOf(current))); }
  };

  useEffect(() => {
    if (open) document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  const choose = (city: string) => { onChange(normalizeCity(city)); setOpen(false); };
  const move = (step: number) => { openList(); setActive((i) => (options.length ? (i + step + options.length) % options.length : 0)); };

  return (
    <div className="relative">
      <p id={`${id}-hint`} className="mb-2 text-sm text-stone">{t.cityPicker.hint}</p>
      <div className="relative">
        <MapPin aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone" />
        <input
          ref={input}
          role="combobox"
          aria-label={label ?? t.cityPicker.placeholder}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-describedby={`${id}-hint`}
          aria-activedescendant={open && options[active] ? `${id}-opt-${active}` : undefined}
          value={value}
          onChange={(e) => { onChange(e.target.value); setTyping(true); setOpen(true); setActive(0); }}
          onFocus={openList}
          onClick={openList}
          onBlur={() => { setOpen(false); onChange(normalizeCity(value)); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
            else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
            else if (e.key === "Enter" && open && options[active]) { e.preventDefault(); choose(options[active].value); }
            else if (e.key === "Escape") setOpen(false);
          }}
          placeholder={t.cityPicker.placeholder}
          autoComplete="off"
          maxLength={80}
          className="w-full rounded-2xl border border-line bg-card py-4 pl-12 pr-12 text-lg"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={t.cityPicker.show}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { if (open) setOpen(false); else { openList(); input.current?.focus(); } }}
          className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-stone hover:bg-wall"
        >
          <ChevronDown aria-hidden className={cn("size-5 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && options.length > 0 && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-1.5 shadow-lg">
          {options.map((o, i) => (
            <li
              key={`${o.value}-${i}`}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={current === o.value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(o.value)}
              onMouseEnter={() => setActive(i)}
              className={cn("flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-2.5", i === active && "bg-wall")}
            >
              <span>{o.label}</span>
              {current === o.value && <Check aria-hidden className="size-4 text-deep-tomato" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
