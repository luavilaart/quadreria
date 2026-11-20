import { describe, it, expect } from 'vitest';
import postgres from 'postgres';
const url=process.env['SUPABASE_DB_URL'];
describe.skipIf(!url || process.env['GALLERY_PRIVILEGED_TESTS'] !== '1')('Cloud gallery rules (requires privileged test database)',()=>{
 it('reserves free tickets, counts active tickets, waitlists overflow, rejects paid tickets, and protects roles',async()=>{
  if(!url)throw new Error('Database unavailable');
  const sql=postgres(url,{max:1,ssl:'prefer'});
  const a='11111111-1111-4111-8111-111111111111';const c='22222222-2222-4222-8222-222222222222';const c2='33333333-3333-4333-8333-333333333333';
  await sql`BEGIN`;
  try{
   for(const id of [a,c,c2])await sql`INSERT INTO auth.users(id) VALUES(${id})`;
   expect((await sql`SELECT count(*)::int n FROM public.profiles WHERE id IN (${a},${c},${c2})`)[0]?.['n']).toBe(3);
   for(const [id,role,handle] of [[a,'artist','test_rules_artist'],[c,'collector','test_rules_collector'],[c2,'collector','test_rules_collector2']]){
    await sql`SELECT set_config('request.jwt.claim.sub',${id??''},true)`;
    await sql`SELECT public.complete_registration(${JSON.stringify({role,name:'Rule test',handle,mediums:['Painting'],room:'sage'})}::jsonb)`;
   }
   await sql`INSERT INTO public.events(id,artist,title,date,price,capacity) VALUES('rule-free',${a},'Free rule test','2026-11-29',0,1),('rule-paid',${a},'Paid rule test','2026-11-29',8,1)`;
   await sql`SELECT set_config('request.jwt.claim.sub',${c},true)`;
   expect((await sql`SELECT (public.reserve_ticket('rule-free')).status status`)[0]?.['status']).toBe('reserved');
   expect((await sql`SELECT public.event_spots('rule-free') spots`)[0]?.['spots']).toBe(0);
   await sql`SELECT public.complete_registration(${JSON.stringify({role:'artist',name:'Escalation attempt',handle:'escalated'})}::jsonb)`;
   expect((await sql`SELECT role FROM public.user_roles WHERE user_id=${c}`)[0]?.['role']).toBe('collector');
   await sql`SELECT set_config('request.jwt.claim.sub',${c2},true)`;
   expect((await sql`SELECT (public.reserve_ticket('rule-free')).status status`)[0]?.['status']).toBe('waitlist');
   await sql`SAVEPOINT paid`;
   await expect(sql`SELECT public.reserve_ticket('rule-paid')`).rejects.toThrow('Paid tickets are coming soon');await sql`ROLLBACK TO SAVEPOINT paid`;
   await sql`SET LOCAL ROLE anon`;
   expect((await sql`SELECT has_function_privilege('anon','public.reserve_ticket(text)','EXECUTE') allowed`)[0]?.['allowed']).toBe(false);
   await sql`RESET ROLE`;
  }finally{await sql`ROLLBACK`;await sql.end();}
 });
 it('blocks collectors from artist writes and hides private rooms and pieces from visitors',async()=>{
  if(!url)throw new Error('Database unavailable');const sql=postgres(url,{max:1,ssl:'prefer'});await sql`BEGIN`;
  try{
   const id='44444444-4444-4444-8444-444444444444';await sql`INSERT INTO auth.users(id) VALUES(${id})`;await sql`SELECT set_config('request.jwt.claim.sub',${id},true)`;await sql`SELECT public.complete_registration(${JSON.stringify({role:'collector',name:'Permission test',handle:'permission_test'})}::jsonb)`;
   await sql`SET LOCAL ROLE authenticated`;await sql`SAVEPOINT owner`;
   await expect(sql`INSERT INTO public.rooms(id,handle) VALUES(${id},'forbidden_room')`).rejects.toThrow();await sql`ROLLBACK TO SAVEPOINT owner`;await sql`RESET ROLE`;
   await sql`UPDATE public.rooms SET published=false WHERE handle='mara'`;await sql`SET LOCAL ROLE anon`;
   expect((await sql`SELECT count(*)::int n FROM public.rooms WHERE handle='mara'`)[0]?.['n']).toBe(0);
   expect((await sql`SELECT count(*)::int n FROM public.pieces WHERE id='p1'`)[0]?.['n']).toBe(0);
  }finally{await sql`ROLLBACK`;await sql.end();}
 });
});
