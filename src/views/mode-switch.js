// Top-level Study Guide / Quiz mode toggle. Click handlers call navigate()
// (so the router drives mode changes); switchMode() is called by the
// router's handlers and by other modules that need a direct mode swap.

import { showAreaPage, getCurrentAreaId, rebuildSidebar } from './sidebar.js';
import { areaDomId } from './dom-ids.js';
import { navigate } from '../router.js';

let mode = 'study';
let manifestData = null;
let quizModeEntered = null;
let quizModeLeft = null;
let mobileShowArea = null;

export function getMode() { return mode; }

export function initModeSwitch(manifest, { onEnterQuiz, onLeaveQuiz, onMobileShowArea } = {}) {
  manifestData = manifest;
  quizModeEntered = onEnterQuiz || null;
  quizModeLeft = onLeaveQuiz || null;
  mobileShowArea = onMobileShowArea || null;
  document.addEventListener('click', handleClick);
}

function handleClick(e) {
  const btn = e.target.closest('[data-action="mode"]');
  if (!btn) return;
  if (btn.dataset.mode === 'quiz') {
    navigate('#/quiz');
  } else {
    // Study: return to whatever area is currently selected
    const curDom = getCurrentAreaId();
    const area = manifestData?.areas.find(a => areaDomId(a.id) === curDom);
    navigate(area ? `#/area/${area.id}` : '#/');
  }
}

export function switchMode(m) {
  mode = m;
  document.querySelectorAll('.nav-tab').forEach((t, i) =>
    t.classList.toggle('active', (i === 0 && m === 'study') || (i === 1 && m === 'quiz')));
  document.querySelectorAll('.bnav-item').forEach((b, i) =>
    b.classList.toggle('active', (i === 0 && m === 'study') || (i === 1 && m === 'quiz')));

  if (m === 'quiz') {
    document.querySelectorAll('.study-area, .ref-page').forEach(p => p.classList.remove('active'));
    const qp = document.querySelector('.quiz-page');
    if (qp) qp.classList.add('active');
    const bc = document.getElementById('breadcrumb');
    if (bc) { bc.style.visibility = 'hidden'; bc.style.pointerEvents = 'none'; }
    if (quizModeEntered) quizModeEntered();
  } else {
    const qp = document.querySelector('.quiz-page');
    if (qp) qp.classList.remove('active');
    const bc = document.getElementById('breadcrumb');
    if (bc) { bc.style.visibility = ''; bc.style.pointerEvents = ''; }
    if (window.innerWidth < 768 && mobileShowArea) {
      mobileShowArea();
    } else {
      showAreaPage(getCurrentAreaId());
    }
    if (quizModeLeft) quizModeLeft();
  }

  rebuildSidebar();
}
