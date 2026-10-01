// ==========================================================================
// COMPONENT: MODAL MODULE
// Beheert algemene modal-interacties en overlay sluiting (< 200 regels)
// ==========================================================================

/**
 * Sluit een specifieke modal op basis van element ID.
 * @param {string} modalId - ID van de modal container
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Opent een specifieke modal op basis van element ID.
 * @param {string} modalId - ID van de modal container
 * @param {string} displayStyle - CSS display type (standaard 'flex')
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