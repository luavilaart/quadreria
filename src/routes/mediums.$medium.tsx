import {createFileRoute,notFound} from '@tanstack/react-router';
import {taxonomy,label,type TaxonomyEntry} from '@/data/taxonomy';
import {galleryQuery} from '@/lib/gallery';
import {pageHead} from '@/lib/head';
import {pathSearch} from '@/data/discovery';
import {TaxonomyPage} from '@/components/q/TaxonomyPage';
export const Route=createFileRoute('/mediums/$medium')({validateSearch:pathSearch,loader:async({params,context})=>{await context.queryClient.ensureQueryData(galleryQuery);const rows=context.queryClient.getQueryData<TaxonomyEntry[]>(['taxonomy'])??taxonomy;const medium=rows.find(t=>t.kind==='medium'&&t.slug===params.medium&&t.status==='active');if(!medium)throw notFound();return {medium};},head:({loaderData:d})=>d?pageHead(label(d.medium,'en'),d.medium.intro_en):pageHead('Unavailable','This quadreria section is unavailable.'),component:Browse});
function Browse(){const {medium}=Route.useLoaderData();return <TaxonomyPage medium={medium} lang='en'/>;}
