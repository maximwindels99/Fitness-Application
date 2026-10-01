// ==========================================================================
// STORAGE MODULE (VOLLEDIG BESTAND)
// Beheert alle LocalStorage lees- en schrijfacties (< 200 regels)
// ==========================================================================

const USERS_KEY = 'aqm_users';
const CURRENT_USER_KEY = 'aqm_current_user_email';
const HISTORY_KEY = 'aqm_workouts_history';
const TEMPLATES_KEY = 'aqm_workout_templates';
const SESSIONS_KEY = 'aqm_coach_sessions';
const CUSTOM_EXERCISES_KEY = 'aqm_custom_exercises';

/**
 * Gebruikers opslaan en ophalen
 */
export function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Huidig ingelogde e-mail opslaan en ophalen
 */
export function getCurrentUserEmail() {
  return localStorage.getItem(CURRENT_USER_KEY) || '';
}

export function setCurrentUserEmail(email) {
  if (email) {
    localStorage.setItem(CURRENT_USER_KEY, email);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Alias voor backwards compatibility
export const saveCurrentUserEmail = setCurrentUserEmail;

/**
 * Workout historie opslaan en ophalen
 */
export function getWorkoutsHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}

export function saveWorkoutsHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Workout schema templates opslaan en ophalen
 */
export function getTemplates() {
  return JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [];
}

export function saveTemplates(templates) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

/**
 * Coach ingeplande sessies opslaan en ophalen
 */
export function getSessions() {
  return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [];
}

export function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

/**
 * Custom oefeningen opslaan en ophalen
 */
export function getCustomExercises() {
  return JSON.parse(localStorage.getItem(CUSTOM_EXERCISES_KEY)) || [];
}

export function saveCustomExercises(exercises) {
  localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises));
}