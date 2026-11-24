import { useQuery } from '@tanstack/react-query';
import { ticketsQuery } from '@/lib/studio';
import { useFormat, useT } from '@/i18n';
import { useSocialCopy } from '@/i18n/social';

export function TicketsContent(){
 const {data,isPending,isError}=useQuery(ticketsQuery);const t=useT();const f=useFormat();const c=t.account;const social=useSocialCopy();
 if(isPending)return <p role="status">{social.loading}</p>;
 if(isError)return <p role="alert">{c.error}</p>;
 return <div className="space-y-4">{!data.length&&<p className="text-stone">{c.emptyTickets}</p>}{data.map(ticket=><article key={ticket.id} className="rounded-2xl border border-line bg-card p-5"><h2 className="text-2xl">{ticket.events?.title??c.cancelled}</h2>{ticket.events&&<p className="mt-2 text-stone">{f.date(ticket.events.date)} · {ticket.events.start_time.slice(0,5)} · {f.city(ticket.events.city)}</p>}<p className="mt-3 font-medium">{ticket.events?.status==='cancelled'?c.cancelled:ticket.status==='waitlist'?c.waitlistStatus:ticket.status==='checked in'?c.checkedIn:ticket.status==='cancelled'?c.cancelled:c.reservedStatus}</p><p className="mt-3 break-all text-sm text-stone">{ticket.id}</p>{ticket.events?.online_link&&ticket.status!=='waitlist'&&<a href={ticket.events.online_link} className="link mt-3 block">{c.online}</a>}</article>)}</div>;
}