// Hash router. Routes:
//   #/              → default (area I)
//   #/area/I        → area I
//   #/area/I/task/C → area I, scroll to task C
//   #/ref           → reference page
//   #/quiz          → quiz mode
//
// Clicks call navigate() which updates location.hash; the hashchange
// listener parses and dispatches to handlers registered by main.js.

let handlers = {};

export function initRouter(h) {
  handlers = h;
  window.addEventListener('hashchange', dispatch);
  dispatch();
}

export function navigate(path) {
  if (location.hash === path) {
    // Already there — re-dispatch so scroll/highlight re-runs
    dispatch();
    return;
  }
  location.hash = path;
}

export function parseHash() {
  const raw = location.hash.slice(1); // strip leading '#'
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] === 'quiz') return { kind: 'quiz' };
  if (parts[0] === 'ref') return { kind: 'ref' };
  if (parts[0] === 'area' && parts[1]) {
    return {
      kind: 'area',
      areaId: parts[1],
      taskLetter: (parts[2] === 'task' && parts[3]) ? parts[3] : null,
    };
  }
  return { kind: 'default' };
}

function dispatch() {
  const route = parseHash();
  if (route.kind === 'quiz') {
    handlers.onQuiz?.();
  } else if (route.kind === 'ref') {
    handlers.onRef?.();
  } else if (route.kind === 'area') {
    handlers.onArea?.(route.areaId, route.taskLetter);
  } else {
    handlers.onArea?.('I', null);
  }
}
