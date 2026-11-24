import { createFileRoute } from '@tanstack/react-router';
import { useEffect,useState } from 'react';
import { Page } from '@/components/q/Shell';
import { QButton } from '@/components/q/QButton';
import { supabase } from '@/integrations/supabase/client';
import { copyFor, langOf, useT } from '@/i18n';
import { pageHead } from '@/lib/head';
import { toast } from 'sonner';
export const Route=createFileRoute('/reset-password')({head:({match})=>{const t=copyFor(langOf(match.context));return pageHead(t.account.resetTitle,t.account.resetDescription);},component:Reset});
function Reset(){const t=useT();const [recovery,setRecovery]=useState(false);const [password,setPassword]=useState('');const [done,setDone]=useState(false);useEffect(()=>{const hash=new URLSearchParams(window.location.hash.slice(1));setRecovery(hash.get('type')==='recovery');},[]);return <Page><form className="mx-auto max-w-lg space-y-5 px-5 pt-10" onSubmit={async e=>{e.preventDefault();const {error}=await supabase.auth.updateUser({password});if(error)toast.error(error.message);else setDone(true);}}><h1 className="text-4xl">{t.account.resetTitle}</h1>{done?<p>{t.account.resetDone}</p>:recovery?<><label>{t.account.newPassword}<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-line bg-card p-4"/></label><QButton type="submit" className="btn-primary">{t.account.save}</QButton></>:<p>{t.account.invalidRecovery}</p>}</form></Page>;}
