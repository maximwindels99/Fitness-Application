// ==========================================================================
// EXERCISES DATA MODULE
// Standaard (50 oefeningen) en custom oefeningen databank met verwijder-ondersteuning
// ==========================================================================

import { getCustomExercises, saveCustomExercises } from '../core/storage.js';

export const DEFAULT_EXERCISES = [
  // BORST
  { 
    id: 'ex_barbell_bench_press', 
    name: 'Barbell Bench Press', 
    category: ['Borst', 'Schouders', 'Triceps'], 
    instructions: 'Ga op het bankje liggen en duw de barbell vanaf je borst gecontroleerd omhoog.',
    videoUrl: 'https://www.youtube.com/results?search_query=Barbell+Bench+Press'
  },
  { 
    id: 'ex_push_up', 
    name: 'Push-up', 
    category: ['Borst', 'Schouders', 'Triceps', 'Core'], 
    instructions: 'Lichaam in een strakke plank en laat je borst tot vlak boven de grond zakken.',
    videoUrl: 'https://www.youtube.com/results?search_query=Push-up+exercise'
  },
  { 
    id: 'ex_incline_dumbbell_press', 
    name: 'Incline Dumbbell Press', 
    category: ['Bovenkant borst', 'Schouders', 'Triceps'], 
    instructions: 'Uitvoering op een schuin bankje om het accent op de bovenkant van de borst te leggen.',
    videoUrl: 'https://www.youtube.com/results?search_query=Incline+Dumbbell+Press'
  },
  { 
    id: 'ex_cable_chest_fly', 
    name: 'Cable Chest Fly', 
    category: ['Borst'], 
    instructions: 'Breng de kabels in een licht gebogen armbeweging voor je borst samen.',
    videoUrl: 'https://www.youtube.com/results?search_query=Cable+Chest+Fly'
  },
  { 
    id: 'ex_dips_chest_focus', 
    name: 'Dips (Chest Focus)', 
    category: ['Onderkant borst', 'Triceps'], 
    instructions: 'Leun licht voorover op de dip bars en laat jezelf zakken tot 90 graden in de ellebogen.',
    videoUrl: 'https://www.youtube.com/results?search_query=Dips+Chest+Focus'
  },
  { 
    id: 'ex_dumbbell_pullover', 
    name: 'Dumbbell Pullover', 
    category: ['Borst', 'Lats'], 
    instructions: 'Liggend op een bankje laat je één dumbbell achter je hoofd zakken en trek je deze weer omhoog.',
    videoUrl: 'https://www.youtube.com/results?search_query=Dumbbell+Pullover'
  },

  // RUG
  { 
    id: 'ex_barbell_deadlift', 
    name: 'Barbell Deadlift', 
    category: ['Onderrug', 'Hamstrings', 'Billen', 'Rug'], 
    instructions: 'Til de stang op vanuit je heupen en benen met een kaarsrechte rug.',
    videoUrl: 'https://www.youtube.com/results?search_query=Barbell+Deadlift'
  },
  { 
    id: 'ex_lat_pulldown', 
    name: 'Lat Pulldown', 
    category: ['Lats', 'Biceps'], 
    instructions: 'Trek de stang van het kabelstation gecontroleerd naar de bovenkant van je borst.',
    videoUrl: 'https://www.youtube.com/results?search_query=Lat+Pulldown'
  },
  { 
    id: 'ex_pull_up', 
    name: 'Pull-up', 
    category: ['Lats', 'Biceps', 'Core'], 
    instructions: 'Hang met een overhandse greep aan een stang en trek je kin boven de stang.',
    videoUrl: 'https://www.youtube.com/results?search_query=Pull-up+exercise'
  },
  { 
    id: 'ex_bent_over_barbell_row', 
    name: 'Bent-Over Barbell Row', 
    category: ['Middenrug', 'Lats', 'Biceps'], 
    instructions: 'Buig voorover met een rechte rug en trek de barbell naar je navel toe.',
    videoUrl: 'https://www.youtube.com/results?search_query=Bent-Over+Barbell+Row'
  },
  { 
    id: 'ex_single_arm_dumbbell_row', 
    name: 'Single-Arm Dumbbell Row', 
    category: ['Middenrug', 'Lats'], 
    instructions: 'Steun met één knie op een bankje en trek de dumbbell aan één kant omhoog.',
    videoUrl: 'https://www.youtube.com/results?search_query=Single-Arm+Dumbbell+Row'
  },
  { 
    id: 'ex_face_pull', 
    name: 'Face Pull', 
    category: ['Achterkant schouders', 'Bovenrug'], 
    instructions: 'Trek een touw aan een kabelstation richting je gezicht met de ellebogen hoog.',
    videoUrl: 'https://www.youtube.com/results?search_query=Face+Pull'
  },
  { 
    id: 'ex_hyperextension', 
    name: 'Hyperextension', 
    category: ['Onderrug', 'Billen'], 
    instructions: 'Buig vanuit je heupen voorover op het Hyperextension-bankje en kom rustig omhoog.',
    videoUrl: 'https://www.youtube.com/results?search_query=Hyperextension+exercise'
  },

  // SCHOUDERS
  { 
    id: 'ex_overhead_press_ohp', 
    name: 'Overhead Press (OHP)', 
    category: ['Schouders', 'Triceps'], 
    instructions: 'Duw een barbell rechtop staand vanuit je sleutelbeenderen boven je hoofd.',
    videoUrl: 'https://www.youtube.com/results?search_query=Overhead+Press+OHP'
  },
  { 
    id: 'ex_dumbbell_lateral_raise', 
    name: 'Dumbbell Lateral Raise', 
    category: ['Zijkant schouders'], 
    instructions: 'Hef de dumbbells zijwaarts omhoog tot schouderhoogte met licht gebogen armen.',
    videoUrl: 'https://www.youtube.com/results?search_query=Dumbbell+Lateral+Raise'
  },
  { 
    id: 'ex_seated_dumbbell_shoulder_press', 
    name: 'Seated Dumbbell Shoulder Press', 
    category: ['Schouders', 'Triceps'], 
    instructions: 'Zittend op een bankje duw je twee dumbbells boven je hoofd samen.',
    videoUrl: 'https://www.youtube.com/results?search_query=Seated+Dumbbell+Shoulder+Press'
  },
  { 
    id: 'ex_rear_delt_fly', 
    name: 'Rear Delt Fly', 
    category: ['Achterkant schouders'], 
    instructions: 'Voorovergebogen hef je de dumbbells naar buiten om de achterkant van de schouder te raken.',
    videoUrl: 'https://www.youtube.com/results?search_query=Rear+Delt+Fly'
  },
  { 
    id: 'ex_dumbbell_front_raise', 
    name: 'Dumbbell Front Raise', 
    category: ['Voorkant schouders'], 
    instructions: 'Hef de dumbbells een voor een recht voor je uit tot ooghoogte.',
    videoUrl: 'https://www.youtube.com/results?search_query=Dumbbell+Front+Raise'
  },
  { 
    id: 'ex_barbell_shrugs', 
    name: 'Barbell Shrugs', 
    category: ['Trapezius'], 
    instructions: 'Til je schouders recht omhoog richting je oren terwijl je een zware stang vasthoudt.',
    videoUrl: 'https://www.youtube.com/results?search_query=Barbell+Shrugs'
  },

  // BENEN
  { 
    id: 'ex_barbell_back_squat', 
    name: 'Barbell Back Squat', 
    category: ['Quadriceps', 'Billen', 'Hamstrings'], 
    instructions: 'Met de stang in je nek zak je door je knieën alsof je op een stoel gaat zitten.',
    videoUrl: 'https://www.youtube.com/results?search_query=Barbell+Back+Squat'
  },
  { 
    id: 'ex_romanian_deadlift_rdl', 
    name: 'Romanian Deadlift (RDL)', 
    category: ['Hamstrings', 'Billen', 'Onderrug'], 
    instructions: 'Met licht gebogen knieën duw je je heupen naar achteren tot je rek voelt in je hamstrings.',
    videoUrl: 'https://www.youtube.com/results?search_query=Romanian+Deadlift+RDL'
  },
  { 
    id: 'ex_barbell_hip_thrust', 
    name: 'Barbell Hip Thrust', 
    category: ['Billen'], 
    instructions: 'Met de bovenrug tegen een bankje duw je het gewicht op je heupen omhoog.',
    videoUrl: 'https://www.youtube.com/results?search_query=Barbell+Hip+Thrust'
  },
  { 
    id: 'ex_walking_lunges', 
    name: 'Walking Lunges', 
    category: ['Quadriceps', 'Billen'], 
    instructions: 'Stap naar voren en zak door je achterste knie totdat deze bijna de grond raakt.',
    videoUrl: 'https://www.youtube.com/results?search_query=Walking+Lunges'
  },
  { 
    id: 'ex_leg_press', 
    name: 'Leg Press', 
    category: ['Quadriceps', 'Billen'], 
    instructions: 'Zittend in de machine duw je het voetplatform gecontroleerd weg.',
    videoUrl: 'https://www.youtube.com/results?search_query=Leg+Press'
  },
  { 
    id: 'ex_bulgarian_split_squat', 
    name: 'Bulgarian Split Squat', 
    category: ['Quadriceps', 'Billen'], 
    instructions: 'Plaats één voet achter je op een bankje en zak door de voorste knie.',
    videoUrl: 'https://www.youtube.com/results?search_query=Bulgarian+Split+Squat'
  },
  { 
    id: 'ex_leg_extension', 
    name: 'Leg Extension', 
    category: ['Quadriceps'], 
    instructions: 'Zittend op het toestel strek je je onderbenen uit om de voorkant van de bovenbenen te isoleren.',
    videoUrl: 'https://www.youtube.com/results?search_query=Leg+Extension'
  },
  { 
    id: 'ex_lying_leg_curl', 
    name: 'Lying Leg Curl', 
    category: ['Hamstrings'], 
    instructions: 'Liggend op je buik krul je het gewicht met je hielen richting je billen.',
    videoUrl: 'https://www.youtube.com/results?search_query=Lying+Leg+Curl'
  },
  { 
    id: 'ex_standing_calf_raise', 
    name: 'Standing Calf Raise', 
    category: ['Kuiten'], 
    instructions: 'Ga op de bal van je voet staan en duw jezelf zo hoog mogelijk op.',
    videoUrl: 'https://www.youtube.com/results?search_query=Standing+Calf+Raise'
  },
  { 
    id: 'ex_goblet_squat', 
    name: 'Goblet Squat', 
    category: ['Quadriceps', 'Core'], 
    instructions: 'Houd een kettlebell of dumbbell tegen je borst en maak een diepe squat.',
    videoUrl: 'https://www.youtube.com/results?search_query=Goblet+Squat'
  },

  // ARMEN
  { 
    id: 'ex_barbell_biceps_curl', 
    name: 'Barbell Biceps Curl', 
    category: ['Biceps'], 
    instructions: 'Krul de barbell vanaf je bovenbenen omhoog naar je schouders.',
    videoUrl: 'https://www.youtube.com/results?search_query=Barbell+Biceps+Curl'
  },
  { 
    id: 'ex_dumbbell_hammer_curl', 
    name: 'Dumbbell Hammer Curl', 
    category: ['Biceps', 'Onderarm'], 
    instructions: 'Krul de dumbbells omhoog met de handpalmen naar elkaar toe gericht.',
    videoUrl: 'https://www.youtube.com/results?search_query=Dumbbell+Hammer+Curl'
  },
  { 
    id: 'ex_incline_dumbbell_curl', 
    name: 'Incline Dumbbell Curl', 
    category: ['Biceps'], 
    instructions: 'Zittend op een schuin bankje hangen de armen naar achteren voor maximale rek.',
    videoUrl: 'https://www.youtube.com/results?search_query=Incline+Dumbbell+Curl'
  },
  { 
    id: 'ex_preacher_curl', 
    name: 'Preacher Curl', 
    category: ['Biceps'], 
    instructions: 'Met je bovenarmen rustend op een schuin kussen krul je het gewicht omhoog.',
    videoUrl: 'https://www.youtube.com/results?search_query=Preacher+Curl'
  },
  { 
    id: 'ex_triceps_rope_pushdown', 
    name: 'Triceps Rope Pushdown', 
    category: ['Triceps'], 
    instructions: 'Duw het touw bij een kabelstation naar beneden en trek het aan het einde uit elkaar.',
    videoUrl: 'https://www.youtube.com/results?search_query=Triceps+Rope+Pushdown'
  },
  { 
    id: 'ex_skull_crushers', 
    name: 'Skull Crushers', 
    category: ['Triceps'], 
    instructions: 'Liggend op een bankje laat je een EZ-stang gecontroleerd naar je voorhoofd zakken.',
    videoUrl: 'https://www.youtube.com/results?search_query=Skull+Crushers'
  },
  { 
    id: 'ex_overhead_dumbbell_triceps_extension', 
    name: 'Overhead Dumbbell Triceps Extension', 
    category: ['Triceps'], 
    instructions: 'Houd een dumbbell met beide handen achter je hoofd en strek je armen recht omhoog.',
    videoUrl: 'https://www.youtube.com/results?search_query=Overhead+Dumbbell+Triceps+Extension'
  },
  { 
    id: 'ex_close_grip_bench_press', 
    name: 'Close-Grip Bench Press', 
    category: ['Triceps', 'Borst'], 
    instructions: 'Bankdrukken met de handen op schouderbreedte om de triceps meer aan te spreken.',
    videoUrl: 'https://www.youtube.com/results?search_query=Close-Grip+Bench+Press'
  },

  // CORE / BUIK
  { 
    id: 'ex_plank', 
    name: 'Plank', 
    category: ['Core'], 
    instructions: 'Steun op onderarmen en tenen en houd je lichaam kaarsrecht als een plank.',
    videoUrl: 'https://www.youtube.com/results?search_query=Plank+exercise'
  },
  { 
    id: 'ex_hanging_leg_raise', 
    name: 'Hanging Leg Raise', 
    category: ['Onderste buikspieren', 'Heupbuigers'], 
    instructions: 'Hang aan een optrekstang en til je gestrekte benen of knieën op tot taillehoogte.',
    videoUrl: 'https://www.youtube.com/results?search_query=Hanging+Leg+Raise'
  },
  { 
    id: 'ex_ab_wheel_rollout', 
    name: 'Ab Wheel Rollout', 
    category: ['Core'], 
    instructions: 'Rol op je knieën met het buikspierwiel zo ver mogelijk naar voren en trek jezelf terug.',
    videoUrl: 'https://www.youtube.com/results?search_query=Ab+Wheel+Rollout'
  },
  { 
    id: 'ex_cable_crunch', 
    name: 'Cable Crunch', 
    category: ['Buikspieren'], 
    instructions: 'Zittend op je knieën bij een kabelstation trek je het touw met je buikspieren naar beneden.',
    videoUrl: 'https://www.youtube.com/results?search_query=Cable+Crunch'
  },
  { 
    id: 'ex_russian_twists', 
    name: 'Russian Twists', 
    category: ['Schuine buikspieren'], 
    instructions: 'Zittend met de voeten van de vloer draai je een gewicht van links naar rechts.',
    videoUrl: 'https://www.youtube.com/results?search_query=Russian+Twists'
  },
  { 
    id: 'ex_mountain_climbers', 
    name: 'Mountain Climbers', 
    category: ['Core', 'Conditie'], 
    instructions: 'Vanuit een opdrukpositie trek je om en om je knieën snel naar je borst toe.',
    videoUrl: 'https://www.youtube.com/results?search_query=Mountain+Climbers'
  },

  // FULL BODY / CONDITIE
  { 
    id: 'ex_kettlebell_swing', 
    name: 'Kettlebell Swing', 
    category: ['Billen', 'Hamstrings', 'Rug', 'Core'], 
    instructions: 'Zwaai een kettlebell vanuit een heupbuiging krachtig omhoog tot borsthoogte.',
    videoUrl: 'https://www.youtube.com/results?search_query=Kettlebell+Swing'
  },
  { 
    id: 'ex_burpees', 
    name: 'Burpees', 
    category: ['Full Body', 'Conditie'], 
    instructions: 'Zak in een squat, spring naar een push-up, spring terug en eindig met een sprong in de lucht.',
    videoUrl: 'https://www.youtube.com/results?search_query=Burpees'
  },
  { 
    id: 'ex_thrusters', 
    name: 'Thrusters', 
    category: ['Quadriceps', 'Schouders', 'Core'], 
    instructions: 'Een combinatie van een diepe front squat en een krachtige overhead press in één beweging.',
    videoUrl: 'https://www.youtube.com/results?search_query=Thrusters+exercise'
  },
  { 
    id: 'ex_farmers_walk', 
    name: "Farmer's Walk", 
    category: ['Grip', 'Schouders', 'Core', 'Benen'], 
    instructions: 'Pak twee zware gewichten op en loop hiermee rechtop een afstand af.',
    videoUrl: 'https://www.youtube.com/results?search_query=Farmers+Walk'
  },
  { 
    id: 'ex_renegade_row', 
    name: 'Renegade Row', 
    category: ['Rug', 'Core', 'Schouders'], 
    instructions: 'In een opdrukpositie op twee dumbbells om en om een gewicht naar je heup roeien.',
    videoUrl: 'https://www.youtube.com/results?search_query=Renegade+Row'
  },
  { 
    id: 'ex_box_jumps', 
    name: 'Box Jumps', 
    category: ['Quadriceps', 'Kuiten', 'Billen'], 
    instructions: 'Spring vanuit een lichte squat met twee voeten tegelijk op een verhoogd platform.',
    videoUrl: 'https://www.youtube.com/results?search_query=Box+Jumps'
  },
  { 
    id: 'ex_battle_ropes', 
    name: 'Battle Ropes', 
    category: ['Schouders', 'Armen', 'Core', 'Conditie'], 
    instructions: 'Maak krachtige golven in het dikke touw door je armen snel op en neer te bewegen.',
    videoUrl: 'https://www.youtube.com/results?search_query=Battle+Ropes'
  }
];

/**
 * Haalt de lijst op van verwijderde (verborgen) oefening IDs.
 */
export function getDeletedExerciseIds() {
  return JSON.parse(localStorage.getItem('aqm_deleted_exercise_ids') || '[]');
}

/**
 * Markeert een oefening als verwijderd in localStorage.
 */
export function deleteExerciseById(id) {
  const strId = String(id);
  const deleted = getDeletedExerciseIds();
  
  if (!deleted.includes(strId)) {
    deleted.push(strId);
    localStorage.setItem('aqm_deleted_exercise_ids', JSON.stringify(deleted));
  }

  // Verwijder ook uit de custom oefeningenlijst
  let customList = getCustomExercises().filter(ex => String(ex.id) !== strId);
  saveCustomExercises(customList);
}

/**
 * Haalt de gecombineerde lijst op van standaard oefeningen en custom oefeningen,
 * gefilterd op verwijderde items.
 */
export function getFullExerciseDatabase() {
  const deletedIds = getDeletedExerciseIds();
  const customEx = getCustomExercises().filter(ex => !deletedIds.includes(String(ex.id)));
  const defaultEx = DEFAULT_EXERCISES.filter(ex => !deletedIds.includes(String(ex.id)));

  return [...defaultEx, ...customEx];
}

/**
 * Zoekt een specifieke oefening op basis van ID.
 */
export function findExerciseById(id) {
  const all = getFullExerciseDatabase();
  return all.find(ex => String(ex.id) === String(id)) || null;
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