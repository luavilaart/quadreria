import { describe,it,expect } from 'vitest';
import postgres from 'postgres';
const url=process.env['SUPABASE_DB_URL'];
describe.skipIf(!url)('Live Cloud rules',()=>{
 const check=async(fn:(sql:ReturnType<typeof postgres>)=>Promise<void>)=>{if(!url)throw new Error('Database unavailable');const sql=postgres(url,{max:1,ssl:'prefer'});try{await fn(sql);}finally{await sql.end();}};
 it('enables RLS on all seven tables',()=>check(async sql=>{const rows=await sql`SELECT relname,relrowsecurity FROM pg_class WHERE relnamespace='public'::regnamespace AND relname IN ('profiles','user_roles','rooms','pieces','services','events','tickets')`;expect(rows).toHaveLength(7);expect(rows.every(r=>r['relrowsecurity']===true)).toBe(true);}));
 it('does not grant browser role edits',()=>check(async sql=>{const rows=await sql`SELECT has_table_privilege('authenticated','public.user_roles','UPDATE') edit,has_table_privilege('authenticated','public.user_roles','INSERT') can_insert`;expect(rows[0]?.['edit']).toBe(false);expect(rows[0]?.['can_insert']).toBe(false);}));
 it('does not allow direct browser ticket creation or anonymous reservation',()=>check(async sql=>{const rows=await sql`SELECT has_table_privilege('authenticated','public.tickets','INSERT') can_insert,has_function_privilege('anon','public.reserve_ticket(text)','EXECUTE') reserve`;expect(rows[0]?.['can_insert']).toBe(false);expect(rows[0]?.['reserve']).toBe(false);}));
 it('locks events and counts only reserved or checked-in tickets for capacity',()=>check(async sql=>{const rows=await sql`SELECT pg_get_functiondef('public.reserve_ticket(text)'::regprocedure) definition`;const definition=String(rows[0]?.['definition']);expect(definition).toContain('FOR UPDATE');expect(definition).toContain("status IN ('reserved','checked in')");expect(definition).toContain("n>=e.capacity THEN 'waitlist' ELSE 'reserved'");expect(definition).toContain('e.price<>0');}));
});
