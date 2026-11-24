import { queryOptions } from '@tanstack/react-query';
import { sampleGallery } from '@/data/sample-gallery';
export const galleryQuery = queryOptions({ queryKey: ['gallery'], queryFn: async () => sampleGallery, staleTime: Infinity });
export { roomColors, mediums, cities, eventTypes, usd, fmtDate } from '@/data/sample';
export type Gallery = typeof sampleGallery;
export type Artist = Gallery['artists'][number];
export type Piece = Gallery['pieces'][number];
export type Service = Gallery['services'][number];
export type Event = Gallery['events'][number];
