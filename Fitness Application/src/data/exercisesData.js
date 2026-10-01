// ==========================================================================
// EXERCISES DATA MODULE
// Standaard en custom oefeningen databank (< 200 regels)
// ==========================================================================

import { getCustomExercises, saveCustomExercises } from '../core/storage.js';

export const DEFAULT_EXERCISES = [
  { 
    id: 'ex_bench_press', 
    name: 'Bench Press', 
    category: 'Borst', 
    instructions: 'Liggend op een platte bank de halterstang gecontroleerd laten zakken tot de borst en krachtig uitduwen.' 
  },
  { 
    id: 'ex_incline_press', 
    name: 'Incline Dumbbell Press', 
    category: 'Borst', 
    instructions: 'Schuine bank (30 graden). Druk de dumbbells verticaal omhoog.' 
  },
  { 
    id: 'ex_chest_fly', 
    name: 'Chest Fly', 
    category: 'Borst', 
    instructions: 'Breng de dumbbells of kabels in een boogvormige beweging voor de borst samen.' 
  },
  { 
    id: 'ex_barbell_squat', 
    name: 'Barbell Squat', 
    category: 'Benen', 
    instructions: 'Stang op de monnikskapspier. Zak gecontroleerd door de knieën tot minimaal 90 graden.' 
  },
  { 
    id: 'ex_leg_press', 
    name: 'Leg Press', 
    category: 'Benen', 
    instructions: 'Voeten op heupbreedte op het platform. Zak diep in en duw krachtig uit zonder de knieën op slot te zetten.' 
  },
  { 
    id: 'ex_romanian_deadlift', 
    name: 'Romanian Deadlift', 
    category: 'Benen', 
    instructions: 'Focus op de hamstrings. Buig licht door de knieën en heupen naar achteren scharnieren.' 
  },
  { 
    id: 'ex_deadlift', 
    name: 'Deadlift', 
    category: 'Rug', 
    instructions: 'Hijs de stang vanuit de grond langs de schenen omhoog met een rechte rug.' 
  },
  { 
    id: 'ex_lat_pulldown', 
    name: 'Lat Pulldown', 
    category: 'Rug', 
    instructions: 'Trek de stang gecontroleerd naar de bovenkant van de borst.' 
  },
  { 
    id: 'ex_bent_over_row', 
    name: 'Bent Over Row', 
    category: 'Rug', 
    instructions: 'Voorovergebogen houding. Trek de halterstang richting de navel.' 
  },
  { 
    id: 'ex_overhead_press', 
    name: 'Overhead Press', 
    category: 'Schouders', 
    instructions: 'Staan of zittend. Duw de halterstang verticaal boven het hoofd.' 
  },
  { 
    id: 'ex_lateral_raise', 
    name: 'Dumbbell Lateral Raise', 
    category: 'Schouders', 
    instructions: 'Hef de dumbbells zijwaarts omhoog tot schouderhoogte.' 
  },
  { 
    id: 'ex_biceps_curl', 
    name: 'Barbell Biceps Curl', 
    category: 'Armen', 
    instructions: 'Curl de stang omhoog met strakke ellebogen langs het lichaam.' 
  },
  { 
    id: 'ex_triceps_pushdown', 
    name: 'Cable Triceps Pushdown', 
    category: 'Armen', 
    instructions: 'Duw het touw of de stang naar beneden tot de armen strekken.' 
  },
  { 
    id: 'ex_plank', 
    name: 'Plank', 
    category: 'Buik', 
    instructions: 'Houd het lichaam recht als een plank op de onderarmen en tenen.' 
  }
];

/**
 * Haalt de gecombineerde lijst op van standaard oefeningen en custom oefeningen.
 */
export function getFullExerciseDatabase() {
  const customEx = getCustomExercises();
  return [...DEFAULT_EXERCISES, ...customEx];
}

/**
 * Zoekt een specifieke oefening op basis van ID.
 */
export function findExerciseById(id) {
  const all = getFullExerciseDatabase();
  return all.find(ex => ex.id === id) || null;
}

/**
 * Voegt een nieuwe custom oefening toe aan de databank.
 */
export function addCustomExercise(newEx) {
  let customList = getCustomExercises();
  customList.push(newEx);
  saveCustomExercises(customList);
}

/**
 * Overschrijft de custom oefeningenlijst.
 */
export function saveCustomExerciseList(list) {
  saveCustomExercises(list);
}