import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database, Json } from '@/integrations/supabase/types';
export type Registration = { role: 'artist' | 'collector'; name: string; handle: string; city: string; mediums: string[]; room: string; bio: string; wants: string[]; links: {label:string;url:string}[] };
type Account = { user: User | null; profile: Database['public']['Tables']['profiles']['Row'] | null; role: 'artist' | 'collector' | null; loading:boolean; refresh: () => Promise<void> };
const Context = createContext<Account>({ user:null, profile:null, role:null, loading:true, refresh:async()=>{} });
export function AccountProvider({ children }: { children: ReactNode }) {
 const [user,setUser]=useState<User|null>(null); const [profile,setProfile]=useState<Account['profile']>(null); const [role,setRole]=useState<Account['role']>(null);
 const [loading,setLoading]=useState(true);
 const router=useRouter(); const qc=useQueryClient();
 const refresh=async()=> { try {const {data}=await supabase.auth.getUser(); setUser(data.user); if (!data.user) { setProfile(null);setRole(null);return; } const [p,r]=await Promise.all([supabase.from('profiles').select('*').eq('user_id',data.user.id).single(),supabase.from('user_roles').select('role').eq('user_id',data.user.id).maybeSingle()]); setProfile(p.data);setRole(r.data?.role??null); }finally{setLoading(false);} };
 useEffect(()=> { void refresh(); const {data}=supabase.auth.onAuthStateChange(event=> { if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event))return; setTimeout(()=>{void refresh(); void router.invalidate();if(event!=='SIGNED_OUT')void qc.invalidateQueries();},0); });return()=>data.subscription.unsubscribe(); },[]);
 return <Context.Provider value={{user,profile,role,loading,refresh}}>{children}</Context.Provider>;
}
export const useAccount=()=>useContext(Context);
export async function completeRegistration(payload: Registration) { const {error}=await supabase.rpc('complete_registration',{payload:payload as unknown as Json});if(error)throw error; }
/** tooLarge is the message shown when the file is not an image under 10 MB (pass t.account.uploadError). */
export async function uploadImage(bucket:string,userId:string,file:File,tooLarge:string) { if(!file.type.startsWith('image/')||file.size>10*1024*1024)throw new Error(tooLarge);const path=`${userId}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;const {error}=await supabase.storage.from(bucket).upload(path,file);if(error)throw error;return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl; }
