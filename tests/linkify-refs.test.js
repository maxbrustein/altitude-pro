import { describe, it, expect } from 'vitest';
import { linkifyRefs } from '../src/utils/linkify-refs.js';

describe('linkifyRefs', () => {
  it('links a 14 CFR section to eCFR', () => {
    const out = linkifyRefs('See 14 CFR 61.60 for details.');
    expect(out).toContain('<a href="https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/section-61.60"');
    expect(out).toContain('>14 CFR 61.60</a>');
  });

  it('links a whole CFR part', () => {
    const out = linkifyRefs('Study 14 CFR 91 carefully.');
    expect(out).toContain('subchapter-F/part-91');
    expect(out).not.toContain('section-91');
  });

  it('does not double-link a section as both section and part', () => {
    const out = linkifyRefs('14 CFR 91.155');
    // Only one <a> tag should be present
    expect((out.match(/<a /g) || []).length).toBe(1);
  });

  it('links FAA handbooks to top-level page', () => {
    const out = linkifyRefs('FAA-H-8083-25 chapter 3');
    expect(out).toContain('handbooks_manuals/aviation/phak');
    expect(out).toContain('>FAA-H-8083-25</a>');
  });

  it('links ACS references', () => {
    const out = linkifyRefs('per FAA-S-ACS-6C standards');
    expect(out).toContain('training_testing/testing/acs');
    expect(out).toContain('>FAA-S-ACS-6C</a>');
  });

  it('leaves POH refs untouched (unlinkable)', () => {
    const out = linkifyRefs('See POH/AFM section 4.');
    expect(out).toBe('See POH/AFM section 4.');
  });

  it('links AC citations to the AC library search', () => {
    const out = linkifyRefs('per AC 68-1 and AC 00-45H');
    expect((out.match(/<a /g) || []).length).toBe(2);
    expect(out).toContain('advisoryCircularNbr=68-1');
    expect(out).toContain('advisoryCircularNbr=00-45H');
  });

  it('links AIM section refs to AIM HTML', () => {
    const out = linkifyRefs('AIM 7-1-5 and AIM 8-1 plus AIM Ch.5');
    expect((out.match(/<a /g) || []).length).toBe(3);
    expect(out).toMatch(/aim_html.*AIM 7-1-5/);
  });

  it('links PHAK/AFH chapter refs to handbook landing pages', () => {
    const out = linkifyRefs('PHAK Ch.17 and AFH Ch.2');
    expect(out).toContain('handbooks_manuals/aviation/phak');
    expect(out).toContain('handbooks_manuals/aviation/airplane_handbook');
  });

  it('links ACS task codes', () => {
    const out = linkifyRefs('ACS PA.I.C.R1 and ACS PA.V.B');
    expect((out.match(/<a /g) || []).length).toBe(2);
  });

  it('links 14 CFR part written as "part 68"', () => {
    const out = linkifyRefs('14 CFR part 68');
    expect(out).toContain('part-68');
  });

  it('handles multiple references in one string', () => {
    const out = linkifyRefs('14 CFR 61.23 plus 14 CFR 68');
    expect((out.match(/<a /g) || []).length).toBe(2);
    expect(out).toContain('section-61.23');
    expect(out).toContain('part-68');
  });

  it('only links the first of a comma list (known limitation)', () => {
    // "14 CFR 61, 68, 91" — only 61 gets linked; 68 and 91 lack the prefix
    const out = linkifyRefs('14 CFR 61, 68, 91');
    expect((out.match(/<a /g) || []).length).toBe(1);
    expect(out).toContain('part-61');
    expect(out).toContain('68, 91'); // still plain text
  });

  it('handles null/empty/non-string input', () => {
    expect(linkifyRefs('')).toBe('');
    expect(linkifyRefs(null)).toBe(null);
    expect(linkifyRefs(undefined)).toBe(undefined);
  });

  it('does not re-wrap text already inside an anchor', () => {
    // Our regex doesn't specifically skip anchors, but the CFR section
    // pattern's output contains `part-61` in URL attributes, not "14 CFR".
    // Verify no cascade corruption.
    const out = linkifyRefs(linkifyRefs('14 CFR 61.60'));
    expect((out.match(/<a /g) || []).length).toBe(1);
  });
});
