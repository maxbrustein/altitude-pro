import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/quiz.css';

import { initSidebar, showAreaPage } from './views/sidebar.js';
import { initModeSwitch } from './views/mode-switch.js';

initSidebar();
initModeSwitch();
showAreaPage('pg-a1');
