// ==========================================================================
// CLIENT PROGRESS MODULE
// Beheert de Chart.js grafiek, custom dropdown, filters, tijdlijnen (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getWorkoutsHistory } from '../core/storage.js';
import { calculate1RM } from '../core/utils.js';
import { getFullExerciseDatabase } from '../data/exercisesData.js';

let clientChartInstance = null;

/**
 * Zet een datumstring (YYYY-MM-DD of DD-MM-YYYY) veilig om naar DD/MM formaat
 */
function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) { // YYYY-MM-DD
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}`;
    } else { // DD-MM-YYYY
      return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`;
    }
  }
  return dateStr;
}

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
      if (ex.sets && ex.sets.some(s => parseFloat(s.weight) > 0 || parseInt(s.reps) > 0)) {
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

  const availableExercises = getFullExerciseDatabase().filter(ex => performedExerciseIds.has(ex.id));
  availableExercises.sort((a, b) => a.name.localeCompare(b.name));

  if (!state.selectedProgressExerciseId || !performedExerciseIds.has(state.selectedProgressExerciseId)) {
    state.selectedProgressExerciseId = availableExercises[0] ? availableExercises[0].id : "";
  }

  const selectedEx = availableExercises.find(e => e.id === state.selectedProgressExerciseId) || availableExercises[0];
  const selectedCatStr = selectedEx ? (Array.isArray(selectedEx.category) ? selectedEx.category.join(', ') : selectedEx.category) : '';

  if (!document.getElementById('progressChart')) {
    const currentTimeline = state.clientTimelineFilter || '10';

    card.innerHTML = `
      <h3 style="margin-top: 0; color: #fff; font-size: 1.1rem; font-weight: 700;">Progressie Per Oefening</h3>
      
      <!-- Custom AQM Searchable Dropdown (Stijlvol Pilvormig) -->
      <label style="display: block; margin: 10px 0 6px 0; font-size: 0.82rem; color: var(--text-muted);">Selecteer een oefening:</label>
      <div class="custom-dropdown-wrapper" style="position: relative; margin-bottom: 16px;">
        <button id="progressDropdownTrigger" type="button" style="display: flex; justify-content: space-between; align-items: center; width: 100%; text-align: left; cursor: pointer; padding: 12px 16px !important; background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: var(--pill-radius); color: #fff; height: auto;" onclick="toggleProgressDropdown(event)">
          <span id="progressDropdownSelectedText" style="line-height: 1.2; font-weight: 600; font-size: 0.9rem; color: var(--white);">${selectedEx ? `${selectedEx.name} (${selectedCatStr})` : 'Selecteer Oefening'}</span>
          <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem; color: var(--text-muted); margin-left: 8px;"></i>
        </button>
        <div id="progressDropdownMenu" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #121927; border: 1px solid var(--glass-border); border-radius: 12px; z-index: 1000; margin-top: 6px; padding: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.7);">
          <input type="text" id="progressExerciseSearchInput" placeholder="Zoek oefening..." style="width: 100%; padding: 10px 14px !important; margin-bottom: 8px; font-size: 0.85rem; background: #1A2234; border: 1px solid var(--glass-border); color: #fff; border-radius: 8px; outline: none;" oninput="filterProgressExerciseList()" />
          <div id="progressExerciseList" style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;"></div>
        </div>
      </div>

      <!-- Bovenzijde: Schakelaar voor MAX GEWICHT vs 1RM MAX -->
      <div class="stats-summary-grid" style="display: flex; gap: 10px; margin-bottom: 12px;">
        <div id="clientProgressPRBox" class="stat-box-fine clickable active" onclick="setClientProgressMetric('weight', event)" style="flex: 1; background: var(--bg-input); padding: 10px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center; cursor: pointer;">
          <span class="stat-label-fine" style="display: block; font-size: 0.72rem; color: var(--text-muted);">MAX GEWICHT</span>
          <strong id="progressPRDisplay" class="stat-value-fine gold" style="font-size: 1.1rem; color: var(--gold-accent);">-</strong>
        </div>
        <div id="clientProgress1RMBox" class="stat-box-fine clickable" onclick="setClientProgressMetric('oneRM', event)" style="flex: 1; background: var(--bg-input); padding: 10px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center; cursor: pointer;">
          <span class="stat-label-fine" style="display: block; font-size: 0.72rem; color: var(--text-muted);">1RM MAX</span>
          <strong id="progress1RMDisplay" class="stat-value-fine gold" style="font-size: 1.1rem; color: var(--gold-accent);">-</strong>
        </div>
      </div>

      <!-- Tijdlijn Filter Bepaling -->
      <div class="timeline-filter-bar">
        <button class="timeline-btn ${currentTimeline === '10' ? 'active' : ''}" onclick="setClientTimelineFilter('10', event)">10S</button>
        <button class="timeline-btn ${currentTimeline === '1m' ? 'active' : ''}" onclick="setClientTimelineFilter('1m', event)">1M</button>
        <button class="timeline-btn ${currentTimeline === '6m' ? 'active' : ''}" onclick="setClientTimelineFilter('6m', event)">6M</button>
        <button class="timeline-btn ${currentTimeline === '1y' ? 'active' : ''}" onclick="setClientTimelineFilter('1y', event)">1J</button>
        <button class="timeline-btn ${currentTimeline === 'ytd' ? 'active' : ''}" onclick="setClientTimelineFilter('ytd', event)">YTD</button>
        <button class="timeline-btn ${currentTimeline === 'all' ? 'active' : ''}" onclick="setClientTimelineFilter('all', event)">Alles</button>
      </div>

      <div class="chart-container-box" style="height: 220px; width: 100%;">
        <canvas id="progressChart"></canvas>
      </div>

      <!-- Onderzijde: Rij 1 (Start, Huidig PR, % Toename) -->
      <div id="progressBottomStatsRow1" class="stats-summary-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 14px;">
        <div style="background: var(--bg-input); padding: 8px 6px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center;">
          <span style="display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">START</span>
          <strong id="progressStartDisplay" style="font-size: 0.95rem; color: var(--text-main); display: block; margin: 2px 0;">-</strong>
          <small id="progressStartDateDisplay" style="font-size: 0.65rem; color: var(--text-muted); display: block;">-</small>
        </div>
        <div style="background: var(--bg-input); padding: 8px 6px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center;">
          <span style="display: block; font-size: 0.65rem; color: var(--gold-accent); font-weight: 700;">HUIDIG PR</span>
          <strong id="progressMaxPRDisplay" style="font-size: 0.95rem; color: var(--gold-accent); display: block; margin: 2px 0;">-</strong>
          <small id="progressPRDateDisplay" style="font-size: 0.65rem; color: var(--gold-accent); opacity: 0.8; display: block;">-</small>
        </div>
        <div style="background: var(--bg-input); padding: 8px 6px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center;">
          <span style="display: block; font-size: 0.65rem; color: var(--gold-accent); font-weight: 700;">TOENAME</span>
          <strong id="progressIncreaseDisplay" style="font-size: 0.95rem; color: var(--gold-accent); display: block; margin: 2px 0;">-</strong>
          <small id="progressIncreaseKgDisplay" style="font-size: 0.65rem; color: var(--gold-accent); opacity: 0.85; display: block;">-</small>
        </div>
      </div>

      <!-- Onderzijde: Rij 2 (Volume, Sessies, Gemiddelde) -->
      <div id="progressBottomStatsRow2" class="stats-summary-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 8px;">
        <div style="background: var(--bg-input); padding: 10px 6px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center;">
          <span style="display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">VOLUME</span>
          <strong id="progressVolumeDisplay" style="font-size: 0.95rem; color: var(--text-main); display: block; margin-top: 2px;">-</strong>
        </div>
        <div style="background: var(--bg-input); padding: 10px 6px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center;">
          <span style="display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">SESSIES</span>
          <strong id="progressSessionsDisplay" style="font-size: 0.95rem; color: var(--text-main); display: block; margin-top: 2px;">-</strong>
        </div>
        <div style="background: var(--bg-input); padding: 10px 6px; border-radius: 10px; border: 1px solid var(--glass-border); text-align: center;">
          <span style="display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">GEMIDDELDE</span>
          <strong id="progressAvgWeightDisplay" style="font-size: 0.95rem; color: var(--text-main); display: block; margin-top: 2px;">-</strong>
        </div>
      </div>
    `;
  }

  populateProgressExerciseList(availableExercises, userHistory);
  renderClientChartData(userHistory);
}

export function renderClientChartData(userHistory) {
  const canvas = document.getElementById('progressChart');
  if (!canvas || !state.selectedProgressExerciseId) return;

  const selectedExId = state.selectedProgressExerciseId;
  let chartPoints = [];
  let maxWeightOverall = 0;
  let max1RMOverall = 0;

  userHistory.forEach(workout => {
    const matchEx = workout.exercises.find(e => e.exerciseId === selectedExId);
    if (matchEx && matchEx.sets) {
      let maxSetWeight = 0;
      let maxSet1RM = 0;
      let workoutVolume = 0;

      matchEx.sets.forEach(s => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps) || 0;
        if (w > maxSetWeight) maxSetWeight = w;

        const est1RM = calculate1RM(w, r);
        if (est1RM > maxSet1RM) maxSet1RM = est1RM;

        if (w > 0 && r > 0) {
          workoutVolume += (w * r);
        }
      });

      if (maxSetWeight > maxWeightOverall) maxWeightOverall = maxSetWeight;
      if (maxSet1RM > max1RMOverall) max1RMOverall = maxSet1RM;

      if (maxSetWeight > 0) {
        chartPoints.push({
          fullDate: workout.date,
          displayDate: formatDateShort(workout.date),
          weight: maxSetWeight,
          oneRM: maxSet1RM,
          volume: workoutVolume,
          timestamp: workout.timestamp || Date.now()
        });
      }
    }
  });

  const prDisp = document.getElementById('progressPRDisplay');
  const oneRmDisp = document.getElementById('progress1RMDisplay');
  if (prDisp) prDisp.innerText = maxWeightOverall > 0 ? `${maxWeightOverall} kg` : '-';
  if (oneRmDisp) oneRmDisp.innerText = max1RMOverall > 0 ? `${max1RMOverall} kg` : '-';

  chartPoints.sort((a, b) => a.timestamp - b.timestamp);

  const timeline = state.clientTimelineFilter || '10';
  let filteredPoints = [...chartPoints];
  const now = Date.now();

  if (timeline === '10') {
    filteredPoints = filteredPoints.slice(-10);
  } else if (timeline === '1m') {
    const minTime = now - (30 * 24 * 60 * 60 * 1000);
    filteredPoints = filteredPoints.filter(p => p.timestamp >= minTime);
  } else if (timeline === '6m') {
    const minTime = now - (180 * 24 * 60 * 60 * 1000);
    filteredPoints = filteredPoints.filter(p => p.timestamp >= minTime);
  } else if (timeline === '1y') {
    const minTime = now - (365 * 24 * 60 * 60 * 1000);
    filteredPoints = filteredPoints.filter(p => p.timestamp >= minTime);
  } else if (timeline === 'ytd') {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
    filteredPoints = filteredPoints.filter(p => p.timestamp >= startOfYear);
  }

  // Onderste vakken - Rij 1
  const startDisp = document.getElementById('progressStartDisplay');
  const startDateDisp = document.getElementById('progressStartDateDisplay');
  const maxPrDisp = document.getElementById('progressMaxPRDisplay');
  const prDateDisp = document.getElementById('progressPRDateDisplay');
  const increaseDisp = document.getElementById('progressIncreaseDisplay');
  const increaseKgDisp = document.getElementById('progressIncreaseKgDisplay');

  // Onderste vakken - Rij 2
  const volDisp = document.getElementById('progressVolumeDisplay');
  const sessDisp = document.getElementById('progressSessionsDisplay');
  const avgWeightDisp = document.getElementById('progressAvgWeightDisplay');

  if (filteredPoints.length > 0) {
    const startPoint = filteredPoints[0];
    let maxPoint = filteredPoints[0];

    let totalVol = 0;
    let weightSum = 0;

    filteredPoints.forEach(p => {
      if (p.weight > maxPoint.weight) {
        maxPoint = p;
      }
      totalVol += (p.volume || 0);
      weightSum += p.weight;
    });

    const startVal = startPoint.weight;
    const prVal = maxPoint.weight;
    const diffKg = prVal - startVal;
    const pctIncrease = startVal > 0 ? ((diffKg / startVal) * 100).toFixed(1) : '0';
    const avgWeight = Math.round(weightSum / filteredPoints.length);

    if (startDisp) startDisp.innerText = `${startVal} kg`;
    if (startDateDisp) startDateDisp.innerText = startPoint.fullDate;

    if (maxPrDisp) maxPrDisp.innerText = `${prVal} kg`;
    if (prDateDisp) prDateDisp.innerText = maxPoint.fullDate;

    if (increaseDisp) increaseDisp.innerText = diffKg >= 0 ? `+${pctIncrease}%` : `${pctIncrease}%`;
    if (increaseKgDisp) increaseKgDisp.innerText = diffKg >= 0 ? `+${diffKg} kg` : `${diffKg} kg`;

    if (volDisp) volDisp.innerText = `${totalVol.toLocaleString('nl-NL')} kg`;
    if (sessDisp) sessDisp.innerText = `${filteredPoints.length}`;
    if (avgWeightDisp) avgWeightDisp.innerText = `${avgWeight} kg`;
  } else {
    if (startDisp) startDisp.innerText = '-';
    if (startDateDisp) startDateDisp.innerText = '-';
    if (maxPrDisp) maxPrDisp.innerText = '-';
    if (prDateDisp) prDateDisp.innerText = '-';
    if (increaseDisp) increaseDisp.innerText = '-';
    if (increaseKgDisp) increaseKgDisp.innerText = '-';

    if (volDisp) volDisp.innerText = '-';
    if (sessDisp) sessDisp.innerText = '-';
    if (avgWeightDisp) avgWeightDisp.innerText = '-';
  }

  const metric = state.clientProgressMetric || 'weight';
  const labels = filteredPoints.map(p => p.displayDate);
  const dataValues = filteredPoints.map(p => metric === 'weight' ? p.weight : p.oneRM);

  const ctx = canvas.getContext('2d');
  if (clientChartInstance) clientChartInstance.destroy();

  clientChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: metric === 'weight' ? 'Max Gewicht (kg)' : '1RM Max (kg)',
        data: dataValues,
        borderColor: '#FF9F0A',
        borderWidth: 1.8,
        backgroundColor: (context) => {
          const chartCtx = context.chart.ctx;
          const gradient = chartCtx.createLinearGradient(0, 0, 0, 180);
          gradient.addColorStop(0, 'rgba(255, 159, 10, 0.25)');
          gradient.addColorStop(1, 'rgba(255, 159, 10, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#FF9F0A',
        pointBorderColor: '#121927',
        pointBorderWidth: 1.5,
        pointRadius: 2.5,
        pointHoverRadius: 4.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items[0]?.dataIndex;
              return filteredPoints[idx] ? filteredPoints[idx].fullDate : items[0]?.label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#8E8E93',
            font: { size: 10 },
            maxTicksLimit: 7,
            autoSkip: true,
            maxRotation: 45,
            minRotation: 45
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          ticks: {
            color: '#8E8E93',
            font: { size: 10 },
            precision: 0,
            stepSize: 1,
            callback: function(value) {
              if (Number.isInteger(value)) {
                return value;
              }
            }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });
}

function populateProgressExerciseList(exercises, userHistory) {
  const list = document.getElementById('progressExerciseList');
  if (!list) return;

  list.innerHTML = '';
  exercises.forEach(ex => {
    const catStr = Array.isArray(ex.category) ? ex.category.join(', ') : ex.category;
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 10px; border-radius: 8px; cursor: pointer;
      background: ${ex.id === state.selectedProgressExerciseId ? 'rgba(255, 159, 10, 0.15)' : 'transparent'};
      color: ${ex.id === state.selectedProgressExerciseId ? 'var(--gold-accent)' : 'var(--text-main)'};
      transition: background 0.2s ease;
    `;
    item.innerHTML = `
      <span style="font-size: 0.88rem; font-weight: 500;">${ex.name}</span>
      <span class="exercise-badge" style="font-size: 0.7rem; padding: 2px 8px; margin: 0;">${catStr}</span>
    `;

    item.onmouseover = () => { if (ex.id !== state.selectedProgressExerciseId) item.style.background = 'rgba(255, 255, 255, 0.05)'; };
    item.onmouseout = () => { if (ex.id !== state.selectedProgressExerciseId) item.style.background = 'transparent'; };

    item.onclick = (e) => {
      e.stopPropagation();
      state.selectedProgressExerciseId = ex.id;
      const text = document.getElementById('progressDropdownSelectedText');
      if (text) text.innerText = `${ex.name} (${catStr})`;
      toggleProgressDropdown(null, false);
      populateProgressExerciseList(exercises, userHistory);
      renderClientChartData(userHistory);
    };

    list.appendChild(item);
  });
}

export function toggleProgressDropdown(e, forceState) {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  const menu = document.getElementById('progressDropdownMenu');
  if (!menu) return;

  const show = forceState !== undefined ? forceState : (menu.style.display === 'none' || !menu.style.display);
  menu.style.display = show ? 'block' : 'none';

  if (show) {
    const input = document.getElementById('progressExerciseSearchInput');
    if (input) { input.value = ''; input.focus(); }
    filterProgressExerciseList();
  }
}

export function filterProgressExerciseList() {
  const input = document.getElementById('progressExerciseSearchInput');
  const term = input ? input.value.toLowerCase() : '';
  const list = document.getElementById('progressExerciseList');
  if (!list) return;

  Array.from(list.children).forEach(child => {
    const match = child.innerText.toLowerCase().includes(term);
    child.style.display = match ? 'flex' : 'none';
  });
}

document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.custom-dropdown-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    toggleProgressDropdown(null, false);
  }
});

export function setClientProgressMetric(metric, event) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  state.clientProgressMetric = metric;

  document.getElementById('clientProgressPRBox')?.classList.toggle('active', metric === 'weight');
  document.getElementById('clientProgress1RMBox')?.classList.toggle('active', metric === 'oneRM');

  const history = getWorkoutsHistory();
  const userHistory = history.filter(h => h.userEmail === state.currentUser?.email);
  renderClientChartData(userHistory);
}

export function setClientTimelineFilter(timeline, event) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  state.clientTimelineFilter = timeline;

  document.querySelectorAll('.timeline-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }

  const history = getWorkoutsHistory();
  const userHistory = history.filter(h => h.userEmail === state.currentUser?.email);
  renderClientChartData(userHistory);
}

export function setProgressFilter(filter, btn, event) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  document.querySelectorAll('.progress-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  state.clientProgressFilter = filter;

  const history = getWorkoutsHistory();
  const userHistory = history.filter(h => h.userEmail === state.currentUser?.email);
  renderClientChartData(userHistory);
}

// Window bindings
window.setClientProgressMetric = setClientProgressMetric;
window.setClientTimelineFilter = setClientTimelineFilter;
window.setProgressFilter = setProgressFilter;
window.toggleProgressDropdown = toggleProgressDropdown;
window.filterProgressExerciseList = filterProgressExerciseList;