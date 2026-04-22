import { describe, it, expect } from 'vitest';
import { transformTaskHtml } from '../scripts/lib/seo-transform.js';

const SAMPLE = `
<div class="task-section task-anchor" id="t-ia">
  <div class="task-hdr">
    <span class="task-badge">Task A</span>
    <span class="task-title">Pilot Qualifications</span>
  </div>
  <div class="subsec-lbl">Certificate Requirements <span class="src-tag far">14 CFR 61</span></div>
  <div class="fact-grid two-col">
    <div class="fact-card hi">
      <div class="fact-title">Part 61 Hour Requirements</div>
      <div class="fact-body">Minimum 40 hours.</div>
      <div class="fact-ref">14 CFR 61.109(a)</div>
    </div>
    <div class="fact-card">
      <div class="fact-title">BasicMed — Alternative to 3rd-Class</div>
      <div class="fact-body">Every 48 months.</div>
      <div class="fact-ref">14 CFR part 68; AC 68-1</div>
    </div>
  </div>
</div>`;

describe('transformTaskHtml', () => {
  it('returns a result with body, title, subsections, and factCards', () => {
    const result = transformTaskHtml(SAMPLE);
    expect(result.title).toBe('Pilot Qualifications');
    expect(result.subsections.length).toBeGreaterThan(0);
    expect(result.factCards.length).toBe(2);
  });

  it('converts subsec-lbl to <h2> with anchor id and § link', () => {
    const { body } = transformTaskHtml(SAMPLE);
    expect(body).toMatch(/<h2 id="certificate-requirements"[^>]*>[\s\S]*Certificate Requirements[\s\S]*<a class="anchor-link" href="#certificate-requirements">§<\/a>[\s\S]*<\/h2>/);
  });

  it('converts fact-card to <section> with id and <h3>', () => {
    const { body } = transformTaskHtml(SAMPLE);
    expect(body).toMatch(/<section class="fact-card[^"]*" id="part-61-hour-requirements">/);
    expect(body).toMatch(/<h3>Part 61 Hour Requirements[\s\S]*<a class="anchor-link" href="#part-61-hour-requirements">§<\/a>[\s\S]*<\/h3>/);
  });

  it('uses override table for BasicMed card', () => {
    const { body } = transformTaskHtml(SAMPLE);
    expect(body).toMatch(/<section class="fact-card" id="basicmed">/);
  });

  it('preserves fact-body and fact-ref content', () => {
    const { body } = transformTaskHtml(SAMPLE);
    expect(body).toContain('Minimum 40 hours.');
    expect(body).toContain('14 CFR 61.109(a)');
  });

  it('extracts subsection titles into subsections array (for intro generation)', () => {
    const { subsections } = transformTaskHtml(SAMPLE);
    expect(subsections).toContain('Certificate Requirements');
  });

  it('extracts fact card Q/A pairs into factCards array (for FAQPage schema)', () => {
    const { factCards } = transformTaskHtml(SAMPLE);
    expect(factCards[0].question).toBe('Part 61 Hour Requirements');
    expect(factCards[0].answer).toBe('Minimum 40 hours.');
    expect(factCards[1].question).toBe('BasicMed — Alternative to 3rd-Class');
  });

  it('removes the task-hdr since page template provides h1 separately', () => {
    const { body } = transformTaskHtml(SAMPLE);
    expect(body).not.toContain('task-hdr');
    expect(body).not.toContain('Task A</span>');
  });

  it('fails if duplicate anchor ids would be emitted on the same page', () => {
    const html = `
      <div class="task-section" id="t-ia">
        <div class="task-hdr"><span class="task-title">T</span></div>
        <div class="fact-card"><div class="fact-title">Same Title</div><div class="fact-body">A</div></div>
        <div class="fact-card"><div class="fact-title">Same Title</div><div class="fact-body">B</div></div>
      </div>`;
    const { body } = transformTaskHtml(html);
    expect(body).toMatch(/id="same-title"/);
    expect(body).toMatch(/id="same-title-2"/);
  });
});
