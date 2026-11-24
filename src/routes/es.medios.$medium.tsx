import {shopSearchValidator} from '@/lib/shop';
import {createFileRoute,notFound} from '@tanstack/react-router';
import {taxonomy,label,type TaxonomyEntry} from '@/data/taxonomy';
import {galleryQuery} from '@/lib/gallery';
import {pageHead} from '@/lib/head';
import {pathSearch} from '@/data/discovery';
import {TaxonomyPage} from '@/components/q/TaxonomyPage';
export const Route=createFileRoute('/es/medios/$medium')({validateSearch:pathSearch,loader:async({params,context})=>{await context.queryClient.ensureQueryData(galleryQuery);const rows=context.queryClient.getQueryData<TaxonomyEntry[]>(['taxonomy'])??taxonomy;const medium=rows.find(t=>t.kind==='medium'&&t.slug_es===params.medium&&t.status==='active');if(!medium)throw notFound();return {medium};},head:({loaderData:d})=>d?pageHead(label(d.medium,'es'),d.medium.intro_es):pageHead('Unavailable','This quadreria section is unavailable.'),component:Browse});
function Browse(){const {medium}=Route.useLoaderData();return <TaxonomyPage medium={medium} lang='es'/>;}
