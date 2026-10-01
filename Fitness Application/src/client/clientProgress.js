// ==========================================================================
// CLIENT PROGRESS MODULE
// Beheert de Chart.js grafiek, filters en lege staat voor sporters (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getWorkoutsHistory } from '../core/storage.js';
import { calculate1RM } from '../core/utils.js';
import { getFullExerciseDatabase } from '../data/exercisesData.js';

let clientChartInstance = null;

/**
 * Update de progressiekaart en chart op basis van afgeronde workouts.
 */
export function updateProgressChart() {
  const container = document.getElementById('tabProgress');
  if (!container || !state.currentUser) return;

  const card = container.querySelector('.progress-card');
  if (!card) return;

  const history = getWorkoutsHistory();
  const userHistory = history.filter(h => h.userEmail === state.currentUser.email);

  let performedExerciseIds = new Set();
  userHistory.forEach(workout => {
    workout.exercises.forEach(ex => {
      if (ex.sets && ex.sets.some(s => s.weight > 0 || s.reps > 0)) {
        performedExerciseIds.add(ex.exerciseId);
      }
    });
  });

  if (performedExerciseIds.size === 0) {
    card.className = 'card empty-state-card';
    card.innerHTML = `
      <div class="empty-state-icon">
        <i class="fa-solid fa-chart-line"></i>
      </div>
      <h4 style="margin: 0 0 6px 0; color: var(--white); font-size: 1.1rem; font-weight: 700;">Nog Geen Progressie Data</h4>
      <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0; max-width: 280px; line-height: 1.4;">
        Voltooi je eerste workout en log je gewichten om hier je krachtsopbouw en grafieken in te zien!
      </p>
    `;
    return;
  }

  card.className = 'card progress-card';

  if (!document.getElementById('progressChart')) {
    card.innerHTML = `
      <h3 style="margin-top: 0; color: #fff; font-size: 1.1rem; font-weight: 700;">Progressie Per Oefening</h3>
      <label for="progressExerciseSelect" style="display: block; margin: 10px 0 6px 0; font-size: 0.82rem; color: var(--text-muted);">Selecteer een oefening:</label>
      <select id="progressExerciseSelect" class="auth-select" style="margin-bottom: 15px;"></select>

      <div class="stats-summary-grid" style="display: flex; gap: 10px; margin-bottom: 15px;">
        <div id="clientProgressPRBox" class="stat-box-fine clickable active" onclick="setClientProgressMetric('weight', event)" style="flex: 1; background: var(--bg-input); padding: 10px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center; cursor: pointer;">
          <span class="stat-label-fine" style="display: block; font-size: 0.72rem; color: var(--text-muted);">MAX GEWICHT</span>
          <strong id="progressPRDisplay" class="stat-value-fine gold" style="font-size: 1.1rem; color: var(--gold-accent);">-</strong>
        </div>
        <div id="clientProgress1RMBox" class="stat-box-fine clickable" onclick="setClientProgressMetric('oneRM', event)" style="flex: 1; background: var(--bg-input); padding: 10px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center; cursor: pointer;">
          <span class="stat-label-fine" style="display: block; font-size: 0.72rem; color: var(--text-muted);">1RM MAX</span>
          <strong id="progress1RMDisplay" class="stat-value-fine gold" style="font-size: 1.1rem; color: var(--gold-accent);">-</strong>
        </div>
      </div>

      <div class="chart-container-box" style="height: 220px; width: 100%;">
        <canvas id="progressChart"></canvas>
      </div>
    `;
  }

  const select = document.getElementById('progressExerciseSelect');
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

  select.onchange = () => renderClientChartData(userHistory);
  renderClientChartData(userHistory);
}

function renderClientChartData(userHistory) {
  const canvas = document.getElementById('progressChart');
  const select = document.getElementById('progressExerciseSelect');
  if (!canvas || !select || !select.value) return;

  const selectedExId = select.value;
  let chartPoints = [];
  let maxWeightOverall = 0;
  let max1RMOverall = 0;

  userHistory.forEach(workout => {
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

  const prDisp = document.getElementById('progressPRDisplay');
  const oneRmDisp = document.getElementById('progress1RMDisplay');
  if (prDisp) prDisp.innerText = maxWeightOverall > 0 ? `${maxWeightOverall} kg` : '-';
  if (oneRmDisp) oneRmDisp.innerText = max1RMOverall > 0 ? `${max1RMOverall} kg` : '-';

  chartPoints.sort((a, b) => a.timestamp - b.timestamp);

  const ctx = canvas.getContext('2d');
  if (clientChartInstance) clientChartInstance.destroy();

  const metric = state.clientProgressMetric || 'weight';
  const labels = chartPoints.map(p => p.date);
  const dataValues = chartPoints.map(p => metric === 'weight' ? p.weight : p.oneRM);

  clientChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: metric === 'weight' ? 'Max Gewicht (kg)' : '1RM Max (kg)',
        data: dataValues,
        borderColor: '#FF9F0A',
        backgroundColor: 'rgba(255, 159, 10, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#FF9F0A',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#8E8E93' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
        y: { ticks: { color: '#8E8E93' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
      }
    }
  });
}

export function setClientProgressMetric(metric, event) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  state.clientProgressMetric = metric;

  document.getElementById('clientProgressPRBox')?.classList.toggle('active', metric === 'weight');
  document.getElementById('clientProgress1RMBox')?.classList.toggle('active', metric === 'oneRM');

  updateProgressChart();
}

export function setProgressFilter(filter, btn, event) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  document.querySelectorAll('.progress-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  state.clientProgressFilter = filter;
  updateProgressChart();
}