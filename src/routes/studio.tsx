import {createFileRoute} from '@tanstack/react-router';
import {galleryQuery} from '@/lib/gallery';
import {pageHead} from '@/lib/head';
import {TaxonomyStudio} from '@/components/q/TaxonomyStudio';
export const Route=createFileRoute('/studio')({loader:({context})=>context.queryClient.ensureQueryData(galleryQuery),head:()=>pageHead('Sample Artist Studio','Choose mediums and specialties, suggest tags, and preview sample pieces on quadreria.'),component:TaxonomyStudio});
