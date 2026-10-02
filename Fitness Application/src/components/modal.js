// ==========================================================================
// COMPONENT: MODAL MODULE
// Beheert algemene modal-interacties, profielinstellingen & coachkoppelingen
// ==========================================================================

import { state } from '../core/state.js';
import { getUsers, saveUsers } from '../core/storage.js';

/**
 * Sluit een specifieke modal op basis van element ID.
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Opent een specifieke modal op basis van element ID.
 */
export function openModal(modalId, displayStyle = 'flex') {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = displayStyle;
  }
}

/**
 * Initialiseert globale event listeners om modals te sluiten bij het klikken op de overlay.
 */
export function initModalBackdropListeners() {
  window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-overlay') || event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  });
}

/**
 * Initialiseert event listeners voor de profielmodal en de gekoppelde sporters modal.
 */
export function initProfileModal() {
  initModalBackdropListeners();

  const profileTrigger = document.getElementById('profileModalTrigger');
  const closeProfileBtn = document.getElementById('closeProfileModalBtn');
  const closeLinkedBtn = document.getElementById('closeLinkedClientsModalBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const btnLinkCoach = document.getElementById('btnLinkCoachCode');
  const btnUnlinkCoach = document.getElementById('btnUnlinkCoach');

  if (profileTrigger) profileTrigger.addEventListener('click', openProfileModal);
  if (closeProfileBtn) closeProfileBtn.addEventListener('click', () => closeModal('profileModal'));
  if (closeLinkedBtn) closeLinkedBtn.addEventListener('click', () => closeModal('linkedClientsModal'));
  if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfileChanges);
  if (btnLinkCoach) btnLinkCoach.addEventListener('click', linkCoachToClient);
  if (btnUnlinkCoach) btnUnlinkCoach.addEventListener('click', unlinkCoachFromClient);

  // Event delegation voor $100% betrouwbare werking van "Gekoppelde Sporters" knop
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#btnOpenLinkedClientsModal');
    if (btn) {
      e.preventDefault();
      renderLinkedClientsListModal();
      openModal('linkedClientsModal', 'flex');
    }
  });
}

/**
 * Vult en opent de profielmodal op basis van de ingelogde gebruiker.
 */
function openProfileModal() {
  const modal = document.getElementById('profileModal');
  const currentUser = state.currentUser;
  if (!modal || !currentUser) return;

  const allUsers = getUsers();
  const freshUser = allUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase()) || currentUser;
  state.currentUser = freshUser; // Houd actieve state 100% in sync

  const nameEl = document.getElementById('modalUserName');
  const roleBadgeEl = document.getElementById('modalUserRoleBadge');
  const coachSection = document.getElementById('modalCoachSection');
  const clientSection = document.getElementById('modalClientSection');

  if (nameEl) nameEl.innerText = `${freshUser.firstName || ''} ${freshUser.lastName || ''}`.trim() || freshUser.email;
  if (roleBadgeEl) roleBadgeEl.innerText = freshUser.role === 'coach' ? 'Coach' : 'Sporter';

  const inputFirstName = document.getElementById('profFirstName');
  const inputLastName = document.getElementById('profLastName');
  const inputDob = document.getElementById('profDob');
  const inputEmail = document.getElementById('profEmail');

  if (inputFirstName) inputFirstName.value = freshUser.firstName || '';
  if (inputLastName) inputLastName.value = freshUser.lastName || '';
  if (inputDob) inputDob.value = freshUser.dob || '';
  if (inputEmail) inputEmail.value = freshUser.email || '';

  if (freshUser.role === 'coach') {
    if (coachSection) coachSection.style.display = 'block';
    if (clientSection) clientSection.style.display = 'none';

    const coachIdEl = document.getElementById('modalCoachIdDisplay');
    if (coachIdEl) coachIdEl.innerText = freshUser.coachId || 'GEEN-ID';
  } else {
    if (coachSection) coachSection.style.display = 'none';
    if (clientSection) clientSection.style.display = 'block';

    updateClientCoachLinkingUI(freshUser);
  }

  openModal('profileModal', 'flex');
}

/**
 * Rendert de lijst met gekoppelde sporters in de specifieke pop-up voor een coach.
 */
function renderLinkedClientsListModal() {
  const container = document.getElementById('linkedClientsModalList');
  if (!container) return;

  const allUsers = getUsers();
  const currentUser = state.currentUser;
  if (!currentUser) return;

  const freshCoach = allUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase()) || currentUser;
  const targetCoachId = (freshCoach.coachId || '').toUpperCase();
  const targetCoachEmail = (freshCoach.email || '').toLowerCase();

  const linkedClients = allUsers.filter(u => {
    if (u.role !== 'client') return false;
    const clientLinkedId = (u.linkedCoachId || u.linkedCoachCode || '').toUpperCase();
    const clientLinkedEmail = (u.linkedCoachEmail || '').toLowerCase();

    return (targetCoachId && clientLinkedId === targetCoachId) || (targetCoachEmail && clientLinkedEmail === targetCoachEmail);
  });

  if (linkedClients.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 25px 10px; color: var(--text-muted); font-size: 0.88rem;">
        Je hebt op dit moment nog geen gekoppelde sporters.
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  linkedClients.forEach(client => {
    const item = document.createElement('div');
    item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: 12px; margin-bottom: 8px;';

    const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Onbekende Sporter';

    item.innerHTML = `
      <div style="display: flex; flex-direction: column; text-align: left;">
        <span style="color: #ffffff; font-weight: 700; font-size: 0.92rem;">${fullName}</span>
        <span style="color: var(--text-muted); font-size: 0.78rem; font-weight: 400; margin-top: 2px;">${client.email}</span>
      </div>
      <button type="button" class="btn-unlink-client-item" style="background: transparent; border: 1px solid rgba(255, 69, 58, 0.6); color: var(--danger); font-size: 0.78rem; font-weight: 600; padding: 5px 12px; border-radius: var(--pill-radius); cursor: pointer; transition: var(--transition);">
        Ontkoppel
      </button>
    `;

    item.querySelector('.btn-unlink-client-item').addEventListener('click', () => {
      confirmUnlinkClientFromCoach(client);
    });

    container.appendChild(item);
  });
}

/**
 * Vraagt bevestiging via de Custom Confirm Modal om een sporter te ontkoppelen.
 */
function confirmUnlinkClientFromCoach(client) {
  const confirmModal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!confirmModal) return;

  const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email;

  if (titleEl) titleEl.innerText = "Sporter Ontkoppelen";
  if (textEl) textEl.innerText = `Weet je zeker dat je de koppeling met ${clientName} wilt opheffen?`;
  if (cancelBtn) cancelBtn.style.display = 'inline-block';

  openModal('customConfirmModal', 'flex');

  cancelBtn.onclick = () => {
    closeModal('customConfirmModal');
  };

  okBtn.onclick = () => {
    let users = getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === client.email.toLowerCase());
    
    if (idx !== -1) {
      delete users[idx].linkedCoachId;
      delete users[idx].linkedCoachCode;
      delete users[idx].linkedCoachEmail;
      saveUsers(users);

      closeModal('customConfirmModal');
      renderLinkedClientsListModal();
    }
  };
}

/**
 * Update de koppelingsstatus weergave voor een sporter.
 */
function updateClientCoachLinkingUI(currentUser) {
  const unlinkedBox = document.getElementById('clientUnlinkedBox');
  const linkedBox = document.getElementById('clientLinkedBox');
  const coachNameEl = document.getElementById('linkedCoachNameDisplay');
  const coachCodeEl = document.getElementById('linkedCoachCodeDisplay');

  const coachCode = (currentUser.linkedCoachId || currentUser.linkedCoachCode || '').toUpperCase();
  const coachEmail = (currentUser.linkedCoachEmail || '').toLowerCase();

  if (!coachCode && !coachEmail) {
    if (unlinkedBox) unlinkedBox.style.display = 'block';
    if (linkedBox) linkedBox.style.display = 'none';
  } else {
    if (unlinkedBox) unlinkedBox.style.display = 'none';
    if (linkedBox) linkedBox.style.display = 'block';

    const allUsers = getUsers();
    const coach = allUsers.find(u => 
      u.role === 'coach' && 
      (
        (coachCode && (u.coachId || '').toUpperCase() === coachCode) || 
        (coachEmail && (u.email || '').toLowerCase() === coachEmail)
      )
    );

    if (coachNameEl) coachNameEl.innerText = coach ? `${coach.firstName || ''} ${coach.lastName || ''}`.trim() : 'Mijn Coach';
    if (coachCodeEl) coachCodeEl.innerText = coachCode || coachEmail || '';
  }
}

/**
 * Koppelt een sporter aan een coach via Coach-ID.
 */
function linkCoachToClient() {
  const codeInput = document.getElementById('inputCoachCode');
  const code = codeInput?.value.trim().toUpperCase();

  if (!code) return;

  const allUsers = getUsers();
  const coach = allUsers.find(u => u.role === 'coach' && u.coachId && u.coachId.toUpperCase() === code);

  if (!coach) {
    alert("Geen actieve coach gevonden met deze ID.");
    return;
  }

  let users = allUsers;
  const currentUser = state.currentUser;
  const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());

  if (idx !== -1) {
    users[idx].linkedCoachId = coach.coachId;
    users[idx].linkedCoachCode = coach.coachId;
    users[idx].linkedCoachEmail = coach.email;
    saveUsers(users);

    state.currentUser = users[idx];
    if (codeInput) codeInput.value = '';
    updateClientCoachLinkingUI(state.currentUser);
  }
}

/**
 * Ontkoppelt een sporter van zijn coach.
 */
function unlinkCoachFromClient() {
  let users = getUsers();
  const currentUser = state.currentUser;
  const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());

  if (idx !== -1) {
    delete users[idx].linkedCoachId;
    delete users[idx].linkedCoachCode;
    delete users[idx].linkedCoachEmail;
    saveUsers(users);

    state.currentUser = users[idx];
    updateClientCoachLinkingUI(state.currentUser);
  }
}

/**
 * Slaat profielwijzigingen op in localStorage en de actieve state.
 */
function saveProfileChanges() {
  const firstName = document.getElementById('profFirstName')?.value.trim();
  const lastName = document.getElementById('profLastName')?.value.trim();
  const dob = document.getElementById('profDob')?.value;
  const password = document.getElementById('profPassword')?.value;

  let users = getUsers();
  const currentUser = state.currentUser;
  const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());

  if (idx !== -1) {
    users[idx].firstName = firstName;
    users[idx].lastName = lastName;
    users[idx].dob = dob;
    if (password) users[idx].password = password;

    saveUsers(users);
    state.currentUser = users[idx];

    const headerNameEl = document.getElementById('userHeaderFirstName');
    if (headerNameEl) headerNameEl.innerText = firstName || 'Sporter';

    closeModal('profileModal');
  }
}