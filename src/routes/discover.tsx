import {createFileRoute} from '@tanstack/react-router';
import {Page} from '@/components/q/Shell';
import {TaxonomyBrowse} from '@/components/q/TaxonomyBrowse';
import {useTaxonomy} from '@/components/q/TaxonomyProvider';
import {galleryQuery} from '@/lib/gallery';
import {pageHead} from '@/lib/head';
import {parseBrowseSearch} from '@/data/discovery';
export const Route=createFileRoute('/discover')({validateSearch:parseBrowseSearch,loader:({context})=>context.queryClient.ensureQueryData(galleryQuery),head:()=>pageHead('Discover art, artists and specialties','Explore ten mediums, artist specialties, piece formats and events on quadreria.'),component:Discover});
function Discover(){const {c}=useTaxonomy();return <Page><div className="mx-auto max-w-6xl px-5 pt-10"><h1 className="text-4xl">{c.art} · quadreria</h1><TaxonomyBrowse/></div></Page>;}
