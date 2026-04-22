import { describe, it, expect } from 'vitest';
import { autoSlug, validateManifestSlugs } from '../scripts/lib/seo-slugs.js';

describe('autoSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(autoSlug('Pilot Qualifications')).toBe('pilot-qualifications');
  });
  it('converts & to "and"', () => {
    expect(autoSlug('Performance & Limitations')).toBe('performance-and-limitations');
  });
  it('replaces / with -', () => {
    expect(autoSlug('Takeoffs / Landings')).toBe('takeoffs-landings');
  });
  it('strips punctuation', () => {
    expect(autoSlug("Don't, really: test!")).toBe('dont-really-test');
  });
  it('collapses multiple spaces and dashes', () => {
    expect(autoSlug('A  B   C')).toBe('a-b-c');
    expect(autoSlug('A---B')).toBe('a-b');
  });
  it('trims leading/trailing dashes', () => {
    expect(autoSlug('- hello -')).toBe('hello');
  });
});

describe('validateManifestSlugs', () => {
  const valid = {
    areas: [
      { id: 'I', tasks: [
        { id: 'I-A', slug: 'pilot-quals' },
        { id: 'I-B', slug: 'airworthiness', aliases: ['arow'] },
      ]},
    ],
  };
  it('returns no errors on a valid manifest', () => {
    expect(validateManifestSlugs(valid)).toEqual([]);
  });
  it('flags missing slug', () => {
    const m = structuredClone(valid);
    delete m.areas[0].tasks[0].slug;
    expect(validateManifestSlugs(m)[0]).toMatch(/missing slug/);
  });
  it('flags duplicate slug', () => {
    const m = structuredClone(valid);
    m.areas[0].tasks[1].slug = 'pilot-quals';
    expect(validateManifestSlugs(m)[0]).toMatch(/duplicate slug/);
  });
  it('flags alias colliding with slug', () => {
    const m = structuredClone(valid);
    m.areas[0].tasks[1].aliases = ['pilot-quals'];
    expect(validateManifestSlugs(m)[0]).toMatch(/alias.*collides/);
  });
  it('flags malformed slug', () => {
    const m = structuredClone(valid);
    m.areas[0].tasks[0].slug = 'Has Spaces';
    expect(validateManifestSlugs(m)[0]).toMatch(/malformed/);
  });
});
