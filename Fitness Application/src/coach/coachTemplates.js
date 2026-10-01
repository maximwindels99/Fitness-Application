// ==========================================================================
// COACH TEMPLATES MODULE
// Beheert workout schema's en toewijzing voor sporters door coaches (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getTemplates, saveTemplates } from '../core/storage.js';
import { getFullExerciseDatabase, findExerciseById } from '../data/exercisesData.js';
import { updateCoachFabVisibility } from './coachNav.js';

/**
 * Rendert de lijst van workout schema's voor de momenteel geselecteerde sporter.
 */
export function renderCoachClientTemplates() {
  const container = document.getElementById('coachClientTemplatesList');
  if (!container || !state.selectedClientEmail) return;

  const templates = getTemplates();
  const clientTemplates = templates.filter(t => t.userEmail === state.selectedClientEmail);

  if (clientTemplates.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 35px 15px;">
        <i class="fa-regular fa-folder-open" style="font-size: 2.2rem; color: var(--gold-accent); margin-bottom: 12px; display: block; opacity: 0.8;"></i>
        <h4 style="margin: 0 0 6px 0; color: var(--white); font-size: 1rem;">Geen Workout Schema's</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; max-width: 280px; margin: 0 auto; line-height: 1.4;">
          Deze sporter heeft nog geen toegewezen workout schema's. Klik op het plusje om er een aan te maken!
        </p>
      </div>
    `;
    updateCoachFabVisibility();
    return;
  }

  container.innerHTML = '';
  clientTemplates.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card card-glass';
    card.style.cssText = 'border-left: 5px solid var(--gold-accent); margin-bottom: 12px;';

    let badgesHTML = t.exercises.slice(0, 3).map(e => {
      const exObj = findExerciseById(e.exerciseId);
      return `<span class="exercise-badge"><i class="fa-solid fa-dumbbell"></i> ${exObj ? exObj.name : e.exerciseId}</span>`;
    }).join(' ');

    if (t.exercises.length > 3) {
      badgesHTML += ` <span class="exercise-badge">+${t.exercises.length - 3} meer</span>`;
    }

    card.innerHTML = `
      <h3 style="margin:0 0 10px 0; color:var(--white); font-size: 1.1rem;">${t.name}</h3>
      <div class="exercise-badges-container" style="margin-bottom: 12px;">${badgesHTML}</div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button type="button" class="btn-action-icon secondary btn-edit-coach-tmpl" title="Bewerken"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="btn-action-icon danger btn-delete-coach-tmpl" title="Verwijderen"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `;

    card.querySelector('.btn-edit-coach-tmpl').addEventListener('click', (e) => {
      e.stopPropagation();
      editCoachClientTemplate(t.id);
    });

    card.querySelector('.btn-delete-coach-tmpl').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCoachClientTemplate(t.id);
    });

    container.appendChild(card);
  });

  updateCoachFabVisibility();
}

/**
 * Schakelt de weergave van het formulier voor een nieuw coach schema.
 */
export function toggleCoachNewTemplateForm() {
  const card = document.getElementById('coachNewTemplateCard');
  if (!card) return;

  const isHidden = card.style.display === 'none';
  card.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    document.getElementById('coachEditingTemplateId').value = "";
    document.getElementById('coachTemplateName').value = "";
    document.getElementById('coachTemplateExercisesContainer').innerHTML = "";
    addExerciseToCoachTemplate();
    card.scrollIntoView({ behavior: 'smooth' });
  }

  updateCoachFabVisibility();
}

/**
 * Voegt een oefening toe aan het coach-schemaformulier.
 */
export function addExerciseToCoachTemplate(selectedExId = "", setsData = null) {
  const container = document.getElementById('coachTemplateExercisesContainer');
  if (!container) return;

  const exerciseDiv = document.createElement('div');
  exerciseDiv.className = 'template-exercise-item';

  const sortedDatabase = getFullExerciseDatabase().sort((a, b) => a.name.localeCompare(b.name));
  const selectedEx = sortedDatabase.find(ex => ex.id === selectedExId) || sortedDatabase[0];

  exerciseDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <label style="margin:0;">OEFENING:</label>
      <button class="danger btn-remove-ex" type="button" style="padding: 3px 8px;"><i class="fa-solid fa-minus"></i></button>
    </div>

    <div class="client-select-wrapper-inline" style="position: relative; width: 100%; margin-bottom: 12px;">
      <input type="hidden" class="tmpl-ex-hidden-input" value="${selectedEx ? selectedEx.id : ''}">
      <div class="inline-client-select tmpl-ex-trigger" style="width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
        <span class="tmpl-ex-trigger-label">${selectedEx ? `${selectedEx.name} (${selectedEx.category})` : '-- Kies Oefening --'}</span>
        <i class="fa-solid fa-chevron-down select-chevron-icon"></i>
      </div>
      <div class="custom-dropdown-menu tmpl-ex-dropdown-list" style="display: none; width: 100%;"></div>
    </div>

    <div class="tmpl-sets-header"><span>SET</span><span>KG</span><span>REPS</span><span></span></div>
    <div class="tmpl-sets-rows"></div>
    <button class="outline btn-add-set" type="button" style="margin-bottom: 5px; margin-top: 8px; font-size: 0.8rem; width: auto; padding: 4px 10px;">+ Set Toevoegen</button>
  `;

  const trigger = exerciseDiv.querySelector('.tmpl-ex-trigger');
  const list = exerciseDiv.querySelector('.tmpl-ex-dropdown-list');
  const hiddenInput = exerciseDiv.querySelector('.tmpl-ex-hidden-input');
  const label = exerciseDiv.querySelector('.tmpl-ex-trigger-label');

  sortedDatabase.forEach(ex => {
    const item = document.createElement('div');
    item.className = `custom-dropdown-item ${ex.id === hiddenInput.value ? 'active' : ''}`;
    item.innerText = `${ex.name} (${ex.category})`;
    item.onclick = (e) => {
      e.stopPropagation();
      hiddenInput.value = ex.id;
      label.innerText = `${ex.name} (${ex.category})`;
      list.style.display = 'none';
    };
    list.appendChild(item);
  });

  trigger.onclick = (e) => {
    e.stopPropagation();
    const isHidden = list.style.display === 'none';
    list.style.display = isHidden ? 'block' : 'none';
  };

  document.addEventListener('click', (e) => {
    if (list && !exerciseDiv.contains(e.target)) list.style.display = 'none';
  });

  exerciseDiv.querySelector('.btn-remove-ex').addEventListener('click', (e) => {
    e.stopPropagation();
    exerciseDiv.remove();
  });

  container.appendChild(exerciseDiv);

  const rowsContainer = exerciseDiv.querySelector('.tmpl-sets-rows');
  if (setsData && setsData.length > 0) {
    setsData.forEach((s, idx) => rowsContainer.appendChild(createCoachTemplateSetRow(idx + 1, s.weight, s.reps)));
  } else {
    rowsContainer.appendChild(createCoachTemplateSetRow(1, "", ""));
  }

  exerciseDiv.querySelector('.btn-add-set').addEventListener('click', (e) => {
    e.stopPropagation();
    const setNum = rowsContainer.children.length + 1;
    rowsContainer.appendChild(createCoachTemplateSetRow(setNum, "", ""));
  });
}

function createCoachTemplateSetRow(setNum, weight, reps) {
  const row = document.createElement('div');
  row.className = 'tmpl-set-row-grid';
  row.style.gridTemplateColumns = '35px 1fr 1fr 40px';
  row.innerHTML = `
    <span class="set-label">${setNum}</span>
    <input type="number" class="tmpl-weight" placeholder="0" value="${weight}" min="0">
    <input type="number" class="tmpl-reps" placeholder="0" value="${reps}" min="0">
    <button type="button" class="btn-remove-set danger"><i class="fa-solid fa-minus"></i></button>
  `;

  row.querySelector('.btn-remove-set').addEventListener('click', (e) => {
    e.stopPropagation();
    const parent = row.parentElement;
    row.remove();
    Array.from(parent.children).forEach((r, idx) => {
      r.querySelector('.set-label').innerText = idx + 1;
    });
  });

  return row;
}

/**
 * Slaat het schema op voor de geselecteerde sporter.
 */
export function saveCoachClientTemplate() {
  if (!state.selectedClientEmail) {
    alert("Selecteer eerst een sporter om een schema voor aan te maken.");
    return;
  }

  const name = document.getElementById('coachTemplateName')?.value.trim();
  const editingId = document.getElementById('coachEditingTemplateId')?.value;

  if (!name) {
    alert("Vul a.u.b. een naam in voor het workout schema.");
    return;
  }

  const exerciseDivs = document.querySelectorAll('#coachTemplateExercisesContainer .template-exercise-item');
  let exercises = [];

  exerciseDivs.forEach(div => {
    const exId = div.querySelector('.tmpl-ex-hidden-input').value;
    if (!exId) return;

    const weights = div.querySelectorAll('.tmpl-weight');
    const reps = div.querySelectorAll('.tmpl-reps');
    let sets = [];

    weights.forEach((wInput, i) => {
      sets.push({ 
        weight: wInput.value || 0, 
        reps: reps[i].value || 0,
        completed: false
      });
    });

    exercises.push({ exerciseId: exId, sets });
  });

  if (exercises.length === 0) {
    alert("Voeg minimaal één geldige oefening toe aan het schema.");
    return;
  }

  let templates = getTemplates();

  if (editingId) {
    const index = templates.findIndex(t => t.id == editingId);
    if (index !== -1) {
      templates[index].name = name;
      templates[index].exercises = exercises;
    }
  } else {
    templates.push({
      id: Date.now(),
      userEmail: state.selectedClientEmail,
      name,
      exercises
    });
  }

  saveTemplates(templates);
  toggleCoachNewTemplateForm();
  renderCoachClientTemplates();
}

export function editCoachClientTemplate(id) {
  const template = getTemplates().find(t => t.id === id);
  if (!template) return;

  document.getElementById('coachEditingTemplateId').value = template.id;
  document.getElementById('coachTemplateName').value = template.name;

  const container = document.getElementById('coachTemplateExercisesContainer');
  container.innerHTML = "";

  template.exercises.forEach(ex => addExerciseToCoachTemplate(ex.exerciseId, ex.sets));

  document.getElementById('coachNewTemplateCard').style.display = 'block';
  document.getElementById('coachNewTemplateCard').scrollIntoView({ behavior: 'smooth' });
  updateCoachFabVisibility();
}

export function deleteCoachClientTemplate(id) {
  if (confirm("Weet je zeker dat je dit schema wilt verwijderen voor deze sporter?")) {
    let templates = getTemplates().filter(t => t.id !== id);
    saveTemplates(templates);
    renderCoachClientTemplates();
  }
}