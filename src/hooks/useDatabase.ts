import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Exercise, type Workout, type Mesocycle } from '../db';

export function useExercises() {
  const exercises = useLiveQuery(() => db.exercises.toArray());
  return exercises;
}

export function useWorkouts() {
  const workouts = useLiveQuery(() =>
    db.workouts.orderBy('date').reverse().toArray()
  );
  return workouts;
}

export function useActiveMesocycle() {
  const mesocycle = useLiveQuery(() =>
    db.mesocycles.where('status').equals('active').first()
  );
  return mesocycle;
}

export async function addExercise(
  exercise: Omit<Exercise, 'id' | 'createdAt'>
) {
  return db.exercises.add({
    ...exercise,
    createdAt: new Date(),
  });
}

export async function addWorkout(workout: Omit<Workout, 'id' | 'createdAt'>) {
  return db.workouts.add({
    ...workout,
    createdAt: new Date(),
  });
}

export async function addMesocycle(
  mesocycle: Omit<Mesocycle, 'id' | 'createdAt'>
) {
  return db.mesocycles.add({
    ...mesocycle,
    createdAt: new Date(),
  });
}
