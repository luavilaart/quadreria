import {createFileRoute} from '@tanstack/react-router';
import {Page} from '@/components/q/Shell';
import {TaxonomyBrowse} from '@/components/q/TaxonomyBrowse';
import {useTaxonomy} from '@/components/q/TaxonomyProvider';
import {galleryQuery} from '@/lib/gallery';
import {pageHead} from '@/lib/head';
export const Route=createFileRoute('/discover')({validateSearch:(s:Record<string,unknown>):{medium?:string}=>typeof s['medium']==='string'?{medium:s['medium']}:{},loader:({context})=>context.queryClient.ensureQueryData(galleryQuery),head:()=>pageHead('Discover art, artists and specialties','Explore ten mediums, artist specialties, piece formats and events on quadreria.'),component:Discover});
function Discover(){const {state,c}=useTaxonomy();const {medium}=Route.useSearch();const id=state.taxonomy.find(t=>t.kind==='medium'&&(t.id===medium||t.slug===medium||t.label_en===medium))?.id??'';return <Page><div className="mx-auto max-w-6xl px-5 pt-10"><h1 className="text-4xl">{c.art} · quadreria</h1><TaxonomyBrowse key={id} initialMedium={id}/></div></Page>;}
