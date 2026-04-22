// Auto-slug derivation + manifest validation.
// Canonical slug format: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export function autoSlug(title) {
  let s = String(title).toLowerCase();
  s = s.replace(/&/g, 'and').replace(/\//g, '-');
  s = s.replace(/[^a-z0-9\s-]/g, '');
  s = s.replace(/\s+/g, '-');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-+|-+$/g, '');
  return s;
}

export function validateManifestSlugs(manifest) {
  const errors = [];
  const slugs = new Set();
  const aliases = new Set();
  const allTasks = manifest.areas.flatMap(a => a.tasks);

  for (const t of allTasks) {
    if (!t.slug) {
      errors.push(`${t.id}: missing slug`);
      continue;
    }
    if (!SLUG_RE.test(t.slug)) {
      errors.push(`${t.id}: malformed slug "${t.slug}"`);
    }
    if (slugs.has(t.slug)) {
      errors.push(`${t.id}: duplicate slug "${t.slug}"`);
    }
    slugs.add(t.slug);
  }

  for (const t of allTasks) {
    for (const alias of (t.aliases || [])) {
      if (!SLUG_RE.test(alias)) {
        errors.push(`${t.id}: malformed alias "${alias}"`);
      }
      if (slugs.has(alias)) {
        errors.push(`${t.id}: alias "${alias}" collides with a canonical slug`);
      }
      if (aliases.has(alias)) {
        errors.push(`${t.id}: alias "${alias}" duplicated across manifest`);
      }
      aliases.add(alias);
    }
  }

  return errors;
}
