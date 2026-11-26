import { describe, expect, it } from 'vitest';
import { activeEntries, serviceTaxonomy, taxonomy } from '@/data/taxonomy';
import { findSpecialty, parseBrowseSearch } from '@/data/discovery';
import { sampleGallery } from '@/data/sample-gallery';

describe('November taxonomy additions', () => {
  it('places nail art immediately after makeup under Body art', () => {
    const rows = activeEntries(taxonomy, 'specialty', 'medium:body-art');
    expect(rows.map(t => t.slug)).toEqual(['tattoo', 'piercing', 'makeup', 'nail-art']);
  });
  it('keeps the existing English and Spanish mural addresses', () => {
    expect(findSpecialty(taxonomy, 'medium:painting', 'mural')?.id).toBe('medium:painting:mural');
    expect(taxonomy.find(t => t.id === 'medium:painting:mural')?.slug_es).toBe('mural');
  });
  it('adds web and UX/UI specialties under Digital art & design', () => {
    expect(activeEntries(taxonomy, 'specialty', 'medium:digital-art-design').slice(-2).map(t => t.slug)).toEqual(['web-design', 'ux-ui-design']);
  });
  it('links all 21 requested service types to a real medium or specialty', () => {
    const rows = activeEntries(taxonomy, 'service');
    expect(rows).toHaveLength(21);
    expect(rows.every(t => !!serviceTaxonomy(taxonomy, t.id).medium_id)).toBe(true);
    expect(serviceTaxonomy(taxonomy, 'service:web-design')).toEqual({ medium_id: 'medium:digital-art-design', specialty_ids: ['medium:digital-art-design:web-design'] });
    expect(serviceTaxonomy(taxonomy, 'service:video-editing')).toEqual({ medium_id: 'medium:film-video-animation', specialty_ids: ['medium:film-video-animation:video-editing'] });
  });
  it('keeps service-type selections in shareable URLs', () => {
    expect(parseBrowseSearch({ tab: 'services', medium: 'digital-art-design', service: 'web-design' })).toEqual({ tab: 'services', medium: 'digital-art-design', service: 'web-design' });
  });
  it('excludes hidden service types and types with hidden ancestors', () => {
    const hidden = taxonomy.map(t => t.id === 'service:web-design' || t.id === 'medium:body-art' ? { ...t, status: 'hidden' as const } : t);
    expect(activeEntries(hidden, 'service').some(t => t.id === 'service:web-design')).toBe(false);
    expect(activeEntries(hidden, 'service').some(t => t.id === 'service:nail-art')).toBe(false);
  });
  it('uses configurable service ordering', () => {
    const reordered = taxonomy.map(t => t.id === 'service:web-design' ? { ...t, sort_order: -1 } : t);
    expect(activeEntries(reordered, 'service')[0]?.id).toBe('service:web-design');
  });
  it('hides services whose linked specialty is not publicly available', () => {
    const missing = taxonomy.filter(t=>t.id!=='medium:digital-art-design:web-design');
    expect(activeEntries(missing, 'service').some(t=>t.id==='service:web-design')).toBe(false);
  });
  it('categorizes samples by their service rather than their artist', () => {
    expect(sampleGallery.services.find(s => s.id === 'sample-video-editing')?.medium_id).toBe('medium:film-video-animation');
    expect(sampleGallery.services.find(s => s.id === 'sample-web-design')?.specialty_ids).toEqual(['medium:digital-art-design:web-design']);
  });
});