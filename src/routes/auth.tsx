import { takePendingPhoto,clearPendingPhoto } from '@/lib/pending-photo';
import { uploadImage } from '@/components/q/AccountProvider';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { Page } from '@/components/q/Shell';
import { Credentials } from '@/components/q/Credentials';
import { useAccount, completeRegistration, type Registration } from '@/components/q/AccountProvider';
import { supabase } from '@/integrations/supabase/client';
import { pageHead } from '@/lib/head';
import { copyFor, langOf, useT } from '@/i18n';
import { toast } from 'sonner';
export const Route=createFileRoute('/auth')({validateSearch:(s:Record<string,unknown>)=>({next:typeof s['next']==='string'&&s['next'].startsWith('/')&&!s['next'].startsWith('//')?s['next']:'/'}),head:({match})=>{const t=copyFor(langOf(match.context));return pageHead(t.account.login,t.account.authDescription);},component:Auth});
function Auth(){const t=useT();const {user,role,refresh}=useAccount();const navigate=useNavigate();const {next}=Route.useSearch();const finishing=useRef(false);
 async function finish(){if(finishing.current)return;finishing.current=true;try{const {data}=await supabase.auth.getUser();if(!data.user){finishing.current=false;return;}const raw=sessionStorage.getItem('quadreria-registration');const registration=raw?JSON.parse(raw) as Registration:data.user.user_metadata['registration'] as Registration|undefined;if(registration){await completeRegistration(registration);const photo=await takePendingPhoto();if(photo){const url=await uploadImage('profile-photos',data.user.id,photo,t.account.uploadError);const {error}=await supabase.from('profiles').update({photo:url}).eq('id',data.user.id);if(error)throw error;await clearPendingPhoto();}sessionStorage.removeItem('quadreria-registration');}const {data:r}=await supabase.from('user_roles').select('role').eq('user_id',data.user.id).maybeSingle();await refresh();const saved=sessionStorage.getItem('quadreria-next');sessionStorage.removeItem('quadreria-next');const target=saved&&saved.startsWith('/')&&!saved.startsWith('//')?saved:next;if(!r){sessionStorage.setItem('quadreria-next',target);await navigate({to:'/join'});return;}await navigate({to:target==='/'?'/studio':target});}catch(e){finishing.current=false;throw e;}}
 useEffect(()=>{if(user)void finish().catch(e=>toast.error(e.message));},[user?.id]);
 return <Page><div className="mx-auto max-w-lg px-5 pt-10"><h1 className="mb-8 text-4xl">{t.account.login}</h1><Credentials next={next} onSuccess={()=>void finish().catch(e=>toast.error(e.message))}/><p className="mt-6">{t.account.newAccount} <Link to="/join" className="link">{t.nav.join}</Link></p></div></Page>;}
