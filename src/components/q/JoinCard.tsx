import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAccount } from "./AccountProvider";
import { useT } from "@/i18n";

/**
 * Home "Start here" card: two doors into the join quiz, with the role already chosen.
 * Hidden for people who already finished signing up.
 */
export function JoinCard() {
  const t = useT();
  const { user, role } = useAccount();
  if (user && role) return null;
  const c = t.home.joinCard;
  const doors = [
    { role: "artist" as const, title: c.artist, note: c.artistNote },
    { role: "collector" as const, title: c.collector, note: c.collectorNote },
  ];
  return (
    <aside aria-labelledby="join-card-title" className="rounded-2xl border border-line bg-card p-6 sm:p-7">
      <h2 id="join-card-title" className="text-2xl">{c.title}</h2>
      <p className="mt-2 text-sm text-stone">{c.intro}</p>
      <div className="mt-5 space-y-3">
        {doors.map((d) => (
          <Link
            key={d.role}
            to="/join"
            search={{ role: d.role }}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-wall px-5 py-4 transition-colors hover:border-ink"
          >
            <span>
              <span className="font-display block text-xl">{d.title}</span>
              <span className="mt-0.5 block text-sm text-stone">{d.note}</span>
            </span>
            <ArrowRight aria-hidden className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </aside>
  );
}
