import Dexie, { type EntityTable } from 'dexie';

// Define the data models
export interface User {
  id?: number;
  name: string;
  email: string;
  trainingExperience: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id?: number;
  name: string;
  category: 'machine' | 'barbell' | 'dumbbell' | 'bodyweight' | 'cable';
  muscleGroups: string[];
  description?: string;
  createdAt: Date;
}

export interface Workout {
  id?: number;
  date: Date;
  exercises: WorkoutExercise[];
  notes?: string;
  completed: boolean;
  createdAt: Date;
}

export interface WorkoutExercise {
  exerciseId: number;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  rir: number; // Reps in reserve
  completed: boolean;
}

export interface Mesocycle {
  id?: number;
  name: string;
  startDate: Date;
  endDate: Date;
  weeks: number;
  status: 'planned' | 'active' | 'completed';
  createdAt: Date;
}

// Define the database
const db = new Dexie('RepstackDB') as Dexie & {
  users: EntityTable<User, 'id'>;
  exercises: EntityTable<Exercise, 'id'>;
  workouts: EntityTable<Workout, 'id'>;
  mesocycles: EntityTable<Mesocycle, 'id'>;
};

// Schema declaration
db.version(1).stores({
  users: '++id, email, createdAt',
  exercises: '++id, name, category, createdAt',
  workouts: '++id, date, completed, createdAt',
  mesocycles: '++id, startDate, endDate, status, createdAt',
});

export { db };
