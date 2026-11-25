import { useId, type ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { QButton } from "@/components/q/QButton";
import { useStudioCopy } from "@/i18n/studio";

export const inputClass = "mt-1.5 w-full rounded-xl border border-line bg-wall px-4 py-3 text-base text-ink placeholder:text-stone/70 focus:border-ink focus:outline-none";

/** A titled card that groups related fields. */
export function Panel({ title, hint, badge, children, className }: { title: string; hint?: string | undefined; badge?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-card p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl">{title}</h2>
        {badge}
      </div>
      {hint && <p className="mt-1 text-sm text-stone">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

/** Label above any input. Pass the input as children; the label wraps it so clicks focus it. */
export function Field({ label, hint, children, className }: { label: string; hint?: string | undefined; children: ReactNode; className?: string | undefined }) {
  return (
    <label className={cn("block text-sm font-medium", className)}>
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-stone">{hint}</span>}
    </label>
  );
}

export function TextField({ label, hint, value, onChange, type = "text", required, placeholder, min, step, maxLength, className }: {
  label: string; hint?: string | undefined; value: string | number; onChange: (v: string) => void; type?: string; required?: boolean;
  placeholder?: string | undefined; min?: number; step?: string; maxLength?: number; className?: string | undefined;
}) {
  return (
    <Field label={label} hint={hint} className={className}>
      <input type={type} value={value} required={required} placeholder={placeholder} min={min} step={step} maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </Field>
  );
}

export function AreaField({ label, hint, value, onChange, rows = 4, maxLength }: { label: string; hint?: string | undefined; value: string; onChange: (v: string) => void; rows?: number; maxLength?: number }) {
  return (
    <Field label={label} hint={hint}>
      <textarea value={value} rows={rows} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "leading-relaxed")} />
    </Field>
  );
}

export function SelectField({ label, hint, value, onChange, options }: { label: string; hint?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Field label={label} hint={hint}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

/** A pill-shaped on/off switch with its label. Real checkbox underneath for keyboard and screen readers. */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  const id = useId();
  return (
    <span className="inline-flex items-center gap-3">
      <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <label htmlFor={id} className={cn("relative h-7 w-12 shrink-0 cursor-pointer rounded-full border border-line transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-deep-tomato",
        checked ? "bg-ink" : "bg-wall", disabled && "cursor-not-allowed opacity-60")}>
        <span className={cn("absolute top-0.5 rounded-full transition-all", checked ? "left-[22px] bg-wall" : "left-0.5 bg-stone/60")} style={{ width: 22, height: 22 }} />
        <span className="sr-only">{label}</span>
      </label>
    </span>
  );
}

export function ProBadge() {
  const c = useStudioCopy();
  return <span className="label inline-flex items-center gap-1 rounded-full bg-sun px-2.5 py-1 text-ink"><Sparkles aria-hidden className="size-3" />{c.pro.badge}</span>;
}

/** A Pro perk shown but locked: what it does, and that Pro is coming. */
export function ProLock({ title, items, children }: { title: string; items?: string[]; children?: ReactNode }) {
  const c = useStudioCopy();
  return (
    <div className="rounded-2xl border border-dashed border-stone/40 bg-wall p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg">{title}</p>
        <ProBadge />
      </div>
      {items && <ul className="mt-3 space-y-1.5 text-sm text-stone">{items.map((i) => <li key={i} className="flex gap-2"><span aria-hidden>·</span>{i}</li>)}</ul>}
      {children}
      <p className="mt-4 flex items-center gap-2 text-sm"><Lock aria-hidden className="size-4" />{c.pro.locked}</p>
    </div>
  );
}

export function SaveButton({ busy, onClick, label }: { busy: boolean; onClick?: () => void; label?: string }) {
  const c = useStudioCopy();
  return <QButton type={onClick ? "button" : "submit"} onClick={onClick} disabled={busy} className="btn-primary">{busy ? c.saving : (label ?? c.save)}</QButton>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line px-5 py-8 text-center text-stone">{children}</p>;
}
