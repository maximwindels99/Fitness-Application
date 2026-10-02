// ==========================================================================
// COACH CLIENTS MODULE
// Beheert cliëntenlijst, custom dropdowns en cliëntselectie voor coaches (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getUsers, saveUsers } from '../core/storage.js';
import { renderCoachClientHistory, updateCoachProgressChart } from './coachProgress.js';
import { renderCoachClientTemplates } from './coachTemplates.js';

/**
 * Haalt alle sporters op die gekoppeld zijn aan de momenteel ingelogde coach.
 */
export function getLoadedClients() {
  if (!state.currentUser || state.currentUser.role !== 'coach') return [];

  const users = getUsers();
  const coachId = (state.currentUser.coachId || '').toUpperCase();
  const coachEmail = (state.currentUser.email || '').toLowerCase();

  return users.filter(u => {
    if (u.role !== 'client') return false;
    const clientCoachId = (u.linkedCoachId || u.linkedCoachCode || '').toUpperCase();
    const clientCoachEmail = (u.linkedCoachEmail || '').toLowerCase();

    return (coachId && clientCoachId === coachId) || (coachEmail && clientCoachEmail === coachEmail);
  });
}

/**
 * Ververst alle actieve subviews voor de momenteel geselecteerde sporter.
 */
export function refreshSelectedClientViews() {
  renderCoachClientHistory();
  updateCoachProgressChart();
  renderCoachClientTemplates();
}

/**
 * Bouwt en initialiseert de doorzoekbare zwevende cliënt-dropdown voor de coach.
 * @param {Function} onSelectCallback - Callback die wordt aangeroepen wanneer een sporter geselecteerd wordt
 */
export function renderCoachClientDropdown(onSelectCallback) {
  const input = document.getElementById('coachClientSearchInput');
  const hiddenVal = document.getElementById('coachClientSelect');
  const menu = document.getElementById('customClientDropdownList');

  if (!input || !hiddenVal || !menu) return;

  const clients = getLoadedClients();

  if (clients.length === 0) {
    input.value = "Geen sporters gekoppeld";
    input.disabled = true;
    hiddenVal.value = "";
    menu.style.display = "none";
    const subTabs = document.getElementById('coachClientSubTabsContainer');
    if (subTabs) subTabs.style.display = 'none';
    return;
  }

  input.disabled = false;

  // Selecteer automatisch de eerste sporter als er nog geen geselecteerd is
  if (!state.selectedClientEmail || !clients.some(c => c.email.toLowerCase() === state.selectedClientEmail.toLowerCase())) {
    state.selectedClientEmail = clients[0].email;
  }

  const selectedClient = clients.find(c => c.email.toLowerCase() === state.selectedClientEmail.toLowerCase());
  if (selectedClient) {
    input.value = selectedClient.firstName && selectedClient.lastName 
      ? `${selectedClient.firstName} ${selectedClient.lastName}` 
      : (selectedClient.name || selectedClient.email);
    hiddenVal.value = selectedClient.email;
  }

  function populateList(filterText = "") {
    menu.innerHTML = "";
    const filtered = clients.filter(c => {
      const name = (c.name || `${c.firstName || ''} ${c.lastName || ''}`).toLowerCase();
      return name.includes(filterText.toLowerCase()) || c.email.toLowerCase().includes(filterText.toLowerCase());
    });

    if (filtered.length === 0) {
      menu.innerHTML = '<div class="custom-dropdown-item disabled" style="padding: 10px; color: var(--text-muted); font-size: 0.85rem; text-align: center;">Geen sporters gevonden</div>';
      return;
    }

    filtered.forEach(client => {
      const displayName = client.firstName && client.lastName 
        ? `${client.firstName} ${client.lastName}` 
        : (client.name || client.email);

      const item = document.createElement('div');
      item.className = `custom-dropdown-item ${client.email.toLowerCase() === state.selectedClientEmail.toLowerCase() ? 'active' : ''}`;
      item.innerText = displayName;

      item.onclick = (e) => {
        e.stopPropagation();
        state.selectedClientEmail = client.email;
        hiddenVal.value = client.email;
        input.value = displayName;
        menu.style.display = "none";

        const subTabs = document.getElementById('coachClientSubTabsContainer');
        if (subTabs) subTabs.style.display = 'flex';

        // Ververs direct de historie, progressie en schema's
        refreshSelectedClientViews();

        if (typeof onSelectCallback === 'function') {
          onSelectCallback(client.email);
        }
      };

      menu.appendChild(item);
    });
  }

  // Bij focus/klik: leeg het invoerveld tijdelijk om vanaf 0 te kunnen typen
  input.onfocus = (e) => {
    e.stopPropagation();
    input.value = "";
    populateList("");
    menu.style.display = "block";
  };

  input.onclick = (e) => {
    e.stopPropagation();
    if (menu.style.display !== "block") {
      input.value = "";
      populateList("");
      menu.style.display = "block";
    }
  };

  input.oninput = () => {
    populateList(input.value);
    menu.style.display = "block";
  };

  // Als de gebruiker buiten klikt zonder een nieuwe te kiezen, herstel de naam van de actieve sporter
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = "none";
      const activeClient = clients.find(c => c.email.toLowerCase() === state.selectedClientEmail.toLowerCase());
      if (activeClient) {
        input.value = activeClient.firstName && activeClient.lastName 
          ? `${activeClient.firstName} ${activeClient.lastName}` 
          : (activeClient.name || activeClient.email);
      }
    }
  });

  const subTabs = document.getElementById('coachClientSubTabsContainer');
  if (subTabs) subTabs.style.display = 'flex';

  // Ververs data van de geselecteerde sporter bij initialisatie
  refreshSelectedClientViews();

  if (typeof onSelectCallback === 'function' && state.selectedClientEmail) {
    onSelectCallback(state.selectedClientEmail);
  }
}

/**
 * Rendert de lijst van gekoppelde sporters binnen het profiel-modal van de coach.
 */
export function renderCoachModalClientsList() {
  const container = document.getElementById('linkedClientsModalList') || document.getElementById('modalCoachClientsList');
  if (!container) return;

  const clients = getLoadedClients();

  if (clients.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px 10px; color: var(--text-muted); font-size: 0.88rem;">
        Je hebt op dit moment nog geen gekoppelde sporters.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  clients.forEach(c => {
    const item = document.createElement('div');
    item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: 12px; margin-bottom: 8px;';

    const displayName = c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : (c.name || 'Sporter');

    item.innerHTML = `
      <div style="display: flex; flex-direction: column; text-align: left;">
        <strong style="color: #ffffff; font-size: 0.92rem; font-weight: 700;">${displayName}</strong>
        <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 400; margin-top: 2px;">${c.email}</span>
      </div>
      <button type="button" class="btn-unlink-client-item" style="background: transparent; border: 1px solid rgba(255, 69, 58, 0.6); color: var(--danger); font-size: 0.78rem; font-weight: 600; padding: 5px 12px; border-radius: var(--pill-radius); cursor: pointer; transition: var(--transition);">
        Ontkoppel
      </button>
    `;

    item.querySelector('.btn-unlink-client-item').onclick = () => {
      confirmUnlinkClient(c);
    };

    container.appendChild(item);
  });
}

/**
 * Vraagt bevestiging via de Custom Confirm Modal om een sporter te ontkoppelen.
 */
function confirmUnlinkClient(client) {
  const confirmModal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!confirmModal) return;

  const displayName = client.firstName && client.lastName ? `${client.firstName} ${client.lastName}` : (client.name || client.email);

  if (titleEl) titleEl.innerText = "Sporter Ontkoppelen";
  if (textEl) textEl.innerText = `Weet je zeker dat je de koppeling met ${displayName} wilt opheffen?`;
  if (cancelBtn) cancelBtn.style.display = 'inline-block';

  confirmModal.style.display = 'flex';

  cancelBtn.onclick = () => {
    confirmModal.style.display = 'none';
  };

  okBtn.onclick = () => {
    let users = getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === client.email.toLowerCase());
    
    if (idx !== -1) {
      delete users[idx].linkedCoachId;
      delete users[idx].linkedCoachCode;
      delete users[idx].linkedCoachEmail;
      saveUsers(users);

      confirmModal.style.display = 'none';
      renderCoachModalClientsList();
      renderCoachClientDropdown();
    }
  };
}