import {useEffect,useId,useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Play,Pause,ExternalLink} from 'lucide-react';
import {QButton} from './QButton';
import {Art} from './Art';
import {useTaxonomy} from './TaxonomyProvider';
import {featureCopy} from '@/i18n/features';
import {embedUrl} from '@/data/taxonomy';
import type {RoomMedia} from '@/lib/room-media';
import {bandcampEmbed} from '@/lib/room-media.functions';
export function RoomMediaTile({item}:{item:RoomMedia}){
 const {lang}=useTaxonomy();const c=featureCopy[lang];const id=useId();const ref=useRef<HTMLMediaElement|null>(null);const [playing,setPlaying]=useState(false);const [progress,setProgress]=useState(0);
 useEffect(()=>{const stop=(e:Event)=>{if((e as CustomEvent).detail!==id){ref.current?.pause();setPlaying(false);}};window.addEventListener('quadreria-play',stop);return()=>{window.removeEventListener('quadreria-play',stop);ref.current?.pause();};},[id]);
 const bandcamp=useQuery({queryKey:['bandcamp-embed',item.url],queryFn:()=>bandcampEmbed({data:{url:item.url}}),enabled:playing&&item.provider==='bandcamp',staleTime:Infinity});
 const embed=embedUrl({id:item.id,piece_id:'',url:item.url,kind:item.kind as 'video'|'audio',provider:item.provider as 'youtube'|'vimeo'|'soundcloud'|'spotify'|'bandcamp'|'upload',poster_url:item.cover_image,duration_s:item.duration_s})??bandcamp.data;
 const toggle=()=>{if(playing){ref.current?.pause();setPlaying(false);}else{window.dispatchEvent(new CustomEvent('quadreria-play',{detail:id}));setPlaying(true);}};
 const mediaProps={onTimeUpdate:(e:React.SyntheticEvent<HTMLMediaElement>)=>{const el=e.currentTarget;setProgress(Number.isFinite(el.duration)&&el.duration?el.currentTime/el.duration*100:0);},onEnded:()=>setPlaying(false)};
 return <article className="min-w-0"><div className="relative overflow-hidden rounded-lg"><Art src={item.cover_image??undefined} ratio={item.kind==='audio'?1:16/9} tone="cream" shape={2} title={item.title}/>{playing&&(item.provider==='upload'?(item.kind==='video'?<video ref={el=>{ref.current=el;}} src={item.url} autoPlay controls playsInline {...mediaProps} className="absolute inset-0 h-full w-full object-contain"/>:<audio ref={el=>{ref.current=el;}} src={item.url} autoPlay {...mediaProps}/>):embed?<iframe title={item.title} src={embed} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full border-0"/>:<a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-x-4 top-4 btn bg-card text-ink"><ExternalLink size={16}/>{c.open}</a>)}<QButton aria-label={`${playing?c.pause:c.play} ${item.title}`} title={playing?c.pause:c.play} onClick={toggle} className="absolute bottom-3 left-3 z-10 !h-10 !w-10 !p-0 bg-card text-ink">{playing?<Pause size={18}/>:<Play size={18}/>}</QButton>{item.kind==='audio'&&<input aria-label={c.progress} type="range" min="0" max="100" step="0.1" value={progress} disabled={item.provider!=='upload'||!playing} className="absolute inset-x-16 bottom-6 w-[calc(100%-5rem)] accent-tomato" onChange={e=>{const el=ref.current;if(el&&Number.isFinite(el.duration)){el.currentTime=Number(e.target.value)/100*el.duration;setProgress(Number(e.target.value));}}}/>}</div><h3 className="mt-3 break-words text-xl">{item.title}</h3></article>;
}