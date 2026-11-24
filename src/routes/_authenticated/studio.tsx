import { createFileRoute, redirect } from '@tanstack/react-router';
import { galleryQuery } from '@/lib/gallery';
import { pageHead } from '@/lib/head';
import { supabase } from '@/integrations/supabase/client';
import { TaxonomyStudio } from '@/components/q/TaxonomyStudio';
import { CollectorStudio } from '@/components/q/CollectorStudio';
import { socialCopy } from '@/i18n/social';
import { langOf } from '@/i18n';

export const Route=createFileRoute('/_authenticated/studio')({
 beforeLoad:async()=>{
  const {data:u,error}=await supabase.auth.getUser();
  if(error||!u.user)throw redirect({to:'/auth',search:{next:'/studio'}});
  const {data,error:roleError}=await supabase.from('user_roles').select('role').eq('user_id',u.user.id).maybeSingle();
  if(roleError)throw roleError;
  if(!data)throw redirect({to:'/join'});
  return {studioRole:data.role};
 },
 loader:({context})=>context.queryClient.ensureQueryData(galleryQuery),
 head:({match})=>{const c=socialCopy[langOf(match.context)];return pageHead(c.title,c.description);},
 component:Studio,
});
function Studio(){const {studioRole}=Route.useRouteContext();return studioRole==='artist'?<TaxonomyStudio/>:<CollectorStudio/>;}