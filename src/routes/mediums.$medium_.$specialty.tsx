import {createFileRoute,notFound} from '@tanstack/react-router';
import {taxonomy,label,type TaxonomyEntry} from '@/data/taxonomy';
import {galleryQuery} from '@/lib/gallery';
import {pageHead} from '@/lib/head';
import {browseSearchValidator} from '@/data/discovery';
import {TaxonomyPage} from '@/components/q/TaxonomyPage';
export const Route=createFileRoute('/mediums/$medium_/$specialty')({validateSearch:browseSearchValidator,loader:async({params,context})=>{const gallery=await context.queryClient.ensureQueryData(galleryQuery);const rows=gallery.taxonomy;const medium=rows.find(t=>t.kind==='medium'&&t.slug===params.medium&&t.status==='active');if(!medium)throw notFound();const specialty=rows.find(t=>t.kind==='specialty'&&t.parent_id===medium.id&&t.slug===params.specialty&&t.status==='active');if(!specialty)throw notFound();return {medium,specialty};},head:({loaderData:d})=>d?pageHead(label(d.specialty,'en'),d.specialty.intro_en):pageHead('Unavailable','This quadreria section is unavailable.'),component:Browse});
function Browse(){const {medium,specialty}=Route.useLoaderData();return <TaxonomyPage medium={medium} specialty={specialty} lang='en'/>;}
