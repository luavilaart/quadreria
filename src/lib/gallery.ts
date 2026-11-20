import { queryOptions } from '@tanstack/react-query';
import { getGallery } from './gallery.functions';
export const galleryQuery = queryOptions({ queryKey: ['gallery'], queryFn: () => getGallery(), staleTime: 0 });
export { roomColors, mediums, cities, eventTypes, usd, fmtDate } from '@/data/sample';
export type Gallery = Awaited<ReturnType<typeof getGallery>>;
export type Artist = Gallery['artists'][number];
export type Piece = Gallery['pieces'][number];
export type Service = Gallery['services'][number];
export type Event = Gallery['events'][number];
