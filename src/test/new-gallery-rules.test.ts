import {describe,it,expect} from 'vitest';
import {sortPieces,validateShopSearch,type RankedPiece} from '@/lib/shop';
import {normalizeLink} from '@/lib/links';
import {validateMedia,freeMediaLimits} from '@/lib/room-media';
import {registrationInput} from '@/lib/registration';
const pieces:RankedPiece[]=[{id:'older',artist:'mara',medium_id:'medium:painting',price:50,created_at:'2026-11-01',format_id:'format:original',status:'available'},{id:'new',artist:'lu',medium_id:'medium:digital-art-design',price:10,created_at:'2026-11-20',format_id:'format:print',status:'available'},{id:'show',artist:'tito',medium_id:'medium:textile-fiber',price:0,created_at:'2026-11-22',format_id:'format:showcase-only',status:'available'}];
const ranking={counts:{older:10,new:1,show:0},interests:[],followed:[]};
describe('Quiz registration',()=>{
 it('never opts a collector into marketing by default',()=>expect(registrationInput({role:'collector',name:''}).marketing_opt_in).toBe(false));
 it('never opts an artist into marketing by default',()=>expect(registrationInput({role:'artist',name:'Mara'}).marketing_opt_in).toBe(false));
 it('keeps an explicit agreement',()=>expect(registrationInput({role:'collector',name:'',marketing_opt_in:true}).marketing_opt_in).toBe(true));
 it('uses the email prefix as a temporary collector name',()=>expect(registrationInput({role:'collector',name:''},'luciana@example.com').name).toBe('luciana'));
});
describe('Shop sorting',()=>{
 it('ranks matching quiz interests before unmatched pieces',()=>expect(sortPieces(pieces,'recommended',{...ranking,interests:['medium:digital-art-design']})[0]?.id).toBe('new'));
 it('ranks followed artists before unmatched pieces',()=>expect(sortPieces(pieces,'recommended',{...ranking,followed:['tito']})[0]?.id).toBe('show'));
 it('orders most popular by favorites',()=>expect(sortPieces(pieces,'popular',ranking).map(p=>p.id)).toEqual(['older','new','show']));
 it('orders new arrivals by arrival date',()=>expect(sortPieces(pieces,'newest',ranking).map(p=>p.id)).toEqual(['show','new','older']));
 it('falls back to favorites when reviews do not exist',()=>expect(sortPieces(pieces,'rated',ranking).map(p=>p.id)).toEqual(['older','new','show']));
 it('supports future average artist ratings',()=>expect(sortPieces(pieces,'rated',{...ranking,ratings:{mara:3,lu:5}})[0]?.id).toBe('new'));
 it('orders prices low to high without showcase-only pieces',()=>expect(sortPieces(pieces,'priceAsc',ranking).map(p=>p.id)).toEqual(['new','older']));
 it('orders prices high to low without showcase-only pieces',()=>expect(sortPieces(pieces,'priceDesc',ranking).map(p=>p.id)).toEqual(['older','new']));
 it('preserves valid shared medium, specialty, city and sort state',()=>expect(validateShopSearch({medium:'medium:painting',specialty:'medium:painting:oil',city:'Tegucigalpa',sort:'popular'})).toMatchObject({medium:'medium:painting',specialty:'medium:painting:oil',city:'Tegucigalpa',sort:'popular'}));
 it('gives logged-out recommendations a popularity/newness blend',()=>{expect(sortPieces(pieces,'recommended',ranking).map(p=>p.id)).toEqual(['older','show','new']);});
});
describe('Platform links',()=>{
 for(const raw of ['@mara','mara','https://instagram.com/mara/'])it(`normalizes Instagram ${raw}`,()=>expect(normalizeLink('instagram',raw)?.url).toBe('https://instagram.com/mara'));
 it('normalizes Substack full URLs',()=>expect(normalizeLink('substack','https://mara.substack.com/p/hello')?.url).toBe('https://mara.substack.com'));
 it('normalizes YouTube handles',()=>expect(normalizeLink('youtube','https://youtube.com/@mara/videos')?.url).toBe('https://youtube.com/@mara'));
 it('normalizes LinkedIn usernames',()=>expect(normalizeLink('linkedin','https://linkedin.com/in/mara/')?.url).toBe('https://linkedin.com/in/mara'));
 it('rejects lookalike hosts',()=>expect(normalizeLink('instagram','https://instagram.com.evil.test/mara')).toBeNull());
 it('does not permit script URLs in custom links',()=>expect(normalizeLink('custom','javascript:alert(1)','Test')).toBeNull());
 it('keeps custom links labeled and structured',()=>expect(normalizeLink('custom','https://example.org','Portfolio')).toEqual({platform:'custom',username:'',url:'https://example.org/',label:'Portfolio'}));
});
describe('Free media upload limits',()=>{
 it('accepts video at 60 seconds and rejects anything longer',()=>{expect(validateMedia('video',60,100,freeMediaLimits)).toBe(true);expect(validateMedia('video',60.01,100,freeMediaLimits)).toBe(false);});
 it('accepts video at 100 MB and rejects anything larger',()=>{expect(validateMedia('video',10,100*1024*1024,freeMediaLimits)).toBe(true);expect(validateMedia('video',10,100*1024*1024+1,freeMediaLimits)).toBe(false);});
 it('accepts audio at 5 minutes and rejects anything longer',()=>{expect(validateMedia('audio',300,100,freeMediaLimits)).toBe(true);expect(validateMedia('audio',300.01,100,freeMediaLimits)).toBe(false);});
 it('accepts audio at 20 MB and rejects anything larger',()=>{expect(validateMedia('audio',10,20*1024*1024,freeMediaLimits)).toBe(true);expect(validateMedia('audio',10,20*1024*1024+1,freeMediaLimits)).toBe(false);});
 it('uses changed settings rather than literal limits',()=>expect(validateMedia('video',61,100,{...freeMediaLimits,video_max_seconds:90})).toBe(true));
});