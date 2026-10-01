// ==========================================================================
// COACH AGENDA MODULE
// Inplannen, bewerken, filteren en historie-beheer van PT-sessies (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getSessions, saveSessions, getUsers } from '../core/storage.js';
import { formatDateShortYY } from '../core/utils.js';
import { updateCoachFabVisibility } from './coachNav.js';
import { getLoadedClients } from './coachClients.js';

/**
 * Vult de sporterfilter in de coach agenda.
 */
export function populateAgendaFilterClients() {
  const filterSelect = document.getElementById('agendaFilterClientSelect');
  if (!filterSelect) return;

  const currentVal = filterSelect.value;
  filterSelect.innerHTML = '<option value="">Alle Sporters</option>';

  const clients = getLoadedClients();
  clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.email;
    opt.textContent = c.name;
    filterSelect.appendChild(opt);
  });

  filterSelect.value = currentVal;
}

/**
 * Schakelt het formulier voor het inplannen of bewerken van een sessie.
 */
export function toggleCoachSessionForm() {
  const card = document.getElementById('coachSessionFormCard');
  const listCard = document.getElementById('coachAgendaListContainer');
  if (!card) return;

  const isHidden = card.style.display === 'none';
  card.style.display = isHidden ? 'block' : 'none';
  if (listCard) listCard.style.display = isHidden ? 'none' : 'block';

  if (isHidden) {
    document.getElementById('editingSessionId').value = "";
    document.getElementById('sessionClientSelect').value = "";
    document.getElementById('sessionDate').value = "";
    document.getElementById('sessionTime').value = "";
    document.getElementById('sessionType').value = "";
    card.scrollIntoView({ behavior: 'smooth' });
  }

  updateCoachFabVisibility();
}

/**
 * Slaat een nieuwe of bewerkte sessie op.
 */
export function saveCoachSession() {
  const editingId = document.getElementById('editingSessionId')?.value;
  const clientEmail = document.getElementById('sessionClientSelect')?.value;
  const date = document.getElementById('sessionDate')?.value;
  const time = document.getElementById('sessionTime')?.value;
  const type = document.getElementById('sessionType')?.value.trim();

  if (!clientEmail || !date || !time || !type) {
    alert("Vul a.u.b. alle velden van de sessie in.");
    return;
  }

  const users = getUsers();
  const clientObj = users.find(u => u.email === clientEmail);
  let sessions = getSessions();

  if (editingId) {
    const index = sessions.findIndex(s => s.id == editingId);
    if (index !== -1) {
      sessions[index].clientEmail = clientEmail;
      sessions[index].clientName = clientObj ? clientObj.name : clientEmail;
      sessions[index].date = date;
      sessions[index].time = time;
      sessions[index].type = type;
    }
  } else {
    sessions.push({
      id: Date.now(),
      coachEmail: state.currentUser.email,
      coachName: state.currentUser.name,
      clientEmail,
      clientName: clientObj ? clientObj.name : clientEmail,
      date,
      time,
      type
    });
  }

  saveSessions(sessions);
  alert("Sessie succesvol opgeslagen!");
  
  toggleCoachSessionForm();
  renderCoachSessions();
}

/**
 * Laadt een bestaande sessie in het bewerkformulier.
 */
export function editCoachSession(id) {
  const session = getSessions().find(s => s.id === id);
  if (!session) return;

  document.getElementById('editingSessionId').value = session.id;
  document.getElementById('sessionClientSelect').value = session.clientEmail;
  document.getElementById('sessionDate').value = session.date;
  document.getElementById('sessionTime').value = session.time;
  document.getElementById('sessionType').value = session.type;

  document.getElementById('coachSessionFormCard').style.display = 'block';
  document.getElementById('coachAgendaListContainer').style.display = 'none';

  updateCoachFabVisibility();
  document.getElementById('coachSessionFormCard').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Schakelt tussen enkel toekomstige sessies tonen of inclusief geschiedenis.
 */
export function toggleAgendaHistoryMode() {
  state.showAgendaHistory = !state.showAgendaHistory;
  
  const btn = document.getElementById('btnToggleAgendaHistory');
  if (btn) {
    if (state.showAgendaHistory) {
      btn.innerHTML = '<i class="fa-solid fa-clock" style="font-size: 1.1rem; color: var(--gold-accent);"></i>';
      btn.style.background = 'rgba(252, 163, 17, 0.2)';
      btn.style.borderColor = 'var(--gold-accent)';
      btn.title = 'Verberg geschiedenis (Toon enkel toekomst)';
    } else {
      btn.innerHTML = '<i class="fa-regular fa-clock" style="font-size: 1.1rem; color: var(--text-muted);"></i>';
      btn.style.background = 'var(--input-bg)';
      btn.style.borderColor = 'var(--glass-border)';
      btn.title = 'Toon geschiedenis';
    }
  }

  renderCoachSessions();
}

/**
 * Rendert de geplande sessies op het coach dashboard op basis van actieve filters.
 */
export function renderCoachSessions() {
  const list = document.getElementById('coachSessionsList');
  if (!list) return;

  let sessions = getSessions();
  let mySessions = sessions.filter(s => s.coachEmail === state.currentUser?.email);

  const clientFilter = document.getElementById('agendaFilterClientSelect')?.value;
  const dateFilter = document.getElementById('agendaFilterDate')?.value;

  if (clientFilter) mySessions = mySessions.filter(s => s.clientEmail === clientFilter);
  if (dateFilter) mySessions = mySessions.filter(s => s.date === dateFilter);

  const todayStr = new Date().toISOString().split('T')[0];
  if (!state.showAgendaHistory && !dateFilter) {
    mySessions = mySessions.filter(s => s.date >= todayStr);
  }

  updateCoachFabVisibility();

  if (mySessions.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding: 20px 0;">Geen geplande sessies gevonden.</p>';
    return;
  }

  mySessions.sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

  list.innerHTML = '';
  mySessions.forEach(s => {
    const item = document.createElement('div');
    item.className = 'session-card-item card-glass';

    item.innerHTML = `
      <div style="width: 100%;">
        <strong style="color:var(--white); font-size: 1.05rem; display: block; margin-bottom: 2px; word-break: break-word;">${s.type}</strong>
        <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: var(--text-muted);">
          <i class="fa-solid fa-user" style="font-size: 0.78rem;"></i> ${s.clientName}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
          <div class="session-date-badge-split-row" style="flex-wrap: wrap; gap: 6px;">
            <div><i class="fa-regular fa-calendar"></i> ${formatDateShortYY(s.date)}</div>
            <div><i class="fa-regular fa-clock"></i> ${s.time}</div>
          </div>
          <div style="display: flex; gap: 6px; flex-shrink: 0; margin-left: auto;">
            <button type="button" class="btn-action-icon secondary btn-edit-sess" title="Bewerken" style="width: 32px !important; height: 32px !important;"><i class="fa-solid fa-pen" style="font-size: 0.8rem;"></i></button>
            <button type="button" class="btn-action-icon danger btn-delete-sess" title="Verwijderen" style="width: 32px !important; height: 32px !important;"><i class="fa-solid fa-minus" style="font-size: 0.8rem;"></i></button>
          </div>
        </div>
      </div>
    `;

    item.querySelector('.btn-edit-sess').addEventListener('click', () => editCoachSession(s.id));
    item.querySelector('.btn-delete-sess').addEventListener('click', () => deleteCoachSession(s.id));

    list.appendChild(item);
  });
}

/**
 * Verwijdert een sessie uit de agenda.
 */
export function deleteCoachSession(id) {
  if (confirm("Weet je zeker dat je deze geplande sessie wilt verwijderen?")) {
    let sessions = getSessions().filter(s => s.id !== id);
    saveSessions(sessions);
    renderCoachSessions();
  }
}

// Alias export voor achterwaartse compatibiliteit
export const deleteSession = deleteCoachSession;