import { Link } from '@tanstack/react-router';
import { label, serviceTaxonomy } from '@/data/taxonomy';
import { useTaxonomy } from './TaxonomyProvider';

/** A service's category links to its own taxonomy, not its artist's main medium. */
export function ServiceTypeLink({ typeId }: { typeId: string | null | undefined }) {
  const { state, lang } = useTaxonomy();
  const type = state.taxonomy.find(t => t.id === typeId && t.kind === 'service' && t.status === 'active');
  if (!type) return null;
  const refs = serviceTaxonomy(state.taxonomy, type.id);
  const medium = state.taxonomy.find(t => t.id === refs.medium_id);
  const specialty = state.taxonomy.find(t => t.id === refs.specialty_ids[0]);
  if (!medium) return null;
  const text = label(type, lang);
  if (lang === 'es') return specialty
    ? <Link className="link text-sm" to="/es/medios/$medium/$specialty" params={{ medium: medium.slug_es, specialty: specialty.slug_es }} search={{ tab: 'services' }}>{text}</Link>
    : <Link className="link text-sm" to="/es/medios/$medium" params={{ medium: medium.slug_es }} search={{ tab: 'services' }}>{text}</Link>;
  return specialty
    ? <Link className="link text-sm" to="/mediums/$medium/$specialty" params={{ medium: medium.slug, specialty: specialty.slug }} search={{ tab: 'services' }}>{text}</Link>
    : <Link className="link text-sm" to="/mediums/$medium" params={{ medium: medium.slug }} search={{ tab: 'services' }}>{text}</Link>;
}