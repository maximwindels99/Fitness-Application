// ==========================================================================
// MOCK DATA MODULE
// Genereert uitgebreide, realistisch-ogende testdata voor 10 unieke accounts
// ==========================================================================

import { saveUsers, saveWorkoutsHistory, saveTemplates, saveSessions } from '../core/storage.js';

/**
 * Genereert verse, uitgebreide testdata voor de demo/ontwikkelmodus.
 */
export function generateRandomMockData() {
  const coachId = 'COACH-6451';
  const defaultPassword = 'Demo1';

  // 1. GEBRUIKERS (1 Coach + 9 Sporters)
  const users = [
    { firstName: 'Arturo', lastName: 'Quiroz Marnef', name: 'Arturo Quiroz Marnef', dob: '1990-01-01', email: 'arturo@gmail.com', password: defaultPassword, role: 'coach', coachId: coachId, linkedCoachId: null },
    
    // Gekoppeld in 2024
    { firstName: 'Daan', lastName: 'de Jong', name: 'Daan de Jong', dob: '1995-05-12', email: 'daan@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2024-01-15', freq: '2-3x_week', baseW: 60, maxW: 100, setbacks: ['2024-08-01', '2025-07-01'] },
    { firstName: 'Kevin', lastName: 'Maes', name: 'Kevin Maes', dob: '1991-12-11', email: 'kevin@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2024-03-01', freq: '2-3x_week', baseW: 75, maxW: 125, setbacks: ['2025-02-10'] },
    { firstName: 'Maxim', lastName: 'Windels', name: 'Maxim Windels', dob: '1998-11-23', email: 'maxim@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2024-06-10', freq: '2-3x_week', baseW: 65, maxW: 95, setbacks: ['2025-11-05'] },
    { firstName: 'Thomas', lastName: 'Janssens', name: 'Thomas Janssens', dob: '1993-07-04', email: 'thomas@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2024-09-01', freq: '2-3x_week', baseW: 50, maxW: 82, setbacks: ['2025-06-15'] },
    
    // Gekoppeld in 2025
    { firstName: 'Emma', lastName: 'Claes', name: 'Emma Claes', dob: '1996-06-22', email: 'emma@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2025-01-15', freq: 'daily', baseW: 35, maxW: 55, setbacks: ['2025-08-10'] },
    { firstName: 'Sophie', lastName: 'Jacobs', name: 'Sophie Jacobs', dob: '1998-08-19', email: 'sophie@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2025-05-20', freq: 'monthly', baseW: 40, maxW: 60, setbacks: [] },
    
    // Gekoppeld in 2026
    { firstName: 'Shana', lastName: 'Peeters', name: 'Shana Peeters', dob: '1997-03-18', email: 'shana@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2026-01-10', freq: '1x_week', baseW: 40, maxW: 62, setbacks: ['2026-05-01'] },
    { firstName: 'Lisa', lastName: 'Willems', name: 'Lisa Willems', dob: '1999-09-30', email: 'lisa@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2026-02-15', freq: '1x_week', baseW: 30, maxW: 50, setbacks: [] },
    { firstName: 'Ruben', lastName: 'Goossens', name: 'Ruben Goossens', dob: '1994-04-14', email: 'ruben@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2026-04-01', freq: '2-3x_week', baseW: 55, maxW: 75, setbacks: [] }
  ];

  // 2. TEMPLATES (2 tot 3 schema's per sporter, 4 tot 5 oefeningen)
  const templates = [
    // Daan
    { id: 101, userEmail: 'daan@gmail.com', name: 'Push Kracht & Hypertrofie', exercises: [
      { exerciseId: 'ex_barbell_bench_press', sets: [{ weight: 85, reps: 6, completed: false }, { weight: 90, reps: 5, completed: false }] },
      { exerciseId: 'ex_incline_dumbbell_press', sets: [{ weight: 32, reps: 8, completed: false }, { weight: 34, reps: 8, completed: false }] },
      { exerciseId: 'ex_overhead_press_ohp', sets: [{ weight: 50, reps: 8, completed: false }] },
      { exerciseId: 'ex_cable_chest_fly', sets: [{ weight: 25, reps: 12, completed: false }] },
      { exerciseId: 'ex_triceps_rope_pushdown', sets: [{ weight: 30, reps: 10, completed: false }] }
    ]},
    { id: 102, userEmail: 'daan@gmail.com', name: 'Pull & Biceps Focus', exercises: [
      { exerciseId: 'ex_barbell_deadlift', sets: [{ weight: 130, reps: 5, completed: false }, { weight: 140, reps: 3, completed: false }] },
      { exerciseId: 'ex_lat_pulldown', sets: [{ weight: 70, reps: 8, completed: false }] },
      { exerciseId: 'ex_bent_over_barbell_row', sets: [{ weight: 75, reps: 8, completed: false }] },
      { exerciseId: 'ex_face_pull', sets: [{ weight: 35, reps: 12, completed: false }] },
      { exerciseId: 'ex_barbell_biceps_curl', sets: [{ weight: 35, reps: 10, completed: false }] }
    ]},
    { id: 103, userEmail: 'daan@gmail.com', name: 'Leg Day Heavy', exercises: [
      { exerciseId: 'ex_barbell_back_squat', sets: [{ weight: 110, reps: 6, completed: false }] },
      { exerciseId: 'ex_romanian_deadlift_rdl', sets: [{ weight: 100, reps: 8, completed: false }] },
      { exerciseId: 'ex_leg_press', sets: [{ weight: 200, reps: 10, completed: false }] },
      { exerciseId: 'ex_lying_leg_curl', sets: [{ weight: 50, reps: 12, completed: false }] },
      { exerciseId: 'ex_standing_calf_raise', sets: [{ weight: 60, reps: 15, completed: false }] }
    ]},

    // Kevin
    { id: 104, userEmail: 'kevin@gmail.com', name: 'Powerlifting Squat & Bench', exercises: [
      { exerciseId: 'ex_barbell_back_squat', sets: [{ weight: 140, reps: 5, completed: false }] },
      { exerciseId: 'ex_barbell_bench_press', sets: [{ weight: 110, reps: 5, completed: false }] },
      { exerciseId: 'ex_leg_press', sets: [{ weight: 240, reps: 8, completed: false }] },
      { exerciseId: 'ex_cable_chest_fly', sets: [{ weight: 30, reps: 12, completed: false }] },
      { exerciseId: 'ex_skull_crushers', sets: [{ weight: 40, reps: 10, completed: false }] }
    ]},
    { id: 105, userEmail: 'kevin@gmail.com', name: 'Deadlift & Back Heavy', exercises: [
      { exerciseId: 'ex_barbell_deadlift', sets: [{ weight: 170, reps: 4, completed: false }] },
      { exerciseId: 'ex_lat_pulldown', sets: [{ weight: 85, reps: 8, completed: false }] },
      { exerciseId: 'ex_single_arm_dumbbell_row', sets: [{ weight: 40, reps: 8, completed: false }] },
      { exerciseId: 'ex_hyperextension', sets: [{ weight: 20, reps: 12, completed: false }] },
      { exerciseId: 'ex_dumbbell_hammer_curl', sets: [{ weight: 22, reps: 10, completed: false }] }
    ]},

    // Maxim
    { id: 106, userEmail: 'maxim@gmail.com', name: 'Upper Body Power', exercises: [
      { exerciseId: 'ex_barbell_bench_press', sets: [{ weight: 90, reps: 6, completed: false }] },
      { exerciseId: 'ex_bent_over_barbell_row', sets: [{ weight: 80, reps: 6, completed: false }] },
      { exerciseId: 'ex_overhead_press_ohp', sets: [{ weight: 55, reps: 8, completed: false }] },
      { exerciseId: 'ex_pull_up', sets: [{ weight: 0, reps: 10, completed: false }] },
      { exerciseId: 'ex_incline_dumbbell_press', sets: [{ weight: 30, reps: 10, completed: false }] }
    ]},
    { id: 107, userEmail: 'maxim@gmail.com', name: 'Lower Body & Core', exercises: [
      { exerciseId: 'ex_barbell_back_squat', sets: [{ weight: 115, reps: 5, completed: false }] },
      { exerciseId: 'ex_romanian_deadlift_rdl', sets: [{ weight: 105, reps: 8, completed: false }] },
      { exerciseId: 'ex_walking_lunges', sets: [{ weight: 24, reps: 10, completed: false }] },
      { exerciseId: 'ex_lying_leg_curl', sets: [{ weight: 55, reps: 10, completed: false }] },
      { exerciseId: 'ex_plank', sets: [{ weight: 0, reps: 60, completed: false }] }
    ]},

    // Thomas
    { id: 108, userEmail: 'thomas@gmail.com', name: 'Push & Legs Focus', exercises: [
      { exerciseId: 'ex_barbell_back_squat', sets: [{ weight: 85, reps: 8, completed: false }] },
      { exerciseId: 'ex_barbell_bench_press', sets: [{ weight: 75, reps: 8, completed: false }] },
      { exerciseId: 'ex_leg_extension', sets: [{ weight: 60, reps: 12, completed: false }] },
      { exerciseId: 'ex_dumbbell_lateral_raise', sets: [{ weight: 12, reps: 12, completed: false }] },
      { exerciseId: 'ex_triceps_rope_pushdown', sets: [{ weight: 25, reps: 12, completed: false }] }
    ]},
    { id: 109, userEmail: 'thomas@gmail.com', name: 'Pull & Core Focus', exercises: [
      { exerciseId: 'ex_lat_pulldown', sets: [{ weight: 60, reps: 10, completed: false }] },
      { exerciseId: 'ex_single_arm_dumbbell_row', sets: [{ weight: 28, reps: 10, completed: false }] },
      { exerciseId: 'ex_face_pull', sets: [{ weight: 30, reps: 12, completed: false }] },
      { exerciseId: 'ex_incline_dumbbell_curl', sets: [{ weight: 14, reps: 10, completed: false }] },
      { exerciseId: 'ex_ab_wheel_rollout', sets: [{ weight: 0, reps: 12, completed: false }] }
    ]},

    // Emma
    { id: 110, userEmail: 'emma@gmail.com', name: 'Conditioning & Core', exercises: [
      { exerciseId: 'ex_burpees', sets: [{ weight: 0, reps: 15, completed: false }] },
      { exerciseId: 'ex_kettlebell_swing', sets: [{ weight: 16, reps: 20, completed: false }] },
      { exerciseId: 'ex_mountain_climbers', sets: [{ weight: 0, reps: 30, completed: false }] },
      { exerciseId: 'ex_plank', sets: [{ weight: 0, reps: 60, completed: false }] },
      { exerciseId: 'ex_russian_twists', sets: [{ weight: 8, reps: 20, completed: false }] }
    ]},
    { id: 111, userEmail: 'emma@gmail.com', name: 'Legs & Glutes High Volume', exercises: [
      { exerciseId: 'ex_barbell_hip_thrust', sets: [{ weight: 70, reps: 12, completed: false }] },
      { exerciseId: 'ex_bulgarian_split_squat', sets: [{ weight: 12, reps: 10, completed: false }] },
      { exerciseId: 'ex_walking_lunges', sets: [{ weight: 16, reps: 12, completed: false }] },
      { exerciseId: 'ex_leg_extension', sets: [{ weight: 45, reps: 15, completed: false }] }
    ]},

    // Sophie
    { id: 112, userEmail: 'sophie@gmail.com', name: 'Fullbody Starter A', exercises: [
      { exerciseId: 'ex_goblet_squat', sets: [{ weight: 16, reps: 10, completed: false }] },
      { exerciseId: 'ex_lat_pulldown', sets: [{ weight: 35, reps: 12, completed: false }] },
      { exerciseId: 'ex_push_up', sets: [{ weight: 0, reps: 8, completed: false }] },
      { exerciseId: 'ex_plank', sets: [{ weight: 0, reps: 45, completed: false }] }
    ]},
    { id: 113, userEmail: 'sophie@gmail.com', name: 'Fullbody Starter B', exercises: [
      { exerciseId: 'ex_romanian_deadlift_rdl', sets: [{ weight: 40, reps: 10, completed: false }] },
      { exerciseId: 'ex_seated_dumbbell_shoulder_press', sets: [{ weight: 10, reps: 10, completed: false }] },
      { exerciseId: 'ex_single_arm_dumbbell_row', sets: [{ weight: 12, reps: 10, completed: false }] },
      { exerciseId: 'ex_russian_twists', sets: [{ weight: 6, reps: 16, completed: false }] }
    ]},

    // Shana
    { id: 114, userEmail: 'shana@gmail.com', name: 'Booty & Legs', exercises: [
      { exerciseId: 'ex_barbell_hip_thrust', sets: [{ weight: 85, reps: 10, completed: false }] },
      { exerciseId: 'ex_barbell_back_squat', sets: [{ weight: 60, reps: 10, completed: false }] },
      { exerciseId: 'ex_bulgarian_split_squat', sets: [{ weight: 14, reps: 10, completed: false }] },
      { exerciseId: 'ex_lying_leg_curl', sets: [{ weight: 40, reps: 12, completed: false }] },
      { exerciseId: 'ex_standing_calf_raise', sets: [{ weight: 45, reps: 15, completed: false }] }
    ]},
    { id: 115, userEmail: 'shana@gmail.com', name: 'Fullbody Strength', exercises: [
      { exerciseId: 'ex_incline_dumbbell_press', sets: [{ weight: 18, reps: 10, completed: false }] },
      { exerciseId: 'ex_lat_pulldown', sets: [{ weight: 45, reps: 10, completed: false }] },
      { exerciseId: 'ex_overhead_press_ohp', sets: [{ weight: 28, reps: 10, completed: false }] },
      { exerciseId: 'ex_barbell_biceps_curl', sets: [{ weight: 20, reps: 12, completed: false }] },
      { exerciseId: 'ex_plank', sets: [{ weight: 0, reps: 60, completed: false }] }
    ]},

    // Lisa
    { id: 116, userEmail: 'lisa@gmail.com', name: 'Lower Body & Glutes', exercises: [
      { exerciseId: 'ex_barbell_hip_thrust', sets: [{ weight: 65, reps: 10, completed: false }] },
      { exerciseId: 'ex_leg_press', sets: [{ weight: 120, reps: 12, completed: false }] },
      { exerciseId: 'ex_walking_lunges', sets: [{ weight: 14, reps: 12, completed: false }] },
      { exerciseId: 'ex_ab_wheel_rollout', sets: [{ weight: 0, reps: 10, completed: false }] }
    ]},
    { id: 117, userEmail: 'lisa@gmail.com', name: 'Upper Body Light', exercises: [
      { exerciseId: 'ex_push_up', sets: [{ weight: 0, reps: 10, completed: false }] },
      { exerciseId: 'ex_lat_pulldown', sets: [{ weight: 35, reps: 12, completed: false }] },
      { exerciseId: 'ex_dumbbell_lateral_raise', sets: [{ weight: 8, reps: 12, completed: false }] },
      { exerciseId: 'ex_triceps_rope_pushdown', sets: [{ weight: 20, reps: 12, completed: false }] }
    ]},

    // Ruben
    { id: 118, userEmail: 'ruben@gmail.com', name: 'Chest & Triceps Focus', exercises: [
      { exerciseId: 'ex_barbell_bench_press', sets: [{ weight: 70, reps: 8, completed: false }] },
      { exerciseId: 'ex_incline_dumbbell_press', sets: [{ weight: 26, reps: 8, completed: false }] },
      { exerciseId: 'ex_cable_chest_fly', sets: [{ weight: 20, reps: 12, completed: false }] },
      { exerciseId: 'ex_skull_crushers', sets: [{ weight: 30, reps: 10, completed: false }] },
      { exerciseId: 'ex_triceps_rope_pushdown', sets: [{ weight: 25, reps: 12, completed: false }] }
    ]},
    { id: 119, userEmail: 'ruben@gmail.com', name: 'Back & Biceps Focus', exercises: [
      { exerciseId: 'ex_barbell_deadlift', sets: [{ weight: 110, reps: 6, completed: false }] },
      { exerciseId: 'ex_pull_up', sets: [{ weight: 0, reps: 8, completed: false }] },
      { exerciseId: 'ex_bent_over_barbell_row', sets: [{ weight: 60, reps: 8, completed: false }] },
      { exerciseId: 'ex_barbell_biceps_curl', sets: [{ weight: 30, reps: 10, completed: false }] },
      { exerciseId: 'ex_incline_dumbbell_curl', sets: [{ weight: 14, reps: 10, completed: false }] }
    ]},
    { id: 120, userEmail: 'ruben@gmail.com', name: 'Legs & Shoulders', exercises: [
      { exerciseId: 'ex_barbell_back_squat', sets: [{ weight: 90, reps: 8, completed: false }] },
      { exerciseId: 'ex_romanian_deadlift_rdl', sets: [{ weight: 80, reps: 8, completed: false }] },
      { exerciseId: 'ex_overhead_press_ohp', sets: [{ weight: 45, reps: 8, completed: false }] },
      { exerciseId: 'ex_dumbbell_lateral_raise', sets: [{ weight: 10, reps: 12, completed: false }] }
    ]}
  ];

  // 3. WORKOUT HISTORIE (Roterend over alle toegewezen schema's per sporter)
  const workoutsHistory = [];
  const nowMs = new Date('2026-10-01T12:00:00').getTime();

  users.filter(u => u.role === 'client').forEach((client) => {
    const startMs = new Date(client.startDate).getTime();
    
    // Haal alle schema's op van deze specifieke sporter
    const clientTemplates = templates.filter(t => t.userEmail === client.email);
    if (clientTemplates.length === 0) return;

    // Frequentie intervallen in milliseconden
    let stepMs = 3 * 86400000; // standaard 2-3x / week
    if (client.freq === 'daily') stepMs = 2 * 86400000;
    else if (client.freq === '1x_week') stepMs = 7 * 86400000;
    else if (client.freq === 'monthly') stepMs = 12 * 86400000;

    let currMs = startMs;
    let sessionCount = 0;

    const setbackMsList = (client.setbacks || []).map(s => new Date(s).getTime());

    while (currMs <= nowMs) {
      // Check of dit datum-punt in een onderbreking valt (ziekte / blessure / vakantie)
      let inHiatusGap = false;
      for (let sbMs of setbackMsList) {
        if (currMs >= sbMs && currMs < sbMs + (28 * 86400000)) { // 4 weken geen workouts
          currMs += 28 * 86400000;
          inHiatusGap = true;
          break;
        }
      }
      if (inHiatusGap) continue;

      // Voortgangsberekening voor gewichten
      const totalSpan = max1(nowMs - startMs);
      const elapsed = Math.max(0, currMs - startMs);
      const overallRatio = Math.min(1.0, elapsed / totalSpan);

      // Bepaal tijdelijke krachtterugval na een onderbreking
      let dropFactor = 0;
      for (let sbMs of setbackMsList) {
        const daysSinceSb = (currMs - (sbMs + (28 * 86400000))) / 86400000;
        if (daysSinceSb >= 0 && daysSinceSb <= 60) {
          dropFactor = Math.max(dropFactor, 0.22 * (1.0 - (daysSinceSb / 60.0)));
        }
      }

      const targetWeight = Math.round((client.baseW + (client.maxW - client.baseW) * overallRatio) * (1.0 - dropFactor));
      const progressFactor = client.maxW > 0 ? (targetWeight / client.maxW) : 1.0;

      // KIES HET ACTIEVE SCHEMA (Roteert netjes over alle toegewezen schema's)
      const activeTemplate = clientTemplates[sessionCount % clientTemplates.length];

      const d = new Date(currMs);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const dateStr = `${day}-${month}-${year}`;

      // Bouw de oefeningenset op op basis van het gekozen actieve schema
      const workoutExercises = activeTemplate.exercises.map(tmplEx => {
        return {
          exerciseId: tmplEx.exerciseId,
          sets: tmplEx.sets.map(s => {
            const baseSetW = parseFloat(s.weight) || 0;
            const scaledW = baseSetW > 0 ? Math.max(5, Math.round(baseSetW * progressFactor)) : 0;
            return {
              weight: scaledW,
              reps: parseInt(s.reps) || 10
            };
          })
        };
      });

      workoutsHistory.push({
        id: `hist_${client.firstName}_${sessionCount}`,
        userEmail: client.email,
        workoutName: activeTemplate.name,
        date: dateStr,
        timeString: '18:30',
        timestamp: currMs,
        duration: '52:10',
        exercises: workoutExercises
      });

      currMs += stepMs;
      sessionCount++;
    }
  });

  // 4. INGEPLANDE SESSIONS (Coach Agenda)
  const sessions = [
    // 2026 Cliënten
    { id: 201, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Quiroz Marnef', clientEmail: 'shana@gmail.com', clientName: 'Shana Peeters', date: '2026-10-05', time: '10:00', type: 'Personal Training - Legs & Booty' },
    { id: 202, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Quiroz Marnef', clientEmail: 'lisa@gmail.com', clientName: 'Lisa Willems', date: '2026-10-08', time: '14:00', type: 'Techniek Check & Schema' },
    { id: 203, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Quiroz Marnef', clientEmail: 'ruben@gmail.com', clientName: 'Ruben Goossens', date: '2026-10-12', time: '11:00', type: 'Personal Training - Chest Focus' },
    
    // 2025 Cliënten
    { id: 204, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Quiroz Marnef', clientEmail: 'emma@gmail.com', clientName: 'Emma Claes', date: '2026-10-16', time: '15:30', type: 'Evaluatie & Conditionering' },
    { id: 205, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Quiroz Marnef', clientEmail: 'sophie@gmail.com', clientName: 'Sophie Jacobs', date: '2026-10-20', time: '09:30', type: 'Maandelijkse Check-in' },
    
    // 2024 Cliënten
    { id: 206, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Quiroz Marnef', clientEmail: 'daan@gmail.com', clientName: 'Daan de Jong', date: '2026-10-26', time: '18:00', type: '3-Maandelijkse Mijlpaal Review' },
    { id: 207, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Quiroz Marnef', clientEmail: 'kevin@gmail.com', clientName: 'Kevin Maes', date: '2026-11-02', time: '19:00', type: 'Powerlifting Max Test' },
    { id: 208, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Quiroz Marnef', clientEmail: 'maxim@gmail.com', clientName: 'Maxim Windels', date: '2026-11-09', time: '17:00', type: 'Schema Periodisering' },
    { id: 209, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Quiroz Marnef', clientEmail: 'thomas@gmail.com', clientName: 'Thomas Janssens', date: '2026-11-16', time: '16:00', type: 'Voortgangsgesprek' }
  ];

  // Schoonmaken van hulpattributen
  const cleanUsers = users.map(({ startDate, freq, baseW, maxW, setbacks, ...u }) => u);

  saveUsers(cleanUsers);
  saveTemplates(templates);
  saveWorkoutsHistory(workoutsHistory);
  saveSessions(sessions);

  window.location.reload();
}

function max1(val) {
  return val <= 0 ? 1 : val;
}

/**
 * Wist alle opgeslagen data in LocalStorage.
 */
export function resetAllData() {
  localStorage.clear();
  window.location.reload();
}