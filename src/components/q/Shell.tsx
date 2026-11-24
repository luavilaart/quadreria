import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wordmark } from "./Wordmark";
import { useAccount } from "./AccountProvider";
import { QButton } from "./QButton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import {useTaxonomy} from "./TaxonomyProvider";
import { useT } from "@/i18n";

export function SiteHeader() {
  const { lang, setLang, c } = useTaxonomy();
  const t = useT();
  const { user } = useAccount();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", search: { next: "/" }, replace: true });
  }
  const linkCls = "hover:text-deep-tomato";
  const active = { className: "text-deep-tomato" };
  const otherLang = lang === "en" ? "es" : "en";
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-wall/95 text-ink backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="text-2xl"><Wordmark /></Link>

        {/* Desktop: the full row. */}
        <nav className="hidden items-center gap-4 text-sm sm:flex">
          <QButton aria-label={t.lang[otherLang]} onClick={() => setLang(otherLang)} className="!px-2 !py-1 text-xs">{t.lang.short[otherLang]}</QButton>
          <Link to="/discover" className={linkCls} activeProps={active}>{c.art}</Link>
          <Link to="/events" className={linkCls} activeProps={active}>{c.events}</Link>
          <Link to="/about" className={linkCls} activeProps={active}>{t.nav.about}</Link>
          {!user ? (
            <>
              <Link to="/auth" search={{ next: "/" }} className={linkCls}>{c.login}</Link>
              <Link to="/join" className="btn btn-primary !px-4 !py-2 text-sm">{c.join}</Link>
            </>
          ) : (
            <>
              <Link to="/studio" className={linkCls} activeProps={active}>{c.studio}</Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><QButton className="!px-3 !py-2 text-sm btn-ghost">{t.account.account}</QButton></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => void logout()}>{t.account.logout}</DropdownMenuItem></DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </nav>

        {/* Phone: Log in and Join stay visible; everything else sits behind the menu button. */}
        <nav className="flex items-center gap-2 text-sm sm:hidden">
          {!user && (
            <>
              <Link to="/auth" search={{ next: "/" }} className={`${linkCls} px-1`}>{c.login}</Link>
              <Link to="/join" className="btn btn-primary !px-4 !py-2 text-sm">{c.join}</Link>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <QButton aria-label={t.nav.menu} title={t.nav.menu} className="!h-10 !w-10 !p-0"><Menu className="!size-6" /></QButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48 p-2 text-base">
              <DropdownMenuItem asChild className="py-2.5 text-base"><Link to="/discover">{c.art}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="py-2.5 text-base"><Link to="/events">{c.events}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild className="py-2.5 text-base"><Link to="/about">{t.nav.about}</Link></DropdownMenuItem>
              {user && <DropdownMenuItem asChild className="py-2.5 text-base"><Link to="/studio">{c.studio}</Link></DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem lang={otherLang} className="py-2.5 text-base" onClick={() => setLang(otherLang)}>{t.lang[otherLang]}</DropdownMenuItem>
              {user && <DropdownMenuItem className="py-2.5 text-base" onClick={() => void logout()}>{t.account.logout}</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <Wordmark className="text-3xl" />
        <p className="mt-2 text-stone">{t.tagline}</p>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {t.footer.map((f, i) => <li key={f}>{i === 0 ? <Link to="/about" className="hover:text-deep-tomato">{f}</Link> : <a href="#" className="hover:text-deep-tomato">{f}</a>}</li>)}
        </ul>
        <p className="label mt-10 text-stone">© 2026 quadreria · {t.sampleShown}</p>
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
  const t = useT();
  return <span className="label inline-block rounded-full border border-current px-2.5 py-1 opacity-70">{t.sample}</span>;
}
