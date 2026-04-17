import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/quiz.css';

import { initSidebar, showAreaPage } from './views/sidebar.js';

initSidebar();
// Activate the first area on load (matches v10 default)
showAreaPage('pg-a1');
