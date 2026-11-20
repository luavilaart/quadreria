import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wordmark } from "./Wordmark";
import { t } from "@/i18n/en";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-wall/95 text-ink backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="text-2xl"><Wordmark /></Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/discover" className="hover:text-deep-tomato" activeProps={{ className: "text-deep-tomato" }}>{t.nav.discover}</Link>
          <Link to="/events" className="hover:text-deep-tomato" activeProps={{ className: "text-deep-tomato" }}>{t.nav.events}</Link>
          <Link to="/studio" className="hidden hover:text-deep-tomato sm:inline">{t.nav.studio}</Link>
          <Link to="/join" className="btn btn-primary !px-4 !py-2 text-sm">{t.nav.join}</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <Wordmark className="text-3xl" />
        <p className="mt-2 text-stone">{t.tagline}</p>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {t.footer.map((f) => <li key={f}><a href="#" className="hover:text-deep-tomato">{f}</a></li>)}
        </ul>
        <p className="label mt-10 text-stone">© 2026 quadreria · {t.sample} shown throughout</p>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (<><SiteHeader /><main>{children}</main><SiteFooter /></>);
}

export function SectionTitle({ kicker, title, action }: { kicker?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {kicker && <p className="label mb-1 text-stone">{kicker}</p>}
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function SampleBadge() {
  return <span className="label inline-block rounded-full border border-current px-2.5 py-1 opacity-70">{t.sample}</span>;
}
