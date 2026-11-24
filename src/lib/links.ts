export type Platform = 'instagram'|'substack'|'youtube'|'linkedin'|'custom';
export type RoomLink = {platform:Platform;username:string;label:string;url:string};
export const platforms = ['instagram','substack','youtube','linkedin'] as const;
export function normalizeLink(platform:Platform,raw:string,label=''):RoomLink|null {
 const input=raw.trim();if(!input)return null;
 if(platform==='custom'){try{const u=new URL(input);return u.protocol==='https:'&&label.trim()?{platform,username:'',label:label.trim(),url:u.href}:null;}catch{return null;}}
 let name=input.replace(/^@/,'');
 if(/^(https?:\/\/|www\.)/i.test(input)) {
  try {const u=new URL(input.startsWith('www.')?'https://'+input:input);const host=u.hostname.replace(/^www\./,'');
   if(platform==='substack'){if(!host.endsWith('.substack.com'))return null;name=host.slice(0,-13);}
   else {const expected={instagram:'instagram.com',youtube:'youtube.com',linkedin:'linkedin.com'}[platform];if(host!==expected)return null;const parts=u.pathname.split('/').filter(Boolean);name=platform==='linkedin'?(parts[0]==='in'?parts[1]??'':''):platform==='youtube'?(parts[0]?.startsWith('@')?parts[0].slice(1):''):parts[0]??'';}
  }catch{return null;}
 }
 if(!/^[\w.-]+$/.test(name))return null;
 const url=platform==='instagram'?`https://instagram.com/${name}`:platform==='substack'?`https://${name}.substack.com`:platform==='youtube'?`https://youtube.com/@${name}`:`https://linkedin.com/in/${name}`;
 return {platform,username:name,label:platform,url};
}
export function asRoomLinks(raw:unknown):RoomLink[] {return Array.isArray(raw)?raw.flatMap((r:unknown)=>{if(!r||typeof r!=='object')return [];const v=r as Record<string,unknown>;const platform=platforms.includes(v['platform'] as typeof platforms[number])?v['platform'] as Platform:'custom';const url=String(v['url']??'');const link=normalizeLink(platform,platform==='custom'?url:String(v['username']||url),String(v['label']??''));return link?[link]:[];}):[];}