import { mediumCatalog, formatCatalog, styleCatalog, serviceCatalog, artistSpecialtyCopy, taxonomyIntro, type Language } from '@/i18n/taxonomy';
export type TaxonomyKind = 'medium' | 'specialty' | 'format' | 'style' | 'service';
export type TaxonomyEntry = { id:string; kind:TaxonomyKind; parent_id:string|null; slug:string; slug_es:string; label_en:string; label_es:string; intro_en:string; intro_es:string; sort_order:number; status:'active'|'pending'|'hidden'; suggested_by:string|null; merged_into:string|null };
export type ArtistMedium = {artist_id:string;medium_id:string;is_main:boolean};
export type ArtistSpecialty = {artist_id:string;specialty_id:string};
export type PieceSpecialty = {piece_id:string;specialty_id:string};
export type PieceStyle = {piece_id:string;style_id:string};
export type MediaKind = 'image'|'video'|'audio';
export type PieceMedia = {id:string;piece_id:string;kind:MediaKind;url:string;provider:'youtube'|'vimeo'|'soundcloud'|'spotify'|'bandcamp'|'upload';poster_url:string|null;duration_s:number|null;size_mb?:number|null};
export type TaxonomyPiece = {medium_id:string;format_id:string;media_type:MediaKind;edition:number|null};
export type Plan = 'free'|'pro';
/** max_pieces null means unlimited (Pro, per the build brief). Upload sizes are in MB. */
export type TaxonomySettings = Record<Plan,{max_mediums:number;max_specialties:number;max_pieces:number|null;video_upload_max_s:number;audio_upload_max_s:number;video_upload_max_mb:number;audio_upload_max_mb:number}>;
// Pro upload sizes are placeholders until the open question on Pro limits is answered.
export const defaultSettings:TaxonomySettings = {free:{max_mediums:3,max_specialties:8,max_pieces:12,video_upload_max_s:60,audio_upload_max_s:300,video_upload_max_mb:100,audio_upload_max_mb:20},pro:{max_mediums:6,max_specialties:20,max_pieces:null,video_upload_max_s:600,audio_upload_max_s:3600,video_upload_max_mb:500,audio_upload_max_mb:100}};
function entry(kind:TaxonomyKind,row:readonly string[],order:number,parent:string|null=null):TaxonomyEntry {
 const [slug='',slug_es='',label_en='',label_es='']=row;
 return {id:parent&&kind==='specialty'?`${parent}:${slug}`:`${kind}:${slug}`,kind,parent_id:parent,slug,slug_es,label_en,label_es,...taxonomyIntro(label_en,label_es),sort_order:order,status:'active',suggested_by:null,merged_into:null};
}
export const taxonomy:TaxonomyEntry[] = mediumCatalog.flatMap(([slug,es,enLabel,esLabel,children],i)=>{const m=entry('medium',[slug,es,enLabel,esLabel],i);return [m,...children.map((r,j)=>entry('specialty',r,j,m.id))];}).concat(formatCatalog.map((r,i)=>entry('format',r,i)),styleCatalog.map((r,i)=>entry('style',r,i)),serviceCatalog.map((r,i)=>entry('service',r,i,r[4])));
export const label = (e:TaxonomyEntry,lang:Language='en')=>lang==='es'?e.label_es:e.label_en;
export const artistSpecialtyLabel = (e:TaxonomyEntry,lang:Language='en')=>e.id==='medium:painting:mural'?artistSpecialtyCopy[lang].mural:label(e,lang);
export function taxonomyAncestors(rows:TaxonomyEntry[],id:string):TaxonomyEntry[] { const result:TaxonomyEntry[]=[];let current=rows.find(t=>t.id===id);while(current&&!result.some(t=>t.id===current?.id)){result.push(current);current=rows.find(t=>t.id===current?.parent_id);}return result; }
export const activeEntries=(rows:TaxonomyEntry[],kind:TaxonomyKind,parent?:string)=>rows.filter(e=>{const chain=taxonomyAncestors(rows,e.id);return e.kind===kind&&(!parent||e.parent_id===parent)&&chain.at(-1)?.parent_id===null&&chain.every(t=>t.status==='active');}).sort((a,b)=>a.sort_order-b.sort_order);
export function serviceTaxonomy(rows:TaxonomyEntry[],id:string|null|undefined){const chain=id?taxonomyAncestors(rows,id):[];return {medium_id:chain.find(t=>t.kind==='medium')?.id??'',specialty_ids:chain.filter(t=>t.kind==='specialty').map(t=>t.id)};}
export function validateSelection(mediums:ArtistMedium[],specialties:ArtistSpecialty[],rows:TaxonomyEntry[],plan:Plan,settings:TaxonomySettings):string|null {
 const limits=settings[plan];if(new Set(specialties.map(s=>s.specialty_id)).size!==specialties.length)return 'parentError';if(mediums.length>limits.max_mediums||specialties.length>limits.max_specialties)return 'limitError';
 if(mediums.some(m=>!rows.some(t=>t.kind==='medium'&&t.id===m.medium_id&&t.status==='active')))return 'parentError';
 if(mediums.length===0||mediums.filter(m=>m.is_main).length!==1||new Set(mediums.map(m=>m.medium_id)).size!==mediums.length)return 'mainError';
 if(specialties.some(s=>!rows.some(t=>t.id===s.specialty_id&&t.kind==='specialty'&&mediums.some(m=>m.medium_id===t.parent_id))))return 'parentError';
 return null;
}
export function validatePiece(count:number,media:PieceMedia[],plan:Plan,settings:TaxonomySettings):string|null {
 const maxPieces=settings[plan].max_pieces;if(maxPieces!==null&&count>=maxPieces)return 'pieceError';
 if(media.some(m=>m.provider==='upload'&&m.kind!=='image'&&(m.duration_s===null||m.duration_s<=0||m.duration_s> (m.kind==='video'?settings[plan].video_upload_max_s:settings[plan].audio_upload_max_s))))return 'durationError';
 if(media.some(m=>m.provider==='upload'&&m.kind!=='image'&&m.size_mb!=null&&m.size_mb>(m.kind==='video'?settings[plan].video_upload_max_mb:settings[plan].audio_upload_max_mb)))return 'sizeError';
 return null;
}
export const isForSale=(p:{format_id:string;status?:string})=>!['format:showcase-only','format:digital-download'].includes(p.format_id)&&p.status!=='sold'&&p.status!=='hidden';
export function mediaProvider(raw:string):PieceMedia['provider']|null {try{const host=new URL(raw).hostname.toLowerCase();for(const [domain,p] of [['youtube.com','youtube'],['youtu.be','youtube'],['vimeo.com','vimeo'],['soundcloud.com','soundcloud'],['spotify.com','spotify'],['bandcamp.com','bandcamp']] as const)if(host===domain||host.endsWith('.'+domain))return p;return null;}catch{return null;}}
export function embedUrl(m:PieceMedia):string|null {try{const u=new URL(m.url);if(mediaProvider(m.url)!==m.provider)return null;switch(m.provider){case 'youtube':{const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');return id&&/^[\w-]+$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1`:null;}case 'vimeo':return /^\/\d+$/.test(u.pathname)?`https://player.vimeo.com/video${u.pathname}?autoplay=1&muted=1`:null;case 'soundcloud':return `https://w.soundcloud.com/player/?url=${encodeURIComponent(m.url)}&auto_play=true`;case 'spotify':return `https://open.spotify.com/embed${u.pathname}`;case 'bandcamp':return u.pathname.startsWith('/EmbeddedPlayer/')?m.url:null;default:return null;}}catch{return null;}}
