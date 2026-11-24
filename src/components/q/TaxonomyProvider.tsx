import {createContext,useContext,useState,type ReactNode} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useRouter} from '@tanstack/react-router';
import {taxonomy,defaultSettings,type TaxonomyEntry,type TaxonomySettings,type ArtistMedium,type ArtistSpecialty,type PieceStyle,type PieceSpecialty,type PieceMedia} from '@/data/taxonomy';
import {artist_mediums,artist_specialties,piece_styles,piece_specialties,piece_media,type SampleGallery,sampleGallery} from '@/data/sample-gallery';
import {galleryQuery} from '@/lib/gallery';
import {taxonomyCopy,type Language} from '@/i18n/taxonomy';
export type SampleState={taxonomy:TaxonomyEntry[];settings:TaxonomySettings;artist_mediums:ArtistMedium[];artist_specialties:ArtistSpecialty[];piece_styles:PieceStyle[];piece_specialties:PieceSpecialty[];piece_media:PieceMedia[];gallery:SampleGallery;notifications:{artist_id:string;message:string}[]};
const initial:SampleState={taxonomy,settings:defaultSettings,artist_mediums,artist_specialties,piece_styles,piece_specialties,piece_media,gallery:sampleGallery,notifications:[]};
export function resolveSuggestion(s:SampleState,id:string,target:TaxonomyEntry|null):SampleState {
 const old=s.taxonomy.find(t=>t.id===id);if(!old)return s;
 const affected=new Set([...s.artist_specialties.filter(a=>a.specialty_id===id).map(a=>a.artist_id),...s.piece_styles.filter(a=>a.style_id===id).map(a=>s.gallery.pieces.find(p=>p.id===a.piece_id)?.artist??'')]);
 const replacement=target?.id;
 const dedupe=<T,>(rows:T[])=>rows.filter((r,i)=>rows.findIndex(x=>JSON.stringify(x)===JSON.stringify(r))===i);
 return {...s,taxonomy:s.taxonomy.map(t=>t.id===id?(target?.id===id?target:{...t,status:'hidden',merged_into:replacement??null}):t),artist_specialties:dedupe(s.artist_specialties.flatMap(a=>a.specialty_id!==id?[a]:replacement?[{...a,specialty_id:replacement}]:[])),piece_specialties:dedupe(s.piece_specialties.flatMap(a=>a.specialty_id!==id?[a]:replacement?[{...a,specialty_id:replacement}]:[])),piece_styles:dedupe(s.piece_styles.flatMap(a=>a.style_id!==id?[a]:replacement?[{...a,style_id:replacement}]:[])),notifications:[...s.notifications,...[...affected].filter(Boolean).map(artist_id=>({artist_id,message:target?'updated':'rejected'}))]};
}
const Context=createContext<{state:SampleState;update:(fn:(s:SampleState)=>SampleState)=>void;lang:Language;setLang:(l:Language)=>void}|null>(null);
export function TaxonomyProvider({children}:{children:ReactNode}) {
 const [localState,setState]=useState(initial);const {data}=useQuery(galleryQuery);const state:SampleState=data?{...localState,taxonomy:data.taxonomy,artist_mediums:data.artist_mediums,artist_specialties:data.artist_specialties,piece_specialties:data.piece_specialties,gallery:data}:localState;const [lang,setLang]=useState<Language>('en');const qc=useQueryClient();const router=useRouter();
 function update(fn:(s:SampleState)=>SampleState){const next=fn(state);setState(next);qc.setQueryData(['gallery'],{...data,...next.gallery,taxonomy:next.taxonomy,artist_mediums:next.artist_mediums,artist_specialties:next.artist_specialties,piece_specialties:next.piece_specialties});qc.setQueryData(['taxonomy'],next.taxonomy);void router.invalidate();}
 return <Context.Provider value={{state,update,lang,setLang}}>{children}</Context.Provider>;
}
export function useTaxonomy(){const value=useContext(Context);if(!value)throw new Error('TaxonomyProvider missing');return {...value,c:taxonomyCopy[value.lang]};}
