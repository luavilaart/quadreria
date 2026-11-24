import { describe, expect, it } from 'vitest';
import { savedGallery, studioDestination } from '@/lib/social';
import { sampleGallery } from '@/data/sample-gallery';
describe('Private Studio rules',()=>{
 it('gives both registered roles a Studio',()=>{expect(studioDestination('artist')).toBe('/studio');expect(studioDestination('collector')).toBe('/studio');});
 it('sends unfinished accounts to the quiz',()=>{expect(studioDestination(null)).toBe('/join');});
 it('only includes hearted pieces and preserves their true proportions',()=>{const result=savedGallery(sampleGallery,['p1','p13'],[]);expect(result.pieces.map(p=>p.id)).toEqual(['p1','p13']);expect(result.pieces[0]?.ratio).toBe(sampleGallery.pieces.find(p=>p.id==='p1')?.ratio);expect(result.pieces.some(p=>p.id==='p2')).toBe(false);});
 it('only includes followed rooms in their original wall color',()=>{const result=savedGallery(sampleGallery,[],['tito']);expect(result.artists.map(a=>a.handle)).toEqual(['tito']);expect(result.artists[0]?.room).toBe('sage');});
});