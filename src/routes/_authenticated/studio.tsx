import { createFileRoute, redirect } from '@tanstack/react-router';
import { galleryQuery } from '@/lib/gallery';
import { pageHead } from '@/lib/head';
import { supabase } from '@/integrations/supabase/client';
import { CollectorStudio } from '@/components/q/CollectorStudio';
import { ArtistStudio, studioTabs, type StudioTab } from '@/components/studio/ArtistStudio';
import { socialCopy } from '@/i18n/social';
import { langOf } from '@/i18n';
import { studioDestination } from '@/lib/social';

export const Route=createFileRoute('/_authenticated/studio')({
 validateSearch:(s:Record<string,unknown>):{tab?:StudioTab}=>studioTabs.includes(s['tab'] as StudioTab)&&s['tab']!=='overview'?{tab:s['tab'] as StudioTab}:{},
 beforeLoad:async()=>{
  const {data:u,error}=await supabase.auth.getUser();
  if(error||!u.user)throw redirect({to:'/auth',search:{next:'/studio'}});
  const {data,error:roleError}=await supabase.from('user_roles').select('role').eq('user_id',u.user.id).maybeSingle();
  if(roleError)throw roleError;
  if(studioDestination(data?.role??null)==='/join')throw redirect({to:'/join'});
  if(!data)throw redirect({to:'/join'});
  return {studioRole:data.role};
 },
 loader:({context})=>context.queryClient.ensureQueryData(galleryQuery),
 head:({match})=>{const c=socialCopy[langOf(match.context)];return pageHead(c.title,c.description);},
 component:Studio,
});
function Studio(){const {studioRole}=Route.useRouteContext();const {tab}=Route.useSearch();return studioRole==='artist'?<ArtistStudio tab={tab??'overview'}/>:<CollectorStudio/>;}