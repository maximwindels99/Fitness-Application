// ==========================================================================
// STATE MODULE
// Centrale reactieve applicatie-state (< 200 regels)
// ==========================================================================

export const state = {
  // Gebruiker & Rol
  currentUser: null,
  selectedClientEmail: null,

  // Actieve Live Workout (Client)
  activeWorkout: {
    template: null,
    templateId: null,
    timerSeconds: 0,
    intervalId: null,
    isTimerRunning: false
  },

  // Coach Voortgang & Filters
  coachProgressMetric: 'weight', // 'weight' of 'oneRM'
  coachProgressFilter: '6M',     // '10S', '1M', '6M', '1Y'
  currentCoachHistoryLimit: 3,

  // Client Voortgang & Filters
  clientProgressMetric: 'weight',
  clientProgressFilter: '6M',

  // Agenda Modus
  showAgendaHistory: false
};

/**
 * Reset de staat van een actieve workout.
 */
export function resetActiveWorkoutState() {
  if (state.activeWorkout.intervalId) {
    clearInterval(state.activeWorkout.intervalId);
  }

  state.activeWorkout = {
    template: null,
    templateId: null,
    timerSeconds: 0,
    intervalId: null,
    isTimerRunning: false
  };
}