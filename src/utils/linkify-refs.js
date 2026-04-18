// Wraps FAA citations in <a> tags pointing at official sources.
// Covered: 14 CFR sections/parts, AC, AIM, PHAK/AFH/IFH chapter refs,
// ACS task codes, FAA-H and FAA-S-ACS document numbers.
// Unlinkable (POH/AFM) pass through untouched. Lists like
// "14 CFR 61, 68, 91" only link the first piece.

const CFR_SUBCHAPTER = {
  21: 'C', 23: 'C', 25: 'C', 27: 'C', 29: 'C', 39: 'C',
  43: 'C', 45: 'C',
  61: 'D', 67: 'D', 68: 'D',
  71: 'E', 73: 'E',
  91: 'F', 93: 'F', 97: 'F', 103: 'F',
  135: 'G', 137: 'G',
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

const PHAK_URL = HANDBOOK_URLS['8083-25'];
const AFH_URL = HANDBOOK_URLS['8083-3'];
const IFH_URL = HANDBOOK_URLS['8083-15'];
const ACS_URL = 'https://www.faa.gov/training_testing/testing/acs';
const AIM_URL = 'https://www.faa.gov/air_traffic/publications/atpubs/aim_html';
const CHART_GUIDE_URL = 'https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/vfr';

function cfrUrl(part, section) {
  const sub = CFR_SUBCHAPTER[Number(part)];
  if (!sub) return null;
  if (section) {
    return `https://www.ecfr.gov/current/title-14/chapter-I/subchapter-${sub}/part-${part}/section-${part}.${section}`;
  }
  return `https://www.ecfr.gov/current/title-14/chapter-I/subchapter-${sub}/part-${part}`;
}

function acUrl(num) {
  // AC library search returns the exact AC when the number matches.
  return `https://www.faa.gov/regulations_policies/advisory_circulars/?mode=list&advisoryCircularNbr=${num}`;
}

// Order matters: more specific patterns first.
const PATTERNS = [
  // 14 CFR 61.60, 14 CFR 91.155, 14 CFR 91.205(b), 14 CFR part 68
  { re: /14\s+CFR\s+(?:part\s+)?(\d+)\.(\d+[a-z]?)/gi, href: (m) => cfrUrl(m[1], m[2]) },
  { re: /14\s+CFR\s+(?:part\s+)?(\d+)(?!\.[0-9])/gi, href: (m) => cfrUrl(m[1]) },
  // FAA-H-8083-25 (with optional trailing revision letter)
  { re: /FAA-H-(8083-\d+)[A-Z]?/g, href: (m) => HANDBOOK_URLS[m[1]] || null },
  // FAA-S-ACS-6C and similar
  { re: /FAA-S-ACS-\d+[A-Z]?/g, href: () => ACS_URL },
  // AC 00-45H, AC 68-1, AC 60-22
  { re: /\bAC\s+(\d{1,3}-\d+[A-Z]?)/g, href: (m) => acUrl(m[1]) },
  // ACS task codes: ACS PA.I.C or PA.I.C.R1 / K2 / S3
  { re: /\bACS\s+PA\.[IVX]+\.[A-Z](?:\.(?:[RKS])?\d+)?/g, href: () => ACS_URL },
  // AIM section: AIM 7-1-5, AIM 8-1, AIM Ch.5
  { re: /\bAIM\s+(?:Ch\.\d+|\d+(?:-\d+){1,2})/g, href: () => AIM_URL },
  // PHAK Ch.N — maps to FAA-H-8083-25 landing page
  { re: /\bPHAK\s+Ch\.\d+/g, href: () => PHAK_URL },
  // AFH Ch.N — FAA-H-8083-3
  { re: /\bAFH\s+Ch\.\d+/g, href: () => AFH_URL },
  // IFH Ch.N — FAA-H-8083-15
  { re: /\bIFH\s+Ch\.\d+/g, href: () => IFH_URL },
  // FAA Sectional Chart Legend — VFR chart guide page
  { re: /\bFAA\s+Sectional\s+Chart\s+Legend\b/g, href: () => CHART_GUIDE_URL },
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
    if (i % 2 === 1) return seg;
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
