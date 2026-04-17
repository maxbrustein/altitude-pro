// Desktop sidebar: area accordion + task list + ref link.
// Also exports navigation primitives (showAreaPage, goToTask, showRefPage,
// scrollToTask) shared with mobile-nav.js and mode-switch.js.

export const AREAS = [
  {id:'pg-a1',num:'I',  short:'PREFLIGHT PREP', name:'Preflight Preparation', tasks:[
    {id:'t-ia', label:'Pilot Qualifications'},{id:'t-ib',label:'Airworthiness Requirements'},
    {id:'t-ic', label:'Weather Information'},{id:'t-id',label:'Cross-Country Planning'},
    {id:'t-ie', label:'National Airspace System'},{id:'t-if',label:'Performance & Limitations'},
    {id:'t-ig', label:'Operation of Systems'},{id:'t-ih',label:'Human Factors'}]},
  {id:'pg-a2',num:'II', short:'PREFLIGHT PROC', name:'Preflight Procedures', tasks:[
    {id:'t-iia',label:'Preflight Assessment'},{id:'t-iib',label:'Flight Deck Management'},
    {id:'t-iic',label:'Engine Starting'},{id:'t-iid',label:'Taxiing'},
    {id:'t-iif',label:'Before Takeoff Check'}]},
  {id:'pg-a3',num:'III',short:'AIRPORT OPS',   name:'Airport Operations', tasks:[
    {id:'t-iiia',label:'Comms & Runway Lighting'},{id:'t-iiib',label:'Traffic Patterns'}]},
  {id:'pg-a4',num:'IV', short:'T/O & LANDINGS',name:'Takeoffs, Landings & Go-Arounds', tasks:[
    {id:'t-iva', label:'Normal Takeoff & Climb'},{id:'t-ivb',label:'Normal Approach & Landing'},
    {id:'t-ivc', label:'Soft-Field T/O & Landing'},{id:'t-ive',label:'Short-Field T/O & Landing'},
    {id:'t-ivm', label:'Forward Slip to Landing'},{id:'t-ivn',label:'Go-Around / Rejected Landing'}]},
  {id:'pg-a5',num:'V',  short:'PERF & GND REF',name:'Performance & Ground Reference', tasks:[
    {id:'t-va',label:'Steep Turns'},{id:'t-vb',label:'Ground Reference Maneuvers'}]},
  {id:'pg-a6',num:'VI', short:'NAVIGATION',    name:'Navigation', tasks:[
    {id:'t-via',label:'Pilotage & Dead Reckoning'},{id:'t-vib',label:'Navigation Systems & Radar'},
    {id:'t-vic',label:'Diversion'},{id:'t-vid',label:'Lost Procedures'}]},
  {id:'pg-a7',num:'VII',short:'STALLS',        name:'Slow Flight & Stalls', tasks:[
    {id:'t-viia', label:'Maneuvering During Slow Flight'},{id:'t-viib',label:'Power-Off Stalls'},
    {id:'t-viic', label:'Power-On Stalls'},{id:'t-viid',label:'Spin Awareness'}]},
  {id:'pg-a8',num:'VIII',short:'INSTRUMENTS',  name:'Basic Instrument Maneuvers', tasks:[
    {id:'t-viiiad',label:'Straight-Level, Climbs, Descents, Turns'},
    {id:'t-viiie', label:'Unusual Attitude Recovery'},{id:'t-viiif',label:'Partial Panel & Radio Nav'}]},
  {id:'pg-a9',num:'IX', short:'EMERGENCIES',   name:'Emergency Operations', tasks:[
    {id:'t-ixa',label:'Emergency Descent'},{id:'t-ixb',label:'Emergency Approach & Landing'},
    {id:'t-ixc',label:'Systems & Equipment Malfunctions'},{id:'t-ixd',label:'Emergency Equipment & ELT'}]},
  {id:'pg-a11',num:'XI', short:'NIGHT OPS',    name:'Night Operations', tasks:[
    {id:'t-xia',label:'Night Operations'}]},
  {id:'pg-a12',num:'XII',short:'POSTFLIGHT',   name:'Postflight Procedures', tasks:[
    {id:'t-xiia',label:'After Landing, Parking & Securing'}]}
];

let curAreaId = 'pg-a1';

export function getCurrentAreaId() { return curAreaId; }

export function initSidebar() {
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  buildSidebar();
  sb.addEventListener('click', handleClick);
}

function buildSidebar() {
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  sb.innerHTML = AREAS.map(area => {
    const isOpen = area.id === curAreaId;
    const taskItems = area.tasks.map(t => `
      <div class="sb-task${curAreaId===area.id ? ' active':''}" data-action="goto-task" data-area-id="${area.id}" data-task-id="${t.id}">
        <span class="sb-task-code">${t.id.replace('t-','').toUpperCase()}</span>
        ${t.label}
      </div>`).join('');
    return `
      <div class="sb-area${isOpen?' open':''}" id="sbarea-${area.id}">
        <div class="sb-area-hdr${isOpen?' active-area open':''}" data-action="toggle-area" data-area-id="${area.id}">
          <div class="sb-area-label">
            <span class="sb-area-num">Area ${area.num}</span>
            <span class="sb-area-name">${area.name}</span>
          </div>
          <span class="sb-area-arrow"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"><polyline points="3.5,2 6.5,5 3.5,8"/></svg></span>
        </div>
        <div class="sb-tasks">${taskItems}</div>
      </div>`;
  }).join('') + `
    <div class="sb-ref${curAreaId==='pg-ref'?' active':''}" data-action="show-ref">
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

function toggleSbArea(areaId) {
  curAreaId = areaId;
  showAreaPage(areaId);
}

export function showAreaPage(areaId) {
  curAreaId = areaId;
  document.querySelectorAll('.study-area, .ref-page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById(areaId);
  if (pg) pg.classList.add('active');
  const c = document.querySelector('.content');
  if (c) c.scrollTop = 0;
  buildSidebar();
}

export function showRefPage() {
  curAreaId = 'pg-ref';
  document.querySelectorAll('.study-area, .ref-page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('pg-ref');
  if (pg) pg.classList.add('active');
  buildSidebar();
}

export function goToTask(areaId, taskId) {
  if (curAreaId !== areaId) {
    showAreaPage(areaId);
    setTimeout(() => scrollToTask(taskId), 80);
  } else {
    scrollToTask(taskId);
  }
}

export function scrollToTask(taskId) {
  const el = document.getElementById(taskId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function rebuildSidebar() {
  buildSidebar();
}
