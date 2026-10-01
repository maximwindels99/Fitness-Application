// ==========================================================================
// COACH NAVIGATION MODULE
// Beheert tabs, navigatie en FAB (Floating Action Button) voor coaches (< 200 regels)
// ==========================================================================

import { updateNavIndicator } from '../client/clientNav.js';

/**
 * Werkt de zichtbaarheid van de Floating Action Buttons bij op basis van het actieve coach-tabblad.
 */
export function updateCoachFabVisibility() {
  const clientsTab = document.getElementById('coachTabClients');
  const agendaTab = document.getElementById('coachTabAgenda');
  const exTab = document.getElementById('coachTabExercises');

  const fabTmpl = document.getElementById('floatingCoachAddTemplateBtn');
  const fabSess = document.getElementById('floatingCoachAddSessionBtn');
  const fabEx = document.getElementById('floatingCoachAddExerciseBtn');

  if (fabTmpl) fabTmpl.style.display = 'none';
  if (fabSess) fabSess.style.display = 'none';
  if (fabEx) fabEx.style.display = 'none';

  if (clientsTab && clientsTab.style.display !== 'none') {
    const tmplSubView = document.getElementById('coachClientTemplatesView');
    const tmplForm = document.getElementById('coachNewTemplateCard');
    if (tmplSubView && tmplSubView.style.display !== 'none') {
      const isFormOpen = tmplForm && tmplForm.style.display !== 'none';
      if (fabTmpl) fabTmpl.style.display = isFormOpen ? 'none' : 'flex';
    }
  } else if (agendaTab && agendaTab.style.display !== 'none') {
    const sessForm = document.getElementById('coachSessionFormCard');
    const isFormOpen = sessForm && sessForm.style.display !== 'none';
    if (fabSess) fabSess.style.display = isFormOpen ? 'none' : 'flex';
  } else if (exTab && exTab.style.display !== 'none') {
    const exForm = document.getElementById('coachNewExerciseCard');
    const isFormOpen = exForm && exForm.style.display !== 'none';
    if (fabEx) fabEx.style.display = isFormOpen ? 'none' : 'flex';
  }
}

/**
 * Schakelt tussen de hoofdtabbladen van het coach-dashboard.
 * @param {'clients'|'agenda'|'exercises'} tab 
 * @param {Object} renderCallbacks 
 */
export function switchCoachTab(tab, renderCallbacks = {}) {
  document.getElementById('coachTabClients').style.display = tab === 'clients' ? 'block' : 'none';
  document.getElementById('coachTabAgenda').style.display = tab === 'agenda' ? 'block' : 'none';
  document.getElementById('coachTabExercises').style.display = tab === 'exercises' ? 'block' : 'none';

  document.getElementById('coachTabClientsBtn')?.classList.toggle('active', tab === 'clients');
  document.getElementById('coachTabAgendaBtn')?.classList.toggle('active', tab === 'agenda');
  document.getElementById('coachTabExercisesBtn')?.classList.toggle('active', tab === 'exercises');

  if (tab === 'clients' && typeof renderCallbacks.onClientsActive === 'function') {
    renderCallbacks.onClientsActive();
  }
  if (tab === 'agenda' && typeof renderCallbacks.onAgendaActive === 'function') {
    renderCallbacks.onAgendaActive();
  }
  if (tab === 'exercises' && typeof renderCallbacks.onExercisesActive === 'function') {
    renderCallbacks.onExercisesActive();
  }

  updateCoachFabVisibility();
  requestAnimationFrame(() => updateNavIndicator('coachBottomNav'));
}

/**
 * Schakelt de sub-tabs onder een geselecteerde sporter (Historie / Progressie / Schema's).
 */
export function switchCoachClientSubTab(subTab, event, renderCallbacks = {}) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();

  document.getElementById('coachClientHistoryView').style.display = subTab === 'history' ? 'block' : 'none';
  document.getElementById('coachClientChartView').style.display = subTab === 'chart' ? 'block' : 'none';
  document.getElementById('coachClientTemplatesView').style.display = subTab === 'templates' ? 'block' : 'none';

  document.getElementById('coachClientSubTabHistBtn')?.classList.toggle('active', subTab === 'history');
  document.getElementById('coachClientSubTabChartBtn')?.classList.toggle('active', subTab === 'chart');
  document.getElementById('coachClientSubTabTmplBtn')?.classList.toggle('active', subTab === 'templates');

  if (subTab === 'history' && typeof renderCallbacks.onSubHistory === 'function') {
    renderCallbacks.onSubHistory();
  }
  if (subTab === 'chart' && typeof renderCallbacks.onSubChart === 'function') {
    renderCallbacks.onSubChart();
  }
  if (subTab === 'templates' && typeof renderCallbacks.onSubTemplates === 'function') {
    renderCallbacks.onSubTemplates();
  }

  updateCoachFabVisibility();
}