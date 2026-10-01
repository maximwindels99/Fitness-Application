// ==========================================================================
// MOCK DATA MODULE
// Genereert testdata en resetfunctionaliteit (< 200 regels)
// ==========================================================================

import { saveUsers, saveWorkoutsHistory, saveTemplates, saveSessions } from '../core/storage.js';

/**
 * Genereert verse realistisch-ogende testdata voor de demo/ontwikkelmodus.
 */
export function generateRandomMockData() {
  const users = [
    {
      firstName: 'Arturo',
      lastName: 'Coach',
      name: 'Arturo Coach',
      dob: '1990-01-01',
      email: 'arturo@gmail.com',
      password: '123',
      role: 'coach',
      coachId: 'COACH-1234',
      linkedCoachId: null
    },
    {
      firstName: 'Daan',
      lastName: 'de Jong',
      name: 'Daan de Jong',
      dob: '1995-05-12',
      email: 'daan@gmail.com',
      password: '123',
      role: 'client',
      coachId: null,
      linkedCoachId: 'COACH-1234'
    },
    {
      firstName: 'Maxim',
      lastName: 'Windels',
      name: 'Maxim Windels',
      dob: '1998-11-23',
      email: 'maxim@gmail.com',
      password: '123',
      role: 'client',
      coachId: null,
      linkedCoachId: 'COACH-1234'
    }
  ];

  const templates = [
    {
      id: 101,
      userEmail: 'daan@gmail.com',
      name: 'Kracht & Hypertrofie',
      exercises: [
        {
          exerciseId: 'ex_bench_press',
          sets: [
            { weight: 70, reps: 8, completed: false },
            { weight: 75, reps: 6, completed: false },
            { weight: 80, reps: 5, completed: false }
          ]
        },
        {
          exerciseId: 'ex_barbell_squat',
          sets: [
            { weight: 100, reps: 6, completed: false },
            { weight: 110, reps: 5, completed: false }
          ]
        }
      ]
    }
  ];

  const workoutsHistory = [
    {
      id: 'hist_1',
      userEmail: 'daan@gmail.com',
      workoutName: 'Kracht & Hypertrofie',
      date: '28-09-2026',
      timeString: '14:30',
      timestamp: Date.now() - 172800000,
      duration: '45:20',
      exercises: [
        {
          exerciseId: 'ex_bench_press',
          sets: [
            { weight: 70, reps: 8 },
            { weight: 75, reps: 6 }
          ]
        },
        {
          exerciseId: 'ex_barbell_squat',
          sets: [
            { weight: 100, reps: 6 },
            { weight: 110, reps: 5 }
          ]
        }
      ]
    }
  ];

  const sessions = [
    {
      id: 201,
      coachEmail: 'arturo@gmail.com',
      coachName: 'Arturo Coach',
      clientEmail: 'daan@gmail.com',
      clientName: 'Daan de Jong',
      date: '2026-10-02',
      time: '10:00',
      type: 'Personal Training - Benen Focus'
    }
  ];

  saveUsers(users);
  saveTemplates(templates);
  saveWorkoutsHistory(workoutsHistory);
  saveSessions(sessions);

  alert("🎉 Verse testdata succesvol aangemaakt! Je kunt inloggen met arturo@gmail.com of daan@gmail.com (Wachtwoord: 123).");
  window.location.reload();
}

/**
 * Wist alle opgeslagen data in LocalStorage.
 */
export function resetAllData() {
  if (confirm("⚠️ Weet je zeker dat je alle data wilt wissen?")) {
    localStorage.clear();
    alert("Alle data is gewist.");
    window.location.reload();
  }
}