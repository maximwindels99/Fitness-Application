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
 * Hulpfunctie om een datumstring (bijv. "03-07-2026") om te zetten naar "DD/MM"
 */
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return dateStr;
}

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
        <button type="button" class="btn-action-icon secondary btn-toggle-coach-det" title="Bekijk details" style="width: 32px !important; height: 32px !important; padding: 0 !important; min-width: 32px;">
          <i class="fa-solid fa-eye" style="font-size: 0.85rem;"></i>
        </button>
      </div>
    `;

    item.querySelector('.btn-toggle-coach-det').addEventListener('click', (e) => {
      e.stopPropagation();
      const det = item.querySelector('.coach-history-details-container');
      const isHidden = det.style.display === 'none';
      det.style.display = isHidden ? 'block' : 'none';
      e.currentTarget.innerHTML = isHidden ? '<i class="fa-solid fa-chevron-up" style="font-size: 0.85rem;"></i>' : '<i class="fa-solid fa-eye" style="font-size: 0.85rem;"></i>';
    });

    container.appendChild(item);
  });

  if ((state.currentCoachHistoryLimit || 3) < clientHistory.length) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'outline full-width';
    loadMoreBtn.type = 'button';
    loadMoreBtn.style.cssText = 'margin-top: 14px; margin-bottom: 8px; font-weight: 700; width: 100%; border-radius: var(--pill-radius); padding: 12px; font-size: 0.9rem; text-align: center;';
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
 * Rendert de volledige progressie-interface van de geselecteerde sporter.
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
        <h3 style="margin-bottom: 15px; color: var(--white); font-weight: 800; font-size: 1.15rem;">Progressie Per Oefening</h3>
        <div style="text-align: center; padding: 35px 15px;">
          <i class="fa-solid fa-chart-line" style="font-size: 2.2rem; color: var(--gold-accent); margin-bottom: 12px; display: block; opacity: 0.8;"></i>
          <h4 style="margin: 0 0 6px 0; color: var(--white); font-size: 1rem;">Geen Progressie Data</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; max-width: 280px; margin: 0 auto; line-height: 1.4;">
            Deze sporter heeft nog geen gewichten of herhalingen gelogd.
          </p>
        </div>
      </div>
    `;
    return;
  }

  const availableExercises = getFullExerciseDatabase().filter(ex => performedExerciseIds.has(ex.id));
  availableExercises.sort((a, b) => a.name.localeCompare(b.name));

  if (!state.selectedCoachExerciseId || !performedExerciseIds.has(state.selectedCoachExerciseId)) {
    state.selectedCoachExerciseId = availableExercises[0] ? availableExercises[0].id : "";
  }

  const currentEx = availableExercises.find(e => e.id === state.selectedCoachExerciseId) || availableExercises[0];

  container.innerHTML = `
    <div class="card card-glass">
      <h3 style="margin-bottom: 6px; color: var(--white); font-weight: 800; font-size: 1.15rem;">Progressie Per Oefening</h3>
      <label style="font-size: 0.82rem; color: var(--text-muted); display: block; margin-bottom: 10px;">Selecteer een oefening:</label>

      <!-- CUSTOM PILVORMMIGE DROPDOWN -->
      <div class="coach-ex-dropdown-wrapper" style="position: relative; width: 100%; margin-bottom: 16px;">
        <div id="coachExDropdownTrigger" class="inline-client-select" style="width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: var(--bg-input); padding: 12px 16px; border-radius: var(--pill-radius); border: 1px solid var(--glass-border);">
          <span id="coachExDropdownLabel" style="font-size: 0.9rem; font-weight: 600; color: var(--white);">${currentEx ? `${currentEx.name} (${Array.isArray(currentEx.category) ? currentEx.category.join(', ') : currentEx.category})` : '-- Kies Oefening --'}</span>
          <i class="fa-solid fa-chevron-down" style="font-size: 0.82rem; color: var(--text-muted);"></i>
        </div>
        <div id="coachExDropdownMenu" class="custom-dropdown-menu" style="display: none; width: 100%; position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; margin-top: 6px;"></div>
      </div>

      <!-- MAX GEWICHT & 1RM MAX SELEKTIEKAARTEN -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
        <div id="coachMetricWeightCard" class="stat-box-fine clickable ${state.coachProgressMetric !== 'oneRM' ? 'active' : ''}" style="padding: 12px; text-align: center; border-radius: 12px; cursor: pointer; background: var(--bg-input); border: 1px solid var(--glass-border);">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">MAX GEWICHT</span>
          <strong id="coachMaxWeightValue" style="font-size: 1.15rem; color: var(--gold-accent); font-weight: 800;">-</strong>
        </div>

        <div id="coachMetric1RMCard" class="stat-box-fine clickable ${state.coachProgressMetric === 'oneRM' ? 'active' : ''}" style="padding: 12px; text-align: center; border-radius: 12px; cursor: pointer; background: var(--bg-input); border: 1px solid var(--glass-border);">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">1RM MAX</span>
          <strong id="coach1RMValue" style="font-size: 1.15rem; color: var(--gold-accent); font-weight: 800;">-</strong>
        </div>
      </div>

      <!-- TIJDSFILTER BALK -->
      <div class="timeline-filter-bar" style="display: flex; gap: 6px; margin-bottom: 16px;">
        <button type="button" class="timeline-btn ${(!state.coachTimeFilter || state.coachTimeFilter === '10S') ? 'active' : ''}" data-filter="10S">10S</button>
        <button type="button" class="timeline-btn ${(state.coachTimeFilter === '1M') ? 'active' : ''}" data-filter="1M">1M</button>
        <button type="button" class="timeline-btn ${(state.coachTimeFilter === '6M') ? 'active' : ''}" data-filter="6M">6M</button>
        <button type="button" class="timeline-btn ${(state.coachTimeFilter === '1J') ? 'active' : ''}" data-filter="1J">1J</button>
        <button type="button" class="timeline-btn ${(state.coachTimeFilter === 'YTD') ? 'active' : ''}" data-filter="YTD">YTD</button>
        <button type="button" class="timeline-btn ${(state.coachTimeFilter === 'Alles') ? 'active' : ''}" data-filter="Alles">Alles</button>
      </div>

      <!-- CHART CANVAS CONTAINER -->
      <div style="position: relative; height: 220px; width: 100%; margin-bottom: 18px;">
        <canvas id="coachProgressChartCanvas"></canvas>
      </div>

      <!-- UITGEBREIDE STATISTIEKEN GRID (6 CARDS) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
        <div style="background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px 6px; text-align: center;">
          <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted); display: block;">START</span>
          <strong id="coachStatStart" style="font-size: 0.95rem; color: var(--white); font-weight: 800; display: block; margin-top: 2px;">-</strong>
          <span id="coachStatStartDate" style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 2px;">-</span>
        </div>

        <div style="background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px 6px; text-align: center;">
          <span style="font-size: 0.68rem; font-weight: 700; color: var(--gold-accent); display: block;">HUIDIG PR</span>
          <strong id="coachStatPR" style="font-size: 0.95rem; color: var(--gold-accent); font-weight: 800; display: block; margin-top: 2px;">-</strong>
          <span id="coachStatPRDate" style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 2px;">-</span>
        </div>

        <div style="background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px 6px; text-align: center;">
          <span style="font-size: 0.68rem; font-weight: 700; color: var(--gold-accent); display: block;">TOENAME</span>
          <strong id="coachStatIncPct" style="font-size: 0.95rem; color: var(--gold-accent); font-weight: 800; display: block; margin-top: 2px;">-</strong>
          <span id="coachStatIncKg" style="font-size: 0.65rem; color: var(--gold-accent); display: block; margin-top: 2px;">-</span>
        </div>

        <div style="background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px 6px; text-align: center;">
          <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted); display: block;">VOLUME</span>
          <strong id="coachStatVolume" style="font-size: 0.95rem; color: var(--white); font-weight: 800; display: block; margin-top: 2px;">-</strong>
        </div>

        <div style="background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px 6px; text-align: center;">
          <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted); display: block;">SESSIES</span>
          <strong id="coachStatSessions" style="font-size: 0.95rem; color: var(--white); font-weight: 800; display: block; margin-top: 2px;">-</strong>
        </div>

        <div style="background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px 6px; text-align: center;">
          <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-muted); display: block;">GEMIDDELDE</span>
          <strong id="coachStatAvg" style="font-size: 0.95rem; color: var(--white); font-weight: 800; display: block; margin-top: 2px;">-</strong>
        </div>
      </div>
    </div>
  `;

  // Custom Dropdown Event Listeners
  const trigger = document.getElementById('coachExDropdownTrigger');
  const menu = document.getElementById('coachExDropdownMenu');

  availableExercises.forEach(ex => {
    const item = document.createElement('div');
    item.className = `custom-dropdown-item ${ex.id === state.selectedCoachExerciseId ? 'active' : ''}`;
    const catStr = Array.isArray(ex.category) ? ex.category.join(', ') : ex.category;
    item.innerText = `${ex.name} (${catStr})`;
    item.onclick = (e) => {
      e.stopPropagation();
      state.selectedCoachExerciseId = ex.id;
      menu.style.display = 'none';
      updateCoachProgressChart();
    };
    menu.appendChild(item);
  });

  trigger.onclick = (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  };

  document.addEventListener('click', (e) => {
    if (menu && !trigger.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  // Metriek Wisselen (Weight vs 1RM)
  document.getElementById('coachMetricWeightCard').onclick = () => {
    state.coachProgressMetric = 'weight';
    updateCoachProgressChart();
  };
  document.getElementById('coachMetric1RMCard').onclick = () => {
    state.coachProgressMetric = 'oneRM';
    updateCoachProgressChart();
  };

  // Tijdsfilter Knoppen Listeners
  container.querySelectorAll('.timeline-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      state.coachTimeFilter = btn.getAttribute('data-filter');
      updateCoachProgressChart();
    };
  });

  renderCoachChartData(clientHistory);
}

function renderCoachChartData(clientHistory) {
  const canvas = document.getElementById('coachProgressChartCanvas');
  if (!canvas || !state.selectedCoachExerciseId) return;

  const selectedExId = state.selectedCoachExerciseId;
  let rawDataPoints = [];
  let maxWeightOverall = 0;
  let max1RMOverall = 0;
  let totalVolumeAllTime = 0;
  let totalSessionsCount = 0;

  clientHistory.forEach(workout => {
    const matchEx = workout.exercises.find(e => e.exerciseId === selectedExId);
    if (matchEx && matchEx.sets) {
      let maxSetWeight = 0;
      let maxSet1RM = 0;
      let workoutExVolume = 0;
      let hasValidSet = false;

      matchEx.sets.forEach(s => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps) || 0;
        if (w > 0 || r > 0) {
          hasValidSet = true;
          workoutExVolume += (w * r);
          if (w > maxSetWeight) maxSetWeight = w;

          const est1RM = calculate1RM(w, r);
          if (est1RM > maxSet1RM) maxSet1RM = est1RM;
        }
      });

      if (hasValidSet) {
        totalSessionsCount++;
        totalVolumeAllTime += workoutExVolume;
        if (maxSetWeight > maxWeightOverall) maxWeightOverall = maxSetWeight;
        if (maxSet1RM > max1RMOverall) max1RMOverall = maxSet1RM;

        rawDataPoints.push({
          date: workout.date,
          shortDate: formatShortDate(workout.date),
          weight: maxSetWeight,
          oneRM: maxSet1RM,
          timestamp: workout.timestamp || 0
        });
      }
    }
  });

  document.getElementById('coachMaxWeightValue').innerText = maxWeightOverall > 0 ? `${maxWeightOverall} kg` : '-';
  document.getElementById('coach1RMValue').innerText = max1RMOverall > 0 ? `${max1RMOverall} kg` : '-';

  rawDataPoints.sort((a, b) => a.timestamp - b.timestamp);

  // Tijdsfiltering toepassen
  const filter = state.coachTimeFilter || '10S';
  let filteredPoints = [...rawDataPoints];

  if (filter === '10S') {
    filteredPoints = rawDataPoints.slice(-10);
  } else if (filter !== 'Alles') {
    const now = new Date();
    let cutoff = new Date();
    if (filter === '1M') cutoff.setMonth(now.getMonth() - 1);
    else if (filter === '6M') cutoff.setMonth(now.getMonth() - 6);
    else if (filter === '1J') cutoff.setFullYear(now.getFullYear() - 1);
    else if (filter === 'YTD') cutoff = new Date(now.getFullYear(), 0, 1);

    filteredPoints = rawDataPoints.filter(p => p.timestamp >= cutoff.getTime());
  }

  // Statistieken invullen
  if (filteredPoints.length > 0) {
    const metric = state.coachProgressMetric || 'weight';
    const firstP = filteredPoints[0];
    const lastP = filteredPoints[filteredPoints.length - 1];

    let startVal = metric === 'weight' ? firstP.weight : firstP.oneRM;
    let endVal = metric === 'weight' ? lastP.weight : lastP.oneRM;

    let highestP = filteredPoints.reduce((prev, curr) => {
      const prevV = metric === 'weight' ? prev.weight : prev.oneRM;
      const currV = metric === 'weight' ? curr.weight : curr.oneRM;
      return currV >= prevV ? curr : prev;
    }, filteredPoints[0]);

    let prVal = metric === 'weight' ? highestP.weight : highestP.oneRM;

    const diffKg = endVal - startVal;
    const pct = startVal > 0 ? ((diffKg / startVal) * 100).toFixed(1) : 0;

    const totalValSum = filteredPoints.reduce((acc, curr) => acc + (metric === 'weight' ? curr.weight : curr.oneRM), 0);
    const avgVal = (totalValSum / filteredPoints.length).toFixed(1);

    document.getElementById('coachStatStart').innerText = `${startVal} kg`;
    document.getElementById('coachStatStartDate').innerText = firstP.date;

    document.getElementById('coachStatPR').innerText = `${prVal} kg`;
    document.getElementById('coachStatPRDate').innerText = highestP.date;

    document.getElementById('coachStatIncPct').innerText = `${pct >= 0 ? '+' : ''}${pct}%`;
    document.getElementById('coachStatIncKg').innerText = `${diffKg >= 0 ? '+' : ''}${diffKg.toFixed(1)} kg`;

    document.getElementById('coachStatVolume').innerText = `${totalVolumeAllTime.toLocaleString('nl-NL')} kg`;
    document.getElementById('coachStatSessions').innerText = `${totalSessionsCount}`;
    document.getElementById('coachStatAvg').innerText = `${avgVal} kg`;
  }

  // Chart Rendering (ENKEL GEHELE GETALLEN OP DE Y-AS EN GEEN DUBBELE LABELS)
  const ctx = canvas.getContext('2d');
  if (coachChartInstance) coachChartInstance.destroy();

  const metric = state.coachProgressMetric || 'weight';
  const labels = filteredPoints.map(p => p.shortDate);
  const dataValues = filteredPoints.map(p => metric === 'weight' ? p.weight : p.oneRM);

  coachChartInstance = new Chart(ctx, {
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
      plugins: { legend: { display: false } },
      scales: {
        x: { 
          ticks: { 
            color: '#8E8E93', 
            font: { size: 10 },
            maxTicksLimit: 7,
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

export function setCoachProgressMetric(metric, event) {
  if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
  state.coachProgressMetric = metric;

  document.getElementById('coachMetricWeightCard')?.classList.toggle('active', metric === 'weight');
  document.getElementById('coachMetric1RMCard')?.classList.toggle('active', metric === 'oneRM');

  updateCoachProgressChart();
}