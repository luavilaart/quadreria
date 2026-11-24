import { createFileRoute, redirect } from '@tanstack/react-router';
import { copyFor, langOf } from '@/i18n';
import { pageHead } from '@/lib/head';
export const Route=createFileRoute('/_authenticated/my-tickets')({beforeLoad:()=>{throw redirect({to:'/studio',replace:true});},head:({match})=>{const t=copyFor(langOf(match.context));return pageHead(t.account.tickets,t.account.ticketsDescription);}});
