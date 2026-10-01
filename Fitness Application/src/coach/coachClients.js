// ==========================================================================
// COACH CLIENTS MODULE
// Beheert cliëntenlijst, custom dropdowns en cliëntselectie voor coaches (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getUsers } from '../core/storage.js';

/**
 * Haalt alle sporters op die gekoppeld zijn aan de momenteel ingelogde coach.
 */
export function getLoadedClients() {
  if (!state.currentUser || state.currentUser.role !== 'coach') return [];

  const users = getUsers();
  return users.filter(u => u.role === 'client' && u.linkedCoachId === state.currentUser.coachId);
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
  if (!state.selectedClientEmail || !clients.some(c => c.email === state.selectedClientEmail)) {
    state.selectedClientEmail = clients[0].email;
  }

  const selectedClient = clients.find(c => c.email === state.selectedClientEmail);
  if (selectedClient) {
    input.value = selectedClient.name;
    hiddenVal.value = selectedClient.email;
  }

  function populateList(filterText = "") {
    menu.innerHTML = "";
    const filtered = clients.filter(c => c.name.toLowerCase().includes(filterText.toLowerCase()));

    if (filtered.length === 0) {
      menu.innerHTML = '<div class="custom-dropdown-item disabled" style="padding: 10px; color: var(--text-muted); font-size: 0.85rem; text-align: center;">Geen sporters gevonden</div>';
      return;
    }

    filtered.forEach(client => {
      const item = document.createElement('div');
      item.className = `custom-dropdown-item ${client.email === state.selectedClientEmail ? 'active' : ''}`;
      item.innerText = client.name;

      item.onclick = (e) => {
        e.stopPropagation();
        state.selectedClientEmail = client.email;
        hiddenVal.value = client.email;
        input.value = client.name;
        menu.style.display = "none";

        const subTabs = document.getElementById('coachClientSubTabsContainer');
        if (subTabs) subTabs.style.display = 'flex';

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
      const activeClient = clients.find(c => c.email === state.selectedClientEmail);
      if (activeClient) {
        input.value = activeClient.name;
      }
    }
  });

  const subTabs = document.getElementById('coachClientSubTabsContainer');
  if (subTabs) subTabs.style.display = 'flex';

  if (typeof onSelectCallback === 'function' && state.selectedClientEmail) {
    onSelectCallback(state.selectedClientEmail);
  }
}

/**
 * Rendert de lijst van gekoppelde sporters binnen het profiel-modal van de coach.
 */
export function renderCoachModalClientsList() {
  const container = document.getElementById('modalCoachClientsList');
  if (!container) return;

  const clients = getLoadedClients();

  if (clients.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; margin:0;">Nog geen sporters gekoppeld aan jouw Coach-ID.</p>';
    return;
  }

  container.innerHTML = '';
  clients.forEach(c => {
    const item = document.createElement('div');
    item.className = 'card-glass';
    item.style.cssText = 'padding: 8px 12px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px;';
    item.innerHTML = `
      <div>
        <strong style="color:var(--white); font-size:0.88rem; display:block;">${c.name}</strong>
        <span style="font-size:0.75rem; color:var(--text-muted);">${c.email}</span>
      </div>
    `;
    container.appendChild(item);
  });
}