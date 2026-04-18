// Wraps FAA citations in <a> tags pointing at official sources.
// Covers: 14 CFR sections/parts (eCFR), FAA-H handbooks, FAA-S-ACS.
// Patterns that aren't linkable (POH/AFM, AIM without section, AC) pass
// through untouched. Lists like "14 CFR 61, 68, 91" only link the first.

const CFR_SUBCHAPTER = {
  61: 'D', 67: 'D', 68: 'D',
  71: 'E', 73: 'E',
  91: 'F', 93: 'F', 97: 'F',
  135: 'G',
  141: 'H', 142: 'H', 147: 'H',
};

const HANDBOOK_URLS = {
  '8083-2':  'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/risk_management_handbook',
  '8083-3':  'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook',
  '8083-9':  'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook',
  '8083-15': 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/instrument_flying_handbook',
  '8083-16': 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/instrument_procedures_handbook',
  '8083-25': 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak',
  '8083-28': 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/aviation_weather_handbook',
  '8083-30': 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/amt_general_handbook',
};

const ACS_URL = 'https://www.faa.gov/training_testing/testing/acs';

function cfrUrl(part, section) {
  const sub = CFR_SUBCHAPTER[Number(part)];
  if (!sub) return null;
  if (section) {
    return `https://www.ecfr.gov/current/title-14/chapter-I/subchapter-${sub}/part-${part}/section-${part}.${section}`;
  }
  return `https://www.ecfr.gov/current/title-14/chapter-I/subchapter-${sub}/part-${part}`;
}

// Order matters: more specific patterns first so they consume matches
// before the broader pattern sees them.
const PATTERNS = [
  // 14 CFR 61.60, 14 CFR 91.155 (section reference)
  { re: /14\s+CFR\s+(\d+)\.(\d+[a-z]?)/g, href: (m) => cfrUrl(m[1], m[2]) },
  // 14 CFR 91 (whole part, not followed by .N)
  { re: /14\s+CFR\s+(\d+)(?!\.[0-9])/g, href: (m) => cfrUrl(m[1]) },
  // FAA-H-8083-25, FAA-H-8083-3B
  { re: /FAA-H-(8083-\d+)[A-Z]?/g, href: (m) => HANDBOOK_URLS[m[1]] || null },
  // FAA-S-ACS-6C
  { re: /FAA-S-ACS-\d+[A-Z]?/g, href: () => ACS_URL },
];

function wrap(text, url) {
  return `<a href="${url}" target="_blank" rel="noopener" class="ref-link">${text}</a>`;
}

export function linkifyRefs(text) {
  if (!text || typeof text !== 'string') return text;
  // Split around existing <a>...</a> blocks so we don't re-wrap already-
  // linked text. Captured delimiters land on odd indices.
  const segments = text.split(/(<a\s[^>]*>[\s\S]*?<\/a>)/gi);
  return segments.map((seg, i) => {
    if (i % 2 === 1) return seg; // existing anchor — leave alone
    let out = seg;
    for (const { re, href } of PATTERNS) {
      out = out.replace(re, (match, ...groups) => {
        const url = href([match, ...groups]);
        return url ? wrap(match, url) : match;
      });
    }
    return out;
  }).join('');
}
