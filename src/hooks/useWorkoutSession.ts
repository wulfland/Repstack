/**
 * Hook for managing an active workout session
 * Handles state, auto-save, and workout progression
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Workout, WorkoutExercise, WorkoutSet } from '../types/models';
import {
  createWorkout,
  updateWorkout,
  autoSaveWorkout,
  recoverActiveWorkout,
  clearAutoSavedWorkout,
  createEmptySet,
  getPreviousPerformance,
} from '../db/service';

interface UseWorkoutSessionReturn {
  workout: Workout | null;
  isActive: boolean;
  startWorkout: () => void;
  endWorkout: () => Promise<void>;
  cancelWorkout: () => void;
  addExercise: (exerciseId: string) => Promise<void>;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ) => void;
  updateExerciseNotes: (exerciseId: string, notes: string) => void;
  updateWorkoutNotes: (notes: string) => void;
  currentExerciseIndex: number;
  setCurrentExerciseIndex: (index: number) => void;
}

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function useWorkoutSession(): UseWorkoutSessionReturn {
  // Initialize state with recovered workout if available
  const [workout, setWorkout] = useState<Workout | null>(() => {
    return recoverActiveWorkout();
  });
  const [isActive, setIsActive] = useState(() => {
    return recoverActiveWorkout() !== null;
  });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const autoSaveTimerRef = useRef<number | null>(null);

  // Auto-save active workout
  useEffect(() => {
    if (!workout || !isActive) {
      return;
    }

    const save = () => {
      autoSaveWorkout(workout);
    };

    // Save immediately
    save();

    // Set up interval for periodic saves
    autoSaveTimerRef.current = window.setInterval(save, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [workout, isActive]);

  const startWorkout = useCallback(() => {
    const newWorkout: Workout = {
      id: 'temp-workout-' + crypto.randomUUID(), // Temporary ID until saved to DB
      date: new Date(),
      exercises: [],
      notes: undefined,
      completed: false,
      duration: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setWorkout(newWorkout);
    setIsActive(true);
    setCurrentExerciseIndex(0);
  }, []);

  const endWorkout = useCallback(async () => {
    if (!workout) return;

    const duration = Math.round(
      (new Date().getTime() - workout.date.getTime()) / 60000
    ); // minutes

    const completedWorkout: Workout = {
      ...workout,
      completed: true,
      duration,
      updatedAt: new Date(),
    };

    // Save to database
    if (workout.id.startsWith('temp-workout-')) {
      // Create new workout
      const id = await createWorkout({
        date: completedWorkout.date,
        exercises: completedWorkout.exercises,
        notes: completedWorkout.notes,
        completed: true,
        duration,
      });
      completedWorkout.id = id;
    } else {
      // Update existing workout
      await updateWorkout(workout.id, completedWorkout);
    }

    // Clear auto-saved data
    clearAutoSavedWorkout();

    // Reset state
    setWorkout(null);
    setIsActive(false);
    setCurrentExerciseIndex(0);
  }, [workout]);

  const cancelWorkout = useCallback(() => {
    if (!workout) return;

    // Clear auto-saved data
    clearAutoSavedWorkout();

    // Reset state
    setWorkout(null);
    setIsActive(false);
    setCurrentExerciseIndex(0);
  }, [workout]);

  const addExercise = useCallback(
    async (exerciseId: string) => {
      if (!workout) return;

      // Try to get previous performance for this exercise
      const previousPerformance = await getPreviousPerformance(exerciseId);
      // Use the last set from previous workout for better progressive overload tracking
      const previousSet =
        previousPerformance?.sets[previousPerformance.sets.length - 1];

      const newExercise: WorkoutExercise = {
        exerciseId,
        sets: [createEmptySet(exerciseId, 1, previousSet)],
        notes: undefined,
      };

      setWorkout({
        ...workout,
        exercises: [...workout.exercises, newExercise],
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const removeExercise = useCallback(
    (exerciseId: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.filter(
          (ex) => ex.exerciseId !== exerciseId
        ),
        updatedAt: new Date(),
      });

      // Adjust current exercise index if needed
      if (currentExerciseIndex >= workout.exercises.length - 1) {
        setCurrentExerciseIndex(Math.max(0, workout.exercises.length - 2));
      }
    },
    [workout, currentExerciseIndex]
  );

  const addSet = useCallback(
    (exerciseId: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) => {
          if (ex.exerciseId !== exerciseId) return ex;

          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet = createEmptySet(
            exerciseId,
            ex.sets.length + 1,
            lastSet
          );

          return {
            ...ex,
            sets: [...ex.sets, newSet],
          };
        }),
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const removeSet = useCallback(
    (exerciseId: string, setId: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) => {
          if (ex.exerciseId !== exerciseId) return ex;

          const updatedSets = ex.sets.filter((set) => set.id !== setId);
          // Renumber sets
          return {
            ...ex,
            sets: updatedSets.map((set, index) => ({
              ...set,
              setNumber: index + 1,
            })),
          };
        }),
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const updateSet = useCallback(
    (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) => {
          if (ex.exerciseId !== exerciseId) return ex;

          return {
            ...ex,
            sets: ex.sets.map((set) =>
              set.id === setId ? { ...set, ...updates } : set
            ),
          };
        }),
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const updateExerciseNotes = useCallback(
    (exerciseId: string, notes: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        exercises: workout.exercises.map((ex) =>
          ex.exerciseId === exerciseId ? { ...ex, notes } : ex
        ),
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  const updateWorkoutNotes = useCallback(
    (notes: string) => {
      if (!workout) return;

      setWorkout({
        ...workout,
        notes,
        updatedAt: new Date(),
      });
    },
    [workout]
  );

  return {
    workout,
    isActive,
    startWorkout,
    endWorkout,
    cancelWorkout,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    updateExerciseNotes,
    updateWorkoutNotes,
    currentExerciseIndex,
    setCurrentExerciseIndex,
  };
}
