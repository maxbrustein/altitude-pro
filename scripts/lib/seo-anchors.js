// Anchor ID generation. Maps heading / card title text to stable IDs for
// use in `<h2 id="...">` / `<section id="...">` on study pages.

const OVERRIDES = {
  'tomato flames': 'tomato-flames',
  'arow must be on board': 'arow-required-documents',
  'aviates required inspection mnemonic': 'aviates-inspections',
  'flaps night vfr': 'flaps-night-vfr',
  'imsafe': 'imsafe',
  'pave': 'pave-checklist',
  'basicmed alternative to 3rd class': 'basicmed',
  'basicmed alternative to 3rdclass': 'basicmed',
};

function baseSlug(text) {
  let s = String(text);
  // Strip source-tag span elements and their content
  s = s.replace(/<span\s+class="src-tag"[^>]*>.*?<\/span>/gi, '');
  // Strip remaining HTML tags
  s = s.replace(/<[^>]*>/g, ' ');
  // HTML entities
  s = s.replace(/&amp;/g, '&').replace(/&bull;/g, ' ').replace(/&mdash;/g, ' ').replace(/&ndash;/g, ' ');
  // Unicode dashes and bullets
  s = s.replace(/[—–•·]/g, ' ');
  s = s.toLowerCase();
  // Replace ampersands and slashes
  s = s.replace(/&/g, 'and').replace(/\//g, '-');
  // Replace dots with hyphens before removing special chars
  s = s.replace(/\./g, '-');
  // Remove most special characters (but keep hyphens)
  s = s.replace(/[^a-z0-9\s-]/g, '');
  s = s.replace(/\s+/g, '-');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-+|-+$/g, '');
  return s;
}

export function anchorId(text, opts = {}) {
  const base = baseSlug(text);
  const rawKey = String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/[—–•·]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (OVERRIDES[rawKey]) return OVERRIDES[rawKey];
  if (opts.numericPrefix && /^\d/.test(base)) return opts.numericPrefix + base;
  return base;
}

export function uniqifyAnchors(ids) {
  const seen = new Map();
  return ids.map((id) => {
    if (!seen.has(id)) {
      seen.set(id, 1);
      return id;
    }
    const n = seen.get(id) + 1;
    seen.set(id, n);
    return `${id}-${n}`;
  });
}
