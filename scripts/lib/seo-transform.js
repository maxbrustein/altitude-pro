// Transforms the existing task HTML partials into semantic HTML suitable
// for SEO study pages. Input is the same string used by the SPA at
// runtime; output has h1/h2/h3 tags, anchor IDs, and anchor-link § icons.

import { anchorId, uniqifyAnchors } from './seo-anchors.js';

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function transformTaskHtml(html) {
  const titleMatch = html.match(/<span class="task-title">([\s\S]*?)<\/span>/);
  const title = titleMatch ? stripTags(titleMatch[1]) : '';

  let body = html.replace(/<div class="task-hdr">[\s\S]*?<\/div>\s*/, '');

  const subsections = [];
  const h2Ids = [];
  body = body.replace(
    /<div class="subsec-lbl">([\s\S]*?)<\/div>/g,
    (match, inner) => {
      const cleanText = stripTags(inner.replace(/<span class="src-tag[^"]*">[\s\S]*?<\/span>/g, ''));
      subsections.push(cleanText);
      const id = anchorId(cleanText);
      h2Ids.push(id);
      return `<h2 id="${id}">${inner.trim()} <a class="anchor-link" href="#${id}">§</a></h2>`;
    }
  );

  const factCards = [];
  const factIds = [];
  const cardRe = /<div class="fact-card([^"]*)">\s*<div class="fact-title">([\s\S]*?)<\/div>\s*<div class="fact-body">([\s\S]*?)<\/div>(?:\s*<div class="fact-ref">([\s\S]*?)<\/div>)?\s*<\/div>/g;
  body = body.replace(cardRe, (match, modClass, title, bodyHtml, refHtml) => {
    const cleanTitle = stripTags(title);
    const id = anchorId(cleanTitle);
    factIds.push(id);
    factCards.push({
      question: cleanTitle,
      answer: stripTags(bodyHtml),
    });
    const refBlock = refHtml ? `\n      <div class="fact-ref">${refHtml}</div>` : '';
    return `<section class="fact-card${modClass}" id="${id}">
      <h3>${title.trim()} <a class="anchor-link" href="#${id}">§</a></h3>
      <div class="fact-body">${bodyHtml}</div>${refBlock}
    </section>`;
  });

  const allIds = [...h2Ids, ...factIds];
  const uniqued = uniqifyAnchors(allIds);
  if (uniqued.some((u, i) => u !== allIds[i])) {
    const seen = new Map();
    body = body.replace(/id="([^"]+)"/g, (m, id) => {
      const count = (seen.get(id) || 0) + 1;
      seen.set(id, count);
      return count === 1 ? m : `id="${id}-${count}"`;
    });
    body = body.replace(
      /id="([^"]+)">([^]*?)<a class="anchor-link" href="#([^"]+)">/g,
      (m, id, middle, href) => `id="${id}">${middle}<a class="anchor-link" href="#${id}">`
    );
  }

  body = body.replace(/<div class="task-section[^"]*"[^>]*>\s*/, '');
  body = body.replace(/\s*<\/div>\s*$/, '');

  return { title, body, subsections, factCards };
}
