/**
 * Core data models for Repstack application
 * Following evidence-based hypertrophy training principles
 */

// Muscle groups for exercise categorization
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

// User profile with preferences and training data
export interface UserProfile {
  id: string;
  name: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    units: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: Date;
  updatedAt: Date;
}

// Exercise definition
export interface Exercise {
  id: string;
  name: string;
  category:
    | 'machine'
    | 'barbell'
    | 'dumbbell'
    | 'bodyweight'
    | 'cable'
    | 'other';
  muscleGroups: MuscleGroup[];
  equipment?: string;
  notes?: string;
  isCustom: boolean;
  createdAt: Date;
}

// Workout set with all tracking data
export interface WorkoutSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  targetReps: number;
  actualReps?: number;
  weight: number;
  rir?: number; // Reps in Reserve, valid range 0-10 (typically 0-4 used for auto-regulation)
  completed: boolean;
}

// Exercise within a workout (groups sets together)
export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

// Complete workout session
export interface Workout {
  id: string;
  date: Date;
  mesocycleId?: string; // Associated mesocycle
  weekNumber?: number; // Week within mesocycle (1-6)
  exercises: WorkoutExercise[];
  notes?: string;
  completed: boolean;
  duration?: number; // Duration in minutes
  createdAt: Date;
  updatedAt: Date;
}

// Training session feedback for auto-regulation
export interface TrainingSession {
  id: string;
  workoutId: string;
  exerciseId: string;
  date: Date;
  pump: number; // 1-5 scale
  soreness: number; // 1-5 scale
  fatigue: number; // 1-5 scale
  performance: 'excellent' | 'good' | 'average' | 'poor';
  notes?: string;
  createdAt: Date;
}

// Mesocycle (training block)
export interface Mesocycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  durationWeeks: number; // Total duration (4-6 weeks)
  currentWeek: number; // Current week in mesocycle (1-6)
  deloadWeek: number; // Which week is deload (typically 4 or 6)
  trainingSplit:
    | 'upper_lower'
    | 'push_pull_legs'
    | 'full_body'
    | 'bro_split'
    | 'custom';
  status: 'planned' | 'active' | 'completed' | 'abandoned';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Volume landmarks for progressive overload tracking
export interface VolumeLandmarks {
  exerciseId: string;
  muscleGroup: MuscleGroup;
  mv: number; // Maintenance Volume (sets per week)
  mev: number; // Minimum Effective Volume
  mav: number; // Maximum Adaptive Volume
  mrv: number; // Maximum Recoverable Volume
}

// Active workout session state (not persisted to DB until completed)
export interface ActiveWorkoutSession {
  workout: Workout;
  startTime: Date;
  lastAutoSave?: Date;
  currentExerciseIndex: number;
  currentSetIndex: number;
}

// Rest timer configuration
export interface RestTimerConfig {
  defaultRestSeconds: number; // Default rest time between sets (30-300 seconds)
  audioEnabled: boolean;
  vibrationEnabled: boolean;
}

// Previous performance data for an exercise
export interface ExercisePreviousPerformance {
  exerciseId: string;
  lastWorkoutDate?: Date;
  sets: WorkoutSet[];
}
