// Desktop sidebar: area accordion + task list + ref link.
// Data comes from manifest.json. Navigation primitives exported for other
// views. DOM IDs (pg-a1, t-ia) remain v10-style until Phase 4b regenerates
// HTML from a cleaner format.

import { areaDomId, taskDomId } from './dom-ids.js';

let manifestData = null;
let curAreaDomId = 'pg-a1';
let curTaskElId = null;              // per-task highlighting (only the clicked task is .active)
const openSections = new Set(['pg-a1']); // multiple sections can be expanded at once

export function getCurrentAreaId() { return curAreaDomId; }

export function initSidebar(manifest) {
  manifestData = manifest;
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  buildSidebar();
  sb.addEventListener('click', handleClick);
}

function buildSidebar() {
  const sb = document.getElementById('sidebar');
  if (!sb || !manifestData) return;
  sb.innerHTML = manifestData.areas.map(area => {
    const areaPgId = areaDomId(area.id);
    const isOpen = openSections.has(areaPgId);
    const isActiveArea = areaPgId === curAreaDomId;
    const taskItems = area.tasks.map(t => {
      const tDomId = taskDomId(t.id);
      return `
      <div class="sb-task${tDomId === curTaskElId ? ' active' : ''}" data-action="goto-task" data-area-id="${areaPgId}" data-task-id="${tDomId}">
        <span class="sb-task-code">${t.letter}</span>
        ${t.title}
      </div>`;
    }).join('');
    return `
      <div class="sb-area${isOpen ? ' open' : ''}" id="sbarea-${areaPgId}">
        <div class="sb-area-hdr${isActiveArea ? ' active-area' : ''}${isOpen ? ' open' : ''}" data-action="toggle-area" data-area-id="${areaPgId}">
          <div class="sb-area-label">
            <span class="sb-area-num">Area ${area.id}</span>
            <span class="sb-area-name">${area.title}</span>
          </div>
          <span class="sb-area-arrow"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
        </div>
        <div class="sb-tasks">${taskItems}</div>
      </div>`;
  }).join('') + `
    <div class="sb-ref${curAreaDomId === 'pg-ref' ? ' active' : ''}" data-action="show-ref">
      <span class="sb-ref-icon"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"><line x1="2" y1="3" x2="10" y2="3"/><line x1="2" y1="6" x2="10" y2="6"/><line x1="2" y1="9" x2="10" y2="9"/></svg></span> Numbers & Rules Reference
    </div>`;
}

function handleClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'toggle-area') {
    toggleSbArea(target.dataset.areaId);
  } else if (action === 'goto-task') {
    goToTask(target.dataset.areaId, target.dataset.taskId);
  } else if (action === 'show-ref') {
    showRefPage();
  }
}

// Toggles area open/close in the sidebar without navigating
function toggleSbArea(areaPgId) {
  if (openSections.has(areaPgId)) openSections.delete(areaPgId);
  else openSections.add(areaPgId);
  buildSidebar();
}

export function showAreaPage(areaPgId) {
  curAreaDomId = areaPgId;
  openSections.add(areaPgId);
  document.querySelectorAll('.study-area, .ref-page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById(areaPgId);
  if (pg) pg.classList.add('active');
  const c = document.querySelector('.content');
  if (c) c.scrollTop = 0;
  buildSidebar();
}

export function showRefPage() {
  curAreaDomId = 'pg-ref';
  document.querySelectorAll('.study-area, .ref-page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('pg-ref');
  if (pg) pg.classList.add('active');
  buildSidebar();
}

export function goToTask(areaPgId, taskElId) {
  curTaskElId = taskElId;
  openSections.add(areaPgId);
  if (curAreaDomId !== areaPgId) {
    showAreaPage(areaPgId);
    setTimeout(() => scrollToTask(taskElId), 80);
  } else {
    buildSidebar();
    scrollToTask(taskElId);
  }
}

export function scrollToTask(taskElId) {
  const el = document.getElementById(taskElId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function rebuildSidebar() {
  buildSidebar();
}
