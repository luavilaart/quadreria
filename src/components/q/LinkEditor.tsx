import {Instagram,Youtube,Linkedin,Link as LinkIcon,Newspaper,X,Plus} from 'lucide-react';
import {QButton} from './QButton';
import {useTaxonomy} from './TaxonomyProvider';
import {featureCopy} from '@/i18n/features';
import {platforms,normalizeLink,type Platform,type RoomLink} from '@/lib/links';
export const PlatformIcon=({platform}:{platform:string})=>{const Icon=platform==='instagram'?Instagram:platform==='youtube'?Youtube:platform==='linkedin'?Linkedin:platform==='substack'?Newspaper:LinkIcon;return <Icon size={18} aria-hidden="true"/>;};
export type LinkDraft={platform:Platform;label:string;raw:string};
export const linkDrafts=(links:RoomLink[]):LinkDraft[]=>links.map(l=>({platform:l.platform,label:l.label,raw:l.platform==='custom'?l.url:l.username}));
export const resolveLinks=(drafts:LinkDraft[])=>drafts.filter(d=>d.raw.trim()||d.label.trim()&&d.platform==='custom').map(d=>normalizeLink(d.platform,d.raw,d.label));
export function LinkEditor({value,onChange}:{value:LinkDraft[];onChange:(v:LinkDraft[])=>void}){
 const {lang}=useTaxonomy();const c=featureCopy[lang];const input='mt-1 w-full min-w-0 rounded-xl border border-line bg-card px-4 py-3';
 const setPlatform=(platform:Platform,raw:string)=>{const other=value.filter(l=>l.platform!==platform);onChange(raw?[...other,{platform,label:'',raw}]:other);};
 return <div className="space-y-4">{platforms.map(p=><label key={p} className="block text-sm"><span className="flex items-center gap-2"><PlatformIcon platform={p}/>{c[p]}</span><input aria-label={c[p]} className={input} placeholder="@name" value={value.find(l=>l.platform===p)?.raw??''} onChange={e=>setPlatform(p,e.target.value)}/></label>)}{value.map((l,i)=>l.platform==='custom'?<div key={i} className="flex items-start gap-2"><div className="grid min-w-0 flex-1 gap-2"><label className="text-sm">{c.linkLabel}<input aria-label={`${c.linkLabel} ${i+1}`} className={input} value={l.label} onChange={e=>onChange(value.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/></label><label className="text-sm">{c.url}<input aria-label={`${c.url} ${i+1}`} type="url" className={input} value={l.raw} onChange={e=>onChange(value.map((x,j)=>j===i?{...x,raw:e.target.value}:x))}/></label></div><QButton className="mt-6 !p-2" aria-label={c.remove} title={c.remove} onClick={()=>onChange(value.filter((_,j)=>j!==i))}><X size={18}/></QButton></div>:null)}<QButton className="chip" onClick={()=>onChange([...value,{platform:'custom',label:'',raw:''}])}><Plus size={16}/>{c.addLink}</QButton></div>;
}