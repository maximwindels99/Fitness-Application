// ==========================================================================
// CLIENT SESSIONS MODULE
// Beheert ingeplande PT-sessies voor de ingelogde sporter (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getSessions } from '../core/storage.js';
import { formatDateShortYY } from '../core/utils.js';

/**
 * Rendert de ingeplande sessies voor de ingelogde sporter.
 */
export function renderClientSessions() {
  const container = document.getElementById('clientSessionsList');
  if (!container || !state.currentUser) return;

  const sessions = getSessions();
  const mySessions = sessions.filter(s => s.clientEmail === state.currentUser.email);

  if (mySessions.length === 0) {
    container.innerHTML = `
      <div class="card empty-state-card">
        <div class="empty-state-icon">
          <i class="fa-regular fa-calendar-xmark"></i>
        </div>
        <h4 style="margin: 0 0 6px 0; color: var(--white); font-size: 1.1rem; font-weight: 700;">Geen Ingeplande Sessies</h4>
        <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0; max-width: 280px; line-height: 1.4;">
          Je hebt momenteel geen ingeplande afspraken met je coach.
        </p>
      </div>
    `;
    return;
  }

  mySessions.sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

  container.innerHTML = '';
  mySessions.forEach(s => {
    const item = document.createElement('div');
    item.className = 'session-card-item card';

    item.innerHTML = `
      <div style="width: 100%;">
        <strong style="color:var(--white); font-size: 1.05rem; display: block; margin-bottom: 4px;">${s.type}</strong>
        <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: var(--text-muted);">
          <i class="fa-solid fa-user-gear" style="font-size: 0.78rem;"></i> Coach: ${s.coachName || 'Je Coach'}
        </p>
        <div class="session-date-badge-split-row" style="display: flex; gap: 10px; font-size: 0.82rem; color: var(--gold-accent); font-weight: 600;">
          <div><i class="fa-regular fa-calendar"></i> ${formatDateShortYY(s.date)}</div>
          <div><i class="fa-regular fa-clock"></i> ${s.time}</div>
        </div>
      </div>
    `;

    container.appendChild(item);
  });
}