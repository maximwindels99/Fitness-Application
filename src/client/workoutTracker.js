// ==========================================================================
// WORKOUT TRACKER MODULE
// Live workout uitvoeren, timerbeheer en set-registratie (< 200 regels)
// ==========================================================================

import { state, resetActiveWorkoutState } from '../core/state.js';
import { getWorkoutsHistory, saveWorkoutsHistory, getTemplates } from '../core/storage.js';
import { findExerciseById } from '../data/exercisesData.js';
import { formatTimerTime, generateUniqueId } from '../core/utils.js';
import { renderTemplates } from './clientTemplates.js';

/**
 * Start of hervat de live workout-timer.
 */
export function startWorkoutTimer(templateId) {
  if (templateId) {
    state.activeWorkout.templateId = templateId;
  }
  state.activeWorkout.isTimerRunning = true;
  updateTimerUI();

  if (!state.activeWorkout.intervalId) {
    state.activeWorkout.intervalId = setInterval(() => {
      state.activeWorkout.timerSeconds++;
      const timerText = document.getElementById('activeWorkoutTimerText');
      if (timerText) timerText.innerText = formatTimerTime(state.activeWorkout.timerSeconds);
    }, 1000);
  }
}

/**
 * Schakelt de pauzestand van de workout-timer.
 */
export function togglePauseWorkoutTimer(e) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

  if (state.activeWorkout.isTimerRunning) {
    if (state.activeWorkout.intervalId) {
      clearInterval(state.activeWorkout.intervalId);
      state.activeWorkout.intervalId = null;
    }
    state.activeWorkout.isTimerRunning = false;
  } else {
    const tmplId = state.activeWorkout.templateId || (state.activeWorkout.template ? state.activeWorkout.template.id : null);
    startWorkoutTimer(tmplId);
  }
  updateTimerUI();
}

function updateTimerUI() {
  const timerText = document.getElementById('activeWorkoutTimerText');
  const toggleBtn = document.getElementById('activeWorkoutPauseBtn');

  if (timerText) timerText.innerText = formatTimerTime(state.activeWorkout.timerSeconds);
  if (toggleBtn) {
    toggleBtn.innerHTML = state.activeWorkout.isTimerRunning ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
  }
}

/**
 * Controleert of alle momenteel aanwezige sets afgevinkt zijn.
 */
export function checkWorkoutCompletionState() {
  const finishBtn = document.getElementById('activeWorkoutFinishBtn');
  if (!finishBtn) return;

  const allCheckBtns = document.querySelectorAll('#activeExercisesContainer .btn-check-set');
  
  if (allCheckBtns.length === 0) {
    finishBtn.disabled = true;
    finishBtn.classList.add('btn-finish-disabled');
    return;
  }

  const completedCheckBtns = document.querySelectorAll('#activeExercisesContainer .btn-check-set.completed');
  const isAllCompleted = allCheckBtns.length === completedCheckBtns.length;

  finishBtn.disabled = !isAllCompleted;
  if (isAllCompleted) {
    finishBtn.classList.remove('btn-finish-disabled');
  } else {
    finishBtn.classList.add('btn-finish-disabled');
  }
}

/**
 * Stopt de timer, schonkt de UI 100% op en herstelt de Start Workout knoppen.
 */
export function stopAndResetWorkoutUI(onRenderTemplates) {
  if (state.activeWorkout.intervalId) {
    clearInterval(state.activeWorkout.intervalId);
    state.activeWorkout.intervalId = null;
  }
  
  resetActiveWorkoutState();

  const card = document.getElementById('activeWorkoutCard');
  const exercisesContainer = document.getElementById('activeExercisesContainer');
  const templatesList = document.getElementById('templatesList');

  if (card) card.style.display = 'none';
  if (exercisesContainer) exercisesContainer.innerHTML = '';
  if (templatesList) templatesList.style.display = 'block';

  renderTemplates((tmplId) => {
    startWorkoutFromTemplate(tmplId, () => stopAndResetWorkoutUI(onRenderTemplates));
  });

  if (typeof onRenderTemplates === 'function') {
    onRenderTemplates();
  }
}

/**
 * Annuleert de actieve workout via de Custom Confirm Modal.
 */
export function cancelActiveWorkout(onRenderTemplates) {
  showCustomConfirm(
    "Workout Annuleren",
    "Weet je zeker dat je de huidige workout wilt sluiten? Je voortgang wordt niet opgeslagen.",
    () => stopAndResetWorkoutUI(onRenderTemplates)
  );
}

/**
 * Haalt de prestaties op van de vorige keer dat een oefening is uitgevoerd.
 */
export function getLastPerformance(exerciseId) {
  const history = getWorkoutsHistory().filter(h => h.userEmail === state.currentUser?.email);
  for (let workout of history) {
    for (let ex of workout.exercises) {
      if (ex.exerciseId === exerciseId) return ex.sets;
    }
  }
  return null;
}

/**
 * Voegt handmatig een set toe aan het actieve oefeningenblok.
 */
export function addSetToActiveExercise(exerciseId) {
  const exDiv = document.querySelector(`.active-exercise-block[data-exercise-id="${exerciseId}"]`);
  if (!exDiv) return;

  const setsContainer = exDiv.querySelector('.active-sets-list');
  if (!setsContainer) return;

  const currentSetsCount = setsContainer.children.length;
  const lastSets = getLastPerformance(exerciseId);
  let lastInfo = '-';
  if (lastSets && lastSets[currentSetsCount]) {
    lastInfo = `${lastSets[currentSetsCount].weight}kg × ${lastSets[currentSetsCount].reps}`;
  }

  setsContainer.appendChild(createActiveSetRow(currentSetsCount + 1, "", "", lastInfo));
  updateActiveSetRowsUI(setsContainer);
  checkWorkoutCompletionState();
}

/**
 * Werkt de nummers bij en plaatst ENKEL op de laatste set een min-knopje.
 */
function updateActiveSetRowsUI(setsContainer) {
  const rows = Array.from(setsContainer.children);

  rows.forEach((row, idx) => {
    const label = row.querySelector('.set-label');
    if (label) label.innerText = idx + 1;

    const actionCell = row.querySelector('.set-action-cell');
    if (actionCell) {
      actionCell.innerHTML = '';

      if (idx === rows.length - 1 && rows.length > 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText = 'width: 34px; height: 32px; border-radius: 8px; background: transparent; border: 1px solid rgba(255, 69, 58, 0.5); color: var(--danger); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer; transition: var(--transition); box-sizing: border-box;';
        btn.title = 'Set verwijderen';
        btn.innerHTML = '<i class="fa-solid fa-minus"></i>';
        btn.onclick = (e) => {
          e.stopPropagation();
          row.remove();
          updateActiveSetRowsUI(setsContainer);
          checkWorkoutCompletionState();
        };
        actionCell.appendChild(btn);
      }
    }
  });
}

/**
 * Start een workout op basis van een template ID.
 */
export function startWorkoutFromTemplate(templateId, onRenderTemplates) {
  const template = getTemplates().find(t => t.id === templateId);
  if (!template) return;

  state.activeWorkout.template = template;
  state.activeWorkout.templateId = templateId;

  if (!state.activeWorkout.isTimerRunning) startWorkoutTimer(templateId);

  const activeCard = document.getElementById('activeWorkoutCard');
  const templatesList = document.getElementById('templatesList');

  if (templatesList) templatesList.style.display = 'none';
  if (activeCard) activeCard.style.display = 'block';

  const activeTitle = document.getElementById('activeWorkoutTitle');
  if (activeTitle) activeTitle.innerText = template.name;

  updateTimerUI();

  const timerBox = document.querySelector('.timer-display-box');
  if (timerBox) {
    timerBox.style.cursor = 'pointer';
    timerBox.onclick = togglePauseWorkoutTimer;

    Array.from(timerBox.children).forEach(child => {
      child.style.pointerEvents = 'none';
    });
  }

  const pauseBtn = document.getElementById('activeWorkoutPauseBtn');
  if (pauseBtn) {
    pauseBtn.onclick = togglePauseWorkoutTimer;
  }

  const finishBtn = document.getElementById('activeWorkoutFinishBtn');
  if (finishBtn) {
    finishBtn.onclick = () => {
      const allCheckBtns = document.querySelectorAll('#activeExercisesContainer .btn-check-set');
      const completedCheckBtns = document.querySelectorAll('#activeExercisesContainer .btn-check-set.completed');

      if (allCheckBtns.length === 0 || allCheckBtns.length !== completedCheckBtns.length) {
        showNotFinishedModal();
      } else {
        finishWorkout(onRenderTemplates);
      }
    };
  }

  const cancelBtn = document.getElementById('activeWorkoutCancelBtn');
  if (cancelBtn) cancelBtn.onclick = () => cancelActiveWorkout(onRenderTemplates);

  const container = document.getElementById('activeExercisesContainer');
  if (!container) return;
  container.innerHTML = '';

  template.exercises.forEach(ex => {
    const exObj = findExerciseById(ex.exerciseId);
    const exName = exObj ? exObj.name : ex.exerciseId;
    const catStr = exObj ? (Array.isArray(exObj.category) ? exObj.category.join(', ') : exObj.category) : '';
    const lastSets = getLastPerformance(ex.exerciseId);

    const exDiv = document.createElement('div');
    exDiv.className = 'active-exercise-block';
    exDiv.dataset.exerciseId = ex.exerciseId;
    exDiv.style.cssText = 'background: rgba(255, 255, 255, 0.02); border: 1px solid var(--glass-border); border-radius: 14px; padding: 14px; margin-bottom: 14px;';

    const setsContainer = document.createElement('div');
    setsContainer.className = 'active-sets-list';

    ex.sets.forEach((s, idx) => {
      let lastInfo = '-';
      if (lastSets && lastSets[idx]) {
        lastInfo = `${lastSets[idx].weight}kg × ${lastSets[idx].reps}`;
      }
      setsContainer.appendChild(createActiveSetRow(idx + 1, s.weight, s.reps, lastInfo, false));
    });

    const videoBtnHTML = exObj && exObj.videoUrl ? `
      <div style="margin-top: 10px;">
        <a href="${exObj.videoUrl}" target="_blank" rel="noopener noreferrer" class="outline" style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; font-size: 0.78rem; text-decoration: none; border-radius: 8px;">
          <i class="fa-solid fa-play"></i> Video
        </a>
      </div>
    ` : '';

    exDiv.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <h4 style="margin:0; color:var(--white); font-size: 1.05rem; font-weight:700;">${exName}</h4>
          ${exObj ? `
            <button type="button" class="btn-ex-info" style="background: transparent; border: 1px solid var(--glass-border); color: var(--gold-accent); font-size: 0.75rem; padding: 3px 10px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-circle-info"></i> Info
            </button>
          ` : ''}
        </div>
        
        <button type="button" class="btn-remove-active-ex" title="Oefening verwijderen" style="background: transparent; border: 1px solid rgba(255, 69, 58, 0.4); color: var(--danger); font-size: 0.75rem; font-weight: 600; padding: 3px 8px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition);">
          <i class="fa-solid fa-minus"></i>
        </button>
      </div>

      <div class="active-ex-info-box" style="display: none; background: rgba(255, 159, 10, 0.06); border: 1px solid rgba(255, 159, 10, 0.2); border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">
        <div style="margin-bottom: 6px;">
          <span class="exercise-badge" style="font-size: 0.72rem; padding: 3px 8px; background: rgba(255, 159, 10, 0.12); border: 1px solid rgba(255, 159, 10, 0.3); color: var(--gold-accent); font-weight: 600; border-radius: 6px; display: inline-block;">${catStr}</span>
        </div>
        <div>${exObj ? (exObj.instructions || 'Geen specifieke instructies beschikbaar voor deze oefening.') : ''}</div>
        ${videoBtnHTML}
      </div>
      
      <div class="active-set-header" style="display: grid; grid-template-columns: 28px 1fr 1fr 1fr 34px 34px; gap: 6px; align-items: center; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-align: center;">
        <span>SET</span>
        <span>KG</span>
        <span>REPS</span>
        <span>VORIGE</span>
        <span></span>
        <span></span>
      </div>
    `;

    const infoBtn = exDiv.querySelector('.btn-ex-info');
    const infoBox = exDiv.querySelector('.active-ex-info-box');

    if (infoBtn && infoBox) {
      infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = infoBox.style.display === 'none';
        infoBox.style.display = isHidden ? 'block' : 'none';
      });
    }

    exDiv.querySelector('.btn-remove-active-ex').onclick = (e) => {
      e.stopPropagation();
      exDiv.remove();
      checkWorkoutCompletionState();
    };

    exDiv.appendChild(setsContainer);
    updateActiveSetRowsUI(setsContainer);

    const addSetBtn = document.createElement('button');
    addSetBtn.type = 'button';
    addSetBtn.style.cssText = 'background: transparent; border: 1px solid var(--gold-accent); color: var(--gold-accent); font-size: 0.78rem; font-weight: 600; padding: 4px 10px; border-radius: 8px; cursor: pointer; margin-top: 8px; transition: var(--transition);';
    addSetBtn.innerText = '+ Set';
    addSetBtn.onclick = () => addSetToActiveExercise(ex.exerciseId);

    exDiv.appendChild(addSetBtn);
    container.appendChild(exDiv);
  });

  checkWorkoutCompletionState();
  activeCard?.scrollIntoView({ behavior: 'smooth' });
}

function showNotFinishedModal() {
  const modal = document.getElementById('workoutNotFinishedModal');
  const closeBtn = document.getElementById('closeWorkoutNotFinishedBtn');

  if (modal) modal.style.display = 'flex';
  if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
}

/**
 * Toont de persoonlijke succesmodal zonder feestmutsen.
 */
function showSuccessModal(durationText, workoutName, onClosed) {
  const modal = document.getElementById('workoutSuccessModal');
  const titleEl = document.getElementById('workoutSuccessUserTitle');
  const textEl = document.getElementById('workoutSuccessMessageText');
  const closeBtn = document.getElementById('closeWorkoutSuccessBtn');

  const userFirstName = state.currentUser?.firstName || 'Sporter';

  if (titleEl) titleEl.innerText = `Sterk werk, ${userFirstName}!`;
  if (textEl) textEl.innerText = `Je hebt ${workoutName} in ${durationText} afgerond. Weer een stap dichter bij je doel!`;

  if (modal) modal.style.display = 'flex';

  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = 'none';
      if (typeof onClosed === 'function') onClosed();
    };
  }
}

function showCustomConfirm(title, text, onConfirm) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!modal) return;

  if (titleEl) titleEl.innerText = title;
  if (textEl) textEl.innerText = text;

  modal.style.display = 'flex';

  cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };

  okBtn.onclick = () => {
    modal.style.display = 'none';
    if (typeof onConfirm === 'function') onConfirm();
  };
}

/**
 * Maakt een enkele compacte set-rij aan.
 */
function createActiveSetRow(setNum, weight, reps, lastInfo, completed = false) {
  const row = document.createElement('div');
  row.className = 'active-set-row-grid';
  row.style.cssText = 'display: grid; grid-template-columns: 28px 1fr 1fr 1fr 34px 34px; gap: 6px; align-items: center; margin-bottom: 8px;';

  row.innerHTML = `
    <span class="set-label" style="text-align: center; font-size: 0.82rem; font-weight: 700; color: var(--text-muted);">${setNum}</span>
    <input type="number" class="act-weight" value="${weight}" placeholder="0" min="0" style="width: 100%; padding: 8px 2px; background: var(--bg-input); border: 1px solid var(--glass-border); color: #fff; border-radius: 8px; text-align: center; font-size: 0.88rem; font-weight: 600; outline: none;">
    <input type="number" class="act-reps" value="${reps}" placeholder="0" min="0" style="width: 100%; padding: 8px 2px; background: var(--bg-input); border: 1px solid var(--glass-border); color: #fff; border-radius: 8px; text-align: center; font-size: 0.88rem; font-weight: 600; outline: none;">
    <span class="last-perf-compact" style="text-align: center; font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${lastInfo}</span>
    
    <button type="button" class="btn-check-set ${completed ? 'completed' : ''}" style="height: 32px; width: 34px; border-radius: 8px; background: ${completed ? 'var(--gold-accent)' : 'rgba(255, 255, 255, 0.05)'}; border: 1px solid ${completed ? 'var(--gold-accent)' : 'var(--glass-border)'}; color: ${completed ? '#000' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition);">
      <i class="fa-solid fa-check" style="font-size: 0.8rem;"></i>
    </button>

    <div class="set-action-cell" style="display: flex; justify-content: center; align-items: center;"></div>
  `;

  const checkBtn = row.querySelector('.btn-check-set');
  checkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isDone = checkBtn.classList.toggle('completed');
    if (isDone) {
      checkBtn.style.background = 'var(--gold-accent)';
      checkBtn.style.color = '#000';
      checkBtn.style.borderColor = 'var(--gold-accent)';
    } else {
      checkBtn.style.background = 'rgba(255, 255, 255, 0.05)';
      checkBtn.style.color = 'var(--text-muted)';
      checkBtn.style.borderColor = 'var(--glass-border)';
    }

    checkWorkoutCompletionState();
  });

  return row;
}

/**
 * Voltooit de actieve workout.
 */
export function finishWorkout(onRenderTemplates) {
  const blocks = document.querySelectorAll('.active-exercise-block');
  let loggedExercises = [];

  blocks.forEach(block => {
    const exId = block.dataset.exerciseId;
    const weights = block.querySelectorAll('.act-weight');
    const reps = block.querySelectorAll('.act-reps');
    const checkBtns = block.querySelectorAll('.btn-check-set');
    let sets = [];

    weights.forEach((wInput, i) => {
      sets.push({
        weight: parseFloat(wInput.value) || 0,
        reps: parseInt(reps[i].value) || 0,
        completed: checkBtns[i].classList.contains('completed')
      });
    });

    loggedExercises.push({ exerciseId: exId, sets });
  });

  const formattedDuration = formatTimerTime(state.activeWorkout.timerSeconds);
  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const workoutName = state.activeWorkout.template ? state.activeWorkout.template.name : 'Workout';

  const completedWorkout = {
    id: generateUniqueId(),
    userEmail: state.currentUser.email,
    workoutName: workoutName,
    date: now.toLocaleDateString('nl-NL'),
    timeString,
    timestamp: now.getTime(),
    duration: formattedDuration,
    exercises: loggedExercises
  };

  let history = getWorkoutsHistory();
  history.unshift(completedWorkout);
  saveWorkoutsHistory(history);

  showSuccessModal(formattedDuration, workoutName, () => {
    stopAndResetWorkoutUI(onRenderTemplates);
  });
}