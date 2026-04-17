import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/quiz.css';

const app = document.getElementById('app');
app.innerHTML = `
  <div style="padding:24px;color:var(--glow);font-family:Outfit,sans-serif;">
    <h1>Altitude Pro — CSS split complete</h1>
    <p>5 stylesheets loaded. Next: port v10 body HTML (Phase 2).</p>
  </div>
`;
