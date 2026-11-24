import {useNavigate,useSearch} from '@tanstack/react-router';
import {useQuery,useSuspenseQuery} from '@tanstack/react-query';
import {useAccount} from './AccountProvider';
import {useTaxonomy} from './TaxonomyProvider';
import {PieceCard} from './Cards';
import {QButton} from './QButton';
import {featureCopy} from '@/i18n/features';
import {activeEntries,label} from '@/data/taxonomy';
import {sortModes,sortPieces,validateShopSearch,type ShopSearch} from '@/lib/shop';
import {galleryQuery,type Piece} from '@/lib/gallery';
import {socialQuery} from '@/lib/social';
export function useShopState(initialMedium='',initialSpecialty=''){
 const {state}=useTaxonomy();const raw=useSearch({strict:false});const search=validateShopSearch(raw as Record<string,unknown>);const navigate=useNavigate();
 const medium=state.taxonomy.find(t=>t.kind==='medium'&&[t.id,t.slug,t.label_en].includes(search.medium||initialMedium))?.id??'';
 const specialty=state.taxonomy.find(t=>t.kind==='specialty'&&t.parent_id===medium&&[t.id,t.slug].includes(search.specialty||initialSpecialty))?.id??'';
 const change=(patch:Partial<ShopSearch>)=>void navigate({search:prev=>({...prev,...patch})});
 return {search:{...search,medium,specialty},change};
}
export function ShopFilters({search,change,sort=true,language}:{search:ShopSearch;change:(p:Partial<ShopSearch>)=>void;sort?:boolean;language?:'en'|'es'}){
 const {state,lang:global}=useTaxonomy();const lang=language??global;const c=featureCopy[lang];const {data}=useSuspenseQuery(galleryQuery);const cities=[...new Set([...data.artists.map(a=>a.city),...data.pieces.map(p=>p.city)])].filter(Boolean).sort();
 const select=(name:string,value:string,key:'medium'|'city'|'sort',options:{id:string;name:string}[],all=true)=><label className="min-w-0 text-sm">{name}<select aria-label={name} className="mt-1 w-full min-w-0 rounded-xl border border-line bg-card px-3 py-3 text-ink" value={value} onChange={e=>change(key==='medium'?{medium:e.target.value,specialty:''}:{[key]:e.target.value})}>{all&&<option value="">{c.all}</option>}{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>;
 return <div className="mb-6 text-ink"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{select(c.medium,search.medium,'medium',activeEntries(state.taxonomy,'medium').map(t=>({id:t.id,name:label(t,lang)})))}{select(c.city,search.city,'city',cities.map(x=>({id:x,name:x})))}{sort&&<div className="col-span-2 sm:col-span-1">{select(c.sort,sortModes.includes(search.sort as typeof sortModes[number])?search.sort:'recommended','sort',sortModes.map(id=>({id,name:c[id]})),false)}</div>}</div>{search.medium&&<div className="mt-4 flex flex-wrap gap-2" aria-label={c.specialty}>{[{id:'',name:c.all},...activeEntries(state.taxonomy,'specialty',search.medium).map(t=>({id:t.id,name:label(t,lang)}))].map(t=><QButton key={t.id} className={`chip text-sm ${search.specialty===t.id?'chip-on':''}`} aria-pressed={search.specialty===t.id} onClick={()=>change({specialty:t.id})}>{t.name}</QButton>)}</div>}</div>;
}
export function ShopGrid({rows,initialMedium='',initialSpecialty='',language,showArtist=true}:{rows:Piece[];initialMedium?:string;initialSpecialty?:string;language?:'en'|'es';showArtist?:boolean}){
 const {state,lang}=useTaxonomy();const {search,change}=useShopState(initialMedium,initialSpecialty);const {user,profile}=useAccount();const {data}=useSuspenseQuery(galleryQuery);const social=useQuery({...socialQuery(user?.id??''),enabled:!!user});
 const filtered=rows.filter(p=>(!search.medium||p.medium_id===search.medium)&&(!search.specialty||state.piece_specialties.some(s=>s.piece_id===p.id&&s.specialty_id===search.specialty))&&(!search.city||p.city===search.city));
 const pieces=sortPieces(filtered,search.sort,{counts:data.favoriteCounts,interests:profile?.interest_medium_ids??[],followed:social.data?.artists??[]});
 return <><ShopFilters search={search} change={change} {...language?{language}:{}}/>{pieces.length?<div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-4">{pieces.map(p=><PieceCard key={p.id} p={p} showArtist={showArtist}/>)}</div>:<p className="text-stone">{featureCopy[language??lang].noResults}</p>}</>;
}