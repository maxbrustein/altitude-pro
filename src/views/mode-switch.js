// Top-level Study Guide / Quiz mode toggle. Coordinates which panel is
// visible (study-area vs quiz-page) and nudges dependent modules when the
// mode changes.

import { showAreaPage, getCurrentAreaId, rebuildSidebar } from './sidebar.js';

let mode = 'study';
let quizModeEntered = null;
let quizModeLeft = null;

export function getMode() { return mode; }

export function initModeSwitch({ onEnterQuiz, onLeaveQuiz, onMobileShowArea } = {}) {
  quizModeEntered = onEnterQuiz || null;
  quizModeLeft = onLeaveQuiz || null;
  mobileShowArea = onMobileShowArea || null;
  document.addEventListener('click', handleClick);
}

let mobileShowArea = null;

function handleClick(e) {
  const btn = e.target.closest('[data-action="mode"]');
  if (!btn) return;
  switchMode(btn.dataset.mode);
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
