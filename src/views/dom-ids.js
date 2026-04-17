// Maps manifest IDs to the legacy DOM IDs baked into index.html (ported from
// v10 without renaming). Phase 4 regenerates the body HTML from markdown
// files; at that point this module goes away and DOM IDs match manifest IDs.

export const AREA_DOM_ID = {
  I: 'a1',  II: 'a2',  III: 'a3',  IV: 'a4',  V: 'a5',
  VI: 'a6', VII: 'a7', VIII: 'a8', IX: 'a9', XI: 'a11', XII: 'a12',
};

export function areaDomId(manifestAreaId) {
  const suffix = AREA_DOM_ID[manifestAreaId];
  return suffix ? `pg-${suffix}` : null;
}

// v10 merged VIII tasks A-D into one section with DOM id `t-viiiad`. Mapped
// explicitly here; every other task follows the simple lowercased pattern.
const TASK_DOM_OVERRIDES = {
  'VIII-A': 't-viiiad',
};

// "I-A" → "t-ia", "XII-A" → "t-xiia", "VIII-A" → "t-viiiad"
export function taskDomId(manifestTaskId) {
  if (TASK_DOM_OVERRIDES[manifestTaskId]) return TASK_DOM_OVERRIDES[manifestTaskId];
  return 't-' + manifestTaskId.toLowerCase().replace('-', '');
}
