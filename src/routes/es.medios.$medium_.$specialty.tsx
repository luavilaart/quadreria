import {createFileRoute,notFound} from '@tanstack/react-router';
import {taxonomy,label,type TaxonomyEntry} from '@/data/taxonomy';
import {galleryQuery} from '@/lib/gallery';
import {pageHead} from '@/lib/head';
import {TaxonomyPage} from '@/components/q/TaxonomyPage';
export const Route=createFileRoute('/es/medios/$medium_/$specialty')({loader:async({params,context})=>{await context.queryClient.ensureQueryData(galleryQuery);const rows=context.queryClient.getQueryData<TaxonomyEntry[]>(['taxonomy'])??taxonomy;const medium=rows.find(t=>t.kind==='medium'&&t.slug_es===params.medium&&t.status==='active');if(!medium)throw notFound();const specialty=rows.find(t=>t.kind==='specialty'&&t.parent_id===medium.id&&t.slug_es===params.specialty&&t.status==='active');if(!specialty)throw notFound();return {medium,specialty};},head:({loaderData:d})=>d?pageHead(label(d.specialty,'es'),d.specialty.intro_es):pageHead('Unavailable','This quadreria section is unavailable.'),component:Browse});
function Browse(){const {medium,specialty}=Route.useLoaderData();return <TaxonomyPage medium={medium} specialty={specialty} lang='es'/>;}
