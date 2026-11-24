import {useEffect} from 'react';
import {Link} from '@tanstack/react-router';
import {Page} from './Shell';
import {TaxonomyBrowse} from './TaxonomyBrowse';
import {useTaxonomy} from './TaxonomyProvider';
import {activeEntries,label,type TaxonomyEntry} from '@/data/taxonomy';
import type {Language} from '@/i18n/taxonomy';
export function TaxonomyPage({medium,specialty,lang}:{medium:TaxonomyEntry;specialty?:TaxonomyEntry;lang:Language}){
 const {state,setLang}=useTaxonomy();useEffect(()=>setLang(lang),[lang]);const selected=specialty??medium;
 return <Page><div className="mx-auto max-w-6xl px-5 pt-10"><p className="label text-stone">{label(medium,lang)}</p><h1 className="mt-2 text-4xl">{label(selected,lang)}</h1><p className="mt-4 max-w-2xl text-stone">{lang==='es'?selected.intro_es:selected.intro_en}</p><div className="mt-6 flex flex-wrap gap-2">{activeEntries(state.taxonomy,'specialty',medium.id).map(t=>lang==='es'?<Link key={t.id} to="/es/medios/$medium/$specialty" params={{medium:medium.slug_es,specialty:t.slug_es}} className="chip">{label(t,lang)}</Link>:<Link key={t.id} to="/mediums/$medium/$specialty" params={{medium:medium.slug,specialty:t.slug}} className="chip">{label(t,lang)}</Link>)}</div><TaxonomyBrowse fixed={{medium,specialty,lang}}/></div></Page>;
}
