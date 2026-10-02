// ==========================================================================
// COACH MASTER TEMPLATES MODULE
// Beheert de centrale master-schema bibliotheek, filtering en toewijzen/delen (< 200 regels)
// ==========================================================================

import { state } from '../core/state.js';
import { getTemplates, saveTemplates, getUsers } from '../core/storage.js';
import { getFullExerciseDatabase, findExerciseById } from '../data/exercisesData.js';

let masterTemplates = JSON.parse(localStorage.getItem('aqm_master_templates') || '[]');

function saveMasterTemplatesToStorage() {
  localStorage.setItem('aqm_master_templates', JSON.stringify(masterTemplates));
}

/**
 * Initialiseert de event listeners voor het zoekveld en het herkomst-filter.
 */
function initMasterTemplatesFilterListeners() {
  const searchInput = document.getElementById('masterTemplateSearchInput');
  const originFilterInput = document.getElementById('masterTemplateOriginFilterInput');
  const originDropdownList = document.getElementById('customMasterTemplateOriginDropdownList');
  const hiddenOriginInput = document.getElementById('masterTemplateOriginFilter');

  if (searchInput && !searchInput.dataset.filterBound) {
    searchInput.dataset.filterBound = 'true';
    searchInput.addEventListener('input', () => renderCoachMasterTemplatesList());
  }

  if (originFilterInput && originDropdownList && !originFilterInput.dataset.filterBound) {
    originFilterInput.dataset.filterBound = 'true';

    originFilterInput.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = originDropdownList.style.display === 'none';
      originDropdownList.style.display = isHidden ? 'block' : 'none';
    });

    document.querySelectorAll('.master-origin-filter-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = item.getAttribute('data-value');
        const text = item.innerText;

        document.querySelectorAll('.master-origin-filter-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (hiddenOriginInput) hiddenOriginInput.value = val;
        if (originFilterInput) originFilterInput.value = text;
        originDropdownList.style.display = 'none';

        renderCoachMasterTemplatesList();
      });
    });

    document.addEventListener('click', (e) => {
      if (originDropdownList && !originFilterInput.contains(e.target)) {
        originDropdownList.style.display = 'none';
      }
    });
  }
}

/**
 * Rendert het overzicht van master-schema's op basis van de actieve filters.
 */
export function renderCoachMasterTemplatesList() {
  const container = document.getElementById('coachMasterTemplatesList');
  if (!container) return;

  initMasterTemplatesFilterListeners();

  const currentCoachEmail = state.currentUser?.email || '';
  const currentCoachId = state.currentUser?.coachId || '';

  const searchQuery = (document.getElementById('masterTemplateSearchInput')?.value || '').toLowerCase().trim();
  const originFilter = document.getElementById('masterTemplateOriginFilter')?.value || 'all';

  // 1. Haal alle master templates op die bestemd zijn voor deze coach
  let accessibleTemplates = masterTemplates.filter(t => {
    if (!t.coachEmail && !t.coachId) return true;
    return t.coachEmail === currentCoachEmail || (currentCoachId && t.coachId === currentCoachId);
  });

  // 2. Filter op Herkomst (Mijn Schema's vs Gedeeld met mij)
  if (originFilter === 'mine') {
    accessibleTemplates = accessibleTemplates.filter(t => !t.sharedByCoachEmail);
  } else if (originFilter === 'shared') {
    accessibleTemplates = accessibleTemplates.filter(t => !!t.sharedByCoachEmail);
  }

  // 3. Filter op zoekopdracht
  if (searchQuery) {
    accessibleTemplates = accessibleTemplates.filter(t => {
      const matchName = t.name.toLowerCase().includes(searchQuery);
      const matchEx = t.exercises.some(e => {
        const exObj = findExerciseById(e.exerciseId);
        return exObj && exObj.name.toLowerCase().includes(searchQuery);
      });
      return matchName || matchEx;
    });
  }

  if (accessibleTemplates.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 35px 15px;">
        <i class="fa-solid fa-folder-plus" style="font-size: 2.2rem; color: var(--gold-accent); margin-bottom: 12px; display: block; opacity: 0.8;"></i>
        <h4 style="margin: 0 0 6px 0; color: var(--white); font-size: 1rem;">Geen Master Schema's</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0 auto; max-width: 280px; line-height: 1.4;">
          ${searchQuery ? 'Geen schema\'s gevonden die voldoen aan je zoekopdracht.' : 'Geen schema\'s gevonden in deze categorie.'}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  accessibleTemplates.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card card-glass';
    card.style.cssText = 'border-left: 4px solid var(--gold-accent) !important; margin-bottom: 12px; position: relative; overflow: visible !important;';

    // Maximaal 3 badges tonen; overige verbergen achter een +X toggle knop
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

    let creatorSubtitle = '';
    if (t.sharedByCoachEmail) {
      const creatorName = t.sharedByCoachName || t.sharedByCoachEmail;
      creatorSubtitle = `
        <div style="font-size: 0.78rem; color: var(--gold-accent); font-weight: 600; margin-top: 2px; margin-bottom: 10px;">
          Door: ${creatorName}
        </div>
      `;
    }

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${t.sharedByCoachEmail ? '0px' : '10px'};">
        <h3 style="margin:0; color:var(--white); font-size: 1.1rem; font-weight: 700;">${t.name}</h3>
      </div>
      
      ${creatorSubtitle}

      <div class="exercise-badges-container" style="display: flex; flex-wrap: wrap; gap: 6px 8px; margin-bottom: 16px;">
        ${initialBadgesHTML}
        ${hiddenBadgesHTML}
        ${extraCount > 0 ? `<button type="button" class="exercise-badge btn-toggle-more" style="background: var(--bg-input); color: var(--gold-accent); border-color: var(--gold-accent); cursor: pointer;">+${extraCount}</button>` : ''}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px;">
        <button type="button" class="btn-primary btn-assign-master" style="padding: 8px 14px; font-size: 0.82rem; border-radius: var(--pill-radius); display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; transition: var(--transition);">
          <i class="fa-solid fa-user-plus"></i>
          <span class="btn-assign-text" style="transition: all 0.25s ease; max-width: 100px; overflow: hidden; display: inline-block;">Toewijzen</span>
        </button>

        <div class="card-action-bar" style="display: flex; align-items: center; margin-left: auto;">
          <div class="sliding-actions-drawer">
            <button type="button" class="btn-action-icon secondary btn-share-master" title="Delen met Coach"><i class="fa-solid fa-share-nodes"></i></button>
            <button type="button" class="btn-action-icon secondary btn-copy-master" title="Kopiëren"><i class="fa-regular fa-copy"></i></button>
            <button type="button" class="btn-action-icon secondary btn-edit-master" title="Bewerken"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="btn-action-icon btn-delete-tmpl-subtle btn-delete-master" title="Verwijderen"><i class="fa-solid fa-minus"></i></button>
          </div>

          <button type="button" class="btn-action-icon secondary btn-actions-toggle" title="Opties" style="margin-left: 8px;">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>
    `;

    const toggleBtn = card.querySelector('.btn-actions-toggle');
    const drawer = card.querySelector('.sliding-actions-drawer');
    const assignBtn = card.querySelector('.btn-assign-master');
    const assignText = card.querySelector('.btn-assign-text');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.contains('open');
      
      document.querySelectorAll('.sliding-actions-drawer.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.btn-actions-toggle.active').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.btn-assign-text').forEach(st => {
        st.style.maxWidth = '100px';
        st.style.opacity = '1';
        st.style.marginLeft = '0px';
      });

      if (!isOpen) {
        drawer.classList.add('open');
        toggleBtn.classList.add('active');
        
        if (assignText) {
          assignText.style.maxWidth = '0px';
          assignText.style.opacity = '0';
        }
        if (assignBtn) {
          assignBtn.style.padding = '8px 10px';
        }
      } else {
        if (assignBtn) {
          assignBtn.style.padding = '8px 14px';
        }
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

    card.querySelector('.btn-assign-master').addEventListener('click', (e) => {
      e.stopPropagation();
      openAssignMasterModal(t);
    });

    card.querySelector('.btn-share-master').addEventListener('click', (e) => {
      e.stopPropagation();
      openShareMasterModal(t);
    });

    card.querySelector('.btn-copy-master').addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateMasterTemplate(t.id);
    });

    card.querySelector('.btn-edit-master').addEventListener('click', (e) => {
      e.stopPropagation();
      editMasterTemplate(t.id);
    });

    card.querySelector('.btn-delete-master').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteMasterTemplate(t.id);
    });

    container.appendChild(card);
  });
}

/**
 * Schakelt de weergave van het formulier voor een nieuw Master Template.
 */
export function toggleCoachMasterTemplateForm() {
  const card = document.getElementById('coachMasterTemplateFormCard');
  const container = document.getElementById('coachMasterTemplatesContainer');
  const nameLabel = document.querySelector('label[for="masterTemplateName"]');
  if (!card) return;

  if (nameLabel) {
    nameLabel.innerText = "Naam schema";
  }

  const isVisible = card.style.display !== 'none';

  if (isVisible) {
    card.style.display = 'none';
    if (container) container.style.display = 'block';
  } else {
    card.style.display = 'block';
    if (container) container.style.display = 'none';

    document.getElementById('editingMasterTemplateId').value = '';
    document.getElementById('masterTemplateName').value = '';
    document.getElementById('masterTemplateExercisesContainer').innerHTML = '';
    addExerciseToMasterTemplate();
    card.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Update de nummers van de oefeningen.
 */
function updateMasterExerciseNumbersUI() {
  const items = document.querySelectorAll('#masterTemplateExercisesContainer .template-exercise-item');
  items.forEach((item, index) => {
    const label = item.querySelector('.master-ex-num-label');
    if (label) {
      label.innerText = `OEFENING ${index + 1}:`;
    }
  });
}

/**
 * Voegt een oefening toe aan het Master Template formulier.
 */
export function addExerciseToMasterTemplate(selectedExId = "", setsData = null) {
  const container = document.getElementById('masterTemplateExercisesContainer');
  if (!container) return;

  const exerciseDiv = document.createElement('div');
  exerciseDiv.className = 'template-exercise-item';
  exerciseDiv.style.cssText = 'margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--glass-border);';

  const sortedDatabase = getFullExerciseDatabase().sort((a, b) => a.name.localeCompare(b.name));
  const selectedEx = sortedDatabase.find(ex => ex.id === selectedExId) || null;

  exerciseDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <label class="master-ex-num-label" style="margin:0; font-size: 0.78rem; font-weight: 700; color: var(--gold-accent); text-transform: uppercase;">OEFENING:</label>
      
      <div style="display: flex; align-items: center; gap: 6px;">
        <button type="button" class="btn-ex-info" style="background: transparent; border: 1px solid var(--glass-border); color: var(--gold-accent); font-size: 0.75rem; padding: 3px 10px; border-radius: 12px; cursor: pointer; display: ${selectedEx ? 'flex' : 'none'}; align-items: center; gap: 4px;">
          <i class="fa-solid fa-circle-info"></i> Info
        </button>

        <button class="btn-remove-ex" type="button" title="Oefening verwijderen" style="background: transparent; border: 1px solid rgba(255, 69, 58, 0.4); color: var(--danger); font-size: 0.75rem; font-weight: 600; padding: 3px 8px; border-radius: 12px; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center;">
          <i class="fa-solid fa-minus"></i>
        </button>
      </div>
    </div>

    <div class="client-select-wrapper-inline" style="position: relative; width: 100%; margin-bottom: 12px;">
      <input type="hidden" class="tmpl-ex-hidden-input" value="${selectedEx ? selectedEx.id : ''}">
      <div class="inline-client-select tmpl-ex-trigger" style="width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: var(--bg-input); padding: 12px 14px; border-radius: var(--pill-radius); border: 1px solid var(--glass-border);">
        <span class="tmpl-ex-trigger-label" style="font-size: 0.88rem; font-weight: 600; ${!selectedEx ? 'color: var(--text-muted);' : 'color: #fff;'}">
          ${selectedEx ? selectedEx.name : '-- Kies Oefening --'}
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

    <!-- INFO BOX MET CATEGORIE-BADGE BOVENAAN EN VIDEOKNOP ONDERAAN -->
    <div class="tmpl-ex-info-box" style="display: none; background: rgba(255, 159, 10, 0.06); border: 1px solid rgba(255, 159, 10, 0.2); border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">
      <div class="info-ex-title" style="margin-bottom: 6px;"></div>
      <div class="info-ex-text"></div>
    </div>

    <div class="tmpl-sets-header" style="display: grid; grid-template-columns: 32px 1fr 1fr 32px; gap: 8px; align-items: center; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; text-align: center;">
      <span>SET</span>
      <span>KG</span>
      <span>REPS</span>
      <span></span>
    </div>

    <div class="tmpl-sets-rows"></div>

    <div style="display: flex; justify-content: flex-start; align-items: center; margin-top: 10px; padding-top: 4px;">
      <button class="btn-add-set" type="button" style="background: transparent; border: 1px solid var(--gold-accent); color: var(--gold-accent); font-size: 0.78rem; font-weight: 600; padding: 4px 10px; border-radius: 8px; cursor: pointer; transition: var(--transition);">
        + Set
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
    if (!hiddenInput.value) return;
    const isHidden = infoBox.style.display === 'none';
    
    if (isHidden) {
      const currentEx = findExerciseById(hiddenInput.value);
      if (currentEx) {
        const catStr = Array.isArray(currentEx.category) ? currentEx.category.join(', ') : currentEx.category;
        
        infoTitle.innerHTML = `<span class="exercise-badge" style="font-size: 0.72rem; padding: 3px 8px; background: rgba(255, 159, 10, 0.12); border: 1px solid rgba(255, 159, 10, 0.3); color: var(--gold-accent); font-weight: 600; border-radius: 6px; display: inline-block;">${catStr}</span>`;
        
        const videoBtnHTML = currentEx.videoUrl ? `
          <div style="margin-top: 10px;">
            <a href="${currentEx.videoUrl}" target="_blank" rel="noopener noreferrer" class="outline" style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; font-size: 0.78rem; text-decoration: none; border-radius: 8px;">
              <i class="fa-solid fa-play"></i> Video
            </a>
          </div>
        ` : '';

        infoText.innerHTML = `<div>${currentEx.instructions || 'Geen specifieke instructies beschikbaar voor deze oefening.'}</div>${videoBtnHTML}`;
        infoBox.style.display = 'block';
      }
    } else {
      infoBox.style.display = 'none';
    }
  });

  function renderDropdownItems(filterText = "") {
    itemsContainer.innerHTML = "";
    
    const usedExIds = Array.from(document.querySelectorAll('#masterTemplateExercisesContainer .tmpl-ex-hidden-input'))
      .map(input => input.value)
      .filter(val => val !== "");

    const filtered = sortedDatabase.filter(ex => {
      const catStr = Array.isArray(ex.category) ? ex.category.join(' ').toLowerCase() : (ex.category || '').toLowerCase();
      return ex.name.toLowerCase().includes(filterText.toLowerCase()) || catStr.includes(filterText.toLowerCase());
    });

    if (filtered.length === 0) {
      itemsContainer.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.82rem; text-align: center;">Geen oefening gevonden</div>';
      return;
    }

    filtered.forEach(ex => {
      const isAlreadyUsed = usedExIds.includes(ex.id) && ex.id !== hiddenInput.value;
      const catStr = Array.isArray(ex.category) ? ex.category.join(', ') : ex.category;

      const item = document.createElement('div');
      item.style.cssText = `padding: 8px 10px; color: #fff; font-size: 0.85rem; cursor: pointer; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; ${
        ex.id === hiddenInput.value ? 'background: rgba(255, 159, 10, 0.18); color: var(--gold-accent);' : ''
      } ${isAlreadyUsed ? 'opacity: 0.5;' : ''}`;

      const badgeText = isAlreadyUsed ? 'Al in schema' : catStr;
      const badgeStyle = isAlreadyUsed 
        ? 'font-size: 0.7rem; padding: 2px 6px; background: rgba(255,255,255,0.1); color: var(--text-muted);' 
        : 'font-size: 0.7rem; padding: 2px 6px; background: rgba(255, 255, 255, 0.06); border: 1px solid var(--glass-border); border-radius: 6px; color: var(--text-muted); font-weight: 500;';

      item.innerHTML = `
        <span>${ex.name}</span>
        <span class="exercise-badge" style="${badgeStyle}">${badgeText}</span>
      `;

      item.onclick = (e) => {
        e.stopPropagation();
        hiddenInput.value = ex.id;
        label.innerText = ex.name;
        label.style.color = '#ffffff';
        list.style.display = 'none';
        infoBox.style.display = 'none';
        infoBtn.style.display = 'flex';
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
    document.querySelectorAll('#masterTemplateExercisesContainer .tmpl-ex-dropdown-list').forEach(l => l.style.display = 'none');
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

  exerciseDiv.querySelector('.btn-remove-ex').addEventListener('click', (e) => {
    e.stopPropagation();
    exerciseDiv.remove();
    updateMasterExerciseNumbersUI();
  });

  container.appendChild(exerciseDiv);
  updateMasterExerciseNumbersUI();

  const rowsContainer = exerciseDiv.querySelector('.tmpl-sets-rows');
  if (setsData && setsData.length > 0) {
    setsData.forEach(s => rowsContainer.appendChild(createMasterSetRow(s.weight, s.reps)));
  } else {
    rowsContainer.appendChild(createMasterSetRow("", ""));
  }

  updateMasterSetRowsUI(rowsContainer);

  exerciseDiv.querySelector('.btn-add-set').addEventListener('click', (e) => {
    e.stopPropagation();
    rowsContainer.appendChild(createMasterSetRow("", ""));
    updateMasterSetRowsUI(rowsContainer);
  });
}

function createMasterSetRow(weight, reps) {
  const row = document.createElement('div');
  row.className = 'tmpl-set-row-grid';
  row.style.cssText = 'display: grid; grid-template-columns: 32px 1fr 1fr 32px; gap: 8px; align-items: center; margin-bottom: 6px;';
  row.innerHTML = `
    <span class="set-label" style="text-align: center; font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">1</span>
    <input type="number" class="tmpl-weight" placeholder="0" value="${weight}" min="0" style="padding: 10px 8px !important; height: 38px !important; line-height: 1; background: var(--bg-input); border: 1px solid var(--glass-border); color: #fff; border-radius: 8px; text-align: center; font-weight: 600; outline: none;">
    <input type="number" class="tmpl-reps" placeholder="0" value="${reps}" min="0" style="padding: 10px 8px !important; height: 38px !important; line-height: 1; background: var(--bg-input); border: 1px solid var(--glass-border); color: #fff; border-radius: 8px; text-align: center; font-weight: 600; outline: none;">
    <div class="set-action-cell" style="display: flex; justify-content: center; align-items: center; width: 32px; height: 38px;"></div>
  `;
  return row;
}

/**
 * Zorgt dat enkel de ALLERLAATSTE set van een oefening een verwijderknop krijgt.
 */
function updateMasterSetRowsUI(rowsContainer) {
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
        btn.style.cssText = 'width: 32px; height: 38px; border-radius: 8px; background: transparent; border: 1px solid rgba(255, 69, 58, 0.5); color: var(--danger); display: flex; align-items: center; justify-content: center; font-size: 0.82rem; cursor: pointer; transition: var(--transition); box-sizing: border-box;';
        btn.title = 'Laatste set verwijderen';
        btn.innerHTML = '<i class="fa-solid fa-minus"></i>';
        btn.onclick = (e) => {
          e.stopPropagation();
          row.remove();
          updateMasterSetRowsUI(rowsContainer);
        };
        actionCell.appendChild(btn);
      }
    }
  });
}

/**
 * Slaat een nieuw of bewerkt Master Template op.
 */
export function saveCoachMasterTemplate() {
  const name = document.getElementById('masterTemplateName')?.value.trim();
  const editingId = document.getElementById('editingMasterTemplateId')?.value;

  if (!name) {
    showCustomAlert("Invoer Onvolledig", "Vul a.u.b. een naam in voor het master schema.");
    return;
  }

  const exerciseDivs = document.querySelectorAll('#masterTemplateExercisesContainer .template-exercise-item');
  let exercises = [];

  exerciseDivs.forEach(div => {
    const exId = div.querySelector('.tmpl-ex-hidden-input')?.value;
    if (!exId) return;

    const weights = div.querySelectorAll('.tmpl-weight');
    const reps = div.querySelectorAll('.tmpl-reps');
    let sets = [];

    weights.forEach((wInput, i) => {
      sets.push({ 
        weight: parseFloat(wInput.value) || 0, 
        reps: parseInt(reps[i].value) || 0,
        completed: false
      });
    });

    exercises.push({ exerciseId: exId, sets });
  });

  if (exercises.length === 0) {
    showCustomAlert("Invoer Onvolledig", "Voeg minimaal één geldige oefening toe aan het schema.");
    return;
  }

  const coachEmail = state.currentUser?.email || '';
  const coachId = state.currentUser?.coachId || '';

  if (editingId) {
    const index = masterTemplates.findIndex(t => String(t.id) === String(editingId));
    if (index !== -1) {
      masterTemplates[index].name = name;
      masterTemplates[index].exercises = exercises;
      masterTemplates[index].coachEmail = coachEmail;
      masterTemplates[index].coachId = coachId;
    }
  } else {
    masterTemplates.push({
      id: Date.now(),
      coachEmail,
      coachId,
      name,
      exercises
    });
  }

  saveMasterTemplatesToStorage();
  toggleCoachMasterTemplateForm();
  renderCoachMasterTemplatesList();
}

/**
 * Opent een pop-up om het master template toe te wijzen aan meerdere geselecteerde sporters.
 */
function openAssignMasterModal(template) {
  const allUsers = getUsers();
  const currentCoachId = state.currentUser?.coachId;
  const currentCoachEmail = state.currentUser?.email;

  const targetCoachId = (currentCoachId || '').toUpperCase();
  const targetCoachEmail = (currentCoachEmail || '').toLowerCase();

  const myClients = allUsers.filter(u => {
    if (u.role !== 'client') return false;
    const clientCoachId = (u.linkedCoachId || u.linkedCoachCode || '').toUpperCase();
    const clientCoachEmail = (u.linkedCoachEmail || '').toLowerCase();

    return (targetCoachId && clientCoachId === targetCoachId) || (targetCoachEmail && clientCoachEmail === targetCoachEmail);
  });

  const coachCodeDisplay = currentCoachId || 'jouw coach code';

  if (myClients.length === 0) {
    showCleanAlertWithoutIcons("Geen Sporters Gekoppeld", `je hebt nog geen sporters, deel jouw code (${coachCodeDisplay})`);
    return;
  }

  const modal = document.getElementById('customConfirmModal');
  const modalCard = modal?.querySelector('.modal-card') || modal?.querySelector('.card-glass') || modal?.querySelector('.modal-content') || modal?.firstElementChild;
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!modal) return;

  let selectedEmails = [];

  if (modalCard) {
    modalCard.style.cssText = 'max-height: 82vh !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; width: 92% !important; max-width: 420px !important; padding: 20px 16px !important; border-radius: 18px !important;';
  }

  if (titleEl) {
    titleEl.innerText = `Schema Toewijzen`;
    titleEl.style.cssText = 'flex-shrink: 0; margin-bottom: 8px;';
  }

  function updateOkButtonState() {
    if (!okBtn) return;
    const count = selectedEmails.length;
    if (count === 0) {
      okBtn.innerText = "Kies min. 1 sporter";
      okBtn.style.opacity = '0.5';
      okBtn.style.cursor = 'not-allowed';
    } else if (count === 1) {
      okBtn.innerText = "Toewijzen aan 1 sporter";
      okBtn.style.opacity = '1';
      okBtn.style.cursor = 'pointer';
    } else {
      okBtn.innerText = `Toewijzen aan ${count} sporters`;
      okBtn.style.opacity = '1';
      okBtn.style.cursor = 'pointer';
    }
  }

  if (textEl) {
    textEl.style.cssText = 'display: flex; flex-direction: column; flex: 1; overflow: hidden; margin-bottom: 12px;';
    textEl.innerHTML = `
      <p style="margin-bottom: 12px; color: var(--text-muted); font-size: 0.88rem; flex-shrink: 0;">
        Selecteer de sporters aan wie je "<strong>${template.name}</strong>" wilt toewijzen:
      </p>

      <!-- SCROLLBARE MULTI-SELECT SPORTERSLIJST -->
      <div id="assignClientDropdownList" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px; margin-bottom: 8px;">
        ${myClients.map(c => {
          const clientName = (c.firstName && c.lastName) 
            ? `${c.firstName}${c.lastName}` 
            : (c.name || c.email);

          return `
            <div class="assign-client-item" data-email="${c.email}" data-name="${clientName}" style="padding: 12px 14px; border-radius: 12px; font-size: 0.88rem; color: #fff; cursor: pointer; background: var(--bg-input); border: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; transition: var(--transition);">
              <div style="display: flex; flex-direction: column; text-align: left;">
                <span class="item-name" style="font-weight: 700; color: #ffffff;">${clientName}</span>
                <span style="color: var(--text-muted); font-size: 0.76rem; font-weight: 400; margin-top: 2px;">${c.email}</span>
              </div>
              <i class="fa-solid fa-check item-check-icon" style="font-size: 0.9rem; color: var(--gold-accent); display: none;"></i>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  setTimeout(() => {
    const items = document.querySelectorAll('.assign-client-item');

    items.forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const email = item.getAttribute('data-email');
        const checkIcon = item.querySelector('.item-check-icon');
        const nameSpan = item.querySelector('.item-name');

        if (selectedEmails.includes(email)) {
          selectedEmails = selectedEmails.filter(e => e !== email);
          item.style.background = 'var(--bg-input)';
          item.style.borderColor = 'var(--glass-border)';
          if (nameSpan) nameSpan.style.color = '#ffffff';
          if (checkIcon) checkIcon.style.display = 'none';
        } else {
          selectedEmails.push(email);
          item.style.background = 'rgba(255, 159, 10, 0.15)';
          item.style.borderColor = 'var(--gold-accent)';
          if (nameSpan) nameSpan.style.color = 'var(--gold-accent)';
          if (checkIcon) checkIcon.style.display = 'inline-block';
        }

        updateOkButtonState();
      };
    });

    updateOkButtonState();
  }, 50);

  if (cancelBtn) cancelBtn.style.display = 'inline-block';
  modal.style.display = 'flex';

  cancelBtn.onclick = () => {
    modal.style.display = 'none';
    if (modalCard) modalCard.style.cssText = '';
  };

  okBtn.onclick = () => {
    if (selectedEmails.length === 0) return;

    let templates = getTemplates();

    selectedEmails.forEach(email => {
      templates.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        userEmail: email,
        name: template.name,
        exercises: JSON.parse(JSON.stringify(template.exercises))
      });
    });

    saveTemplates(templates);
    modal.style.display = 'none';
    if (modalCard) modalCard.style.cssText = '';

    const msg = selectedEmails.length === 1 
      ? `Schema "${template.name}" is succesvol toegewezen!` 
      : `Schema "${template.name}" is succesvol toegewezen aan ${selectedEmails.length} sporters!`;

    showCustomAlert("Schema Toegewezen", msg);
  };
}

function openShareMasterModal(template) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!modal) return;

  if (titleEl) titleEl.innerText = `Master Schema Delen`;
  if (textEl) {
    textEl.innerHTML = `
      <p style="margin-bottom: 12px; color: var(--text-muted); font-size: 0.88rem;">Vul de <strong>Coach ID</strong> of het <strong>e-mailadres</strong> in van de collega-coach:</p>
      <div class="floating-group" style="margin-bottom: 0;">
        <input type="text" id="targetCoachIdentifierInput" placeholder=" " autocomplete="off" style="text-transform: uppercase;">
        <label for="targetCoachIdentifierInput">Coach ID of E-mailadres</label>
      </div>
    `;
  }

  if (cancelBtn) cancelBtn.style.display = 'inline-block';
  modal.style.display = 'flex';

  cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };

  okBtn.onclick = () => {
    const rawInput = document.getElementById('targetCoachIdentifierInput')?.value.trim();
    if (!rawInput) {
      showCustomAlert("Ongeldige Invoer", "Vul a.u.b. een Coach ID of e-mailadres in.");
      return;
    }

    const allUsers = getUsers();
    const targetInputUpper = rawInput.toUpperCase();
    const targetInputLower = rawInput.toLowerCase();

    const targetCoach = allUsers.find(u => 
      u.role === 'coach' && (
        (u.coachId && u.coachId.toUpperCase() === targetInputUpper) || 
        (u.email && u.email.toLowerCase() === targetInputLower)
      )
    );

    if (!targetCoach) {
      showCustomAlert("Coach Niet Gevonden", "Geen actieve coach gevonden met deze Coach-ID of e-mailadres.");
      return;
    }

    if (targetCoach.email === state.currentUser?.email) {
      showCustomAlert("Actie Niet Mogelijk", "Je kunt geen schema met jezelf delen.");
      return;
    }

    const currentCoachName = state.currentUser?.firstName ? `${state.currentUser.firstName} ${state.currentUser.lastName}` : state.currentUser?.email;

    masterTemplates.push({
      id: Date.now(),
      coachEmail: targetCoach.email,
      coachId: targetCoach.coachId || '',
      sharedByCoachEmail: state.currentUser?.email || '',
      sharedByCoachName: currentCoachName,
      name: template.name.replace(/\s*\(Gedeeld\)/gi, ''),
      exercises: JSON.parse(JSON.stringify(template.exercises))
    });

    saveMasterTemplatesToStorage();
    modal.style.display = 'none';

    const targetName = targetCoach.firstName ? `${targetCoach.firstName} ${targetCoach.lastName}` : targetCoach.email;
    showCustomAlert("Schema Gedeeld", `Een kopie van "${template.name}" is succesvol overgedragen aan ${targetName}!`);
  };
}

function duplicateMasterTemplate(id) {
  const target = masterTemplates.find(t => String(t.id) === String(id));
  if (!target) return;

  masterTemplates.push({
    ...JSON.parse(JSON.stringify(target)),
    id: Date.now(),
    coachEmail: state.currentUser?.email || '',
    coachId: state.currentUser?.coachId || '',
    sharedByCoachEmail: undefined,
    sharedByCoachName: undefined,
    name: `${target.name.replace(/\s*\(Kopie\)/gi, '')} (Kopie)`
  });

  saveMasterTemplatesToStorage();
  renderCoachMasterTemplatesList();
}

function editMasterTemplate(id) {
  const target = masterTemplates.find(t => String(t.id) === String(id));
  if (!target) return;

  toggleCoachMasterTemplateForm();
  document.getElementById('editingMasterTemplateId').value = target.id;
  document.getElementById('masterTemplateName').value = target.name;

  const container = document.getElementById('masterTemplateExercisesContainer');
  container.innerHTML = '';

  target.exercises.forEach(ex => addExerciseToMasterTemplate(ex.exerciseId, ex.sets));
}

function deleteMasterTemplate(id) {
  showCustomConfirm("Master Schema Verwijderen", "Weet je zeker dat je dit master schema wilt verwijderen uit je bibliotheek?", () => {
    masterTemplates = masterTemplates.filter(t => String(t.id) !== String(id));
    saveMasterTemplatesToStorage();
    renderCoachMasterTemplatesList();
  });
}

function showCustomAlert(title, text) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!modal) {
    alert(`${title}: ${text}`);
    return;
  }

  if (titleEl) titleEl.innerText = title;
  if (textEl) textEl.innerText = text;
  if (cancelBtn) cancelBtn.style.display = 'none';

  modal.style.display = 'flex';

  okBtn.onclick = () => {
    modal.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
  };
}

function showCleanAlertWithoutIcons(title, text) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!modal) {
    alert(`${title}: ${text}`);
    return;
  }

  if (titleEl) titleEl.innerText = title;
  if (textEl) {
    textEl.innerHTML = `<p style="margin: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.45;">${text}</p>`;
  }

  if (cancelBtn) cancelBtn.style.display = 'none';

  modal.style.display = 'flex';

  okBtn.onclick = () => {
    modal.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
  };
}

function showCustomConfirm(title, text, onConfirm) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const textEl = document.getElementById('confirmModalText');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const okBtn = document.getElementById('confirmModalOkBtn');

  if (!modal) {
    if (confirm(text)) onConfirm();
    return;
  }

  if (titleEl) titleEl.innerText = title;
  if (textEl) textEl.innerText = text;
  if (cancelBtn) cancelBtn.style.display = 'inline-block';

  modal.style.display = 'flex';

  cancelBtn.onclick = () => {
    modal.style.display = 'none';
  };

  okBtn.onclick = () => {
    modal.style.display = 'none';
    if (typeof onConfirm === 'function') onConfirm();
  };
}