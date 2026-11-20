import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wordmark } from "./Wordmark";
import { useAccount } from "./AccountProvider";
import { QButton } from "./QButton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { langs, useLang, useSetLang, useT } from "@/i18n";

export function SiteHeader() {
  const t=useT();
  const {user,role,profile}=useAccount();
  const qc=useQueryClient();const navigate=useNavigate();
  async function logout(){await qc.cancelQueries();qc.clear();await supabase.auth.signOut();await navigate({to:"/auth",search:{next:"/"},replace:true});}
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-wall/95 text-ink backdrop-blur">
      <div className="mx-auto flex flex-wrap gap-y-2 max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="text-2xl"><Wordmark /></Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/discover" className="hover:text-deep-tomato" activeProps={{ className: "text-deep-tomato" }}>{t.nav.discover}</Link>
          <Link to="/events" className="hover:text-deep-tomato" activeProps={{ className: "text-deep-tomato" }}>{t.nav.events}</Link>
          <LangSwitch />
          {!user ? <><Link to="/auth" search={{next:"/"}} className="hover:text-deep-tomato">{t.account.login}</Link><Link to="/join" className="btn btn-primary !px-4 !py-2 text-sm">{t.nav.join}</Link></> :
            <DropdownMenu><DropdownMenuTrigger asChild><QButton className="!px-3 !py-2 text-sm btn-ghost">{t.account.account}</QButton></DropdownMenuTrigger><DropdownMenuContent align="end">{role==='artist'?<DropdownMenuItem asChild><Link to="/studio">{t.account.studio}</Link></DropdownMenuItem>:role==='collector'?<DropdownMenuItem asChild><Link to="/my-tickets">{t.account.tickets}</Link></DropdownMenuItem>:<DropdownMenuItem asChild><Link to="/join">{t.account.finish}</Link></DropdownMenuItem>}<DropdownMenuItem onClick={()=>void logout()}>{t.account.logout}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}
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
          {t.footer.map((f) => <li key={f}><a href="#" className="hover:text-deep-tomato">{f}</a></li>)}
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

/** ES / EN pill. The choice is saved in a cookie and applies to every page. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const t = useT(); const lang = useLang(); const setLang = useSetLang();
  return (
    <div role="group" aria-label={t.lang.label} className={`flex rounded-full border border-line p-0.5 text-xs ${className}`}>
      {langs.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} title={t.lang[l]} onClick={() => { if (l !== lang) void setLang(l); }}
          className={`rounded-full px-2 py-1 ${lang === l ? "bg-ink text-wall" : "hover:text-deep-tomato"}`}>
          <span aria-hidden>{t.lang.short[l]}</span><span className="sr-only">{t.lang[l]}</span>
        </button>
      ))}
    </div>
  );
}
