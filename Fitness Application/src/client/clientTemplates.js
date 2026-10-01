// ==========================================================================
// CLIENT TEMPLATES MODULE
// Schema's bouwen, bewerken en kopiëren voor sporters (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getTemplates, saveTemplates } from '../core/storage.js';
import { getFullExerciseDatabase, findExerciseById } from '../data/exercisesData.js';
import { startWorkoutFromTemplate } from './workoutTracker.js';

/**
 * Rendert alle workout-schema's van de ingelogde sporter.
 */
export function renderTemplates() {
  const container = document.getElementById('templatesList');
  if (!container) return;

  const templates = getTemplates();
  const userTemplates = templates.filter(t => t.userEmail === state.currentUser?.email);

  if (userTemplates.length === 0) {
    container.innerHTML = `
      <div class="card empty-state-card">
        <div class="empty-state-icon">
          <i class="fa-solid fa-list-check"></i>
        </div>
        <h4 style="margin: 0 0 6px 0; color: var(--white); font-size: 1.1rem; font-weight: 700;">Geen Workoutschema's</h4>
        
        <button type="button" id="emptyStateCreateBtn" class="btn-primary" style="margin: 16px 0 14px 0; padding: 12px 22px; font-weight: 700; border-radius: 12px; width: 100%; max-width: 260px;">
          + Maak zelf een schema
        </button>

        <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0; max-width: 280px; line-height: 1.4;">
          Nog geen schema van je coach? Neem contact op of wacht op toewijzing.
        </p>
      </div>
    `;

    document.getElementById('emptyStateCreateBtn')?.addEventListener('click', toggleNewTemplateForm);
    return;
  }

  container.innerHTML = `
    <!-- SUBTIELE BREDE KNOP BOVENAAN VOOR HET MAKEN VAN EEN NIEUW SCHEMA -->
    <button type="button" id="topCreateTemplateBtn" class="outline full-width" style="margin-bottom: 14px; padding: 12px; border-radius: var(--pill-radius); font-weight: 700; font-size: 0.92rem;">
      + Nieuw Schema Maken
    </button>
  `;

  document.getElementById('topCreateTemplateBtn')?.addEventListener('click', toggleNewTemplateForm);

  userTemplates.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'border-left: 4px solid var(--gold-accent) !important; margin-bottom: 12px; overflow: hidden;';

    const initialExercises = t.exercises.slice(0, 3);
    const hiddenExercises = t.exercises.slice(3);
    const extraCount = hiddenExercises.length;

    let initialBadgesHTML = initialExercises.map(e => {
      const exObj = findExerciseById(e.exerciseId);
      return `<span class="exercise-badge">${exObj ? exObj.name : e.exerciseId}</span>`;
    }).join('');

    let hiddenBadgesHTML = hiddenExercises.map(e => {
      const exObj = findExerciseById(e.exerciseId);
      return `<span class="exercise-badge extra-badge-item" style="display: none;">${exObj ? exObj.name : e.exerciseId}</span>`;
    }).join('');

    card.innerHTML = `
      <h3 style="margin:0 0 10px 0; color:var(--white); font-size: 1.1rem;">${t.name}</h3>
      
      <div class="exercise-badges-container" style="display: flex; flex-wrap: wrap; gap: 6px 8px; margin-bottom: 16px;">
        ${initialBadgesHTML}
        ${hiddenBadgesHTML}
        ${extraCount > 0 ? `<button type="button" class="exercise-badge btn-toggle-more" style="background: var(--bg-input); color: var(--gold-accent); border-color: var(--gold-accent); cursor: pointer;">+${extraCount}</button>` : ''}
      </div>

      <!-- SMOOTH SLIDING ACTIERIJ -->
      <div class="card-action-bar">
        <button type="button" class="btn-primary btn-start-workout">
          <i class="fa-solid fa-play" style="margin-right: 6px;"></i> Start Workout
        </button>

        <div class="sliding-actions-drawer">
          <button type="button" class="btn-action-icon secondary btn-copy-tmpl" title="Kopiëren"><i class="fa-regular fa-copy"></i></button>
          <button type="button" class="btn-action-icon secondary btn-edit-tmpl" title="Bewerken"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn-action-icon btn-delete-tmpl-subtle" title="Verwijderen"><i class="fa-solid fa-minus"></i></button>
        </div>

        <button type="button" class="btn-action-icon secondary btn-actions-toggle" title="Opties">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </div>
    `;

    // TOGGLE MET SMOOTH ANIMATIE VOOR HET UITSCHUIVEN VAN DE OPTIES
    const toggleBtn = card.querySelector('.btn-actions-toggle');
    const drawer = card.querySelector('.sliding-actions-drawer');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.contains('open');
      
      document.querySelectorAll('.sliding-actions-drawer.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.btn-actions-toggle.active').forEach(b => b.classList.remove('active'));

      if (!isOpen) {
        drawer.classList.add('open');
        toggleBtn.classList.add('active');
      }
    });

    if (extraCount > 0) {
      const toggleMoreBtn = card.querySelector('.btn-toggle-more');
      const extraItems = card.querySelectorAll('.extra-badge-item');
      let isOpenMore = false;

      toggleMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpenMore = !isOpenMore;
        
        extraItems.forEach(el => {
          el.style.display = isOpenMore ? 'inline-flex' : 'none';
        });

        toggleMoreBtn.innerText = isOpenMore ? '-' : `+${extraCount}`;
      });
    }

    // DIRECTE EN KEHARDE KOPPELING AAN START WORKOUT
    card.querySelector('.btn-start-workout').addEventListener('click', (e) => {
      e.stopPropagation();
      startWorkoutFromTemplate(t.id, renderTemplates);
    });

    card.querySelector('.btn-copy-tmpl').addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateTemplate(t.id, renderTemplates);
    });

    card.querySelector('.btn-edit-tmpl').addEventListener('click', (e) => {
      e.stopPropagation();
      editTemplate(t.id);
    });

    card.querySelector('.btn-delete-tmpl-subtle').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTemplate(t.id, renderTemplates);
    });

    container.appendChild(card);
  });

  // Klik buiten de lade sluit geopende opties automatisch
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.card-action-bar')) {
      document.querySelectorAll('.sliding-actions-drawer.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.btn-actions-toggle.active').forEach(b => b.classList.remove('active'));
    }
  });
}

/**
 * Dupliceert een bestaand schema.
 */
function duplicateTemplate(id, onDuplicatedCallback) {
  let templates = getTemplates();
  const templateToCopy = templates.find(t => t.id === id);

  if (!templateToCopy) return;

  const newTemplate = {
    ...JSON.parse(JSON.stringify(templateToCopy)),
    id: Date.now(),
    name: `${templateToCopy.name} (Kopie)`
  };

  templates.push(newTemplate);
  saveTemplates(templates);

  if (typeof onDuplicatedCallback === 'function') onDuplicatedCallback();
}

/**
 * Schakelt de weergave van het formulier voor een nieuw schema.
 */
export function toggleNewTemplateForm() {
  const card = document.getElementById('newTemplateCard');
  const templatesList = document.getElementById('templatesList');
  if (!card) return;

  const isHidden = card.style.display === 'none' || !card.style.display;
  
  card.style.display = isHidden ? 'block' : 'none';
  
  if (templatesList) {
    templatesList.style.display = isHidden ? 'none' : 'block';
  }

  if (isHidden) {
    document.getElementById('editingTemplateId').value = "";
    document.getElementById('templateName').value = "";
    document.getElementById('templateExercisesContainer').innerHTML = "";
    addExerciseToTemplate();
    card.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Voegt een oefeningenblok toe.
 */
export function addExerciseToTemplate(selectedExId = "", setsData = null) {
  const container = document.getElementById('templateExercisesContainer');
  if (!container) return;

  const exerciseDiv = document.createElement('div');
  exerciseDiv.className = 'template-exercise-item';

  const sortedDatabase = getFullExerciseDatabase().sort((a, b) => a.name.localeCompare(b.name));
  const selectedEx = sortedDatabase.find(ex => ex.id === selectedExId) || null;

  exerciseDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <label style="margin:0; font-size: 0.78rem; font-weight: 700; color: var(--gold-accent); text-transform: uppercase; letter-spacing: 0.5px;">OEFENING:</label>
      
      <button type="button" class="btn-ex-info" style="background: transparent; border: 1px solid var(--glass-border); color: var(--gold-accent); font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
        <i class="fa-solid fa-circle-info"></i> Info
      </button>
    </div>

    <div class="client-select-wrapper-inline" style="position: relative; width: 100%; margin-bottom: 12px;">
      <input type="hidden" class="tmpl-ex-hidden-input" value="${selectedEx ? selectedEx.id : ''}">
      <div class="inline-client-select tmpl-ex-trigger" style="width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: var(--bg-input); padding: 12px 14px; border-radius: var(--pill-radius); border: 1px solid var(--glass-border);">
        <span class="tmpl-ex-trigger-label" style="font-size: 0.88rem; font-weight: 500; ${!selectedEx ? 'color: var(--text-muted);' : ''}">
          ${selectedEx ? `${selectedEx.name} (${selectedEx.category})` : '-- Kies Oefening --'}
        </span>
        <i class="fa-solid fa-chevron-down select-chevron-icon" style="font-size: 0.8rem; color: var(--text-muted);"></i>
      </div>
      
      <div class="tmpl-ex-dropdown-list" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 150; background: #121927; border: 1px solid var(--glass-border); border-radius: 12px; max-height: 230px; overflow-y: auto; box-shadow: 0 12px 30px rgba(0,0,0,0.7); margin-top: 4px; padding: 8px;">
        <div style="padding-bottom: 6px; margin-bottom: 6px; border-bottom: 1px solid var(--glass-border);">
          <input type="text" class="ex-search-field" placeholder="Zoek oefening..." style="width: 100%; padding: 8px 12px; background: #1A2234; border: 1px solid var(--glass-border); color: #fff; border-radius: 8px; font-size: 0.85rem; outline: none;">
        </div>
        <div class="ex-items-container"></div>
      </div>
    </div>

    <div class="tmpl-ex-info-box" style="display: none; background: rgba(255, 159, 10, 0.06); border: 1px solid rgba(255, 159, 10, 0.2); border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">
      <strong class="info-ex-title" style="color: var(--gold-accent); display: block; margin-bottom: 4px;">-</strong>
      <span class="info-ex-text">-</span>
    </div>

    <div class="tmpl-sets-header" style="display: grid; grid-template-columns: 32px 1fr 1fr 32px; gap: 8px; align-items: center; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; text-align: center;">
      <span>SET</span>
      <span>KG</span>
      <span>REPS</span>
      <span></span>
    </div>

    <div class="tmpl-sets-rows"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 4px;">
      <button class="btn-add-set" type="button" style="background: transparent; border: none; color: var(--gold-accent); font-size: 0.82rem; font-weight: 600; cursor: pointer; padding: 4px 0;">
        + Set toevoegen
      </button>

      <button class="btn-remove-ex-block" type="button" style="background: transparent; border: 1px solid rgba(255, 69, 58, 0.4); color: var(--danger); font-size: 0.78rem; font-weight: 600; padding: 4px 10px; border-radius: 8px; cursor: pointer; transition: var(--transition);">
        Verwijder
      </button>
    </div>
  `;

  const trigger = exerciseDiv.querySelector('.tmpl-ex-trigger');
  const list = exerciseDiv.querySelector('.tmpl-ex-dropdown-list');
  const hiddenInput = exerciseDiv.querySelector('.tmpl-ex-hidden-input');
  const label = exerciseDiv.querySelector('.tmpl-ex-trigger-label');
  const searchInput = exerciseDiv.querySelector('.ex-search-field');
  const itemsContainer = exerciseDiv.querySelector('.ex-items-container');

  const infoBtn = exerciseDiv.querySelector('.btn-ex-info');
  const infoBox = exerciseDiv.querySelector('.tmpl-ex-info-box');
  const infoTitle = exerciseDiv.querySelector('.info-ex-title');
  const infoText = exerciseDiv.querySelector('.info-ex-text');

  infoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!hiddenInput.value) {
      alert("Kies eerst een oefening om de instructies te bekijken.");
      return;
    }
    const isHidden = infoBox.style.display === 'none';
    
    if (isHidden) {
      const currentEx = findExerciseById(hiddenInput.value);
      if (currentEx) {
        infoTitle.innerText = `${currentEx.name} (${currentEx.category})`;
        infoText.innerText = currentEx.instructions || 'Geen specifieke instructies beschikbaar voor deze oefening.';
        infoBox.style.display = 'block';
      }
    } else {
      infoBox.style.display = 'none';
    }
  });

  function renderDropdownItems(filterText = "") {
    itemsContainer.innerHTML = "";
    
    const usedExIds = Array.from(document.querySelectorAll('.tmpl-ex-hidden-input'))
      .map(input => input.value)
      .filter(val => val !== "");

    const filtered = sortedDatabase.filter(ex => 
      ex.name.toLowerCase().includes(filterText.toLowerCase()) || 
      ex.category.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
      itemsContainer.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.82rem; text-align: center;">Geen oefening gevonden</div>';
      return;
    }

    filtered.forEach(ex => {
      const isAlreadyUsed = usedExIds.includes(ex.id) && ex.id !== hiddenInput.value;

      const item = document.createElement('div');
      item.style.cssText = `padding: 8px 10px; color: #fff; font-size: 0.85rem; cursor: pointer; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; ${
        ex.id === hiddenInput.value ? 'background: rgba(255, 159, 10, 0.18); color: var(--gold-accent);' : ''
      } ${isAlreadyUsed ? 'opacity: 0.5;' : ''}`;

      const badgeText = isAlreadyUsed ? 'Al in schema' : ex.category;
      const badgeStyle = isAlreadyUsed 
        ? 'font-size: 0.7rem; padding: 2px 6px; background: rgba(255,255,255,0.1); color: var(--text-muted);' 
        : 'font-size: 0.7rem; padding: 2px 6px;';

      item.innerHTML = `
        <span>${ex.name}</span>
        <span class="exercise-badge" style="${badgeStyle}">${badgeText}</span>
      `;

      item.onclick = (e) => {
        e.stopPropagation();
        hiddenInput.value = ex.id;
        label.innerText = `${ex.name} (${ex.category})`;
        label.style.color = '#ffffff';
        list.style.display = 'none';
        infoBox.style.display = 'none';
      };

      item.onmouseenter = () => { if (ex.id !== hiddenInput.value) item.style.background = 'rgba(255, 255, 255, 0.06)'; };
      item.onmouseleave = () => { if (ex.id !== hiddenInput.value) item.style.background = 'transparent'; };

      itemsContainer.appendChild(item);
    });
  }

  renderDropdownItems();

  searchInput.addEventListener('input', (e) => {
    e.stopPropagation();
    renderDropdownItems(e.target.value);
  });

  searchInput.addEventListener('click', (e) => e.stopPropagation());

  trigger.onclick = (e) => {
    e.stopPropagation();
    const isHidden = list.style.display === 'none';
    document.querySelectorAll('.tmpl-ex-dropdown-list').forEach(l => l.style.display = 'none');
    list.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
      searchInput.value = "";
      renderDropdownItems();
      setTimeout(() => searchInput.focus(), 50);
    }
  };

  document.addEventListener('click', (e) => {
    if (list && !exerciseDiv.contains(e.target)) list.style.display = 'none';
  });

  exerciseDiv.querySelector('.btn-remove-ex-block').addEventListener('click', (e) => {
    e.stopPropagation();
    exerciseDiv.remove();
  });

  container.appendChild(exerciseDiv);

  const rowsContainer = exerciseDiv.querySelector('.tmpl-sets-rows');
  if (setsData && setsData.length > 0) {
    setsData.forEach((s) => rowsContainer.appendChild(createTemplateSetRow(s.weight, s.reps)));
  } else {
    rowsContainer.appendChild(createTemplateSetRow("", ""));
  }

  updateSetRowsUI(rowsContainer);

  exerciseDiv.querySelector('.btn-add-set').addEventListener('click', (e) => {
    e.stopPropagation();
    rowsContainer.appendChild(createTemplateSetRow("", ""));
    updateSetRowsUI(rowsContainer);
  });
}

function createTemplateSetRow(weight, reps) {
  const row = document.createElement('div');
  row.className = 'tmpl-set-row-grid';
  row.style.cssText = 'display: grid; grid-template-columns: 32px 1fr 1fr 32px; gap: 8px; align-items: center; margin-bottom: 6px;';
  row.innerHTML = `
    <span class="set-label" style="text-align: center; font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">1</span>
    <input type="number" class="tmpl-weight" placeholder="0" value="${weight}" min="0" style="padding: 8px; background: var(--bg-input); border: 1px solid var(--glass-border); color: #fff; border-radius: 8px; text-align: center;">
    <input type="number" class="tmpl-reps" placeholder="0" value="${reps}" min="0" style="padding: 8px; background: var(--bg-input); border: 1px solid var(--glass-border); color: #fff; border-radius: 8px; text-align: center;">
    <div class="set-action-cell" style="display: flex; justify-content: center; align-items: center; width: 32px; height: 32px;"></div>
  `;
  return row;
}

function updateSetRowsUI(rowsContainer) {
  const rows = Array.from(rowsContainer.children);
  
  rows.forEach((row, idx) => {
    const label = row.querySelector('.set-label');
    if (label) label.innerText = idx + 1;

    const actionCell = row.querySelector('.set-action-cell');
    if (actionCell) {
      actionCell.innerHTML = '';

      if (idx === rows.length - 1 && rows.length > 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText = 'width: 26px; height: 26px; border-radius: 50%; background: var(--danger); color: #fff; border: none; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; cursor: pointer;';
        btn.title = 'Laatste set verwijderen';
        btn.innerHTML = '<i class="fa-solid fa-minus"></i>';
        btn.onclick = (e) => {
          e.stopPropagation();
          row.remove();
          updateSetRowsUI(rowsContainer);
        };
        actionCell.appendChild(btn);
      }
    }
  });
}

export function saveTemplate(onSavedCallback) {
  const name = document.getElementById('templateName')?.value.trim();
  const editingId = document.getElementById('editingTemplateId')?.value;

  if (!name) {
    alert("Vul a.u.b. een naam in voor je workout.");
    return;
  }

  const exerciseDivs = document.querySelectorAll('#templateExercisesContainer .template-exercise-item');
  let exercises = [];

  exerciseDivs.forEach(div => {
    const exId = div.querySelector('.tmpl-ex-hidden-input').value;
    if (!exId) return;

    const weights = div.querySelectorAll('.tmpl-weight');
    const reps = div.querySelectorAll('.tmpl-reps');
    let sets = [];

    weights.forEach((wInput, i) => {
      sets.push({ 
        weight: parseFloat(wInput.value) || 0, 
        reps: parseInt(reps[i].value) || 0
      });
    });

    exercises.push({ exerciseId: exId, sets });
  });

  if (exercises.length === 0) {
    alert("Selecteer bij alle toegevoegde oefeningen een geldige oefening.");
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
      userEmail: state.currentUser.email,
      name,
      exercises
    });
  }

  saveTemplates(templates);
  toggleNewTemplateForm();
  if (typeof onSavedCallback === 'function') onSavedCallback();
}

export function editTemplate(id) {
  const template = getTemplates().find(t => t.id === id);
  if (!template) return;

  document.getElementById('editingTemplateId').value = template.id;
  document.getElementById('templateName').value = template.name;

  const container = document.getElementById('templateExercisesContainer');
  container.innerHTML = "";

  template.exercises.forEach(ex => addExerciseToTemplate(ex.exerciseId, ex.sets));

  const card = document.getElementById('newTemplateCard');
  const templatesList = document.getElementById('templatesList');

  if (card) card.style.display = 'block';
  if (templatesList) templatesList.style.display = 'none';

  card?.scrollIntoView({ behavior: 'smooth' });
}

export function deleteTemplate(id, onDeletedCallback) {
  showCustomConfirm("Workoutschema Verwijderen", "Weet je zeker dat je dit schema wilt verwijderen?", () => {
    let templates = getTemplates().filter(t => t.id !== id);
    saveTemplates(templates);
    if (typeof onDeletedCallback === 'function') onDeletedCallback();
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