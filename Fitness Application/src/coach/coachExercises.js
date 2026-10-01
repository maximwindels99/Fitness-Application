// ==========================================================================
// COACH EXERCISES MODULE
// Beheert de oefeningendatabank en custom oefeningen toevoegen (< 200 regels)
// ==========================================================================

import { getFullExerciseDatabase, addCustomExercise } from '../data/exercisesData.js';
import { generateUniqueId } from '../core/utils.js';
import { updateCoachFabVisibility } from './coachNav.js';

/**
 * Rendert de volledige oefeningenlijst op het coach dashboard met optionele categoriefilter.
 */
export function renderCoachExercisesList() {
  const container = document.getElementById('coachExercisesList');
  if (!container) return;

  const categoryFilter = document.getElementById('coachExerciseCategoryFilter')?.value || '';
  let exercises = getFullExerciseDatabase();

  if (categoryFilter) {
    exercises = exercises.filter(ex => ex.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  exercises.sort((a, b) => a.name.localeCompare(b.name));

  if (exercises.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px 0;">Geen oefeningen gevonden in deze categorie.</p>';
    return;
  }

  container.innerHTML = '';
  exercises.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'card card-glass';
    card.style.cssText = 'margin-bottom: 10px; padding: 12px 16px; border-left: 4px solid var(--gold-accent);';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
        <h4 style="margin:0; color:var(--white); font-size:1.05rem;">${ex.name}</h4>
        <span class="exercise-badge" style="margin:0;"><i class="fa-solid fa-tag"></i> ${ex.category}</span>
      </div>
      <p style="margin:6px 0 0 0; font-size:0.85rem; color:var(--text-muted); line-height:1.4;">${ex.instructions || 'Geen instructies beschikbaar.'}</p>
    `;

    container.appendChild(card);
  });
}

/**
 * Schakelt de weergave van het formulier om een nieuwe oefening toe te voegen.
 */
export function toggleCoachNewExerciseForm() {
  const card = document.getElementById('coachNewExerciseCard');
  if (!card) return;

  const isHidden = card.style.display === 'none';
  card.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    document.getElementById('newExName').value = '';
    document.getElementById('newExCategory').value = 'Borst';
    document.getElementById('newExInstructions').value = '';
    card.scrollIntoView({ behavior: 'smooth' });
  }

  updateCoachFabVisibility();
}

/**
 * Slaat een nieuwe custom oefening op in de databank.
 */
export function saveCoachCustomExercise() {
  const name = document.getElementById('newExName')?.value.trim();
  const category = document.getElementById('newExCategory')?.value;
  const instructions = document.getElementById('newExInstructions')?.value.trim();

  if (!name || !category) {
    alert("Vul a.u.b. minimaal de naam en categorie van de oefening in.");
    return;
  }

  const newExercise = {
    id: generateUniqueId(),
    name,
    category,
    instructions: instructions || 'Geen specifieke instructies.'
  };

  addCustomExercise(newExercise);
  alert(`Oefening "${name}" succesvol toegevoegd aan de databank!`);

  toggleCoachNewExerciseForm();
  renderCoachExercisesList();
}