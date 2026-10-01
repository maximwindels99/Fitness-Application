// ==========================================================================
// COACH PROGRESS MODULE
// Voortgangsgrafieken, 1RM berekeningen en historie per sporter (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getWorkoutsHistory } from '../core/storage.js';
import { calculate1RM } from '../core/utils.js';
import { getFullExerciseDatabase, findExerciseById } from '../data/exercisesData.js';

let coachChartInstance = null;

/**
 * Rendert de afgeronde workout-historie van de geselecteerde sporter.
 */
export function renderCoachClientHistory() {
  const container = document.getElementById('coachClientHistoryList');
  if (!container || !state.selectedClientEmail) return;

  const history = getWorkoutsHistory();
  const clientHistory = history.filter(h => h.userEmail === state.selectedClientEmail);
  clientHistory.sort((a, b) => (b.timestamp || b.id) - (a.timestamp || a.id));

  if (clientHistory.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 35px 15px;">
        <i class="fa-solid fa-clock-rotate-left" style="font-size: 2.2rem; color: var(--gold-accent); margin-bottom: 12px; display: block; opacity: 0.8;"></i>
        <h4 style="margin: 0 0 6px 0; color: var(--white); font-size: 1rem;">Geen Workout Historie</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; max-width: 280px; margin: 0 auto; line-height: 1.4;">
          Deze sporter heeft nog geen afgeronde workouts gelogd.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  const visible = clientHistory.slice(0, state.currentCoachHistoryLimit || 3);

  visible.forEach(h => {
    const item = document.createElement('div');
    item.className = 'workout-item card-glass';

    let detailsHTML = '';
    h.exercises.forEach((ex, exIdx) => {
      const exObj = findExerciseById(ex.exerciseId);
      const exName = exObj ? exObj.name : ex.exerciseId;
      
      let setsLines = ex.sets.map((s, i) => 
        `<div style="font-size: 0.82rem; color: var(--text-muted); padding-left: 10px; margin-top: 2px;">${i + 1} - ${s.weight}kg - ${s.reps} reps</div>`
      ).join('');

      const marginTop = exIdx > 0 ? 'margin-top: 10px;' : '';
      detailsHTML += `
        <div style="${marginTop}">
          <strong style="color: var(--white); font-size: 0.9rem; display: block;">${exName}</strong>
          ${setsLines}
        </div>
      `;
    });

    const durationInfo = h.duration ? `<span style="font-size:0.85rem; color:var(--gold-accent); font-weight:700;"><i class="fa-regular fa-clock"></i> ${h.duration}</span>` : '';

    item.innerHTML = `
      <div style="margin-bottom: 8px;">
        <h3 style="margin: 0; font-size: 1.1rem; color: var(--white);">${h.workoutName}</h3>
      </div>
      <div class="coach-history-details-container" style="display: none; margin-bottom: 10px; padding-top: 8px; border-top: 1px solid var(--glass-border);">${detailsHTML}</div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
        <div style="display: flex; gap: 12px; align-items: center;">${durationInfo}<span style="font-size: 0.85rem; font-weight: 700; color: var(--gold-accent);">${h.date}</span></div>
        <button type="button" class="btn-action-icon secondary btn-toggle-coach-det" title="Bekijk details"><i class="fa-solid fa-eye"></i></button>
      </div>
    `;

    item.querySelector('.btn-toggle-coach-det').addEventListener('click', (e) => {
      e.stopPropagation();
      const det = item.querySelector('.coach-history-details-container');
      const isHidden = det.style.display === 'none';
      det.style.display = isHidden ? 'block' : 'none';
      e.currentTarget.innerHTML = isHidden ? '<i class="fa-solid fa-chevron-up"></i>' : '<i class="fa-solid fa-eye"></i>';
    });

    container.appendChild(item);
  });

  if ((state.currentCoachHistoryLimit || 3) < clientHistory.length) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'outline';
    loadMoreBtn.type = 'button';
    loadMoreBtn.style.cssText = 'margin-top: 12px; margin-bottom: 8px; font-weight: 700;';
    loadMoreBtn.innerText = 'Zie Meer Workouts (+5)';
    loadMoreBtn.onclick = (e) => {
      e.stopPropagation();
      state.currentCoachHistoryLimit = (state.currentCoachHistoryLimit || 3) + 5;
      renderCoachClientHistory();
    };
    container.appendChild(loadMoreBtn);
  }
}

/**
 * Rendert de voortgangsgrafiek van de geselecteerde sporter.
 */
export function updateCoachProgressChart() {
  const container = document.getElementById('coachClientChartView');
  if (!container || !state.selectedClientEmail) return;

  const history = getWorkoutsHistory();
  const clientHistory = history.filter(h => h.userEmail === state.selectedClientEmail);

  let performedExerciseIds = new Set();
  clientHistory.forEach(workout => {
    workout.exercises.forEach(ex => {
      if (ex.sets && ex.sets.some(s => s.weight > 0 || s.reps > 0)) {
        performedExerciseIds.add(ex.exerciseId);
      }
    });
  });

  if (performedExerciseIds.size === 0) {
    container.innerHTML = `
      <div class="card card-glass">
        <h3 style="margin-bottom: 15px;">Progressie Per Oefening</h3>
        <div style="text-align: center; padding: 35px 15px;">
          <i class="fa-solid fa-chart-line" style="font-size: 2.2rem; color: var(--gold-accent); margin-bottom: 12px; display: block; opacity: 0.8;"></i>
          <h4 style="margin: 0 0 6px 0; color: var(--white); font-size: 1rem;">Geen Progressie Data</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; max-width: 280px; margin: 0 auto; line-height: 1.4;">
            Deze sporter heeft nog geen gewichten of herhalingen gelogd voor oefeningen.
          </p>
        </div>
      </div>
    `;
    return;
  }

  if (!document.getElementById('coachProgressChart')) {
    container.innerHTML = `
      <div class="card card-glass">
        <h3>Progressie Per Oefening</h3>
        <label for="coachProgressExerciseSelect">Selecteer een oefening:</label>
        <select id="coachProgressExerciseSelect"></select>

        <div class="stats-summary-grid">
          <div id="coachProgressPRBox" class="stat-box-fine clickable active" onclick="setCoachProgressMetric('weight', event)">
            <span class="stat-label-fine">MAX GEWICHT</span>
            <strong id="coachProgressPRDisplay" class="stat-value-fine gold">-</strong>
          </div>
          <div id="coachProgress1RMBox" class="stat-box-fine clickable" onclick="setCoachProgressMetric('oneRM', event)">
            <span class="stat-label-fine">1RM MAX</span>
            <strong id="coachProgress1RMDisplay" class="stat-value-fine gold">-</strong>
          </div>
        </div>

        <div class="chart-container-box">
          <canvas id="coachProgressChart"></canvas>
        </div>
      </div>
    `;
  }

  const select = document.getElementById('coachProgressExerciseSelect');
  const availableExercises = getFullExerciseDatabase().filter(ex => performedExerciseIds.has(ex.id));
  availableExercises.sort((a, b) => a.name.localeCompare(b.name));

  const currentSelection = select.value || (availableExercises[0] ? availableExercises[0].id : "");

  select.innerHTML = '';
  availableExercises.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex.id;
    opt.textContent = `${ex.name} (${ex.category})`;
    if (ex.id === currentSelection) opt.selected = true;
    select.appendChild(opt);
  });

  select.onchange = () => renderCoachChartData(clientHistory);
  renderCoachChartData(clientHistory);
}

function renderCoachChartData(clientHistory) {
  const canvas = document.getElementById('coachProgressChart');
  const select = document.getElementById('coachProgressExerciseSelect');
  if (!canvas || !select || !select.value) return;

  const selectedExId = select.value;
  let chartPoints = [];
  let maxWeightOverall = 0;
  let max1RMOverall = 0;

  clientHistory.forEach(workout => {
    const matchEx = workout.exercises.find(e => e.exerciseId === selectedExId);
    if (matchEx && matchEx.sets) {
      let maxSetWeight = 0;
      let maxSet1RM = 0;

      matchEx.sets.forEach(s => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps) || 0;
        if (w > maxSetWeight) maxSetWeight = w;

        const est1RM = calculate1RM(w, r);
        if (est1RM > maxSet1RM) maxSet1RM = est1RM;
      });

      if (maxSetWeight > maxWeightOverall) maxWeightOverall = maxSetWeight;
      if (maxSet1RM > max1RMOverall) max1RMOverall = maxSet1RM;

      if (maxSetWeight > 0) {
        chartPoints.push({
          date: workout.date,
          weight: maxSetWeight,
          oneRM: maxSet1RM,
          timestamp: workout.timestamp || 0
        });
      }
    }
  });

  const prDisp = document.getElementById('coachProgressPRDisplay');
  const oneRmDisp = document.getElementById('coachProgress1RMDisplay');
  if (prDisp) prDisp.innerText = maxWeightOverall > 0 ? `${maxWeightOverall} kg` : '-';
  if (oneRmDisp) oneRmDisp.innerText = max1RMOverall > 0 ? `${max1RMOverall} kg` : '-';

  chartPoints.sort((a, b) => a.timestamp - b.timestamp);

  const ctx = canvas.getContext('2d');
  if (coachChartInstance) coachChartInstance.destroy();

  const metric = state.coachProgressMetric || 'weight';
  const labels = chartPoints.map(p => p.date);
  const dataValues = chartPoints.map(p => metric === 'weight' ? p.weight : p.oneRM);

  coachChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: metric === 'weight' ? 'Max Gewicht (kg)' : '1RM Max (kg)',
        data: dataValues,
        borderColor: '#FCA311',
        backgroundColor: 'rgba(252, 163, 17, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#FCA311',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#9aa8c3' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
        y: { ticks: { color: '#9aa8c3' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
      }
    }
  });
}

export function setCoachProgressMetric(metric, event) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  state.coachProgressMetric = metric;

  document.getElementById('coachProgressPRBox')?.classList.toggle('active', metric === 'weight');
  document.getElementById('coachProgress1RMBox')?.classList.toggle('active', metric === 'oneRM');

  updateCoachProgressChart();
}