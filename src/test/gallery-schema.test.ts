import { describe,it,expect } from 'vitest';
import postgres from 'postgres';
const url=process.env['SUPABASE_DB_URL'];
describe.skipIf(!url)('Live Cloud rules',()=>{
 const check=async(fn:(sql:ReturnType<typeof postgres>)=>Promise<void>)=>{if(!url)throw new Error('Database unavailable');const sql=postgres(url,{max:1,ssl:'prefer'});try{await fn(sql);}finally{await sql.end();}};
 it('enables RLS on all seven tables',()=>check(async sql=>{const rows=await sql`SELECT relname,relrowsecurity FROM pg_class WHERE relnamespace='public'::regnamespace AND relname IN ('profiles','user_roles','rooms','pieces','services','events','tickets')`;expect(rows).toHaveLength(7);expect(rows.every(r=>r['relrowsecurity']===true)).toBe(true);}));
 it('does not grant browser role edits',()=>check(async sql=>{const rows=await sql`SELECT has_table_privilege('authenticated','public.user_roles','UPDATE') edit,has_table_privilege('authenticated','public.user_roles','INSERT') can_insert`;expect(rows[0]?.['edit']).toBe(false);expect(rows[0]?.['can_insert']).toBe(false);}));
 it('does not allow direct browser ticket creation or anonymous reservation',()=>check(async sql=>{const rows=await sql`SELECT has_table_privilege('authenticated','public.tickets','INSERT') can_insert,has_function_privilege('anon','public.reserve_ticket(text)','EXECUTE') reserve`;expect(rows[0]?.['can_insert']).toBe(false);expect(rows[0]?.['reserve']).toBe(false);}));
 it('locks events and counts only reserved or checked-in tickets for capacity',()=>check(async sql=>{const rows=await sql`SELECT pg_get_functiondef('public.reserve_ticket(text)'::regprocedure) definition`;const definition=String(rows[0]?.['definition']);expect(definition).toContain('FOR UPDATE');expect(definition).toContain("status IN ('reserved','checked in')");expect(definition).toContain("n>=e.capacity THEN 'waitlist' ELSE 'reserved'");expect(definition).toContain('e.price<>0');}));
 it('locks favorites and follows to their creator and denies anonymous access',()=>check(async sql=>{
  const rows=await sql`SELECT relname,relrowsecurity,has_table_privilege('anon',oid,'SELECT') anonymous_read,has_table_privilege('authenticated',oid,'UPDATE') can_edit FROM pg_class WHERE oid IN ('public.favorites'::regclass,'public.follows'::regclass)`;
  expect(rows).toHaveLength(2);for(const row of rows){expect(row['relrowsecurity']).toBe(true);expect(row['anonymous_read']).toBe(false);expect(row['can_edit']).toBe(false);}
  const policies=await sql`SELECT tablename,qual,with_check FROM pg_policies WHERE tablename IN ('favorites','follows')`;
  expect(policies).toHaveLength(2);for(const policy of policies){expect(policy['qual']).toBe('(collector = auth.uid())');expect(String(policy['with_check'])).toContain('(collector = auth.uid())');expect(String(policy['with_check'])).toContain('user_roles.user_id = auth.uid()');}
 }));
 it('allows only one favorite or follow per pair',()=>check(async sql=>{
  await sql.begin(async tx=>{
   const owner='11111111-1111-4111-8111-111111111111';const target=crypto.randomUUID();
   await tx`INSERT INTO public.favorites(collector,piece) VALUES (${owner},${target})`;await tx`INSERT INTO public.follows(collector,artist) VALUES (${owner},${target})`;
   expect(await tx`INSERT INTO public.favorites(collector,piece) VALUES (${owner},${target}) ON CONFLICT DO NOTHING RETURNING piece`).toHaveLength(0);
   expect(await tx`INSERT INTO public.follows(collector,artist) VALUES (${owner},${target}) ON CONFLICT DO NOTHING RETURNING artist`).toHaveLength(0);
   throw new Error('rollback test rows');
  }).catch(error=>{if(!(error instanceof Error)||error.message!=='rollback test rows')throw error;});
 }));
 it('does not expose artist count functions to anonymous callers',()=>check(async sql=>{const rows=await sql`SELECT has_function_privilege('anon','public.my_artist_social_counts()','EXECUTE') anon,has_function_privilege('authenticated','public.my_artist_social_counts()','EXECUTE') signed_in`;expect(rows[0]?.['anon']).toBe(false);expect(rows[0]?.['signed_in']).toBe(true);}));
});
