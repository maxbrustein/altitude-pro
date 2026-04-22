import { describe, it, expect } from 'vitest';
import { anchorId, uniqifyAnchors } from '../scripts/lib/seo-anchors.js';

describe('anchorId', () => {
  it('lowercases and hyphenates', () => {
    expect(anchorId('Certificate Requirements')).toBe('certificate-requirements');
  });
  it('strips source-tag HTML before slugging', () => {
    expect(anchorId('Certificate Requirements <span class="src-tag">14 CFR 61</span>')).toBe('certificate-requirements');
  });
  it('uses override table for known mnemonics', () => {
    expect(anchorId('TOMATO FLAMES')).toBe('tomato-flames');
    expect(anchorId('AROW — Must Be On Board')).toBe('arow-required-documents');
    expect(anchorId('AVIATES — Required Inspection Mnemonic')).toBe('aviates-inspections');
  });
  it('handles em-dashes and bullets', () => {
    expect(anchorId('BasicMed — Alternative to 3rd-Class')).toBe('basicmed');
  });
  it('produces valid ids (no leading digits, kebab-case)', () => {
    expect(anchorId('14 CFR 91.155')).toBe('14-cfr-91-155');
    expect(anchorId('14 CFR 91.155', { numericPrefix: 'reg-' })).toBe('reg-14-cfr-91-155');
  });
});

describe('uniqifyAnchors', () => {
  it('returns inputs unchanged when unique', () => {
    expect(uniqifyAnchors(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });
  it('appends -2, -3 to duplicates', () => {
    expect(uniqifyAnchors(['foo', 'foo', 'bar', 'foo'])).toEqual(['foo', 'foo-2', 'bar', 'foo-3']);
  });
});
