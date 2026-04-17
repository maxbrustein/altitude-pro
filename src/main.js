import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/quiz.css';

import { loadManifest } from './content.js';
import { mountAllTasks } from './views/task.js';
import {
  initSidebar, showAreaPage, showRefPage, scrollToTask, setCurrentTaskElId,
  initSidebarScrollSpy
} from './views/sidebar.js';
import {
  initModeSwitch, switchMode, getMode
} from './views/mode-switch.js';
import {
  initMobileNav, activateSection, reactivateCurrentSection
} from './views/mobile-nav.js';
import { initQuiz, onEnterQuiz } from './views/quiz.js';
import { initRouter } from './router.js';
import { areaDomId, taskDomId } from './views/dom-ids.js';
import { state } from './state.js';

async function boot() {
  const manifest = await loadManifest('ppl');

  await mountAllTasks(manifest);

  initSidebar(manifest);
  initSidebarScrollSpy();
  initMobileNav(manifest);
  initQuiz();
  initModeSwitch(manifest, {
    onMobileShowArea: reactivateCurrentSection,
    onEnterQuiz,
  });

  initRouter({
    onArea: (manifestAreaId, taskLetter) => {
      if (getMode() === 'quiz') switchMode('study');
      const areaPgId = areaDomId(manifestAreaId);
      if (!areaPgId) return;

      // Update current-task highlighting in the sidebar
      setCurrentTaskElId(taskLetter ? taskDomId(`${manifestAreaId}-${taskLetter}`) : null);

      // Show the area (desktop) and mobile section state
      showAreaPage(areaPgId);
      activateSection(manifestAreaId, taskLetter);

      if (taskLetter) {
        const manifestTaskId = `${manifestAreaId}-${taskLetter}`;
        state.tasks.markViewed(manifestTaskId);
        setTimeout(() => scrollToTask(taskDomId(manifestTaskId)), 100);
      }
    },
    onRef: () => {
      if (getMode() === 'quiz') switchMode('study');
      showRefPage();
    },
    onQuiz: () => {
      switchMode('quiz');
    },
  });
}

boot();
