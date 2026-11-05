// ==========================================================================
// AUTHENTICATIE & PROFIEL MODULE (VOLLEDIG BESTAND)
// Beheert inloggen, registreren, uitloggen en profielbeheer (< 200 regels)
// ==========================================================================

import { state } from './state.js';
import { getUsers, saveUsers, getCurrentUserEmail, setCurrentUserEmail } from './storage.js';
import { renderCoachModalClientsList } from '../coach/coachClients.js';

/**
 * Controleert de sessiestatus bij het opstarten van de app.
 */
export function checkAuthState(callbacks = {}) {
  const users = getUsers();
  const savedEmail = getCurrentUserEmail();

  if (savedEmail) {
    const user = users.find(u => u.email.toLowerCase() === savedEmail.toLowerCase());
    if (user) {
      state.currentUser = user;
      showAppUI();
      updateProfileUI();

      if (user.role === 'coach' && typeof callbacks.onCoachLogin === 'function') {
        callbacks.onCoachLogin();
      } else if (user.role === 'client' && typeof callbacks.onClientLogin === 'function') {
        callbacks.onClientLogin();
      }
      return;
    }
  }

  showAuthModal();
}

/**
 * Initialiseert de authenticatie.
 */
export function initAuth(callbacks = {}) {
  checkAuthState(callbacks);

  const btnUnlink = document.getElementById('btnUnlinkCoach');
  if (btnUnlink) {
    btnUnlink.addEventListener('click', unlinkCoach);
  }

  // Luister naar het sluiten van de gekoppelde sporters modal
  const closeLinkedBtn = document.getElementById('closeLinkedClientsModalBtn');
  if (closeLinkedBtn) {
    closeLinkedBtn.addEventListener('click', () => {
      const linkedClientsModal = document.getElementById('linkedClientsModal');
      if (linkedClientsModal) linkedClientsModal.style.display = 'none';
    });
  }
}

/**
 * Werkt de gebruikersnaam in de header bij met de voornaam van de ingelogde gebruiker.
 */
export function updateProfileUI() {
  const profileTrigger = document.getElementById('profileModalTrigger');
  if (!profileTrigger) return;

  const nameSpan = profileTrigger.querySelector('span') || document.getElementById('userHeaderFirstName');

  if (!state.currentUser) {
    if (nameSpan) nameSpan.innerText = 'Inloggen';
    return;
  }

  const firstName = state.currentUser.firstName || (state.currentUser.name ? state.currentUser.name.split(' ')[0] : 'Sporter');
  
  if (nameSpan) {
    nameSpan.innerText = firstName;
  }
}

/**
 * Handelt het inloggen van een gebruiker af.
 */
export function login(callbacks = {}) {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');

  const email = emailInput?.value.trim().toLowerCase();
  const password = passInput?.value.trim();

  if (!email || !password) {
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

  if (!user) {
    return;
  }

  state.currentUser = user;
  setCurrentUserEmail(user.email);

  if (emailInput) emailInput.value = '';
  if (passInput) passInput.value = '';

  showAppUI();
  updateProfileUI();

  if (user.role === 'coach' && typeof callbacks.onCoachLogin === 'function') {
    callbacks.onCoachLogin();
  } else if (user.role === 'client' && typeof callbacks.onClientLogin === 'function') {
    callbacks.onClientLogin();
  }
}

/**
 * Handelt het registreren van een nieuwe gebruiker af.
 */
export function register(callbacks = {}) {
  const firstName = document.getElementById('regFirstName')?.value.trim();
  const lastName = document.getElementById('regLastName')?.value.trim();
  const dob = document.getElementById('regDob')?.value;
  const email = document.getElementById('regEmail')?.value.trim().toLowerCase();
  const password = document.getElementById('regPassword')?.value.trim();
  
  const roleRadio = document.querySelector('input[name="regRoleRadio"]:checked');
  const role = roleRadio ? roleRadio.value : 'client';

  if (!firstName || !lastName || !dob || !email || !password) {
    return;
  }

  let users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email)) {
    return;
  }

  const newUser = {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    dob,
    email,
    password,
    role,
    coachId: role === 'coach' ? `COACH-${Math.floor(1000 + Math.random() * 9000)}` : null,
    linkedCoachId: null
  };

  users.push(newUser);
  saveUsers(users);

  state.currentUser = newUser;
  setCurrentUserEmail(newUser.email);

  showAppUI();
  updateProfileUI();

  if (role === 'coach' && typeof callbacks.onCoachLogin === 'function') {
    callbacks.onCoachLogin();
  } else if (role === 'client' && typeof callbacks.onClientLogin === 'function') {
    callbacks.onClientLogin();
  }
}

/**
 * Logt de huidige gebruiker uit.
 */
export function logout() {
  state.currentUser = null;
  setCurrentUserEmail('');
  location.reload();
}

/**
 * Schakelt tussen inloggen en registreren.
 */
export function toggleAuth(targetView) {
  const loginForm = document.getElementById('loginCard');
  const regForm = document.getElementById('registerCard');

  if (targetView === 'register') {
    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'block';
  } else {
    if (loginForm) loginForm.style.display = 'block';
    if (regForm) regForm.style.display = 'none';
  }
}

export function showAuthModal() {
  const authSection = document.getElementById('authSection');
  const appSection = document.getElementById('appSection');

  if (authSection) authSection.style.display = 'flex';
  if (appSection) appSection.style.display = 'none';
}

export function showAppUI() {
  const authSection = document.getElementById('authSection');
  const appSection = document.getElementById('appSection');

  if (authSection) authSection.style.display = 'none';
  if (appSection) appSection.style.display = 'block';

  const isCoach = state.currentUser?.role === 'coach';
  const coachView = document.getElementById('coachView');
  const clientView = document.getElementById('clientView');

  if (coachView) coachView.style.display = isCoach ? 'block' : 'none';
  if (clientView) clientView.style.display = isCoach ? 'none' : 'block';
}

export function toggleProfileModal() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;

  const isHidden = modal.style.display === 'none' || !modal.style.display;
  modal.style.display = isHidden ? 'flex' : 'none';

  if (isHidden && state.currentUser) {
    const users = getUsers();
    const freshUser = users.find(u => u.email.toLowerCase() === state.currentUser.email.toLowerCase()) || state.currentUser;
    state.currentUser = freshUser;

    const profFirstName = document.getElementById('profFirstName');
    const profLastName = document.getElementById('profLastName');
    const profEmail = document.getElementById('profEmail');
    const profDob = document.getElementById('profDob');

    if (profFirstName) profFirstName.value = freshUser.firstName || '';
    if (profLastName) profLastName.value = freshUser.lastName || '';
    if (profEmail) profEmail.value = freshUser.email || '';
    if (profDob) profDob.value = freshUser.dob || '';

    const modalUserName = document.getElementById('modalUserName');
    const modalUserRoleBadge = document.getElementById('modalUserRoleBadge');

    if (modalUserName) modalUserName.innerText = freshUser.name || `${freshUser.firstName} ${freshUser.lastName}`;
    if (modalUserRoleBadge) modalUserRoleBadge.innerText = freshUser.role === 'coach' ? 'Coach' : 'Sporter (Client)';

    const modalClientSection = document.getElementById('modalClientSection');
    const modalCoachSection = document.getElementById('modalCoachSection');

    if (modalClientSection) modalClientSection.style.display = freshUser.role === 'coach' ? 'none' : 'block';
    if (modalCoachSection) modalCoachSection.style.display = freshUser.role === 'coach' ? 'block' : 'none';

    // SPORTER VIEW: CONTROLEREN OP GEKOPPELDE COACH
    if (freshUser.role !== 'coach') {
      const unlinkedBox = document.getElementById('clientUnlinkedBox');
      const linkedBox = document.getElementById('clientLinkedBox');
      
      const targetCode = (freshUser.linkedCoachId || freshUser.linkedCoachCode || '').toUpperCase();
      const linkedCoach = users.find(u => u.role === 'coach' && u.coachId && u.coachId.toUpperCase() === targetCode);

      if (linkedCoach || targetCode) {
        if (unlinkedBox) unlinkedBox.style.display = 'none';
        if (linkedBox) linkedBox.style.display = 'block';

        const nameDisp = document.getElementById('linkedCoachNameDisplay');
        const codeDisp = document.getElementById('linkedCoachCodeDisplay');

        if (nameDisp) {
          nameDisp.innerText = linkedCoach ? (linkedCoach.name || `${linkedCoach.firstName} ${linkedCoach.lastName}`) : 'Mijn Coach';
          nameDisp.style.color = 'var(--gold-accent)';
        }
        if (codeDisp) codeDisp.innerText = targetCode || (linkedCoach ? linkedCoach.coachId : '');
      } else {
        if (unlinkedBox) unlinkedBox.style.display = 'block';
        if (linkedBox) linkedBox.style.display = 'none';
      }
    }

    // COACH VIEW: COACH-ID WEERGEVEN EN GEKOPPELDE SPORTERS KNOP BINDEN
    if (freshUser.role === 'coach') {
      const modalCoachIdDisplay = document.getElementById('modalCoachIdDisplay');
      if (modalCoachIdDisplay) modalCoachIdDisplay.innerText = freshUser.coachId || 'Geen ID';

      const btnOpenLinked = document.getElementById('btnOpenLinkedClientsModal');
      if (btnOpenLinked) {
        btnOpenLinked.onclick = () => {
          renderCoachModalClientsList();
          const linkedClientsModal = document.getElementById('linkedClientsModal');
          if (linkedClientsModal) linkedClientsModal.style.display = 'flex';
        };
      }
    }
  }
}

export function saveProfileChanges() {
  if (!state.currentUser) return;

  const firstName = document.getElementById('profFirstName')?.value.trim();
  const lastName = document.getElementById('profLastName')?.value.trim();
  const email = document.getElementById('profEmail')?.value.trim().toLowerCase();
  const dob = document.getElementById('profDob')?.value;
  const password = document.getElementById('profPassword')?.value.trim();

  if (!firstName || !lastName || !email) {
    return;
  }

  state.currentUser.firstName = firstName;
  state.currentUser.lastName = lastName;
  state.currentUser.name = `${firstName} ${lastName}`;
  state.currentUser.email = email;
  if (dob) state.currentUser.dob = dob;
  if (password) state.currentUser.password = password;

  let users = getUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === state.currentUser.email.toLowerCase());
  if (idx !== -1) {
    users[idx] = state.currentUser;
    saveUsers(users);
  }

  setCurrentUserEmail(state.currentUser.email);
  updateProfileUI();
  toggleProfileModal();
}

export function linkCoachByCode() {
  const codeInput = document.getElementById('inputCoachCode');
  const code = codeInput?.value.trim().toUpperCase();
  if (!code) return;

  let users = getUsers();
  const coach = users.find(u => u.role === 'coach' && u.coachId && u.coachId.toUpperCase() === code);

  if (!coach) {
    return;
  }

  state.currentUser.linkedCoachId = code;
  state.currentUser.linkedCoachCode = code;

  const idx = users.findIndex(u => u.email.toLowerCase() === state.currentUser.email.toLowerCase());
  if (idx !== -1) {
    users[idx] = state.currentUser;
    saveUsers(users);
  }

  if (codeInput) codeInput.value = '';
  toggleProfileModal();
  toggleProfileModal();
}

/**
 * Verbreekt de koppeling met de coach.
 */
export function unlinkCoach() {
  state.currentUser.linkedCoachId = null;
  delete state.currentUser.linkedCoachCode;

  let users = getUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === state.currentUser.email.toLowerCase());
  if (idx !== -1) {
    users[idx] = state.currentUser;
    saveUsers(users);
  }

  toggleProfileModal();
  toggleProfileModal();
}