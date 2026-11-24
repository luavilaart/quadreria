import { useState } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from './AccountProvider';
import { QButton } from './QButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { socialQuery } from '@/lib/social';
import { supabase } from '@/integrations/supabase/client';
import { useSocialCopy } from '@/i18n/social';

function SocialAction({kind,id}:{kind:'favorite'|'follow';id:string}) {
 const {user,role}=useAccount();const c=useSocialCopy();const qc=useQueryClient();const navigate=useNavigate();
 const next=useRouterState({select:s=>s.location.href});
 const [prompt,setPrompt]=useState(false);const [busy,setBusy]=useState(false);
 const saved=useQuery({...socialQuery(user?.id??''),enabled:!!user&&!!role});
 const active=kind==='favorite'?saved.data?.pieces.includes(id)??false:saved.data?.artists.includes(id)??false;
 const label=kind==='favorite'?(active?c.unsave:c.save):(active?c.followed:c.follow);
 async function toggle(){
  if(!user){setPrompt(true);return;}
  if(!role){sessionStorage.setItem('quadreria-next',next);await navigate({to:'/join'});return;}
  setBusy(true);
  try{
   const result=kind==='favorite'
    ?active?await supabase.from('favorites').delete().eq('collector',user.id).eq('piece',id):await supabase.from('favorites').insert({collector:user.id,piece:id})
    :active?await supabase.from('follows').delete().eq('collector',user.id).eq('artist',id):await supabase.from('follows').insert({collector:user.id,artist:id});
   if(result.error)throw result.error;
   await Promise.all([qc.invalidateQueries({queryKey:['social',user.id]}),qc.invalidateQueries({queryKey:['social-counts']})]);
  }catch{toast.error(c.error);}finally{setBusy(false);}
 }
 return <>
  <QButton aria-label={label} title={label} aria-pressed={active} disabled={busy|| (!!user&&!!role&&saved.isPending)} onClick={()=>void toggle()} className={kind==='favorite'?'!p-2 h-10 w-10 shrink-0 rounded-full bg-card text-ink border border-line':'btn-ghost mt-5'}>
   {kind==='favorite'?<Heart aria-hidden className={`h-5 w-5 ${active?'fill-tomato text-ink':''}`}/>:label}
  </QButton>
  <Dialog open={prompt} onOpenChange={setPrompt}><DialogContent className="max-w-sm rounded-2xl bg-card text-ink"><DialogHeader><DialogTitle className="font-display text-2xl">{c.prompt}</DialogTitle></DialogHeader><div className="flex gap-3"><Link to="/join" onClick={()=>sessionStorage.setItem('quadreria-next',next)} className="btn btn-primary flex-1">{c.join}</Link><Link to="/auth" search={{next}} className="btn btn-ghost flex-1">{c.login}</Link></div></DialogContent></Dialog>
 </>;
}
export const FavoriteButton=({piece}:{piece:string})=><SocialAction kind="favorite" id={piece}/>;
export const FollowButton=({artist}:{artist:string})=><SocialAction kind="follow" id={artist}/>;