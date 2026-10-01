// ==========================================================================
// UTILS MODULE
// Datumformattering, ID generatie en 1RM Brzycki formule (< 200 regels)
// ==========================================================================

/**
 * Genereert een unieke ID string op basis van timestamp en willekeurige tekens.
 */
export function generateUniqueId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Berekent het geschatte 1Rep Max (1RM) via de Brzycki-formule: Weight / (1.0278 - 0.0278 * Reps)
 * @param {number} weight - Gewicht in kg
 * @param {number} reps - Aantal herhalingen
 * @returns {number} Geschat 1RM afgerond op 1 decimaal
 */
export function calculate1RM(weight, reps) {
  const w = parseFloat(weight) || 0;
  const r = parseInt(reps) || 0;
  
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;

  const oneRm = w / (1.0278 - (0.0278 * r));
  return Math.round(oneRm * 10) / 10;
}

/**
 * Formatteert seconden naar MM:SS string voor de live workout timer.
 */
export function formatTimerTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatteert een ISO datumstring (YYYY-MM-DD) naar DD-MM.
 */
export function formatDateDDMM(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}`;
  }
  return dateString;
}

/**
 * Formatteert een ISO datumstring (YYYY-MM-DD) naar DD-MM-YY.
 */
export function formatDateShortYY(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0].slice(-2)}`;
  }
  return dateString;
}