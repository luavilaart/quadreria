import { useId } from "react";
import { citySuggestions, featuredCities, normalizeCity } from "@/data/places";
import { useFormat, useT } from "@/i18n";
import { QButton } from "./QButton";

/** Quick picks for the launch cities plus a free text field that accepts any city in the world. */
export function CityPicker({ value, onChange }: { value: string; onChange: (city: string) => void }) {
  const t = useT();
  const f = useFormat();
  const listId = useId();
  const current = normalizeCity(value);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {featuredCities.map((c) => (
          <QButton key={c} aria-pressed={current === c} onClick={() => onChange(c)} className={`chip !px-4 !py-3 text-base ${current === c ? "chip-on" : ""}`}>
            {f.city(c)}
          </QButton>
        ))}
      </div>
      <label className="block">
        <span className="text-stone">{t.cityPicker.hint}</span>
        <input
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onChange(normalizeCity(value))}
          placeholder={t.cityPicker.placeholder}
          autoComplete="address-level2"
          maxLength={80}
          className="mt-2 w-full rounded-2xl border border-line bg-card px-5 py-4 text-lg"
        />
        <datalist id={listId}>
          {citySuggestions.map((c) => <option key={c} value={c} />)}
        </datalist>
      </label>
    </div>
  );
}
