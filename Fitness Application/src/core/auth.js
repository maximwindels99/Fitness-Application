// ==========================================================================
// AUTHENTICATIE & PROFIEL MODULE (VOLLEDIG BESTAND)
// Beheert inloggen, registreren, uitloggen en profielbeheer (< 200 regels)
// ==========================================================================

import { state } from './state.js';
import { getUsers, saveUsers, getCurrentUserEmail, setCurrentUserEmail } from './storage.js';

/**
 * Controleert de sessiestatus bij het opstarten van de app.
 */
export function checkAuthState(callbacks = {}) {
  const users = getUsers();
  const savedEmail = getCurrentUserEmail();

  if (savedEmail) {
    const user = users.find(u => u.email === savedEmail);
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

  // Koppel de ontkoppelknop
  const btnUnlink = document.getElementById('btnUnlinkCoach');
  if (btnUnlink) {
    btnUnlink.addEventListener('click', unlinkCoach);
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
    alert("Vul a.u.b. alle velden in.");
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

  if (!user) {
    alert("Ongeldige inloggegevens. Controleer je e-mailadres en wachtwoord.");
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
    alert("Vul a.u.b. alle verplichte velden in.");
    return;
  }

  let users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email)) {
    alert("Er bestaat al een account met dit e-mailadres.");
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
    const profFirstName = document.getElementById('profFirstName');
    const profLastName = document.getElementById('profLastName');
    const profEmail = document.getElementById('profEmail');
    const profDob = document.getElementById('profDob');

    if (profFirstName) profFirstName.value = state.currentUser.firstName || '';
    if (profLastName) profLastName.value = state.currentUser.lastName || '';
    if (profEmail) profEmail.value = state.currentUser.email || '';
    if (profDob) profDob.value = state.currentUser.dob || '';

    const modalUserName = document.getElementById('modalUserName');
    const modalUserRoleBadge = document.getElementById('modalUserRoleBadge');

    if (modalUserName) modalUserName.innerText = state.currentUser.name || `${state.currentUser.firstName} ${state.currentUser.lastName}`;
    if (modalUserRoleBadge) modalUserRoleBadge.innerText = state.currentUser.role === 'coach' ? 'Coach' : 'Sporter (Client)';

    const modalClientSection = document.getElementById('modalClientSection');
    const modalCoachSection = document.getElementById('modalCoachSection');

    if (modalClientSection) modalClientSection.style.display = state.currentUser.role === 'coach' ? 'none' : 'block';
    if (modalCoachSection) modalCoachSection.style.display = state.currentUser.role === 'coach' ? 'block' : 'none';

    // ALS SPORTER: TOON WEL OF GEEN GEKOPPELDE COACH
    if (state.currentUser.role !== 'coach') {
      const unlinkedBox = document.getElementById('clientUnlinkedBox');
      const linkedBox = document.getElementById('clientLinkedBox');
      
      const users = getUsers();
      const linkedCoach = users.find(u => u.role === 'coach' && (u.coachId === state.currentUser.linkedCoachId || u.id === state.currentUser.linkedCoachId));

      if (linkedCoach || state.currentUser.linkedCoachId) {
        if (unlinkedBox) unlinkedBox.style.display = 'none';
        if (linkedBox) linkedBox.style.display = 'block';

        const nameDisp = document.getElementById('linkedCoachNameDisplay');
        const codeDisp = document.getElementById('linkedCoachCodeDisplay');

        if (nameDisp) {
  nameDisp.innerText = linkedCoach ? linkedCoach.name || `${linkedCoach.firstName} ${linkedCoach.lastName}` : 'Mijn Coach';
  nameDisp.style.color = 'var(--gold-accent)';
}
        if (codeDisp) codeDisp.innerText = state.currentUser.linkedCoachId || (linkedCoach ? linkedCoach.coachId : '');
      } else {
        if (unlinkedBox) unlinkedBox.style.display = 'block';
        if (linkedBox) linkedBox.style.display = 'none';
      }
    }

    if (state.currentUser.role === 'coach') {
      const modalCoachIdDisplay = document.getElementById('modalCoachIdDisplay');
      if (modalCoachIdDisplay) modalCoachIdDisplay.innerText = state.currentUser.coachId || 'Geen ID';
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
    alert("Voornaam, achternaam en e-mailadres zijn verplicht.");
    return;
  }

  state.currentUser.firstName = firstName;
  state.currentUser.lastName = lastName;
  state.currentUser.name = `${firstName} ${lastName}`;
  state.currentUser.email = email;
  if (dob) state.currentUser.dob = dob;
  if (password) state.currentUser.password = password;

  let users = getUsers();
  const idx = users.findIndex(u => u.email === state.currentUser.email || u.id === state.currentUser.id);
  if (idx !== -1) {
    users[idx] = state.currentUser;
    saveUsers(users);
  }

  setCurrentUserEmail(state.currentUser.email);
  updateProfileUI();
  toggleProfileModal();
  alert("Profiel succesvol bijgewerkt!");
}

export function linkCoachByCode() {
  const code = document.getElementById('inputCoachCode')?.value.trim().toUpperCase();
  if (!code) {
    alert("Vul een geldige coach-code in.");
    return;
  }

  const users = getUsers();
  const coach = users.find(u => u.role === 'coach' && u.coachId === code);

  if (!coach) {
    alert("Geen coach gevonden met deze code. Controleer de code en probeer opnieuw.");
    return;
  }

  state.currentUser.linkedCoachId = code;
  const idx = users.findIndex(u => u.email === state.currentUser.email || u.id === state.currentUser.id);
  if (idx !== -1) {
    users[idx] = state.currentUser;
    saveUsers(users);
  }

  alert(`Succesvol gekoppeld aan je coach (${coach.name || coach.firstName})!`);
  toggleProfileModal();
}

/**
 * Verbreekt de koppeling met de coach.
 */
export function unlinkCoach() {
  if (confirm("Weet je zeker dat je de koppeling met je coach wilt verbreken?")) {
    state.currentUser.linkedCoachId = null;

    let users = getUsers();
    const idx = users.findIndex(u => u.email === state.currentUser.email || u.id === state.currentUser.id);
    if (idx !== -1) {
      users[idx] = state.currentUser;
      saveUsers(users);
    }

    alert("Koppeling met de coach is verbroken.");
    toggleProfileModal();
  }
}