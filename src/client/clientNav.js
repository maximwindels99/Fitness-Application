// ==========================================================================
// CLIENT NAVIGATION MODULE
// Beheert tab-schakeling en sliding indicator voor de sporter (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';

/**
 * Werkt de positie en breedte van de sliding indicator op de onderbalk bij.
 * @param {string} navId - HTML element ID van de nav container (bijv. 'bottomNav')
 */
export function updateNavIndicator(navId) {
  const nav = document.getElementById(navId);
  if (!nav || nav.offsetWidth === 0) return;

  const activeBtn = nav.querySelector('.bottom-nav-btn.active');
  let indicator = nav.querySelector('.nav-indicator');

  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'nav-indicator';
    nav.appendChild(indicator);
  }

  if (activeBtn) {
    indicator.style.opacity = '1';
    indicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    indicator.style.width = `${activeBtn.offsetWidth}px`;
  } else {
    indicator.style.opacity = '0';
  }
}

/**
 * Schakelt tussen de hoofdtabbladen van het sporter-portaal.
 * @param {'templates'|'history'|'progress'|'sessions'} tab 
 * @param {Object} renderCallbacks - Callbacks om de specifieke tabs te renderen
 */
export function switchClientTab(tab, renderCallbacks = {}) {
  document.getElementById('tabTemplates').style.display = tab === 'templates' ? 'block' : 'none';
  document.getElementById('tabHistory').style.display = tab === 'history' ? 'block' : 'none';
  document.getElementById('tabProgress').style.display = tab === 'progress' ? 'block' : 'none';
  document.getElementById('tabSessions').style.display = tab === 'sessions' ? 'block' : 'none';

  const fabBtn = document.getElementById('floatingAddTemplateBtn');
  const templateForm = document.getElementById('newTemplateCard');

  if (fabBtn) {
    const isFormOpen = templateForm && templateForm.style.display !== 'none';
    const isWorkoutActive = state.activeWorkout.template !== null;
    fabBtn.style.display = (tab === 'templates' && !isFormOpen && !isWorkoutActive) ? 'flex' : 'none';
  }

  document.getElementById('tabTemplatesBtn')?.classList.toggle('active', tab === 'templates');
  document.getElementById('tabHistoryBtn')?.classList.toggle('active', tab === 'history');
  document.getElementById('tabProgressBtn')?.classList.toggle('active', tab === 'progress');
  document.getElementById('tabSessionsBtn')?.classList.toggle('active', tab === 'sessions');

  if (tab === 'templates' && typeof renderCallbacks.renderTemplates === 'function') {
    renderCallbacks.renderTemplates();
  }
  if (tab === 'history' && typeof renderCallbacks.onHistoryActive === 'function') {
    renderCallbacks.onHistoryActive();
  }
  if (tab === 'progress' && typeof renderCallbacks.onProgressActive === 'function') {
    renderCallbacks.onProgressActive();
  }
  if (tab === 'sessions' && typeof renderCallbacks.onSessionsActive === 'function') {
    renderCallbacks.onSessionsActive();
  }

  requestAnimationFrame(() => updateNavIndicator('bottomNav'));
}

// Alias export voor directe compatibiliteit
export const switchTab = switchClientTab;