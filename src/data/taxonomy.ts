import { mediumCatalog, formatCatalog, styleCatalog, taxonomyIntro, type Language } from '@/i18n/taxonomy';
export type TaxonomyKind = 'medium' | 'specialty' | 'format' | 'style';
export type TaxonomyEntry = { id:string; kind:TaxonomyKind; parent_id:string|null; slug:string; slug_es:string; label_en:string; label_es:string; intro_en:string; intro_es:string; sort_order:number; status:'active'|'pending'|'hidden'; suggested_by:string|null; merged_into:string|null };
export type ArtistMedium = {artist_id:string;medium_id:string;is_main:boolean};
export type ArtistSpecialty = {artist_id:string;specialty_id:string};
export type PieceSpecialty = {piece_id:string;specialty_id:string};
export type PieceStyle = {piece_id:string;style_id:string};
export type MediaKind = 'image'|'video'|'audio';
export type PieceMedia = {id:string;piece_id:string;kind:MediaKind;url:string;provider:'youtube'|'vimeo'|'soundcloud'|'spotify'|'bandcamp'|'upload';poster_url:string|null;duration_s:number|null};
export type TaxonomyPiece = {medium_id:string;format_id:string;media_type:MediaKind;edition:number|null};
export type Plan = 'free'|'pro';
export type TaxonomySettings = Record<Plan,{max_mediums:number;max_specialties:number;max_pieces:number;video_upload_max_s:number;audio_upload_max_s:number}>;
export const defaultSettings:TaxonomySettings = {free:{max_mediums:3,max_specialties:8,max_pieces:12,video_upload_max_s:60,audio_upload_max_s:300},pro:{max_mediums:6,max_specialties:20,max_pieces:12,video_upload_max_s:600,audio_upload_max_s:3600}};
function entry(kind:TaxonomyKind,row:readonly string[],order:number,parent:string|null=null):TaxonomyEntry {
 const [slug='',slug_es='',label_en='',label_es='']=row;
 return {id:parent?`${parent}:${slug}`:`${kind}:${slug}`,kind,parent_id:parent,slug,slug_es,label_en,label_es,...taxonomyIntro(label_en,label_es),sort_order:order,status:'active',suggested_by:null,merged_into:null};
}
export const taxonomy:TaxonomyEntry[] = mediumCatalog.flatMap(([slug,es,enLabel,esLabel,children],i)=>{const m=entry('medium',[slug,es,enLabel,esLabel],i);return [m,...children.map((r,j)=>entry('specialty',r,j,m.id))];}).concat(formatCatalog.map((r,i)=>entry('format',r,i)),styleCatalog.map((r,i)=>entry('style',r,i)));
export const label = (e:TaxonomyEntry,lang:Language='en')=>lang==='es'?e.label_es:e.label_en;
export const activeEntries=(rows:TaxonomyEntry[],kind:TaxonomyKind,parent?:string)=>rows.filter(e=>e.kind===kind&&e.status==='active'&&(!parent||e.parent_id===parent)&&(!e.parent_id||rows.some(p=>p.id===e.parent_id&&p.status==='active'))).sort((a,b)=>a.sort_order-b.sort_order);
export function validateSelection(mediums:ArtistMedium[],specialties:ArtistSpecialty[],rows:TaxonomyEntry[],plan:Plan,settings:TaxonomySettings):string|null {
 const limits=settings[plan];if(new Set(specialties.map(s=>s.specialty_id)).size!==specialties.length)return 'parentError';if(mediums.length>limits.max_mediums||specialties.length>limits.max_specialties)return 'limitError';
 if(mediums.some(m=>!rows.some(t=>t.kind==='medium'&&t.id===m.medium_id&&t.status==='active')))return 'parentError';
 if(mediums.length===0||mediums.filter(m=>m.is_main).length!==1||new Set(mediums.map(m=>m.medium_id)).size!==mediums.length)return 'mainError';
 if(specialties.some(s=>!rows.some(t=>t.id===s.specialty_id&&t.kind==='specialty'&&mediums.some(m=>m.medium_id===t.parent_id))))return 'parentError';
 return null;
}
export function validatePiece(count:number,media:PieceMedia[],plan:Plan,settings:TaxonomySettings):string|null {
 if(count>=settings[plan].max_pieces)return 'pieceError';
 if(media.some(m=>m.provider==='upload'&&m.kind!=='image'&&(m.duration_s===null||m.duration_s<=0||m.duration_s> (m.kind==='video'?settings[plan].video_upload_max_s:settings[plan].audio_upload_max_s))))return 'durationError';
 return null;
}
export const isForSale=(p:{format_id:string;status?:string})=>!['format:showcase-only','format:digital-download'].includes(p.format_id)&&p.status!=='sold'&&p.status!=='hidden';
export function mediaProvider(raw:string):PieceMedia['provider']|null {try{const host=new URL(raw).hostname.toLowerCase();for(const [domain,p] of [['youtube.com','youtube'],['youtu.be','youtube'],['vimeo.com','vimeo'],['soundcloud.com','soundcloud'],['spotify.com','spotify'],['bandcamp.com','bandcamp']] as const)if(host===domain||host.endsWith('.'+domain))return p;return null;}catch{return null;}}
export function embedUrl(m:PieceMedia):string|null {try{const u=new URL(m.url);if(mediaProvider(m.url)!==m.provider)return null;switch(m.provider){case 'youtube':{const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');return id&&/^[\w-]+$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1`:null;}case 'vimeo':return /^\/\d+$/.test(u.pathname)?`https://player.vimeo.com/video${u.pathname}?autoplay=1&muted=1`:null;case 'soundcloud':return `https://w.soundcloud.com/player/?url=${encodeURIComponent(m.url)}&auto_play=true`;case 'spotify':return `https://open.spotify.com/embed${u.pathname}`;case 'bandcamp':return u.pathname.startsWith('/EmbeddedPlayer/')?m.url:null;default:return null;}}catch{return null;}}
