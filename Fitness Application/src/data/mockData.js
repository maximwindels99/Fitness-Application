// ==========================================================================
// MOCK DATA MODULE
// Genereert verse testdata voor 10 unieke gebruikers met historische progressie (< 200 regels)
// ==========================================================================

import { saveUsers, saveWorkoutsHistory, saveTemplates, saveSessions } from '../core/storage.js';

/**
 * Genereert verse realistisch-ogende testdata voor de demo/ontwikkelmodus.
 */
export function generateRandomMockData() {
  const coachId = 'COACH-6451';
  const defaultPassword = 'Demo1';

  const users = [
    { firstName: 'Arturo', lastName: 'Coach', name: 'Arturo Coach', dob: '1990-01-01', email: 'arturo@gmail.com', password: defaultPassword, role: 'coach', coachId: coachId, linkedCoachId: null },
    { firstName: 'Daan', lastName: 'de Jong', name: 'Daan de Jong', dob: '1995-05-12', email: 'daan@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2024-01-15', baseWeight: 60, targetWeight: 95 },
    { firstName: 'Maxim', lastName: 'Windels', name: 'Maxim Windels', dob: '1998-11-23', email: 'maxim@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2025-02-01', baseWeight: 65, targetWeight: 90 },
    { firstName: 'Shana', lastName: 'Peeters', name: 'Shana Peeters', dob: '1997-03-18', email: 'shana@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2026-01-10', baseWeight: 40, targetWeight: 65 },
    { firstName: 'Thomas', lastName: 'Janssens', name: 'Thomas Janssens', dob: '1993-07-04', email: 'thomas@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2025-05-10', baseWeight: 50, targetWeight: 80 },
    { firstName: 'Lisa', lastName: 'Willems', name: 'Lisa Willems', dob: '1999-09-30', email: 'lisa@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2026-02-15', baseWeight: 35, targetWeight: 55 },
    { firstName: 'Kevin', lastName: 'Maes', name: 'Kevin Maes', dob: '1991-12-11', email: 'kevin@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2024-03-01', baseWeight: 80, targetWeight: 130 },
    { firstName: 'Emma', lastName: 'Claes', name: 'Emma Claes', dob: '1996-06-22', email: 'emma@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2025-08-01', baseWeight: 30, targetWeight: 50 },
    { firstName: 'Ruben', lastName: 'Goossens', name: 'Ruben Goossens', dob: '1994-04-14', email: 'ruben@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2026-03-01', baseWeight: 55, targetWeight: 75 },
    { firstName: 'Sophie', lastName: 'Jacobs', name: 'Sophie Jacobs', dob: '1998-08-19', email: 'sophie@gmail.com', password: defaultPassword, role: 'client', coachId: null, linkedCoachId: coachId, startDate: '2025-01-20', baseWeight: 45, targetWeight: 70 }
  ];

  const templates = [
    {
      id: 101,
      userEmail: 'daan@gmail.com',
      name: 'Push Kracht & Hypertrofie',
      exercises: [
        { exerciseId: 'ex_bench_press', sets: [{ weight: 85, reps: 6, completed: false }, { weight: 90, reps: 5, completed: false }] },
        { exerciseId: 'ex_overhead_press', sets: [{ weight: 50, reps: 8, completed: false }] }
      ]
    },
    {
      id: 102,
      userEmail: 'maxim@gmail.com',
      name: 'Leg Day Focus',
      exercises: [
        { exerciseId: 'ex_barbell_squat', sets: [{ weight: 110, reps: 6, completed: false }, { weight: 115, reps: 5, completed: false }] }
      ]
    },
    {
      id: 103,
      userEmail: 'shana@gmail.com',
      name: 'Booty & Legs',
      exercises: [
        { exerciseId: 'ex_barbell_squat', sets: [{ weight: 60, reps: 10, completed: false }] },
        { exerciseId: 'ex_hip_thrust', sets: [{ weight: 90, reps: 10, completed: false }] }
      ]
    }
  ];

  const workoutsHistory = [];
  const now = new Date('2026-10-01T12:00:00').getTime();

  // Genereer geleidelijke progressie per cliënt vanaf hun specifieke startdatum
  users.filter(u => u.role === 'client').forEach((client, idx) => {
    const startMs = new Date(client.startDate).getTime();
    const stepDays = 10 + (idx % 4); // Elke 10 tot 13 dagen een workout
    let currentMs = startMs;
    let sessionCount = 0;

    while (currentMs <= now) {
      const progressRatio = Math.min(1, (currentMs - startMs) / (now - startMs));
      const currentWeight = Math.round(client.baseWeight + (client.targetWeight - client.baseWeight) * progressRatio);
      
      const d = new Date(currentMs);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const dateStr = `${day}-${month}-${year}`;

      workoutsHistory.push({
        id: `hist_${client.firstName}_${sessionCount}`,
        userEmail: client.email,
        workoutName: idx % 2 === 0 ? 'Kracht & Hypertrofie' : 'Fullbody Workout',
        date: dateStr,
        timeString: '18:30',
        timestamp: currentMs,
        duration: '52:10',
        exercises: [
          {
            exerciseId: 'ex_bench_press',
            sets: [
              { weight: Math.max(10, currentWeight - 5), reps: 10 },
              { weight: currentWeight, reps: 6 }
            ]
          },
          {
            exerciseId: 'ex_barbell_squat',
            sets: [
              { weight: Math.max(15, Math.round(currentWeight * 1.2)), reps: 8 },
              { weight: Math.max(20, Math.round(currentWeight * 1.3)), reps: 5 }
            ]
          }
        ]
      });

      currentMs += stepDays * 24 * 60 * 60 * 1000;
      sessionCount++;
    }
  });

  const sessions = [
    { id: 201, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Coach', clientEmail: 'daan@gmail.com', clientName: 'Daan de Jong', date: '2026-10-05', time: '10:00', type: 'Personal Training - Borst & Schouders' },
    { id: 202, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Coach', clientEmail: 'maxim@gmail.com', clientName: 'Maxim Windels', date: '2026-10-06', time: '14:00', type: 'Techniek Check - Squat & Deadlift' },
    { id: 203, coachEmail: 'arturo@gmail.com', coachName: 'Arturo Coach', clientEmail: 'shana@gmail.com', clientName: 'Shana Peeters', date: '2026-10-08', time: '11:30', type: 'Evaluatie Progressie & Voeding' }
  ];

  // Sla op zonder tijdelijke hulpattributen
  const cleanUsers = users.map(({ startDate, baseWeight, targetWeight, ...u }) => u);

  saveUsers(cleanUsers);
  saveTemplates(templates);
  saveWorkoutsHistory(workoutsHistory);
  saveSessions(sessions);

  window.location.reload();
}

/**
 * Wist alle opgeslagen data in LocalStorage.
 */
export function resetAllData() {
  localStorage.clear();
  window.location.reload();
}