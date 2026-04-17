// Mobile-only navigation: breadcrumb + bottom sheet picker + bottom nav +
// scroll observer that updates the breadcrumb's current task as you scroll.

const MOB_AREAS = [
  {id:'pg-a1',num:'I',  short:'PREFLIGHT PREP', name:'Preflight Preparation', tasks:[
    ['t-ia','A · PILOT QUALS'],['t-ib','B · AIRWORTHINESS'],['t-ic','C · WEATHER'],
    ['t-id','D · XC PLANNING'],['t-ie','E · AIRSPACE'],['t-if','F · PERFORMANCE'],
    ['t-ig','G · SYSTEMS'],['t-ih','H · HUMAN FACTORS']]},
  {id:'pg-a2',num:'II', short:'PREFLIGHT PROC', name:'Preflight Procedures', tasks:[
    ['t-iia','A · PREFLIGHT ASSESS'],['t-iib','B · FLIGHT DECK'],
    ['t-iic','C · ENGINE START'],['t-iid','D · TAXIING'],['t-iif','F · BEFORE T/O']]},
  {id:'pg-a3',num:'III',short:'AIRPORT OPS',    name:'Airport Operations', tasks:[
    ['t-iiia','A · COMMS & LIGHTING'],['t-iiib','B · TRAFFIC PATTERN']]},
  {id:'pg-a4',num:'IV', short:'T/O & LANDINGS', name:'Takeoffs, Landings & Go-Arounds', tasks:[
    ['t-iva','A · NORMAL T/O'],['t-ivb','B · NORMAL LANDING'],
    ['t-ivc','C/D · SOFT FIELD'],['t-ive','E/F · SHORT FIELD'],
    ['t-ivm','M · FORWARD SLIP'],['t-ivn','N · GO-AROUND']]},
  {id:'pg-a5',num:'V',  short:'PERF & GND REF', name:'Performance & Ground Reference', tasks:[
    ['t-va','A · STEEP TURNS'],['t-vb','B · GND REFERENCE']]},
  {id:'pg-a6',num:'VI', short:'NAVIGATION',     name:'Navigation', tasks:[
    ['t-via','A · PILOTAGE & DR'],['t-vib','B · NAV SYSTEMS'],
    ['t-vic','C · DIVERSION'],['t-vid','D · LOST PROC']]},
  {id:'pg-a7',num:'VII',short:'STALLS',         name:'Slow Flight & Stalls', tasks:[
    ['t-viia','A · SLOW FLIGHT'],['t-viib','B · POWER-OFF STALL'],
    ['t-viic','C · POWER-ON STALL'],['t-viid','D · SPIN AWARENESS']]},
  {id:'pg-a8',num:'VIII',short:'INSTRUMENTS',   name:'Basic Instrument Maneuvers', tasks:[
    ['t-viiiad','A-D · BASIC MANEUVERS'],['t-viiie','E · UNUSUAL ATTITUDE'],
    ['t-viiif','F · PARTIAL PANEL']]},
  {id:'pg-a9',num:'IX', short:'EMERGENCIES',    name:'Emergency Operations', tasks:[
    ['t-ixa','A · EMERG DESCENT'],['t-ixb','B · EMERG LANDING'],
    ['t-ixc','C · SYS MALFUNCTIONS'],['t-ixd','D · EMERG EQUIP']]},
  {id:'pg-a11',num:'XI', short:'NIGHT OPS',     name:'Night Operations', tasks:[
    ['t-xia','A · NIGHT OPERATIONS']]},
  {id:'pg-a12',num:'XII',short:'POSTFLIGHT',    name:'Postflight Procedures', tasks:[
    ['t-xiia','A · AFTER LANDING']]}
];

let mobActiveSectionId = 'pg-a1';

export function getMobActiveSectionId() { return mobActiveSectionId; }

export function initMobileNav() {
  buildBottomNav();
  document.addEventListener('click', handleClick);
  initScrollObserver();
  activateSection('pg-a1');
}

export function activateSection(areaId) {
  mobActiveSectionId = areaId;
  document.querySelectorAll('.study-area').forEach(el => {
    el.classList.toggle('active', el.id === areaId);
  });
  const contentEl = document.querySelector('.content');
  if (contentEl) contentEl.scrollTop = 0;
  const area = MOB_AREAS.find(a => a.id === areaId);
  if (area) {
    const sv = document.getElementById('bc-section-val');
    const tv = document.getElementById('bc-task-val');
    if (sv) sv.textContent = area.num + ' · ' + area.short;
    if (tv && area.tasks[0]) tv.textContent = area.tasks[0][1];
  }
}

export function reactivateCurrentSection() {
  activateSection(mobActiveSectionId);
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
  if (pickSec) { sheetPickSection(pickSec.dataset.areaId); return; }
  const pickTask = e.target.closest('[data-action="sheet-pick-task"]');
  if (pickTask) { sheetPickTask(pickTask.dataset.taskId, pickTask.dataset.taskVal); return; }
}

function openSheet(type) {
  const overlay = document.getElementById('sheet-overlay');
  const list = document.getElementById('sheet-list');
  const title = document.getElementById('sheet-title');
  if (!overlay || !list || !title) return;

  if (type === 'section') {
    title.textContent = 'Jump to Section';
    list.innerHTML = MOB_AREAS.map(area => {
      const isActive = area.id === mobActiveSectionId;
      return `<div class="sheet-item${isActive ? ' active-item' : ''}" data-action="sheet-pick-section" data-area-id="${area.id}">
        <span class="si-num">${area.num}</span>
        <span>${area.name}</span>
      </div>`;
    }).join('');
  } else {
    title.textContent = 'Jump to Task';
    const area = MOB_AREAS.find(a => a.id === mobActiveSectionId) || MOB_AREAS[0];
    const curTaskVal = (document.getElementById('bc-task-val') || {}).textContent || '';
    list.innerHTML = area.tasks.map(t => {
      const isActive = t[1] === curTaskVal;
      const escapedVal = t[1].replace(/"/g, '&quot;');
      return `<div class="sheet-item${isActive ? ' active-item' : ''}" data-action="sheet-pick-task" data-task-id="${t[0]}" data-task-val="${escapedVal}">
        <span class="si-num">${t[0].replace('t-', '').toUpperCase()}</span>
        <span>${t[1].split(' · ')[1] || t[1]}</span>
      </div>`;
    }).join('');
  }

  overlay.classList.add('open');
}

function closeSheet() {
  const overlay = document.getElementById('sheet-overlay');
  if (overlay) overlay.classList.remove('open');
}

function sheetPickSection(areaId) {
  closeSheet();
  activateSection(areaId);
}

function sheetPickTask(taskId, taskVal) {
  closeSheet();
  const tv = document.getElementById('bc-task-val');
  if (tv) tv.textContent = taskVal;
  setTimeout(() => {
    const el = document.getElementById(taskId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

function initScrollObserver() {
  const contentEl = document.querySelector('.content');
  if (!contentEl) return;

  function onScroll() {
    if (window.innerWidth >= 768) return;
    const activeArea = document.getElementById(mobActiveSectionId);
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
