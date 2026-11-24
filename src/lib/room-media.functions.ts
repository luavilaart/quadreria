import {createServerFn} from '@tanstack/react-start';
import {mediaProvider} from '@/data/taxonomy';
/** Resolve only a Bandcamp permalink, never an arbitrary remote URL. */
export const bandcampEmbed=createServerFn({method:'GET'}).inputValidator((input:{url:string})=>input).handler(async({data})=>{
 if(mediaProvider(data.url)!=='bandcamp')return null;
 const url=new URL(data.url);if(url.protocol!=='https:'||!/^\/(album|track)\/[^/]+\/?$/.test(url.pathname))return null;
 const response=await fetch(url.href,{redirect:'manual',signal:AbortSignal.timeout(10000)});if(!response.ok)return null;
 const html=(await response.text()).slice(0,2_000_000);const encoded=/data-tralbum="([^"]+)"/.exec(html)?.[1];if(!encoded)return null;
 try{const info=JSON.parse(encoded.replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&amp;','&')) as {current?:{type?:string;id?:number};album_id?:number};const type=info.current?.type==='track'?'track':'album';const id=type==='album'?info.album_id??info.current?.id:info.current?.id;if(!id||!Number.isSafeInteger(id)||id<1)return null;return `https://bandcamp.com/EmbeddedPlayer/${type}=${id}/size=large/tracklist=false/transparent=true/`; }catch{return null;}
});