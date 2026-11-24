import {zodValidator,fallback} from '@tanstack/zod-adapter';
import {z} from 'zod';
export const shopSearchValidator=zodValidator(z.object({medium:fallback(z.string(),'').default(''),specialty:fallback(z.string(),'').default(''),city:fallback(z.string(),'').default(''),sort:fallback(z.string(),'recommended').default('recommended'),tab:fallback(z.string(),'art').default('art'),collection:fallback(z.string(),'').default('')}));
export const sortModes=['recommended','popular','newest','rated','priceAsc','priceDesc'] as const;
export type SortMode=typeof sortModes[number];
export type ShopSearch={medium:string;specialty:string;city:string;sort:string;tab:string;collection:string};
export function validateShopSearch(s:Record<string,unknown>):ShopSearch {const str=(k:string,d='')=>typeof s[k]==='string'?s[k] as string:d;return {medium:str('medium'),specialty:str('specialty'),city:str('city'),sort:str('sort','recommended'),tab:str('tab','art'),collection:str('collection')};}
export type RankedPiece={id:string;artist:string;medium_id:string;price:number;created_at:string;format_id:string;status:string};
export type Ranking={counts:Record<string,number>;interests:readonly string[];followed:readonly string[];ratings?:Record<string,number|null>};
export function sortPieces<P extends RankedPiece>(rows:readonly P[],mode:string,r:Ranking):P[] {
 const popular=(p:P)=>r.counts[p.id]??0;const date=(p:P)=>Date.parse(p.created_at)||0;
 const price=mode==='priceAsc'||mode==='priceDesc';
 const filtered=price?rows.filter(p=>p.format_id!=='format:showcase-only'&&p.format_id!=='format:digital-download'):rows;
 const popOrder=[...filtered].sort((x,y)=>popular(y)-popular(x)||date(y)-date(x));const newOrder=[...filtered].sort((x,y)=>date(y)-date(x)||popular(y)-popular(x));
 const blend=[...new Set(popOrder.flatMap((p,i)=>{const fresh=newOrder[i];return fresh?[p,fresh]:[p];}))];
 const scores=new Map(blend.map((p,i)=>[p.id,i]));
 return [...filtered].sort((a,b)=>{
  if(price)return (mode==='priceAsc'?a.price-b.price:b.price-a.price)||date(b)-date(a)||a.id.localeCompare(b.id);
  if(mode==='newest')return date(b)-date(a)||a.id.localeCompare(b.id);
  if(mode==='rated'){const ar=r.ratings?.[a.artist];const br=r.ratings?.[b.artist];if(ar!=null||br!=null)return (br??-1)-(ar??-1)||popular(b)-popular(a)||date(b)-date(a);}
  if(mode==='recommended'||!sortModes.includes(mode as SortMode)){
   const match=(p:P)=>(r.interests.includes(p.medium_id)?1:0)+(r.followed.includes(p.artist)?1:0);
   const interest=match(b)-match(a);if(interest)return interest;
   // Rank-based blend keeps both popular pieces and new pieces near the top.
   const score=(p:P)=>scores.get(p.id)??0;
   return score(a)-score(b)||popular(b)-popular(a)||date(b)-date(a)||a.id.localeCompare(b.id);
  }
  return popular(b)-popular(a)||date(b)-date(a)||a.id.localeCompare(b.id);
 });
}