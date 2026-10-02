// ==========================================================================
// COACH EXERCISES MODULE
// Beheert de oefeningendatabank, custom oefeningen, favorieten en filters (< 200 regels)
// ==========================================================================

import { getFullExerciseDatabase, addCustomExercise, deleteExerciseById } from '../data/exercisesData.js';
import { generateUniqueId } from '../core/utils.js';
import { updateCoachFabVisibility } from './coachNav.js';

let favoriteExerciseIds = JSON.parse(localStorage.getItem('aqm_favorite_exercises') || '[]');
let isOnlyFavoritesFilterActive = false;
let selectedFormCategories = [];

function saveFavoritesToStorage() {
  localStorage.setItem('aqm_favorite_exercises', JSON.stringify(favoriteExerciseIds));
}

/**
 * Past de hoogte van de textarea automatisch aan aan de inhoud.
 */
function autoResizeTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.max(textarea.scrollHeight, 80)}px`;
}

/**
 * Rendert de badges voor geselecteerde categorieën in het toevoeg/bewerkformulier.
 */
function renderSelectedFormCategoriesBadges() {
  const container = document.getElementById('selectedCategoriesBadgeContainer');
  const hiddenInput = document.getElementById('newExCategory');
  const searchInput = document.getElementById('newExCategorySearchInput');

  if (hiddenInput) {
    hiddenInput.value = selectedFormCategories.join(', ');
  }

  if (searchInput) {
    searchInput.value = 'Klik om categorieën te kiezen...';
  }

  if (!container) return;

  if (selectedFormCategories.length === 0) {
    container.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-muted);">Geen categorieën geselecteerd</span>';
    return;
  }

  container.innerHTML = selectedFormCategories.map(cat => `
    <span class="exercise-badge" style="margin: 0; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 159, 10, 0.2); color: var(--gold-accent); border: 1px solid var(--gold-accent);">
      ${cat}
      <i class="fa-solid fa-xmark remove-cat-btn" data-cat="${cat}" style="cursor: pointer; font-size: 0.75rem;"></i>
    </span>
  `).join('');

  container.querySelectorAll('.remove-cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const catToRemove = btn.getAttribute('data-cat');
      selectedFormCategories = selectedFormCategories.filter(c => c !== catToRemove);
      renderSelectedFormCategoriesBadges();
      populateExerciseCategoryDropdowns();
    });
  });
}

/**
 * Vult de custom categoriedropdowns (zowel voor de filter als voor het toevoegformulier).
 */
export function populateExerciseCategoryDropdowns() {
  const categories = ['Borst', 'Rug', 'Benen', 'Schouders', 'Armen', 'Buik'];

  // 1. Categoriefilter op het dashboard
  const filterSearchInput = document.getElementById('coachExerciseCategorySearchInput');
  const filterHiddenInput = document.getElementById('coachExerciseCategoryFilter');
  const filterDropdownList = document.getElementById('customExerciseCategoryDropdownList');

  if (filterSearchInput && filterDropdownList) {
    const currentVal = filterHiddenInput ? filterHiddenInput.value : '';
    let filterHtml = `<div class="custom-dropdown-item ${!currentVal ? 'active' : ''}" data-cat="" style="${!currentVal ? 'color: var(--gold-accent); background: rgba(255, 159, 10, 0.15); font-weight: 700;' : ''}">Alle Categorieën</div>`;

    categories.forEach(cat => {
      const isSelected = currentVal.toLowerCase() === cat.toLowerCase();
      filterHtml += `<div class="custom-dropdown-item ${isSelected ? 'active' : ''}" data-cat="${cat}" style="${isSelected ? 'color: var(--gold-accent); background: rgba(255, 159, 10, 0.15); font-weight: 700;' : ''}">${cat}</div>`;
    });

    filterDropdownList.innerHTML = filterHtml;

    filterDropdownList.querySelectorAll('.custom-dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const cat = item.getAttribute('data-cat');
        if (filterHiddenInput) filterHiddenInput.value = cat;
        if (filterSearchInput) filterSearchInput.value = cat || 'Alle Categorieën';
        filterDropdownList.style.display = 'none';
        renderCoachExercisesList();
      });
    });
  }

  // 2. Formulier Multi-Categorie Selectie
  const formDropdownList = document.getElementById('customNewExCategoryDropdownList');

  if (formDropdownList) {
    let formHtml = '';

    categories.forEach(cat => {
      const isSelected = selectedFormCategories.includes(cat);
      formHtml += `
        <div class="custom-dropdown-item ${isSelected ? 'active' : ''}" data-cat="${cat}" style="display: flex; justify-content: space-between; align-items: center; ${isSelected ? 'color: var(--gold-accent); background: rgba(255, 159, 10, 0.15); font-weight: 700;' : ''}">
          <span>${cat}</span>
          ${isSelected ? '<i class="fa-solid fa-check" style="font-size: 0.8rem;"></i>' : ''}
        </div>
      `;
    });

    formDropdownList.innerHTML = formHtml;

    formDropdownList.querySelectorAll('.custom-dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const cat = item.getAttribute('data-cat');
        
        if (selectedFormCategories.includes(cat)) {
          selectedFormCategories = selectedFormCategories.filter(c => c !== cat);
        } else {
          selectedFormCategories.push(cat);
        }

        renderSelectedFormCategoriesBadges();
        populateExerciseCategoryDropdowns();
      });
    });
  }
}

/**
 * Zet categorie-informatie van een oefening om naar een uniforme array.
 */
function getExerciseCategoriesArray(ex) {
  if (Array.isArray(ex.category)) return ex.category;
  if (typeof ex.category === 'string' && ex.category.trim() !== '') {
    return ex.category.split(',').map(c => c.trim());
  }
  return ['Algemeen'];
}

/**
 * Rendert de volledige oefeningenlijst op het coach dashboard.
 */
export function renderCoachExercisesList() {
  const container = document.getElementById('coachExercisesList');
  if (!container) return;

  populateExerciseCategoryDropdowns();

  const nameSearch = document.getElementById('coachExerciseSearchInput')?.value.trim().toLowerCase() || '';
  const categoryFilter = document.getElementById('coachExerciseCategoryFilter')?.value.trim().toLowerCase() || '';

  let exercises = getFullExerciseDatabase();

  if (nameSearch) {
    exercises = exercises.filter(ex => ex.name.toLowerCase().includes(nameSearch));
  }

  if (categoryFilter) {
    exercises = exercises.filter(ex => {
      const cats = getExerciseCategoriesArray(ex).map(c => c.toLowerCase());
      return cats.includes(categoryFilter);
    });
  }

  if (isOnlyFavoritesFilterActive) {
    exercises = exercises.filter(ex => favoriteExerciseIds.includes(String(ex.id)));
  }

  exercises.sort((a, b) => a.name.localeCompare(b.name));

  if (exercises.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px 0;">Geen oefeningen gevonden.</p>';
    return;
  }

  container.innerHTML = '';
  exercises.forEach(ex => {
    const isFav = favoriteExerciseIds.includes(String(ex.id));
    const categoriesArray = getExerciseCategoriesArray(ex);

    const card = document.createElement('div');
    card.className = 'card card-glass';
    card.style.cssText = 'margin-bottom: 12px; padding: 14px 16px; position: relative; overflow: hidden;';

    card.innerHTML = `
      <!-- BOVENREGEL: NAAM LINKS (MET AFSTAND), STER RECHTSBOVEN -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <h4 style="margin: 0; color: var(--white); font-size: 1.05rem; font-weight: 700; max-width: calc(100% - 36px); word-break: break-word;">${ex.name}</h4>
        <button type="button" class="btn-fav-star" title="Favoriet" style="background: none; border: none; cursor: pointer; padding: 2px; color: ${isFav ? 'var(--gold-accent)' : 'var(--text-muted)'}; font-size: 1.1rem; flex-shrink: 0;">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
        </button>
      </div>

      <!-- MIDDEN: UITKLAPBARE INSTRUCTIES EN OPTIONELE VIDEO LINK -->
      <div class="exercise-details-box" style="display: none; padding: 10px 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); border-radius: 10px; margin-bottom: 12px;">
        <p style="margin: 0 0 ${ex.videoUrl ? '8px' : '0'} 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.45;">${ex.instructions || 'Geen specifieke instructies beschikbaar.'}</p>
        ${ex.videoUrl ? `
          <a href="${ex.videoUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--gold-accent); text-decoration: none; font-weight: 600;">
            <i class="fa-solid fa-circle-play"></i> Bekijk Demonstratievideo
          </a>
        ` : ''}
      </div>

      <!-- ONDERSTE REGEL: CATEGORIE BADGES LINKSONDER, OOGJE & TOGGLE RECHTSONDER -->
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px;">
        <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
          ${categoriesArray.map(cat => `<span class="exercise-badge" style="margin: 0; font-weight: 600; font-size: 0.75rem;">${cat}</span>`).join('')}
        </div>

        <div class="card-action-bar" style="display: flex; align-items: center; margin-left: auto; flex-shrink: 0; gap: 8px;">
          <button type="button" class="btn-action-icon secondary btn-toggle-details" title="Bekijk instructies">
            <i class="fa-regular fa-eye"></i>
          </button>

          <div class="sliding-actions-drawer">
            <button type="button" class="btn-action-icon secondary btn-edit-ex" title="Bewerken"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="btn-action-icon btn-delete-tmpl-subtle btn-delete-ex" title="Verwijderen"><i class="fa-solid fa-minus"></i></button>
          </div>

          <button type="button" class="btn-action-icon secondary btn-actions-toggle" title="Opties">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </div>
    `;

    // Favoriet togglen
    card.querySelector('.btn-fav-star').addEventListener('click', (e) => {
      e.stopPropagation();
      const strId = String(ex.id);
      if (favoriteExerciseIds.includes(strId)) {
        favoriteExerciseIds = favoriteExerciseIds.filter(id => id !== strId);
      } else {
        favoriteExerciseIds.push(strId);
      }
      saveFavoritesToStorage();
      renderCoachExercisesList();
    });

    // Oogje togglen (Details in-/uitklappen)
    const eyeBtn = card.querySelector('.btn-toggle-details');
    const detailsBox = card.querySelector('.exercise-details-box');

    eyeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = detailsBox.style.display === 'none';
      
      if (isHidden) {
        detailsBox.style.display = 'block';
        eyeBtn.innerHTML = '<i class="fa-solid fa-eye" style="color: var(--gold-accent);"></i>';
        eyeBtn.style.background = 'rgba(255, 159, 10, 0.15)';
        eyeBtn.style.borderColor = 'var(--gold-accent)';
      } else {
        detailsBox.style.display = 'none';
        eyeBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
        eyeBtn.style.background = 'var(--bg-input)';
        eyeBtn.style.borderColor = 'var(--glass-border)';
      }
    });

    // Roterende optieknop + uitschuiflade
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

    // Bewerken
    card.querySelector('.btn-edit-ex').addEventListener('click', (e) => {
      e.stopPropagation();
      editCoachExercise(ex);
    });

    // Verwijderen via Custom Confirm Modal
    card.querySelector('.btn-delete-ex').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCoachExercise(ex.id);
    });

    container.appendChild(card);
  });
}

/**
 * Schakelt de weergave van het formulier om een nieuwe/bewerkte oefening toe te voegen.
 */
export function toggleCoachNewExerciseForm() {
  const card = document.getElementById('coachNewExerciseCard');
  const listContainer = document.getElementById('coachExercisesContainer');
  const titleEl = document.getElementById('coachExerciseFormTitle');
  const instructionsEl = document.getElementById('newExInstructions');
  if (!card) return;

  const isVisible = getComputedStyle(card).display !== 'none';

  if (isVisible) {
    card.style.display = 'none';
    if (listContainer) listContainer.style.display = 'block';
  } else {
    card.style.display = 'block';
    if (listContainer) listContainer.style.display = 'none';

    document.getElementById('editingExerciseId').value = '';
    if (titleEl) titleEl.innerText = 'Nieuwe Oefening Toevoegen';

    document.getElementById('newExName').value = '';
    document.getElementById('newExVideoUrl').value = '';
    selectedFormCategories = [];
    renderSelectedFormCategoriesBadges();

    if (instructionsEl) {
      instructionsEl.value = '';
      instructionsEl.style.height = '80px';
    }

    card.scrollIntoView({ behavior: 'smooth' });
  }

  updateCoachFabVisibility();
}

/**
 * Slaat een nieuwe of bewerkte custom oefening op.
 */
export function saveCoachCustomExercise() {
  const editingId = document.getElementById('editingExerciseId')?.value;
  const name = document.getElementById('newExName')?.value.trim();
  const videoUrl = document.getElementById('newExVideoUrl')?.value.trim();
  const instructions = document.getElementById('newExInstructions')?.value.trim();

  if (!name || selectedFormCategories.length === 0) {
    showCustomAlert("Invoer Onvolledig", "Vul a.u.b. de naam in en kies minimaal één categorie.");
    return;
  }

  let customExercises = JSON.parse(localStorage.getItem('aqm_custom_exercises') || '[]');

  if (editingId) {
    const index = customExercises.findIndex(e => String(e.id) === String(editingId));
    if (index !== -1) {
      customExercises[index].name = name;
      customExercises[index].category = selectedFormCategories.join(', ');
      customExercises[index].videoUrl = videoUrl;
      customExercises[index].instructions = instructions || 'Geen specifieke instructies.';
    } else {
      customExercises.push({
        id: editingId,
        name,
        category: selectedFormCategories.join(', '),
        videoUrl,
        instructions: instructions || 'Geen specifieke instructies.'
      });
    }
    localStorage.setItem('aqm_custom_exercises', JSON.stringify(customExercises));
  } else {
    const newExercise = {
      id: generateUniqueId(),
      name,
      category: selectedFormCategories.join(', '),
      videoUrl,
      instructions: instructions || 'Geen specifieke instructies.'
    };
    addCustomExercise(newExercise);
  }
  
  toggleCoachNewExerciseForm();
  renderCoachExercisesList();
}

/**
 * Bewerkt een bestaande oefening
 */
function editCoachExercise(ex) {
  toggleCoachNewExerciseForm();
  
  const titleEl = document.getElementById('coachExerciseFormTitle');
  if (titleEl) titleEl.innerText = 'Oefening Bewerken';

  document.getElementById('editingExerciseId').value = ex.id;
  document.getElementById('newExName').value = ex.name;
  document.getElementById('newExVideoUrl').value = ex.videoUrl || '';
  
  selectedFormCategories = getExerciseCategoriesArray(ex);
  renderSelectedFormCategoriesBadges();
  populateExerciseCategoryDropdowns();

  const instructionsEl = document.getElementById('newExInstructions');
  if (instructionsEl) {
    instructionsEl.value = ex.instructions || '';
    autoResizeTextarea(instructionsEl);
  }
}

/**
 * Verwijdert een oefening via de AQM Confirm Modal
 */
function deleteCoachExercise(id) {
  showCustomConfirm("Oefening Verwijderen", "Weet je zeker dat je deze oefening wilt verwijderen?", () => {
    deleteExerciseById(id);
    renderCoachExercisesList();
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

// INITIËLE LISTENERS VOOR OEFENINGEN TAB
function initCoachExerciseListeners() {
  const topCreateBtn = document.getElementById('topCreateExerciseBtn');
  if (topCreateBtn) {
    topCreateBtn.addEventListener('click', toggleCoachNewExerciseForm);
  }

  const cancelBtn = document.getElementById('cancelCustomExBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', toggleCoachNewExerciseForm);
  }

  const saveBtn = document.getElementById('saveCustomExBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveCoachCustomExercise);
  }

  const searchInput = document.getElementById('coachExerciseSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderCoachExercisesList);
  }

  // Auto-expand textarea tijdens het typen
  const instructionsTextarea = document.getElementById('newExInstructions');
  if (instructionsTextarea) {
    instructionsTextarea.addEventListener('input', () => {
      autoResizeTextarea(instructionsTextarea);
    });
  }

  // Favorieten filter toggle
  const favToggleBtn = document.getElementById('btnToggleFavoriteExercises');
  if (favToggleBtn) {
    favToggleBtn.addEventListener('click', () => {
      isOnlyFavoritesFilterActive = !isOnlyFavoritesFilterActive;
      const icon = favToggleBtn.querySelector('i');
      if (isOnlyFavoritesFilterActive) {
        favToggleBtn.style.background = 'rgba(255, 159, 10, 0.2)';
        favToggleBtn.style.borderColor = 'var(--gold-accent)';
        if (icon) {
          icon.className = 'fa-solid fa-star';
          icon.style.color = 'var(--gold-accent)';
        }
      } else {
        favToggleBtn.style.background = 'var(--bg-input)';
        favToggleBtn.style.borderColor = 'var(--glass-border)';
        if (icon) {
          icon.className = 'fa-regular fa-star';
          icon.style.color = 'var(--text-muted)';
        }
      }
      renderCoachExercisesList();
    });
  }

  // Custom Categoriefilter Dropdown events
  const filterSearchInput = document.getElementById('coachExerciseCategorySearchInput');
  const filterDropdownList = document.getElementById('customExerciseCategoryDropdownList');
  if (filterSearchInput && filterDropdownList) {
    filterSearchInput.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = filterDropdownList.style.display === 'block';
      filterDropdownList.style.display = isVisible ? 'none' : 'block';
      populateExerciseCategoryDropdowns();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#coachExercisesContainer .custom-dropdown-wrapper')) {
        filterDropdownList.style.display = 'none';
      }
    });
  }

  // Custom Formulier Categorie Dropdown events
  const formCatSearchInput = document.getElementById('newExCategorySearchInput');
  const formCatDropdownList = document.getElementById('customNewExCategoryDropdownList');
  if (formCatSearchInput && formCatDropdownList) {
    formCatSearchInput.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = formCatDropdownList.style.display === 'block';
      formCatDropdownList.style.display = isVisible ? 'none' : 'block';
      populateExerciseCategoryDropdowns();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#coachNewExerciseCard .custom-dropdown-wrapper')) {
        formCatDropdownList.style.display = 'none';
      }
    });
  }

  renderSelectedFormCategoriesBadges();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCoachExerciseListeners);
} else {
  initCoachExerciseListeners();
}