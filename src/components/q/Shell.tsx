import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wordmark } from "./Wordmark";
import { useAccount } from "./AccountProvider";
import { QButton } from "./QButton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {useTaxonomy} from "./TaxonomyProvider";
import { t } from "@/i18n/en";

export function SiteHeader() {
  const {lang,setLang,c}=useTaxonomy();
  const {user,role,profile}=useAccount();
  const qc=useQueryClient();const navigate=useNavigate();
  async function logout(){await qc.cancelQueries();qc.clear();await supabase.auth.signOut();await navigate({to:"/auth",search:{next:"/"},replace:true});}
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-wall/95 text-ink backdrop-blur">
      <div className="mx-auto flex flex-wrap gap-y-2 max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="text-2xl"><Wordmark /></Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <QButton aria-label={lang==="en"?"Español":"English"} onClick={()=>setLang(lang==="en"?"es":"en")} className="!px-2 !py-1 text-xs">{lang==="en"?"ES":"EN"}</QButton>
          <Link to="/discover" className="hover:text-deep-tomato" activeProps={{ className: "text-deep-tomato" }}>{c.art}</Link>
          <Link to="/studio" className="hover:text-deep-tomato">{c.studio}</Link>
          <Link to="/events" className="hover:text-deep-tomato" activeProps={{ className: "text-deep-tomato" }}>{c.events}</Link>
          {!user ? <><Link to="/auth" search={{next:"/"}} className="hover:text-deep-tomato">{c.login}</Link><Link to="/join" className="btn btn-primary !px-4 !py-2 text-sm">{c.join}</Link></> :
            <DropdownMenu><DropdownMenuTrigger asChild><QButton className="!px-3 !py-2 text-sm btn-ghost">{t.account.account}</QButton></DropdownMenuTrigger><DropdownMenuContent align="end">{role==='artist'?<DropdownMenuItem asChild><Link to="/studio">{t.account.studio}</Link></DropdownMenuItem>:role==='collector'?<DropdownMenuItem asChild><Link to="/my-tickets">{t.account.tickets}</Link></DropdownMenuItem>:<DropdownMenuItem asChild><Link to="/join">{t.account.finish}</Link></DropdownMenuItem>}<DropdownMenuItem onClick={()=>void logout()}>{t.account.logout}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}
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
