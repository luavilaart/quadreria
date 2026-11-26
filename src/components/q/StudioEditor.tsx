import {useTaxonomy} from './TaxonomyProvider';
import {activeEntries,label} from '@/data/taxonomy';
import {LinkEditor,linkDrafts,resolveLinks} from './LinkEditor';
import {asRoomLinks} from '@/lib/links';
import {featureCopy} from '@/i18n/features';
import {serviceTypeCopy} from '@/i18n/taxonomy';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import { uploadImage } from './AccountProvider';
import { QButton } from './QButton';
import { useT } from '@/i18n';
import { roomColors, eventTypes } from '@/lib/gallery';
import { toast } from 'sonner';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
type Tables=Database['public']['Tables'];
type Kind='room'|'pieces'|'services'|'events';
type RecordData=Record<string,unknown>;
const list=(v:unknown)=>Array.isArray(v)?v.join('\n'):'';
const split=(v:unknown)=>String(v??'').split('\n').map(x=>x.trim()).filter(Boolean);
const pairs=(v:unknown,a:string,b:string)=>Array.isArray(v)?v.map(x=>`${x[a]} | ${x[b]}`).join('\n'):'';
const parsePairs=(v:unknown,a:string,b:string)=>split(v).map(line=>{const i=line.indexOf('|');return{[a]:line.slice(0,i).trim(),[b]:line.slice(i+1).trim()};});
export function StudioEditor({kind,row,owner,onClose}:{kind:Kind;row?:RecordData | undefined;owner:string;onClose:()=>void}){
 const {state,lang,c:taxCopy}=useTaxonomy();const fcopy=featureCopy[lang];
 const [links,setLinks]=useState(()=>linkDrafts(asRoomLinks(row?.['links'])));
 const [specialties,setSpecialties]=useState<string[]>(()=>state.piece_specialties.filter(s=>s.piece_id===row?.['id']).map(s=>s.specialty_id));
 const t=useT(); const c=t.account; const qc=useQueryClient();const router=useRouter();
 const [form,setForm]=useState<RecordData>(()=> kind==='room'?{...row,loves:list(row?.['loves']),links:pairs(row?.['links'],'label','url'),faq:pairs(row?.['faq'],'q','a')}:{title:'',price:0,medium:'',medium_id:activeEntries(state.taxonomy,'medium')[0]?.id??'',format_id:'format:original',size:'',collection:'',ratio:1,city:'',status:kind==='events'?'published':'available',published:false,price_type:'fixed',description:'',type:'Class',date:'',start_time:'17:00',end_time:'18:00',address:'',online_link:'',capacity:10,blurb:'',...row,tags:list(row?.['tags']),bring:list(row?.['bring'])});
 const [files,setFiles]=useState<File[]>([]);const [busy,setBusy]=useState(false);
 const input='mt-1 w-full rounded-xl border border-line bg-wall px-4 py-3';
 const set=(key:string,value:unknown)=>setForm(f=>({...f,[key]:value}));
 const field=(key:string,label:string,type='text')=><label key={key} className="block text-sm">{label}<input required={['title','date'].includes(key)} aria-label={label} type={type} step={key==='ratio'?'any':type==='number'?'0.01':undefined} min={type==='number'?key==='ratio'?0.01:key==='capacity'?1:0:undefined} value={String(form[key]??'')} onChange={e=>set(key,type==='number'?Number(e.target.value):e.target.value)} className={input}/></label>;
 const area=(key:string,label:string)=><label key={key} className="block text-sm">{label}<textarea aria-label={label} rows={3} className={input} value={String(form[key]??'')} onChange={e=>set(key,e.target.value)}/></label>;
 const select=(key:string,label:string,options:{value:string;label:string}[])=><label key={key} className="block text-sm">{label}<select aria-label={label} value={String(form[key]??'')} onChange={e=>set(key,e.target.value)} className={input}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
 const bool=(key:string,label:string)=><label className="flex items-center gap-3"><input type="checkbox" checked={!!form[key]} onChange={e=>set(key,e.target.checked)}/>{label}</label>;
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);try{
  if(kind==='room'){
   const parsed=resolveLinks(links);if(parsed.some(l=>!l))throw new Error(fcopy.linkInvalid);
   const data:Tables['rooms']['Update']={tagline:String(form['tagline']??''),bio:String(form['bio']??''),room_color:String(form['room_color']??'cream'),loves:split(form['loves']),links:parsed as Json,faq:parsePairs(form['faq'],'q','a') as Json,published:!!form['published'],section_order:form['section_order'] as string[],visible_sections:form['visible_sections'] as string[]};
   const {error}=await supabase.from('rooms').update(data).eq('id',owner);if(error)throw error;
  }else if(kind==='pieces'){
   const urls=[...(Array.isArray(form['images'])?form['images'] as string[]:[])];for(const file of files)urls.push(await uploadImage('piece-images',owner,file,c.uploadError));
   const data:Tables['pieces']['Insert']={artist:owner,title:String(form['title']),price:Number(form['price']),medium:String(form['medium']),medium_id:String(form['medium_id']),format_id:String(form['format_id']),size:String(form['size']),collection:String(form['collection']),tags:split(form['tags']),ratio:Number(form['ratio']),city:String(form['city']),status:String(form['status']),images:urls};
   const result=row?.['id']?await supabase.from('pieces').update(data).eq('id',String(row['id'])).select('id').single():await supabase.from('pieces').insert(data).select('id').single();if(result.error)throw result.error;const {error:specError}=await supabase.rpc('save_piece_specialties',{target_piece:result.data.id,specialty_ids:specialties});if(specError)throw specError;
  }else if(kind==='services'){
   const data:Tables['services']['Insert']={artist:owner,title:String(form['title']),price:Number(form['price']),price_type:String(form['price_type']),description:String(form['description']),published:!!form['published'],service_type_id:String(form['service_type_id']??'')||null};const result=row?.['id']?await supabase.from('services').update(data).eq('id',String(row['id'])):await supabase.from('services').insert(data);if(result.error)throw result.error;
  }else{
   let cover=String(form['cover_image']??'')||null;if(files[0])cover=await uploadImage('event-covers',owner,files[0],c.uploadError);
   const data:Tables['events']['Insert']={artist:owner,title:String(form['title']),price:Number(form['price']),type:String(form['type']),date:String(form['date']),start_time:String(form['start_time']),end_time:String(form['end_time']),city:String(form['city']),address:String(form['address']),online_link:String(form['online_link']),capacity:Number(form['capacity']),bring:split(form['bring']),blurb:String(form['blurb']),cover_image:cover,status:String(form['status'])};const result=row?.['id']?await supabase.from('events').update(data).eq('id',String(row['id'])):await supabase.from('events').insert(data);if(result.error)throw result.error;
  }
  await qc.invalidateQueries();await router.invalidate();toast.success(c.saved);onClose();
 }catch(e){toast.error(e instanceof Error?e.message:c.error);}finally{setBusy(false);}}
 const sectionLabels:Record<string,string>={work:t.room.work,media:fcopy.listen,shop:t.room.shop,services:t.room.services,events:t.room.events,about:t.room.about,links:t.room.links,faq:t.room.faq,contact:t.room.contact};
 const order=(form['section_order'] as string[]|undefined)??['work','shop','services','events','about','links','faq','contact'];const visible=(form['visible_sections'] as string[]|undefined)??order;
 return <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 px-5 py-8"><form onSubmit={save} role="dialog" aria-modal="true" aria-label={c.edit} className="mx-auto max-w-2xl space-y-4 rounded-2xl bg-card p-6"><div className="flex items-center justify-between"><h2 className="text-2xl">{kind==='room'?c.room:c.edit}</h2><QButton aria-label={c.cancel} onClick={onClose}><X/></QButton></div>
 {kind==='room'?<>{field('tagline',c.tagline)}{area('bio',c.bio)}<p>{c.color}</p><div className="flex flex-wrap gap-2">{roomColors.map(color=><QButton key={color.id} aria-label={t.roomColors[color.id]} title={t.roomColors[color.id]} aria-pressed={form['room_color']===color.id} onClick={()=>set('room_color',color.id)} className={`room-${color.id} h-10 w-10 !p-0 bg-room border ${form['room_color']===color.id?'ring-2 ring-ink':'border-line'}`}/>)}</div>{area('loves',c.loves+' · '+c.separator)}<h3>{c.links}</h3><LinkEditor value={links} onChange={setLinks}/>{area('faq',c.faq+' · '+c.faqFormat)}{bool('published',c.published)}<h3>{c.sections}</h3>{order.map((id,i)=><div key={id} className="flex items-center gap-3"><label className="flex flex-1 items-center gap-3"><input type="checkbox" checked={visible.includes(id)} onChange={e=>set('visible_sections',e.target.checked?[...visible,id]:visible.filter(x=>x!==id))}/>{sectionLabels[id]??id}</label>{[-1,1].map(dir=><QButton key={dir} aria-label={dir<0?c.up:c.down} title={dir<0?c.up:c.down} disabled={i+dir<0||i+dir>=order.length} onClick={()=>{const next=[...order];const target=next[i+dir];if(!target)return;next[i+dir]=id;next[i]=target;set('section_order',next);}}>{dir<0?<ArrowUp/>:<ArrowDown/>}</QButton>)}</div>)}</>:<>{field('title',c.title)}{field('price',c.price,'number')}
 {kind==='pieces'?<><label className="block text-sm">{fcopy.medium}<select aria-label={fcopy.medium} className={input} value={String(form['medium_id']??'')} onChange={e=>{set('medium_id',e.target.value);setSpecialties([]);}}>{activeEntries(state.taxonomy,'medium').map(t=><option key={t.id} value={t.id}>{label(t,lang)}</option>)}</select></label><div className="flex flex-wrap gap-2">{activeEntries(state.taxonomy,'specialty',String(form['medium_id']??'')).map(t=><QButton key={t.id} className={`chip ${specialties.includes(t.id)?'chip-on':''}`} aria-pressed={specialties.includes(t.id)} onClick={()=>setSpecialties(s=>s.includes(t.id)?s.filter(x=>x!==t.id):[...s,t.id])}>{label(t,lang)}</QButton>)}</div>{select('format_id',taxCopy.format,activeEntries(state.taxonomy,'format').map(t=>({value:t.id,label:label(t,lang)})))}{field('size',c.size)}{field('collection',c.collection)}{area('tags',c.tags+' · '+c.separator)}{field('ratio',c.ratio,'number')}{field('city',c.city)}{select('status',c.status,[{value:'available',label:c.available},{value:'sold',label:c.sold},{value:'hidden',label:c.hidden}])}<div className="flex flex-wrap gap-3">{(Array.isArray(form['images'])?form['images'] as string[]:[]).map(url=><div key={url} className="w-20"><img src={url} alt={c.artwork} className="w-full object-contain"/><QButton aria-label={c.remove} onClick={()=>set('images',(form['images'] as string[]).filter(x=>x!==url))}><X/></QButton></div>)}</div></>:kind==='services'?<>{select('service_type_id',serviceTypeCopy[lang].type,[{value:'',label:serviceTypeCopy[lang].untyped},...activeEntries(state.taxonomy,'service').map(t=>({value:t.id,label:label(t,lang)}))])}{area('description',c.description)}{select('price_type',c.priceType,[{value:'fixed',label:c.fixed},{value:'hourly',label:c.hourly},{value:'consult',label:c.consult}])}{bool('published',c.published)}</>:<>{select('type',c.type,eventTypes.map(x=>({value:x,label:t.eventTypes[x]??x})))}{field('date',c.date,'date')}<div className="grid grid-cols-2 gap-3">{field('start_time',c.start,'time')}{field('end_time',c.end,'time')}</div>{field('city',c.city)}{field('address',c.address)}{field('online_link',c.online,'url')}{field('capacity',c.capacity,'number')}{area('bring',c.bring+' · '+c.separator)}{area('blurb',c.description)}{select('status',c.status,[{value:'published',label:c.published},{value:'cancelled',label:c.cancelled}])}</>}
 {kind!=='services'&&<label className="block">{kind==='pieces'?c.images:c.cover}<input aria-label={kind==='pieces'?c.images:c.cover} type="file" accept="image/*" multiple={kind==='pieces'} className="mt-2 block w-full" onChange={e=>setFiles(Array.from(e.target.files??[]))}/></label>}</>}
 <div className="flex gap-3"><QButton type="submit" disabled={busy} className="btn-primary flex-1">{busy?c.saving:c.save}</QButton><QButton disabled={busy} onClick={onClose} className="btn-ghost">{c.cancel}</QButton></div></form></div>;
}
