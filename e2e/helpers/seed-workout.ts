import { Page } from '@playwright/test';

/**
 * Insert one completed workout (with its exercises) straight into IndexedDB
 * so a test can open Progress -> Workout History -> detail without logging
 * a session by hand. Call after skipOnboarding(page); reload afterwards so
 * Dexie live queries pick it up.
 *
 * Table names are the V2 tables from src/db/index.ts.
 */
export async function seedWorkout(page: Page): Promise<string> {
  const workoutId = await page.evaluate(async () => {
    const workoutId = 'e2e-workout-1';
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9);

    // Reuse the starter exercises if they exist so the library shows no
    // duplicates; otherwise insert our own.
    const findOrCreate = (
      db: IDBDatabase,
      name: string,
      fallbackId: string,
      muscleGroups: string[]
    ): Promise<string> =>
      new Promise((resolve, reject) => {
        const tx = db.transaction('exercisesV2', 'readwrite');
        const store = tx.objectStore('exercisesV2');
        const req = store.index('name').get(name);
        req.onsuccess = () => {
          const found = req.result as { id: string } | undefined;
          if (found) return resolve(found.id);
          store.put({
            id: fallbackId,
            name,
            category: 'barbell',
            muscleGroups,
            isCustom: false,
            createdAt: now,
          });
          resolve(fallbackId);
        };
        req.onerror = () => reject(req.error);
      });

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open('RepstackDB');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => resolve(open.result);
    });

    const benchId = await findOrCreate(db, 'Barbell Bench Press', 'e2e-bench', [
      'chest',
      'triceps',
    ]);
    const rowId = await findOrCreate(db, 'Barbell Row', 'e2e-row', [
      'back',
      'biceps',
    ]);

    const set = (
      exerciseId: string,
      n: number,
      weight: number,
      reps: number
    ) => ({
      id: `${exerciseId}-set-${n}`,
      exerciseId,
      setNumber: n,
      targetReps: reps,
      actualReps: reps,
      weight,
      rir: 2,
      completed: true,
    });

    const workout = {
      id: workoutId,
      date,
      exercises: [
        {
          exerciseId: benchId,
          sets: [set(benchId, 1, 80, 10), set(benchId, 2, 80, 9)],
        },
        { exerciseId: rowId, sets: [set(rowId, 1, 70, 12)] },
      ],
      notes: 'Seeded by e2e/helpers/seed-workout.ts',
      completed: true,
      duration: 45,
      createdAt: now,
      updatedAt: now,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('workoutsV2', 'readwrite');
      tx.objectStore('workoutsV2').put(workout);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });

    return workoutId;
  });

  return workoutId;
}
