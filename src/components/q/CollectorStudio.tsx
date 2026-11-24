import { useState } from 'react';
import { Page } from './Shell';
import { QButton } from './QButton';
import { SavedWall } from './SavedWall';
import { TicketsContent } from './TicketsContent';
import { useSocialCopy } from '@/i18n/social';
export function CollectorStudio(){
 const c=useSocialCopy();const [tab,setTab]=useState<'favorites'|'following'|'tickets'|'orders'>('favorites');
 return <Page><div className="mx-auto max-w-5xl px-5 pt-10"><h1 className="text-4xl">{c.title}</h1><div className="mt-6 flex flex-wrap gap-2" role="tablist">{(['favorites','following','tickets','orders'] as const).map(key=><QButton key={key} role="tab" aria-selected={tab===key} className={`chip ${tab===key?'chip-on':''}`} onClick={()=>setTab(key)}>{c[key]}</QButton>)}</div><section className="mt-8" role="tabpanel" aria-label={c[tab]}>{tab==='favorites'||tab==='following'?<SavedWall kind={tab}/>:tab==='tickets'?<TicketsContent/>:<p className="text-stone">{c.emptyOrders}</p>}</section></div></Page>;
}