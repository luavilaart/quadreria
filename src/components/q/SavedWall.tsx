import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from './AccountProvider';
import { useTaxonomy } from './TaxonomyProvider';
import { PieceCard, RoomCard } from './Cards';
import { savedGallery, socialQuery } from '@/lib/social';
import { useSocialCopy } from '@/i18n/social';

export function SavedWall({kind}:{kind:'favorites'|'following'}) {
 const {user}=useAccount();const {state}=useTaxonomy();const c=useSocialCopy();
 const result=useQuery({...socialQuery(user?.id??''),enabled:!!user});
 if(result.isPending)return <p role="status" className="text-stone">{c.loading}</p>;
 if(result.isError)return <p role="alert">{c.error}</p>;
 const saved=savedGallery(state.gallery,result.data.pieces,result.data.artists);
 if(kind==='following')return saved.artists.length?<div className="grid gap-4 sm:grid-cols-3">{saved.artists.map(a=><RoomCard key={a.id} a={a}/>)}</div>:<div><p className="text-stone">{c.emptyFollowing}</p><Link to="/discover" search={{tab:'artists'}} className="btn btn-primary mt-5">{c.discoverArtists}</Link></div>;
 return saved.pieces.length?<div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-8">{saved.pieces.map((p,i)=><div key={p.id} className={`max-w-xs ${i%3===0?'w-[38%]':i%3===1?'w-[52%]':'w-[44%]'}`}><PieceCard p={p}/></div>)}</div>:<div><p className="text-stone">{c.emptyFavorites}</p><Link to="/discover" className="btn btn-primary mt-5">{c.findArt}</Link></div>;
}