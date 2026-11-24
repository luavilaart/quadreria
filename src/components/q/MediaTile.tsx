import {useEffect,useRef,useState,useId} from 'react';
import {Play,Pause} from 'lucide-react';
import {Art} from './Art';
import {QButton} from './QButton';
import {useTaxonomy} from './TaxonomyProvider';
import {embedUrl} from '@/data/taxonomy';
import type {Piece} from '@/lib/gallery';
export function MediaTile({p}:{p:Piece}) {
 const playerId=useId();const {state,c}=useTaxonomy();const [playing,setPlaying]=useState(false);const [progress,setProgress]=useState(0);const ref=useRef<HTMLMediaElement|null>(null);const media=state.piece_media.find(m=>m.piece_id===p.id&&m.kind!=='image');
 useEffect(()=>{const stop=(e:Event)=>{if((e as CustomEvent).detail!==playerId){setPlaying(false);ref.current?.pause();}};window.addEventListener('quadreria-play',stop);return()=>window.removeEventListener('quadreria-play',stop);},[playerId]);
 useEffect(()=>()=>{ref.current?.pause();},[]);
 const play=(auto=false)=>{if(auto&&(p.media_type!=='video'||window.matchMedia('(prefers-reduced-motion: reduce)').matches))return;window.dispatchEvent(new CustomEvent('quadreria-play',{detail:playerId}));setPlaying(true);};
 if(p.media_type==='image'&&!media)return <Art src={p.images[0]} ratio={p.ratio} tone={p.tone} shape={p.shape} title={p.title}/>;
 const embed=media?embedUrl(media):null;
 return <div className="relative" onPointerEnter={e=>{if(e.pointerType==='mouse')play(true);}} onPointerLeave={()=>{if(p.media_type==='video'){setPlaying(false);ref.current?.pause();}}}>
 <Art src={media?.poster_url??p.images[0]} ratio={p.ratio} tone={p.tone} shape={p.shape} title={p.title}/>
 {playing&&media?.url&&(embed?<iframe src={embed} title={p.title} allow="autoplay; encrypted-media" className="absolute inset-0 h-full w-full rounded-md border-0"/>:media.provider==='upload'?(media.kind==='video'?<video ref={el=>{ref.current=el;}} src={media.url} autoPlay muted playsInline onEnded={()=>setPlaying(false)} onTimeUpdate={e=>setProgress(e.currentTarget.currentTime/e.currentTarget.duration*100)} className="absolute inset-0 h-full w-full rounded-md object-contain"/>:<audio ref={el=>{ref.current=el;}} src={media.url} autoPlay onEnded={()=>setPlaying(false)} onTimeUpdate={e=>setProgress(e.currentTarget.currentTime/e.currentTarget.duration*100)}/>):<a href={media.url} target="_blank" rel="noreferrer" className="absolute inset-x-4 top-4 btn bg-card text-ink">{c.play}</a>)}
 <QButton aria-label={`${playing?c.pause:c.play} ${p.title}`} title={playing?c.pause:c.play} className="absolute bottom-3 left-3 z-10 !h-10 !w-10 !p-0 bg-card text-ink" onClick={e=>{e.preventDefault();e.stopPropagation();if(playing){setPlaying(false);ref.current?.pause();}else play();}}>{playing?<Pause size={18}/>:<Play size={18}/>}</QButton>
 <span className="label absolute right-3 top-3 rounded-full bg-card px-2 py-1 text-ink">{p.media_type==='audio'?c.audio:c.video}</span>
 {p.media_type==='audio'&&<div className="absolute inset-x-16 bottom-6 h-1 overflow-hidden rounded-full bg-line"><div className="h-full bg-tomato" style={{width:`${Number.isFinite(progress)?progress:0}%`}}/></div>}
 </div>;
}
