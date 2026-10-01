// ==========================================================================
// MAIN ENTRY POINT MODULE (app.js)
// Centraliseert initialisatie, DOM-event listeners en window-bindings
// ==========================================================================

import { state } from './core/state.js';
import { 
  initAuth, login, register, logout, toggleAuth, 
  toggleProfileModal, saveProfileChanges, linkCoachByCode, updateProfileUI 
} from './core/auth.js';
import { generateRandomMockData } from './data/mockData.js';

// Client Imports
import { switchClientTab } from './client/clientNav.js';
import { 
  renderTemplates, toggleNewTemplateForm, addExerciseToTemplate, 
  saveTemplate 
} from './client/clientTemplates.js';
import { 
  startWorkoutFromTemplate, togglePauseWorkoutTimer, 
  cancelActiveWorkout, finishWorkout 
} from './client/workoutTracker.js';
import { 
  renderHistory, closeEditHistoryModal, saveHistoryEdits 
} from './client/clientHistory.js';
import { 
  updateProgressChart, setClientProgressMetric, setProgressFilter 
} from './client/clientProgress.js';
import { renderClientSessions } from './client/clientSessions.js';

// Coach Imports
import { switchCoachTab, switchCoachClientSubTab } from './coach/coachNav.js';
import { renderCoachClientDropdown, renderCoachModalClientsList } from './coach/coachClients.js';
import { 
  renderCoachClientTemplates, toggleCoachNewTemplateForm, addExerciseToCoachTemplate, 
  saveCoachClientTemplate 
} from './coach/coachTemplates.js';
import { 
  renderCoachSessions, populateAgendaFilterClients, toggleCoachSessionForm, 
  saveCoachSession, toggleAgendaHistoryMode 
} from './coach/coachAgenda.js';
import { 
  renderCoachClientHistory, updateCoachProgressChart, setCoachProgressMetric 
} from './coach/coachProgress.js';
import { 
  renderCoachExercisesList, toggleCoachNewExerciseForm, saveCoachCustomExercise 
} from './coach/coachExercises.js';

// Event Handlers Binder
document.addEventListener('DOMContentLoaded', () => {
  
  // ------------------------------------------------------------------------
  // AUTH & REGISTRATIE HANDLERS
  // ------------------------------------------------------------------------
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      bootAuth('login');
    });
  }

  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      bootAuth('register');
    });
  }

  // Formulieren ook via Enter-toets laten verzenden
  document.getElementById('loginFormContainer')?.addEventListener('submit', (e) => {
    e.preventDefault();
    bootAuth('login');
  });

  document.getElementById('registerFormContainer')?.addEventListener('submit', (e) => {
    e.preventDefault();
    bootAuth('register');
  });

  // Schakelen tussen inloggen en registreren links
  document.getElementById('toRegisterLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuth('register');
  });

  document.getElementById('toLoginLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuth('login');
  });

  // ------------------------------------------------------------------------
  // PROFIEL MODAL & HEADER HANDLERS
  // ------------------------------------------------------------------------
  const profileTrigger = document.getElementById('profileModalTrigger');
  if (profileTrigger) {
    profileTrigger.addEventListener('click', () => {
      toggleProfileModal();
      if (state.currentUser?.role === 'coach') renderCoachModalClientsList();
    });
  }

  document.getElementById('closeProfileModalBtn')?.addEventListener('click', toggleProfileModal);
  document.getElementById('saveProfileBtn')?.addEventListener('click', saveProfileChanges);
  document.getElementById('btnLinkCoachCode')?.addEventListener('click', linkCoachByCode);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('resetMockDataBtn')?.addEventListener('click', generateRandomMockData);

  // ------------------------------------------------------------------------
  // CLIENT NAVIGATION & ACTIONS
  // ------------------------------------------------------------------------
  document.getElementById('tabTemplatesBtn')?.addEventListener('click', () => switchClientTab('templates', { renderTemplates: () => renderTemplates(id => startWorkoutFromTemplate(id, () => renderTemplates())) }));
  document.getElementById('tabHistoryBtn')?.addEventListener('click', () => switchClientTab('history', { onHistoryActive: renderHistory }));
  document.getElementById('tabProgressBtn')?.addEventListener('click', () => switchClientTab('progress', { onProgressActive: updateProgressChart }));
  document.getElementById('tabSessionsBtn')?.addEventListener('click', () => switchClientTab('sessions', { onSessionsActive: renderClientSessions }));

  document.getElementById('floatingAddTemplateBtn')?.addEventListener('click', toggleNewTemplateForm);
  document.getElementById('addExerciseToTemplateBtn')?.addEventListener('click', () => addExerciseToTemplate());
  document.getElementById('saveTemplateBtn')?.addEventListener('click', () => saveTemplate(() => renderTemplates(id => startWorkoutFromTemplate(id, () => renderTemplates()))));
  document.getElementById('cancelTemplateBtn')?.addEventListener('click', toggleNewTemplateForm);

  // Live Workout Controls
  document.getElementById('activeWorkoutPauseBtn')?.addEventListener('click', togglePauseWorkoutTimer);
  document.getElementById('activeWorkoutFinishBtn')?.addEventListener('click', () => finishWorkout(() => renderTemplates(id => startWorkoutFromTemplate(id, () => renderTemplates()))));
  document.getElementById('activeWorkoutCancelBtn')?.addEventListener('click', () => cancelActiveWorkout(() => renderTemplates(id => startWorkoutFromTemplate(id, () => renderTemplates()))));

  // Edit History Modal Controls
  document.getElementById('closeEditHistoryModalBtn')?.addEventListener('click', closeEditHistoryModal);
  document.getElementById('cancelHistoryEditsBtn')?.addEventListener('click', closeEditHistoryModal);
  document.getElementById('saveHistoryEditsBtn')?.addEventListener('click', () => saveHistoryEdits(renderHistory));

  // ------------------------------------------------------------------------
  // COACH NAVIGATION & ACTIONS
  // ------------------------------------------------------------------------
  document.getElementById('coachTabClientsBtn')?.addEventListener('click', () => switchCoachTab('clients', { onClientsActive: () => renderCoachClientDropdown(onCoachClientSelected) }));
  document.getElementById('coachTabAgendaBtn')?.addEventListener('click', () => switchCoachTab('agenda', { onAgendaActive: () => { populateAgendaFilterClients(); renderCoachSessions(); } }));
  document.getElementById('coachTabExercisesBtn')?.addEventListener('click', () => switchCoachTab('exercises', { onExercisesActive: renderCoachExercisesList }));

  document.getElementById('coachClientSubTabHistBtn')?.addEventListener('click', (e) => switchCoachClientSubTab('history', e, { onSubHistory: renderCoachClientHistory }));
  document.getElementById('coachClientSubTabChartBtn')?.addEventListener('click', (e) => switchCoachClientSubTab('chart', e, { onSubChart: updateCoachProgressChart }));
  document.getElementById('coachClientSubTabTmplBtn')?.addEventListener('click', (e) => switchCoachClientSubTab('templates', e, { onSubTemplates: renderCoachClientTemplates }));

  document.getElementById('floatingCoachAddTemplateBtn')?.addEventListener('click', toggleCoachNewTemplateForm);
  document.getElementById('addExerciseToCoachTemplateBtn')?.addEventListener('click', () => addExerciseToCoachTemplate());
  document.getElementById('saveCoachTemplateBtn')?.addEventListener('click', saveCoachClientTemplate);
  document.getElementById('cancelCoachTemplateBtn')?.addEventListener('click', toggleCoachNewTemplateForm);

  document.getElementById('floatingCoachAddSessionBtn')?.addEventListener('click', () => { populateAgendaFilterClients(); toggleCoachSessionForm(); });
  document.getElementById('saveSessionBtn')?.addEventListener('click', saveCoachSession);
  document.getElementById('cancelSessionBtn')?.addEventListener('click', toggleCoachSessionForm);
  document.getElementById('btnToggleAgendaHistory')?.addEventListener('click', toggleAgendaHistoryMode);

  document.getElementById('floatingCoachAddExerciseBtn')?.addEventListener('click', toggleCoachNewExerciseForm);
  document.getElementById('saveCustomExBtn')?.addEventListener('click', saveCoachCustomExercise);
  document.getElementById('cancelCustomExBtn')?.addEventListener('click', toggleCoachNewExerciseForm);

  document.getElementById('agendaFilterClientSelect')?.addEventListener('change', renderCoachSessions);
  document.getElementById('agendaFilterDate')?.addEventListener('change', renderCoachSessions);
  document.getElementById('coachExerciseCategoryFilter')?.addEventListener('change', renderCoachExercisesList);

  // App opstarten met authenticatiecontrole
  initAuth({
    onClientLogin: () => switchClientTab('templates', { renderTemplates: () => renderTemplates(id => startWorkoutFromTemplate(id, () => renderTemplates())) }),
    onCoachLogin: () => switchCoachTab('clients', { onClientsActive: () => renderCoachClientDropdown(onCoachClientSelected) })
  });

  // Zorg dat profielweergave direct juist staat
  updateProfileUI();
});

function bootAuth(type) {
  const callbacks = {
    onClientLogin: () => switchClientTab('templates', { renderTemplates: () => renderTemplates(id => startWorkoutFromTemplate(id, () => renderTemplates())) }),
    onCoachLogin: () => switchCoachTab('clients', { onClientsActive: () => renderCoachClientDropdown(onCoachClientSelected) })
  };

  if (type === 'login') login(callbacks);
  if (type === 'register') register(callbacks);
}

function onCoachClientSelected(clientEmail) {
  renderCoachClientHistory();
  updateCoachProgressChart();
  renderCoachClientTemplates();
}

// Window-bindings voor inline event attributes
window.setClientProgressMetric = setClientProgressMetric;
window.setProgressFilter = setProgressFilter;
window.setCoachProgressMetric = setCoachProgressMetric;