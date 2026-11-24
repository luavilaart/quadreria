import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Gallery } from './gallery';

export function studioDestination(role: 'artist' | 'collector' | null) {
 return role ? '/studio' : '/join';
}
export function savedGallery(gallery: Gallery, pieces: readonly string[], artists: readonly string[]) {
 return {pieces:gallery.pieces.filter(p=>pieces.includes(p.id)),artists:gallery.artists.filter(a=>artists.includes(a.handle))};
}
export const socialQuery = (userId: string) => queryOptions({
 queryKey:['social',userId],
 queryFn:async()=>{
  const [favorites,follows]=await Promise.all([
   supabase.from('favorites').select('piece').eq('collector',userId).order('created_at',{ascending:false}),
   supabase.from('follows').select('artist').eq('collector',userId).order('created_at',{ascending:false}),
  ]);
  if(favorites.error)throw favorites.error;
  if(follows.error)throw follows.error;
  return {pieces:favorites.data.map(f=>f.piece),artists:follows.data.map(f=>f.artist)};
 },
});
export const socialCountsQuery = (userId:string) => queryOptions({
 queryKey:['social-counts',userId],
 queryFn:async()=>{
  const {data,error}=await supabase.rpc('my_artist_social_counts');
  if(error)throw error;
  const result=data as {followers:number;pieces:Record<string,number>} | null;
  return result??{followers:0,pieces:{}};
 },
});