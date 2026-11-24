import {useAccount} from './AccountProvider';
import {useTaxonomy} from './TaxonomyProvider';
import {featureCopy} from '@/i18n/features';
import {supabase} from '@/integrations/supabase/client';
import {toast} from 'sonner';
import { useState } from 'react';
import { Page } from './Shell';
import { QButton } from './QButton';
import { SavedWall } from './SavedWall';
import { TicketsContent } from './TicketsContent';
import { useSocialCopy } from '@/i18n/social';
export function CollectorStudio(){
 const {user,profile,refresh}=useAccount();const {lang}=useTaxonomy();const f=featureCopy[lang];const [name,setName]=useState<string|null>(null);
 const c=useSocialCopy();const [tab,setTab]=useState<'favorites'|'following'|'tickets'|'orders'>('favorites');
 return <Page><div className="mx-auto max-w-5xl px-5 pt-10"><h1 className="text-4xl">{c.title}</h1><details className="mt-4"><summary className="link cursor-pointer">{f.profile}</summary><form className="mt-3 flex flex-wrap gap-3" onSubmit={async e=>{e.preventDefault();if(!user)return;const {error}=await supabase.from('profiles').update({display_name:(name??profile?.display_name??'').trim()}).eq('id',user.id);if(error){toast.error(error.message);return;}await refresh();toast.success(f.saved);}}><label className="min-w-0 flex-1">{f.name}<input aria-label={f.name} required value={name??profile?.display_name??''} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-card px-4 py-3"/></label><QButton type="submit" className="btn-primary self-end">{f.save}</QButton></form></details><div className="mt-6 flex flex-wrap gap-2" role="tablist">{(['favorites','following','tickets','orders'] as const).map(key=><QButton key={key} role="tab" aria-selected={tab===key} className={`chip ${tab===key?'chip-on':''}`} onClick={()=>setTab(key)}>{c[key]}</QButton>)}</div><section className="mt-8" role="tabpanel" aria-label={c[tab]}>{tab==='favorites'||tab==='following'?<SavedWall kind={tab}/>:tab==='tickets'?<TicketsContent/>:<p className="text-stone">{c.emptyOrders}</p>}</section></div></Page>;
}