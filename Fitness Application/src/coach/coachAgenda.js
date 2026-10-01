// ==========================================================================
// COACH AGENDA MODULE
// Inplannen, bewerken, filteren en historie-beheer van PT-sessies (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getSessions, saveSessions, getUsers } from '../core/storage.js';
import { updateCoachFabVisibility } from './coachNav.js';
import { getLoadedClients } from './coachClients.js';

/**
 * Zet een YYYY-MM-DD string om naar DD/MM/YY
 */
function formatDateShortYY(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const yy = parts[0].slice(-2);
    return `${parts[2]}/${parts[1]}/${yy}`;
  }
  return dateStr;
}

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
 * Vult de sporterdropdown IN het formulier voor het inplannen van een sessie.
 */
export function populateSessionClientSelect(selectedEmail = "") {
  const selectEl = document.getElementById('sessionClientSelect');
  if (!selectEl) return;

  selectEl.innerHTML = '<option value="" disabled selected>-- Kies een sporter --</option>';

  const clients = getLoadedClients();
  clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.email;
    opt.textContent = c.name;
    selectEl.appendChild(opt);
  });

  if (selectedEmail) {
    selectEl.value = selectedEmail;
  }
}

/**
 * Schakelt het formulier voor het inplannen of bewerken van een sessie.
 */
export function toggleCoachSessionForm() {
  const card = document.getElementById('coachSessionFormCard');
  const listCard = document.getElementById('coachAgendaListContainer');
  if (!card) return;

  const isVisible = getComputedStyle(card).display !== 'none';

  if (isVisible) {
    // FORMULIER SLUITEN & AGENDALIJST TONEN
    card.style.display = 'none';
    if (listCard) listCard.style.display = 'block';
  } else {
    // FORMULIER OPENEN & AGENDALIJST VERBERGEN
    card.style.display = 'block';
    if (listCard) listCard.style.display = 'none';

    populateSessionClientSelect();
    document.getElementById('editingSessionId').value = "";
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
    showCustomAlert("Invoer Onvolledig", "Vul a.u.b. alle velden van de sessie in.");
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
  
  toggleCoachSessionForm();
  renderCoachSessions();
}

/**
 * Laadt een bestaande sessie in het bewerkformulier.
 */
export function editCoachSession(id) {
  const session = getSessions().find(s => s.id === id);
  if (!session) return;

  populateSessionClientSelect(session.clientEmail);

  document.getElementById('editingSessionId').value = session.id;
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
      btn.style.background = 'rgba(255, 159, 10, 0.2)';
      btn.style.borderColor = 'var(--gold-accent)';
      btn.title = 'Verberg geschiedenis (Toon enkel toekomst)';
    } else {
      btn.innerHTML = '<i class="fa-regular fa-clock" style="font-size: 1.1rem; color: var(--text-muted);"></i>';
      btn.style.background = 'var(--bg-input)';
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

  populateAgendaFilterClients();

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
    item.className = 'card card-glass';
    item.style.cssText = 'margin-bottom: 12px; position: relative; overflow: hidden; padding: 14px 16px;';

    item.innerHTML = `
      <h3 style="margin: 0 0 6px 0; color: var(--white); font-size: 1.08rem; font-weight: 700; word-break: break-word;">${s.type}</h3>
      <p style="margin: 0 0 10px 0; font-size: 0.88rem; color: var(--text-muted); font-weight: 500;">
        ${s.clientName}
      </p>

      <div class="card-action-bar" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div style="flex-shrink: 0; font-size: 0.92rem; font-weight: 700; color: var(--gold-accent); white-space: nowrap;">
          ${formatDateShortYY(s.date)} &nbsp; ${s.time}
        </div>

        <div style="display: flex; align-items: center; margin-left: auto;">
          <div class="sliding-actions-drawer">
            <button type="button" class="btn-action-icon secondary btn-edit-sess" title="Bewerken"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="btn-action-icon btn-delete-tmpl-subtle btn-delete-sess" title="Verwijderen"><i class="fa-solid fa-minus"></i></button>
          </div>

          <button type="button" class="btn-action-icon secondary btn-actions-toggle" title="Opties" style="margin-left: 8px;">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>
    `;

    const toggleBtn = item.querySelector('.btn-actions-toggle');
    const drawer = item.querySelector('.sliding-actions-drawer');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.contains('open');
      
      document.querySelectorAll('.sliding-actions-drawer.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.btn-actions-toggle.active').forEach(b => b.classList.remove('active'));

      if (!isOpen) {
        drawer.classList.add('open');
        toggleBtn.classList.add('active');
      }
    });

    item.querySelector('.btn-edit-sess').addEventListener('click', (e) => {
      e.stopPropagation();
      editCoachSession(s.id);
    });

    item.querySelector('.btn-delete-sess').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCoachSession(s.id);
    });

    list.appendChild(item);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.card-action-bar')) {
      document.querySelectorAll('.sliding-actions-drawer.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.btn-actions-toggle.active').forEach(b => b.classList.remove('active'));
    }
  });
}

/**
 * Verwijdert een sessie uit de agenda via de Custom Confirm Modal.
 */
export function deleteCoachSession(id) {
  showCustomConfirm("Sessie Verwijderen", "Weet je zeker dat je deze geplande sessie wilt verwijderen?", () => {
    let sessions = getSessions().filter(s => s.id !== id);
    saveSessions(sessions);
    renderCoachSessions();
  });
}

function showCustomAlert(title, text) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!modal) {
    alert(`${title}: ${text}`);
    return;
  }

  if (titleEl) titleEl.innerText = title;
  if (textEl) textEl.innerText = text;
  if (cancelBtn) cancelBtn.style.display = 'none';

  modal.style.display = 'flex';

  okBtn.onclick = () => {
    modal.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
  };
}

function showCustomConfirm(title, text, onConfirm) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!modal) {
    if (confirm(text)) onConfirm();
    return;
  }

  if (titleEl) titleEl.innerText = title;
  if (textEl) textEl.innerText = text;
  if (cancelBtn) cancelBtn.style.display = 'inline-block';

  modal.style.display = 'flex';

  cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };

  okBtn.onclick = () => {
    modal.style.display = 'none';
    if (typeof onConfirm === 'function') onConfirm();
  };
}

// INITIËLE KOPPELING VAN EVENTS VIA JAVASCRIPT ZONDER INLINE HTML EVENTS
function initCoachAgendaListeners() {
  const topBtn = document.getElementById('topCreateSessionBtn');
  if (topBtn) {
    topBtn.addEventListener('click', toggleCoachSessionForm);
  }

  const cancelBtn = document.getElementById('cancelSessionBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', toggleCoachSessionForm);
  }

  const saveBtn = document.getElementById('saveSessionBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveCoachSession);
  }

  const historyBtn = document.getElementById('btnToggleAgendaHistory');
  if (historyBtn) {
    historyBtn.addEventListener('click', toggleAgendaHistoryMode);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCoachAgendaListeners);
} else {
  initCoachAgendaListeners();
}

// Global window bindings voor achterwaartse compatibiliteit
window.toggleCoachSessionForm = toggleCoachSessionForm;
window.saveCoachSession = saveCoachSession;
window.toggleAgendaHistoryMode = toggleAgendaHistoryMode;

export const deleteSession = deleteCoachSession;