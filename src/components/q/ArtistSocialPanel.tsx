import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from './AccountProvider';
import { Art } from './Art';
import { QButton } from './QButton';
import { StudioEditor } from './StudioEditor';
import { useSocialCopy } from '@/i18n/social';
import { useT, useFormat } from '@/i18n';
import { socialCountsQuery } from '@/lib/social';
export function ArtistSocialPanel({kind}:{kind:'room'|'pieces'}){
 const {user,profile}=useAccount();const c=useSocialCopy();const t=useT();const format=useFormat();
 const [editing,setEditing]=useState<Record<string,unknown>|null>(null);
 const counts=useQuery({...socialCountsQuery(user?.id??''),enabled:!!user});
 const result=useQuery({queryKey:['artist-social-panel',user?.id,kind],enabled:!!user,queryFn:async()=>{
  if(!user)throw new Error(c.error);
  const [room,pieces]=await Promise.all([supabase.from('rooms').select('*').eq('id',user.id).maybeSingle(),supabase.from('pieces').select('*').eq('artist',user.id)]);
  if(room.error)throw room.error;if(pieces.error)throw pieces.error;
  return {room:room.data,pieces:pieces.data};
 }});
 if(result.isPending||counts.isPending)return <p role="status">{c.loading}</p>;
 if(result.isError||counts.isError)return <p role="alert">{c.error}</p>;
 return <>{kind==='room'?<><h2 className="text-2xl">{profile?.display_name}</h2><p className="mt-4 text-stone">{c.followers} · {counts.data.followers}</p><p className="mt-4">{result.data.room?.tagline}</p><p className="mt-2 text-stone">{result.data.room?.bio}</p>{result.data.room&&<QButton className="chip mt-5" onClick={()=>setEditing(result.data.room)}>{t.account.room}</QButton>}</>:result.data.pieces.length>0&&<div className="mb-8 grid grid-cols-2 gap-5 sm:grid-cols-3">{result.data.pieces.map(p=><article key={p.id}><Art ratio={p.ratio} tone="cream" shape={p.shape} src={p.images[0]} title={p.title}/><h3 className="mt-2 text-base">{p.title}</h3><p className="mt-2 text-sm">{format.price(p.price)}</p><p className="mt-2 text-sm text-stone">{c.favoriteCount} · {counts.data.pieces[p.id]??0}</p><QButton className="chip mt-3" onClick={()=>setEditing(p)}>{t.account.edit}</QButton></article>)}</div>}{editing&&user&&<StudioEditor kind={kind} row={editing} owner={user.id} onClose={()=>setEditing(null)}/>}</>;
}