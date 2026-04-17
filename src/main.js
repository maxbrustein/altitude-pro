import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/quiz.css';

import { loadManifest } from './content.js';
import { initSidebar, showAreaPage } from './views/sidebar.js';
import { initModeSwitch } from './views/mode-switch.js';
import { initMobileNav, reactivateCurrentSection } from './views/mobile-nav.js';
import { initQuiz, onEnterQuiz } from './views/quiz.js';

async function boot() {
  const manifest = await loadManifest('ppl');

  initSidebar(manifest);
  initMobileNav(manifest);
  initQuiz();
  initModeSwitch({
    onMobileShowArea: reactivateCurrentSection,
    onEnterQuiz,
  });

  if (window.innerWidth >= 768) {
    showAreaPage('pg-a1');
  }
}

boot();
