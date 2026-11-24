import {createFileRoute} from '@tanstack/react-router';
import {TaxonomyAdmin} from '@/components/q/TaxonomyAdmin';
import {pageHead} from '@/lib/head';
export const Route=createFileRoute('/admin/taxonomy')({head:()=>({...pageHead('Sample Taxonomy review','Preview taxonomy labels, suggestions, media review and plan settings on quadreria.'),meta:[...pageHead('Sample Taxonomy review','Preview taxonomy labels, suggestions, media review and plan settings on quadreria.').meta,{name:'robots',content:'noindex'}]}),component:TaxonomyAdmin});
