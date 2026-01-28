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

// Recovery/fatigue status for auto-regulation
export type RecoveryStatus =
  | 'well_recovered'
  | 'moderately_recovered'
  | 'fatigued'
  | 'very_fatigued';

// Muscle group feedback for auto-regulation
export interface MuscleGroupFeedback {
  muscleGroup: MuscleGroup;
  pump?: number; // 1-5 scale
  soreness?: number; // 1-5 scale
}

// Workout feedback for auto-regulation
export interface WorkoutFeedback {
  overallRecovery?: RecoveryStatus;
  muscleGroupFeedback?: MuscleGroupFeedback[];
  notes?: string;
}

// Complete workout session
export interface Workout {
  id: string;
  date: Date;
  mesocycleId?: string; // Associated mesocycle
  weekNumber?: number; // Week within mesocycle (1-6)
  splitDayId?: string; // Associated split day from mesocycle
  exercises: WorkoutExercise[];
  notes?: string;
  completed: boolean;
  duration?: number; // Duration in minutes
  feedback?: WorkoutFeedback; // Auto-regulation feedback
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

// Exercise configuration within a mesocycle split day
export interface MesocycleExercise {
  exerciseId: string; // Reference to Exercise
  order: number; // Order within the split day
  targetSets: number; // Number of sets to perform (typically 2-5)
  targetRepsMin: number; // Minimum target reps (e.g., 8)
  targetRepsMax: number; // Maximum target reps (e.g., 12)
  restSeconds?: number; // Optional custom rest time
  notes?: string; // Exercise-specific notes
}

// Split day configuration within a mesocycle
export interface MesocycleSplitDay {
  id: string;
  name: string; // e.g., "Push Day", "Upper A", "Full Body 1"
  dayOrder: number; // Order in the split rotation (1, 2, 3...)
  exercises: MesocycleExercise[];
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
  splitDays: MesocycleSplitDay[]; // Exercise configuration for each split day
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

// Program template types
export type TemplateType = 'upper_lower' | 'push_pull_legs' | 'full_body';

export interface TemplateExerciseSlot {
  name: string; // Display name like "Horizontal Push (chest focus)"
  description: string; // More details
  muscleGroups: MuscleGroup[]; // Primary muscle groups
  targetSets: string; // e.g., "3-4 sets"
  targetReps: string; // e.g., "8-12 reps"
}

export interface TemplateDayPlan {
  name: string; // e.g., "Upper Day A", "Push Day"
  exercises: TemplateExerciseSlot[];
}

export interface ProgramTemplate {
  id: TemplateType;
  name: string;
  description: string;
  daysPerWeek: number;
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  days: TemplateDayPlan[];
}
