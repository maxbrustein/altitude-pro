// Mobile-only navigation: breadcrumb + bottom sheet picker + bottom nav +
// scroll observer that updates the breadcrumb's current task as you scroll.
// Reads areas/tasks from manifest.json (via content loader).

import { areaDomId, taskDomId } from './dom-ids.js';

let manifestData = null;
let mobActiveAreaId = 'I'; // manifest ID

export function getMobActiveSectionId() { return areaDomId(mobActiveAreaId); }

export function initMobileNav(manifest) {
  manifestData = manifest;
  buildBottomNav();
  document.addEventListener('click', handleClick);
  initScrollObserver();
  activateSection('I');
}

// Accepts either a manifest area id (e.g., "I") or a DOM id (e.g., "pg-a1").
// External callers (like reactivateCurrentSection) pass the manifest id.
export function activateSection(areaIdOrDomId) {
  // Normalize to manifest id
  let manifestAreaId = areaIdOrDomId;
  if (areaIdOrDomId.startsWith('pg-')) {
    // Find the manifest id that maps to this DOM id
    const area = manifestData?.areas.find(a => areaDomId(a.id) === areaIdOrDomId);
    if (area) manifestAreaId = area.id;
  }
  mobActiveAreaId = manifestAreaId;
  const areaPgId = areaDomId(manifestAreaId);
  document.querySelectorAll('.study-area').forEach(el => {
    el.classList.toggle('active', el.id === areaPgId);
  });
  const contentEl = document.querySelector('.content');
  if (contentEl) contentEl.scrollTop = 0;
  const area = manifestData?.areas.find(a => a.id === manifestAreaId);
  if (area) {
    const sv = document.getElementById('bc-section-val');
    const tv = document.getElementById('bc-task-val');
    if (sv) sv.textContent = `${area.id} · ${area.short}`;
    if (tv && area.tasks[0]) tv.textContent = `${area.tasks[0].letter} · ${area.tasks[0].short}`;
  }
}

export function reactivateCurrentSection() {
  activateSection(mobActiveAreaId);
}

function buildBottomNav() {
  const bn = document.getElementById('bottom-nav');
  if (!bn) return;
  const ICONS = {
    study: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"><rect x="2.5" y="2.5" width="11" height="11"/><line x1="2.5" y1="6" x2="13.5" y2="6"/><line x1="5" y1="9" x2="11" y2="9"/><line x1="5" y1="11" x2="11" y2="11"/></svg>`,
    quiz:  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2"/><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/></svg>`
  };
  bn.innerHTML = [
    { key: 'study', label: 'Study' },
    { key: 'quiz', label: 'Quiz' }
  ].map((item, i) => `
    <button class="bnav-item${i === 0 ? ' active' : ''}" data-action="mode" data-mode="${item.key}">
      <span class="bnav-icon">${ICONS[item.key]}</span>
      <span class="bnav-label">${item.label}</span>
    </button>`).join('');
}

function handleClick(e) {
  const sheetOpenBtn = e.target.closest('[data-action="sheet"]');
  if (sheetOpenBtn) { openSheet(sheetOpenBtn.dataset.sheet); return; }
  const sheetCloseBtn = e.target.closest('[data-action="sheet-close"]');
  if (sheetCloseBtn) { closeSheet(); return; }
  const overlay = e.target.closest('[data-action="sheet-overlay"]');
  if (overlay && e.target === overlay) { closeSheet(); return; }
  const pickSec = e.target.closest('[data-action="sheet-pick-section"]');
  if (pickSec) { sheetPickSection(pickSec.dataset.manifestAreaId); return; }
  const pickTask = e.target.closest('[data-action="sheet-pick-task"]');
  if (pickTask) { sheetPickTask(pickTask.dataset.taskElId, pickTask.dataset.taskVal); return; }
}

function openSheet(type) {
  const overlay = document.getElementById('sheet-overlay');
  const list = document.getElementById('sheet-list');
  const title = document.getElementById('sheet-title');
  if (!overlay || !list || !title || !manifestData) return;

  if (type === 'section') {
    title.textContent = 'Jump to Section';
    list.innerHTML = manifestData.areas.map(area => {
      const isActive = area.id === mobActiveAreaId;
      return `<div class="sheet-item${isActive ? ' active-item' : ''}" data-action="sheet-pick-section" data-manifest-area-id="${area.id}">
        <span class="si-num">${area.id}</span>
        <span>${area.title}</span>
      </div>`;
    }).join('');
  } else {
    title.textContent = 'Jump to Task';
    const area = manifestData.areas.find(a => a.id === mobActiveAreaId) || manifestData.areas[0];
    const curTaskVal = (document.getElementById('bc-task-val') || {}).textContent || '';
    list.innerHTML = area.tasks.map(t => {
      const taskVal = `${t.letter} · ${t.short}`;
      const isActive = taskVal === curTaskVal;
      const escapedVal = taskVal.replace(/"/g, '&quot;');
      return `<div class="sheet-item${isActive ? ' active-item' : ''}" data-action="sheet-pick-task" data-task-el-id="${taskDomId(t.id)}" data-task-val="${escapedVal}">
        <span class="si-num">${t.letter}</span>
        <span>${t.short}</span>
      </div>`;
    }).join('');
  }

  overlay.classList.add('open');
}

function closeSheet() {
  const overlay = document.getElementById('sheet-overlay');
  if (overlay) overlay.classList.remove('open');
}

function sheetPickSection(manifestAreaId) {
  closeSheet();
  activateSection(manifestAreaId);
}

function sheetPickTask(taskElId, taskVal) {
  closeSheet();
  const tv = document.getElementById('bc-task-val');
  if (tv) tv.textContent = taskVal;
  setTimeout(() => {
    const el = document.getElementById(taskElId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

function initScrollObserver() {
  const contentEl = document.querySelector('.content');
  if (!contentEl) return;

  function onScroll() {
    if (window.innerWidth >= 768) return;
    const areaPgId = areaDomId(mobActiveAreaId);
    const activeArea = document.getElementById(areaPgId);
    if (!activeArea) return;
    const tasks = activeArea.querySelectorAll('.task-section.task-anchor[data-task-val]');
    let best = null;
    let bestBottom = -Infinity;
    tasks.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5 && rect.bottom > bestBottom) {
        bestBottom = rect.bottom;
        best = el;
      }
    });
    if (!best && tasks.length) best = tasks[0];
    if (best) {
      const tv = document.getElementById('bc-task-val');
      if (tv && tv.textContent !== best.dataset.taskVal) tv.textContent = best.dataset.taskVal;
    }
  }

  contentEl.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  setTimeout(onScroll, 400);
}
