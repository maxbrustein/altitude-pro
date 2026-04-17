// Quiz engine: setup panel (topic chips + length chips) + active quiz UI
// (question card, answer feedback, difficulty adaptation, results screen).
// Questions loaded from content/certs/ppl/quiz/*.json via content.loadAllQuizTopics.

import { loadAllQuizTopics } from '../content.js';

let BANK = [];  // populated by initQuiz from content/certs/ppl/quiz/*.json
const TOPICS = ['Regulations','Weather','Airspace','Navigation','Maneuvers','Systems','Aeromedical'];

// State
let setupLen = 10;
let setupTopics = new Set(['Regulations','Weather','Airspace','Navigation','Maneuvers','Systems','Aeromedical']);
let qS = {};

function buildTopicGrid() {
  const g = document.getElementById('tg');
  if (!g) return;
  g.innerHTML = TOPICS.map(t => {
    const cnt = BANK.filter(q => q.t === t).length;
    return `<div class="topic-chip active" id="tt-${t}" data-action="topic-toggle" data-topic="${t}">
      <span id="tc-${t}">✓</span> ${t} <span class="tc-cnt">(${cnt})</span>
    </div>`;
  }).join('');
}

function toggleTopic(t) {
  if (setupTopics.has(t)) {
    if (setupTopics.size === 1) return;
    setupTopics.delete(t);
    document.getElementById('tt-'+t).classList.remove('active');
    document.getElementById('tc-'+t).textContent = '○';
  } else {
    setupTopics.add(t);
    document.getElementById('tt-'+t).classList.add('active');
    document.getElementById('tc-'+t).textContent = '✓';
  }
  updatePreview();
}

function selAll() {
  TOPICS.forEach(t => {
    setupTopics.add(t);
    const el = document.getElementById('tt-'+t);
    if (el) { el.classList.add('active'); document.getElementById('tc-'+t).textContent = '✓'; }
  });
  updatePreview();
}

function clrAll() {
  TOPICS.forEach((t,i) => {
    const el = document.getElementById('tt-'+t);
    if (i === 0) {
      setupTopics.add(t);
      if (el) { el.classList.add('active'); document.getElementById('tc-'+t).textContent = '✓'; }
    } else {
      setupTopics.delete(t);
      if (el) { el.classList.remove('active'); document.getElementById('tc-'+t).textContent = '○'; }
    }
  });
  updatePreview();
}

function setLen(len, clickedEl) {
  setupLen = len;
  document.querySelectorAll('.len-btn').forEach(b => b.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');
  updatePreview();
}

function updatePreview() {
  const avail  = BANK.filter(q => setupTopics.has(q.t)).length;
  const actual = setupLen === 9999 ? avail : Math.min(setupLen, avail);
  const el = document.getElementById('qprev');
  if (el) el.textContent = `${actual} question${actual !== 1 ? 's' : ''} from ${avail} available`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  const pool  = shuffle(BANK.filter(q => setupTopics.has(q.t)));
  const limit = setupLen === 9999 ? pool.length : Math.min(setupLen, pool.length);
  qS = { diff:1, streak:0, total:0, correct:0, wrong:0,
         queue: pool.slice(0, limit), idx:0, maxQ:limit, answered:false };
  document.getElementById('setup-panel').style.display = 'none';
  document.getElementById('active-quiz').style.display = 'block';
  updateStats();
  nextQuestion();
}

function endQuiz() {
  document.getElementById('setup-panel').style.display = 'block';
  document.getElementById('active-quiz').style.display = 'none';
  updatePreview();
}

function nextQuestion() {
  if (qS.idx >= qS.queue.length) { showComplete(); return; }
  const remaining = qS.queue.slice(qS.idx);
  remaining.sort((a,b) => Math.abs(a.d - qS.diff) - Math.abs(b.d - qS.diff));
  for (let i = 0; i < remaining.length; i++) qS.queue[qS.idx + i] = remaining[i];
  const q = qS.queue[qS.idx];
  qS.answered = false;
  renderQ(q);
  updateDiff();
  updateProg();
}

function renderQ(q) {
  const L  = ['A','B','C','D'];
  const DL = ['Easy','Medium','Hard','Expert','Ace'];
  const DC = ['d-easy','d-med','d-hard','d-expert','d-ace'];
  document.getElementById('qcon').innerHTML = `
    <div class="q-card">
      <div class="q-meta">
        <span class="q-num">Q${qS.total+1} / ${qS.maxQ}</span>
        <span class="q-topic">${q.t}</span>
        <span class="q-diff ${DC[q.d-1]}">${DL[q.d-1]}</span>
      </div>
      <div class="q-text">${q.q}</div>
      <div class="choices">
        ${q.c.map((c,i) => `
          <button class="choice" id="cb${i}" data-action="quiz-answer" data-choice="${i}">
            <span class="choice-ltr">${L[i]}</span><span>${c}</span>
          </button>`).join('')}
      </div>
      <div class="explanation" id="expl">
        <div class="exp-ref">Ref: ${q.r}</div>${q.e}
      </div>
    </div>
    <div class="q-actions">
      <button class="btn btn-bright" id="nbtn" data-action="quiz-next" disabled>Next</button>
      <button class="btn btn-outline" data-action="quiz-end">End Quiz</button>
    </div>`;
}

function pick(idx) {
  if (qS.answered) return;
  qS.answered = true;
  const q  = qS.queue[qS.idx]; qS.idx++; qS.total++;
  const ok = idx === q.a;
  if (ok) { qS.correct++; qS.streak++; if (qS.streak >= 3 && qS.diff < 5) { qS.diff++; qS.streak = 0; } }
  else    { qS.wrong++;  qS.streak = 0; if (qS.diff > 1) qS.diff--; }
  for (let i = 0; i < q.c.length; i++) {
    const b = document.getElementById('cb'+i);
    b.disabled = true;
    if (i === q.a)             b.classList.add(ok && i === idx ? 'correct' : 'revealed');
    else if (i === idx && !ok) b.classList.add('wrong');
  }
  document.getElementById('expl').classList.add('show');
  document.getElementById('nbtn').disabled = false;
  updateStats(); updateProg();
}

function nextQ() { nextQuestion(); }

function updateStats() {
  document.getElementById('s-done').textContent = qS.total;
  document.getElementById('s-left').textContent = qS.maxQ - qS.total;
  document.getElementById('s-cor').textContent  = qS.correct;
  document.getElementById('s-wrg').textContent  = qS.wrong;
  document.getElementById('s-pct').textContent  = qS.total > 0 ? Math.round(qS.correct/qS.total*100)+'%' : '--';
}

function updateDiff() {
  const cols = ['var(--glow)','#f4c842','var(--amber)','var(--red)','var(--signal)'];
  const labs  = ['Easy','Medium','Hard','Expert','Ace'];
  for (let i = 1; i <= 5; i++) {
    const dot = document.getElementById('d'+i);
    if (dot) dot.style.background = i <= qS.diff ? cols[qS.diff-1] : 'var(--lift)';
  }
  const dt = document.getElementById('dtxt');
  if (dt) { dt.textContent = labs[qS.diff-1]; dt.style.color = cols[qS.diff-1]; }
}

function updateProg() {
  const pct = qS.maxQ > 0 ? (qS.total / qS.maxQ) * 100 : 0;
  const el  = document.getElementById('pbf');
  if (el) el.style.width = Math.min(100, pct) + '%';
}

function showComplete() {
  const pct   = qS.total > 0 ? Math.round(qS.correct/qS.total*100) : 0;
  const grade = pct >= 90 ? 'Checkride Ready' : pct >= 80 ? 'Strong Performance' : pct >= 70 ? 'Keep Reviewing' : 'Focus on Weak Areas';
  const col   = pct >= 90 ? 'var(--glow)' : pct >= 80 ? 'var(--bright)' : pct >= 70 ? 'var(--amber)' : 'var(--red)';
  document.getElementById('qcon').innerHTML = `
    <div class="result-card">
      <div class="result-score" style="color:${col}">${pct}%</div>
      <div class="result-grade" style="color:${col}">${grade}</div>
      <div class="result-stats">
        <div class="stat-box"><div class="stat-val" style="color:var(--glow)">${qS.correct}</div><div class="stat-lbl">Correct</div></div>
        <div class="stat-box"><div class="stat-val" style="color:var(--red)">${qS.wrong}</div><div class="stat-lbl">Wrong</div></div>
        <div class="stat-box"><div class="stat-val" style="color:var(--cloud)">${qS.total}</div><div class="stat-lbl">Total</div></div>
      </div>
      <p class="result-msg">Quiz complete. Adjust settings and go again.</p>
      <button class="btn btn-bright" data-action="quiz-end">Back to Setup</button>
    </div>`;
}


// ── Init + event delegation ──


export async function initQuiz() {
  const topics = await loadAllQuizTopics('ppl');
  // Flatten to BANK using the v10-style field names so the rest of the
  // engine (startQuiz, renderQ, etc.) doesn't need rewriting.
  BANK = topics.flatMap(({ data }) => data.questions.map(q => ({
    t: data.title,
    d: q.difficulty,
    q: q.q,
    c: q.choices,
    a: q.answer,
    e: q.explanation,
    r: q.ref || '',
    taskIds: q.taskIds,
  })));
  buildTopicGrid();
  updatePreview();
  const quizPage = document.querySelector('.quiz-page');
  if (quizPage) quizPage.addEventListener('click', handleClick);
}

function handleClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'topic-toggle') { toggleTopic(target.dataset.topic); }
  else if (action === 'quiz-topics-all') { selAll(); }
  else if (action === 'quiz-topics-clear') { clrAll(); }
  else if (action === 'quiz-length') { setLen(parseInt(target.dataset.length, 10), target); }
  else if (action === 'quiz-start') { startQuiz(); }
  else if (action === 'quiz-answer') { pick(parseInt(target.dataset.choice, 10)); }
  else if (action === 'quiz-next') { nextQ(); }
  else if (action === 'quiz-end') { endQuiz(); }
}

// Called by mode-switch when entering quiz mode
export function onEnterQuiz() { updatePreview(); }
