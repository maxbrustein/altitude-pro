import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/quiz.css';

import { initSidebar, showAreaPage } from './views/sidebar.js';
import { initModeSwitch } from './views/mode-switch.js';
import { initMobileNav, reactivateCurrentSection } from './views/mobile-nav.js';

initSidebar();
initMobileNav();
initModeSwitch({
  onMobileShowArea: reactivateCurrentSection,
});

// Start on the first area (desktop-default)
if (window.innerWidth >= 768) {
  showAreaPage('pg-a1');
}
