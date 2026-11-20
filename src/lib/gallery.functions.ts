import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { Artist, Event, RoomColor } from '@/data/sample';
import { en } from '@/i18n/en';

export const getGallery = createServerFn({ method: 'GET' }).handler(async () => {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  const url = process.env['SUPABASE_URL'];
  if (!key || !url) throw new Error(en.account.error);
  const db = createClient<Database>(url, key, { auth: { persistSession: false }, global: { fetch: (input, init) => {
    const h = new Headers(init?.headers); if (key.startsWith('sb_') && h.get('Authorization') === `Bearer ${key}`) h.delete('Authorization'); h.set('apikey', key); return fetch(input, { ...init, headers: h });
  } } });
  const results = await Promise.all([db.from('profiles').select('*'), db.from('rooms').select('*'), db.from('pieces').select('*'), db.from('services').select('*'), db.from('events').select('*')]);
  for (const result of results) if (result.error) throw new Error(result.error.message);
  const [profiles, rooms, rawPieces, rawServices, rawEvents] = results;
  const artists = (rooms.data ?? []).map(r => {
    const p = profiles.data?.find(p => p.id === r.id);
    return { ...r, name: p?.display_name ?? '', city: p?.city ?? '', mediums: p?.mediums ?? [], photo: p?.photo, sample: p?.sample ?? false, room: r.room_color as RoomColor, links: r.links as Artist['links'], faq: r.faq as Artist['faq'] };
  });
  const handle = (id: string) => artists.find(a => a.id === id)?.handle ?? '';
  const name = (id: string) => artists.find(a => a.id === id)?.name ?? '';
  const pieces = (rawPieces.data ?? []).map(p => ({ ...p, artist: handle(p.artist), artistName: name(p.artist), tone: p.tone as RoomColor, price: Number(p.price), ratio: Number(p.ratio) }));
  const services = (rawServices.data ?? []).map(s => ({ ...s, artist: handle(s.artist), artistName: name(s.artist), note: s.description, price: Number(s.price) }));
  const events = await Promise.all((rawEvents.data ?? []).map(async e => {
    const spotsResult = await db.rpc('event_spots', {event_id:e.id});
    if(spotsResult.error)throw spotsResult.error;
    return ({ ...e, artist: handle(e.artist), artistName: name(e.artist), type: e.type as Event['type'], tone: e.tone as RoomColor, price: Number(e.price), time: `${e.start_time.slice(0,5)} – ${e.end_time.slice(0,5)} (CST)`, spots: spotsResult.data ?? 0 });}));
  return { artists: artists.map(a => ({ ...a, firstPiece: pieces.find(p => p.artist === a.handle) })), pieces, services, events };
});
