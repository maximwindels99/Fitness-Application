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
  const masterTmplTab = document.getElementById('coachTabMasterTemplates');

  const fabTmpl = document.getElementById('floatingCoachAddTemplateBtn');
  const fabSess = document.getElementById('floatingCoachAddSessionBtn');
  const fabEx = document.getElementById('floatingCoachAddExerciseBtn');

  // Standaard alle FAB-knoppen verbergen
  if (fabTmpl) fabTmpl.style.display = 'none';
  if (fabSess) fabSess.style.display = 'none';
  if (fabEx) fabEx.style.display = 'none';

  if (clientsTab && clientsTab.style.display !== 'none') {
    if (fabTmpl) fabTmpl.style.display = 'none';
  } else if (agendaTab && agendaTab.style.display !== 'none') {
    const sessForm = document.getElementById('coachSessionFormCard');
    const isFormOpen = sessForm && sessForm.style.display !== 'none';
    if (fabSess) fabSess.style.display = isFormOpen ? 'none' : 'flex';
  } else if (exTab && exTab.style.display !== 'none') {
    const exForm = document.getElementById('coachNewExerciseCard');
    const isFormOpen = exForm && exForm.style.display !== 'none';
    if (fabEx) fabEx.style.display = isFormOpen ? 'none' : 'flex';
  } else if (masterTmplTab && masterTmplTab.style.display !== 'none') {
    if (fabTmpl) fabTmpl.style.display = 'none';
  }
}

/**
 * Schakelt tussen de hoofdtabbladen van het coach-dashboard.
 * @param {'clients'|'agenda'|'exercises'|'masterTemplates'} tab 
 * @param {Object} renderCallbacks 
 */
export function switchCoachTab(tab, renderCallbacks = {}) {
  const clientsTab = document.getElementById('coachTabClients');
  const agendaTab = document.getElementById('coachTabAgenda');
  const exTab = document.getElementById('coachTabExercises');
  const masterTmplTab = document.getElementById('coachTabMasterTemplates');

  // Harde isolatie van de hoofdtabbladen
  if (clientsTab) {
    if (tab === 'clients') {
      clientsTab.style.setProperty('display', 'flex', 'important');
      clientsTab.style.setProperty('flex-direction', 'column', 'important');
      clientsTab.style.setProperty('width', '100%', 'important');
    } else {
      clientsTab.style.setProperty('display', 'none', 'important');
    }
  }

  if (agendaTab) {
    if (tab === 'agenda') {
      agendaTab.style.setProperty('display', 'flex', 'important');
      agendaTab.style.setProperty('flex-direction', 'column', 'important');
      agendaTab.style.setProperty('width', '100%', 'important');
    } else {
      agendaTab.style.setProperty('display', 'none', 'important');
    }
  }

  if (exTab) {
    if (tab === 'exercises') {
      exTab.style.setProperty('display', 'flex', 'important');
      exTab.style.setProperty('flex-direction', 'column', 'important');
      exTab.style.setProperty('width', '100%', 'important');
    } else {
      exTab.style.setProperty('display', 'none', 'important');
    }
  }

  if (masterTmplTab) {
    if (tab === 'masterTemplates') {
      masterTmplTab.style.setProperty('display', 'flex', 'important');
      masterTmplTab.style.setProperty('flex-direction', 'column', 'important');
      masterTmplTab.style.setProperty('width', '100%', 'important');
    } else {
      masterTmplTab.style.setProperty('display', 'none', 'important');
    }
  }

  document.getElementById('coachTabClientsBtn')?.classList.toggle('active', tab === 'clients');
  document.getElementById('coachTabAgendaBtn')?.classList.toggle('active', tab === 'agenda');
  document.getElementById('coachTabExercisesBtn')?.classList.toggle('active', tab === 'exercises');
  document.getElementById('coachTabMasterTemplatesBtn')?.classList.toggle('active', tab === 'masterTemplates');

  if (tab === 'clients' && typeof renderCallbacks.onClientsActive === 'function') {
    renderCallbacks.onClientsActive();
  }
  if (tab === 'agenda' && typeof renderCallbacks.onAgendaActive === 'function') {
    renderCallbacks.onAgendaActive();
  }
  if (tab === 'exercises' && typeof renderCallbacks.onExercisesActive === 'function') {
    renderCallbacks.onExercisesActive();
  }
  if (tab === 'masterTemplates' && typeof renderCallbacks.onMasterTemplatesActive === 'function') {
    renderCallbacks.onMasterTemplatesActive();
  }

  updateCoachFabVisibility();
  requestAnimationFrame(() => updateNavIndicator('coachBottomNav'));
}

/**
 * Schakelt de sub-tabs onder een geselecteerde sporter (Historie / Progressie / Schema's).
 */
export function switchCoachClientSubTab(subTab, event, renderCallbacks = {}) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();

  const histView = document.getElementById('coachClientHistoryView');
  const chartView = document.getElementById('coachClientChartView');
  const tmplView = document.getElementById('coachClientTemplatesView');

  // Zet de actieve subview op 100% breedte direct onder de sub-tabs
  if (histView) {
    histView.style.display = subTab === 'history' ? 'block' : 'none';
    histView.style.width = '100%';
  }
  if (chartView) {
    chartView.style.display = subTab === 'chart' ? 'block' : 'none';
    chartView.style.width = '100%';
  }
  if (tmplView) {
    tmplView.style.display = subTab === 'templates' ? 'block' : 'none';
    tmplView.style.width = '100%';
  }

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