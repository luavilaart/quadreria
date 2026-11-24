import {useState} from 'react';
import {useSuspenseQuery} from '@tanstack/react-query';
import {galleryQuery,cities} from '@/lib/gallery';
import {activeEntries,label,isForSale} from '@/data/taxonomy';
import {useTaxonomy} from './TaxonomyProvider';
import {QButton} from './QButton';
import {PieceCard,RoomCard,ServiceCard,EventCard} from './Cards';
export function TaxonomyBrowse({initialMedium='',initialSpecialty='',language}:{initialMedium?:string;initialSpecialty?:string;language?:'en'|'es'}) {
 const {state,lang:globalLang,c:globalCopy}=useTaxonomy();const lang=language??globalLang;const c=language?taxonomyCopy[language]:globalCopy;
 const {data}=useSuspenseQuery(galleryQuery);const [tab,setTab]=useState('art');const [medium,setMedium]=useState(initialMedium);const [specialty,setSpecialty]=useState(initialSpecialty);const [format,setFormat]=useState('');const [price,setPrice]=useState('');const [city,setCity]=useState('');const [sale,setSale]=useState(false);
 const selector=(name:string,value:string,onChange:(v:string)=>void,options:{id:string;label:string}[])=><label className="min-w-0 text-sm">{name}<select aria-label={name} value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-3"><option value="">{c.all}</option>{options.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}</select></label>;
 const opts=(kind:'medium'|'specialty'|'format')=>activeEntries(state.taxonomy,kind,kind==='specialty'?medium:undefined).map(t=>({id:t.id,label:label(t,lang)}));
 const artistMatches=(id:string)=> (!medium||state.artist_mediums.some(m=>m.artist_id===id&&m.medium_id===medium))&&(!specialty||state.artist_specialties.some(s=>s.artist_id===id&&s.specialty_id===specialty));
 const pieces=data.pieces.filter(p=>(!medium||p.medium_id===medium)&&(!specialty||state.piece_specialties.some(s=>s.piece_id===p.id&&s.specialty_id===specialty))&&(!format||p.format_id===format)&&(!city||p.city===city)&&(!price||(price==='50'?p.price<50:price==='250'?p.price<250:p.price>=250))&&(!sale||isForSale(p))&&p.review_status==='approved');
 return <><div className="mt-6 flex rounded-full border border-line bg-card p-1" role="tablist">{(['art','artists','services','events'] as const).map(x=><QButton key={x} role="tab" aria-selected={tab===x} onClick={()=>setTab(x)} className={`flex-1 !px-1 !py-2 text-sm ${tab===x?'bg-ink text-wall':''}`}>{c[x]}</QButton>)}</div>
 <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{selector(c.mediums,medium,v=>{setMedium(v);setSpecialty('');},opts('medium'))}{selector(c.specialties,specialty,setSpecialty,medium?opts('specialty'):[])}{tab==='art'&&<>{selector(c.format,format,setFormat,opts('format'))}{selector(c.price,price,setPrice,[{id:'50',label:c.under50},{id:'250',label:c.under250},{id:'plus',label:c.over250}])}</>}{(tab==='art'||tab==='events')&&selector(c.city,city,setCity,cities.map(x=>({id:x,label:x})))}</div>
 {tab==='art'&&<label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={sale} onChange={e=>setSale(e.target.checked)}/>{c.sale}</label>}
 <div className="mt-8">{tab==='art'&&(pieces.length?<div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-4">{pieces.map(p=><PieceCard key={p.id} p={p}/>)}</div>:<p className="text-stone">{c.empty}</p>)}
 {tab==='artists'&&<div className="grid gap-4 sm:grid-cols-3">{data.artists.filter(a=>artistMatches(a.id)).map(a=><RoomCard key={a.id} a={a} language={lang}/>)}</div>}
 {tab==='services'&&<div className="grid gap-3 sm:grid-cols-2">{data.services.filter(s=>(!medium||s.medium_id===medium)&&(!specialty||s.specialty_ids.includes(specialty))).map(s=><ServiceCard key={s.id} s={s}/>)}</div>}
 {tab==='events'&&<div className="grid gap-3 sm:grid-cols-2">{data.events.filter(e=>artistMatches(e.artist)&&(!city||e.city===city)).map(e=><EventCard key={e.id} e={e}/>)}</div>}</div></>;
}
import {taxonomyCopy} from '@/i18n/taxonomy';
