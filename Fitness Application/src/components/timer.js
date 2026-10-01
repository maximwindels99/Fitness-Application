// ==========================================================================
// COMPONENT: TIMER MODULE
// Beheert de workout stopwatch / rust-timer logica (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { formatTimerTime } from '../core/utils.js';

/**
 * Start of hervat de live workout timer.
 * @param {Function} onTickCallback - Optionele callback die elke seconde draait.
 */
export function startTimer(onTickCallback) {
  if (state.activeWorkout.isTimerRunning) return;

  state.activeWorkout.isTimerRunning = true;
  state.activeWorkout.intervalId = setInterval(() => {
    state.activeWorkout.timerSeconds++;
    
    updateTimerUI();

    if (typeof onTickCallback === 'function') {
      onTickCallback(state.activeWorkout.timerSeconds);
    }
  }, 1000);
}

/**
 * Pauzeert de actieve timer.
 */
export function pauseTimer() {
  if (!state.activeWorkout.isTimerRunning) return;

  clearInterval(state.activeWorkout.intervalId);
  state.activeWorkout.intervalId = null;
  state.activeWorkout.isTimerRunning = false;
}

/**
 * Stopt en reset de timer naar 0.
 */
export function stopTimer() {
  pauseTimer();
  state.activeWorkout.timerSeconds = 0;
  updateTimerUI();
}

/**
 * Werkt het timer-element in de DOM bij.
 */
export function updateTimerUI() {
  const timerDisplay = document.getElementById('workoutTimerDisplay');
  if (timerDisplay) {
    timerDisplay.innerText = formatTimerTime(state.activeWorkout.timerSeconds);
  }
}