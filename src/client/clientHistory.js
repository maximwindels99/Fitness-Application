// ==========================================================================
// CLIENT HISTORY MODULE
// Beheert workout-historie en bewerkings-modal voor sporters (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getWorkoutsHistory, saveWorkoutsHistory } from '../core/storage.js';
import { findExerciseById } from '../data/exercisesData.js';

let currentHistoryLimit = 3;

/**
 * Rendert de historie van afgeronde workouts voor de ingelogde sporter.
 */
export function renderHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;

  const history = getWorkoutsHistory();
  const userHistory = history.filter(h => h.userEmail === state.currentUser?.email);
  userHistory.sort((a, b) => (b.timestamp || b.id) - (a.timestamp || a.id));

  if (userHistory.length === 0) {
    container.innerHTML = `
      <div class="card empty-state-card">
        <div class="empty-state-icon">
          <i class="fa-solid fa-clock-rotate-left"></i>
        </div>
        <h4 style="margin: 0 0 6px 0; color: var(--white); font-size: 1.1rem; font-weight: 700;">Nog Geen Afgeronde Workouts</h4>
        <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0; max-width: 280px; line-height: 1.4;">
          Nog geen afgeronde workouts. Voltooi je eerste workout om hier je geschiedenis te zien.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  const visibleHistory = userHistory.slice(0, currentHistoryLimit);

  visibleHistory.forEach(h => {
    const item = document.createElement('div');
    item.className = 'workout-item card';
    item.style.cssText = 'margin-bottom: 12px; overflow: hidden;';

    let detailsHTML = '';
    h.exercises.forEach((ex, exIndex) => {
      const exObj = findExerciseById(ex.exerciseId);
      const exName = exObj ? exObj.name : ex.exerciseId;
      
      let setsLines = ex.sets.map((s, i) => 
        `<div style="font-size: 0.82rem; color: var(--text-muted); padding-left: 10px; margin-top: 2px;">Set ${i + 1}: ${s.weight}kg - ${s.reps} reps</div>`
      ).join('');

      const marginTop = exIndex > 0 ? 'margin-top: 12px;' : '';
      detailsHTML += `
        <div style="${marginTop}">
          <strong style="color: var(--white); font-size: 0.92rem; display: block;">${exName}</strong>
          ${setsLines}
        </div>
      `;
    });

    const durationInfo = h.duration ? `<span style="font-size:0.85rem; color:var(--gold-accent); font-weight:700;"><i class="fa-regular fa-clock" style="margin-right: 4px;"></i>${h.duration}</span>` : '';

    item.innerHTML = `
      <div style="margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 1.15rem; color: var(--white); width: 100%;">${h.workoutName}</h3>
      </div>

      <!-- DETAILS CONTAINER (INKLAPBAAR) -->
      <div class="client-history-details-container" style="display: none; margin-bottom: 12px; padding-top: 10px; border-top: 1px solid var(--glass-border);">${detailsHTML}</div>

      <!-- ACTIERIJ: OOGJE VAST + UNIVERSELE SMOOTH UITSCHUIFTOGGLE -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
        <div style="display: flex; gap: 12px; align-items: center;">
          ${durationInfo}
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--gold-accent);">${h.date}</span>
        </div>

        <div class="card-action-bar" style="width: auto; gap: 6px;">
          <!-- OOGJE VAST GEPLAATST -->
          <button type="button" class="btn-action-icon secondary btn-toggle-det" title="Bekijk details">
            <i class="fa-solid fa-eye"></i>
          </button>

          <!-- UITSCHUIFLADE VOOR BEWERKEN EN SUBTIEL VERWIJDEREN -->
          <div class="sliding-actions-drawer">
            <button type="button" class="btn-action-icon secondary btn-edit-hist" title="Bewerken">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn-action-icon btn-delete-tmpl-subtle btn-delete-hist" title="Verwijderen">
              <i class="fa-solid fa-minus"></i>
            </button>
          </div>

          <!-- UNIVERSELE OPTIES TOGGLE (3 PUNTJES EN ROTATIE) -->
          <button type="button" class="btn-action-icon secondary btn-actions-toggle btn-history-actions-toggle" title="Opties">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>
    `;

    // TOGGLE EVENT VOOR HET SMOOTH UITSCHUIVEN VAN DE LADE
    const toggleBtn = item.querySelector('.btn-history-actions-toggle');
    const drawer = item.querySelector('.sliding-actions-drawer');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.contains('open');
      
      // Sluit eventueel andere geopende lades
      document.querySelectorAll('.sliding-actions-drawer.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.btn-actions-toggle.active').forEach(b => b.classList.remove('active'));

      if (!isOpen) {
        drawer.classList.add('open');
        toggleBtn.classList.add('active'); // Zorgt voor de $90^\circ$ rotatie en oranje kleur
      }
    });

    item.querySelector('.btn-toggle-det').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleClientHistoryDetails(e.currentTarget);
    });

    item.querySelector('.btn-edit-hist').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditHistoryModal(h.id);
    });

    item.querySelector('.btn-delete-hist').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteHistoryItem(h.id);
    });

    container.appendChild(item);
  });

  if (currentHistoryLimit < userHistory.length) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'outline';
    loadMoreBtn.type = 'button';
    loadMoreBtn.style.cssText = 'margin-top: 15px; margin-bottom: 10px; font-weight: 700; width: 100%; border-radius: var(--pill-radius);';
    loadMoreBtn.innerText = `Zie Meer Workouts (+${userHistory.length - currentHistoryLimit})`;
    loadMoreBtn.onclick = (e) => {
      e.stopPropagation();
      currentHistoryLimit += 5;
      renderHistory();
    };
    container.appendChild(loadMoreBtn);
  }

  // Klik buiten de lade sluit geopende opties automatisch
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.card-action-bar')) {
      document.querySelectorAll('.sliding-actions-drawer.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.btn-actions-toggle.active').forEach(b => b.classList.remove('active'));
    }
  });
}

export function toggleClientHistoryDetails(btn) {
  const item = btn.closest('.workout-item');
  if (!item) return;
  const details = item.querySelector('.client-history-details-container');
  if (!details) return;
  const isHidden = details.style.display === 'none';
  details.style.display = isHidden ? 'block' : 'none';
  btn.innerHTML = isHidden ? '<i class="fa-solid fa-chevron-up"></i>' : '<i class="fa-solid fa-eye"></i>';
}

export function openEditHistoryModal(id) {
  const history = getWorkoutsHistory();
  const workout = history.find(h => h.id === id);
  if (!workout) return;

  document.getElementById('editHistoryId').value = workout.id;
  document.getElementById('editHistoryTitle').innerText = workout.workoutName;
  document.getElementById('editHistoryDateDisplay').innerText = workout.date;

  const container = document.getElementById('editHistoryExercisesContainer');
  container.innerHTML = '';

  workout.exercises.forEach((ex) => {
    const exObj = findExerciseById(ex.exerciseId);
    const exName = exObj ? exObj.name : ex.exerciseId;

    const block = document.createElement('div');
    block.className = 'template-exercise-item';
    block.dataset.exId = ex.exerciseId;

    let setsRows = '';
    ex.sets.forEach((s, sIdx) => {
      setsRows += `
        <div class="tmpl-set-row-grid" style="display: grid; grid-template-columns: 35px 1fr 1fr; gap: 6px; align-items: center; margin-bottom: 6px;">
          <span class="set-label">${sIdx + 1}</span>
          <input type="number" class="edit-hist-weight" value="${s.weight}" min="0" placeholder="kg" style="padding: 8px; background: var(--bg-input); border: 1px solid var(--glass-border); color: #fff; border-radius: 6px; text-align: center;">
          <input type="number" class="edit-hist-reps" value="${s.reps}" min="0" placeholder="reps" style="padding: 8px; background: var(--bg-input); border: 1px solid var(--glass-border); color: #fff; border-radius: 6px; text-align: center;">
        </div>
      `;
    });

    block.innerHTML = `
      <h4 style="margin: 0 0 10px 0; color: var(--gold-accent); font-size: 0.95rem;">${exName}</h4>
      <div class="tmpl-sets-header" style="display: grid; grid-template-columns: 35px 1fr 1fr; gap: 6px; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px; text-align: center;"><span>SET</span><span>KG</span><span>REPS</span></div>
      <div class="edit-hist-sets-container">${setsRows}</div>
    `;

    container.appendChild(block);
  });

  document.getElementById('editHistoryModal').style.display = 'flex';
}

export function saveHistoryEdits(onSavedCallback) {
  const id = document.getElementById('editHistoryId').value;
  let history = getWorkoutsHistory();
  const workoutIndex = history.findIndex(h => h.id == id);

  if (workoutIndex === -1) return;

  const container = document.getElementById('editHistoryExercisesContainer');
  const exBlocks = container.querySelectorAll('.template-exercise-item');

  let updatedExercises = [];

  exBlocks.forEach(block => {
    const exerciseId = block.dataset.exId;
    const weights = block.querySelectorAll('.edit-hist-weight');
    const reps = block.querySelectorAll('.edit-hist-reps');

    let sets = [];
    weights.forEach((wInput, idx) => {
      sets.push({
        weight: parseFloat(wInput.value) || 0,
        reps: parseInt(reps[idx].value) || 0
      });
    });

    updatedExercises.push({ exerciseId, sets });
  });

  history[workoutIndex].exercises = updatedExercises;
  saveWorkoutsHistory(history);

  closeEditHistoryModal();
  renderHistory();
  if (typeof onSavedCallback === 'function') onSavedCallback();
}

export function closeEditHistoryModal() {
  document.getElementById('editHistoryModal').style.display = 'none';
}

export function deleteHistoryItem(id) {
  showCustomConfirm("Workout Verwijderen", "Weet je zeker dat je deze afgeronde workout wilt verwijderen uit je historie?", () => {
    let history = getWorkoutsHistory().filter(h => h.id !== id);
    saveWorkoutsHistory(history);
    renderHistory();
  });
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