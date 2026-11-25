import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAccount } from "./AccountProvider";
import { useT } from "@/i18n";
import { usePagesCopy } from "@/i18n/pages";

/**
 * Two big buttons beside the home tagline. Each opens the join quiz with the role
 * already chosen; the quiz ends in sign-up. Once someone has signed up, the same two buttons
 * lead to their Studio and to the art instead, so the hero never goes empty.
 */
export function JoinCard() {
  const t = useT();
  const { user, role } = useAccount();
  const signed = usePagesCopy().join;
  const c = t.home.joinCard;
  const base =
    "group flex w-full items-center justify-between gap-4 rounded-full px-8 py-6 font-display text-2xl transition-transform active:scale-[0.98] sm:py-7 sm:text-3xl";
  if (user && role) {
    return (
      <nav aria-label={signed.label} className="flex flex-col gap-4">
        <Link to="/studio" className={`${base} bg-tomato text-ink hover:bg-deep-tomato`}>
          {signed.studio}
          <ArrowRight aria-hidden className="size-7 shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link to="/discover" className={`${base} bg-ink text-wall hover:bg-ink/90`}>
          {signed.findArt}
          <ArrowRight aria-hidden className="size-7 shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      </nav>
    );
  }
  return (
    <nav aria-label={c.label} className="flex flex-col gap-4">
      <Link to="/join" search={{ role: "artist" }} className={`${base} bg-tomato text-ink hover:bg-deep-tomato`}>
        {c.artist}
        <ArrowRight aria-hidden className="size-7 shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>
      <Link to="/join" search={{ role: "collector" }} className={`${base} bg-ink text-wall hover:bg-ink/90`}>
        {c.collector}
        <ArrowRight aria-hidden className="size-7 shrink-0 transition-transform group-hover:translate-x-1" />
      </Link>
    </nav>
  );
}
