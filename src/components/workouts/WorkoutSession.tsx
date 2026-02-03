/**
 * Main workout session page component
 * Handles active workout logging and tracking
 */

import { useState, useMemo, useEffect } from 'react';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import {
  useExercises,
  useActiveMesocycle,
  useCompletedWorkouts,
} from '../../hooks/useDatabase';
import { useToast } from '../../hooks/useToast';
import {
  getMesocycleWeekDescription,
  getNextSplitDay,
} from '../../lib/mesocycleUtils';
import type {
  WorkoutFeedback as WorkoutFeedbackType,
  MuscleGroup,
  ProgramTemplate,
  MesocycleSplitDay,
} from '../../types/models';
import ExerciseSelector from './ExerciseSelector';
import WorkoutExerciseCard from './WorkoutExerciseCard';
import WorkoutFeedback from './WorkoutFeedback';
import RestTimer from './RestTimer';
import SplitDaySelector from './SplitDaySelector';
import ToastContainer from '../common/ToastContainer';
import ConfirmDialog from '../common/ConfirmDialog';
import TemplateSelector from '../templates/TemplateSelector';
import TemplateGuide from '../templates/TemplateGuide';
import './WorkoutSession.css';

interface WorkoutSessionProps {
  onNavigate?: (
    page: 'mesocycles' | 'workout' | 'exercises' | 'progress' | 'settings'
  ) => void;
}

export default function WorkoutSession({ onNavigate }: WorkoutSessionProps) {
  const {
    workout,
    isActive,
    startWorkout,
    startWorkoutFromSplit,
    endWorkout,
    cancelWorkout,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    updateExerciseNotes,
    updateWorkoutNotes,
  } = useWorkoutSession();

  const exercises = useExercises();
  const activeMesocycle = useActiveMesocycle();
  const completedWorkouts = useCompletedWorkouts();
  const { toasts, showToast, removeToast } = useToast();
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSplitSelector, setShowSplitSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProgramTemplate | null>(null);
  const [activeWorkoutTemplate, setActiveWorkoutTemplate] =
    useState<ProgramTemplate | null>(null);
  const [templateDayIndex, setTemplateDayIndex] = useState(0);
  const [recommendedSplit, setRecommendedSplit] =
    useState<MesocycleSplitDay | null>(null);

  // Memoize mesocycle context to avoid recalculation on every render
  const mesocycleContext = useMemo(() => {
    return activeMesocycle
      ? `${activeMesocycle.name} - ${getMesocycleWeekDescription(activeMesocycle, activeMesocycle.currentWeek)}`
      : null;
  }, [activeMesocycle]);

  // Calculate recommended split when mesocycle or completed workouts change
  useEffect(() => {
    let cancelled = false;

    const fetchRecommendedSplit = async () => {
      if (activeMesocycle && completedWorkouts) {
        const split = await getNextSplitDay(activeMesocycle, completedWorkouts);
        if (!cancelled) {
          setRecommendedSplit(split);
        }
      } else if (!cancelled) {
        setRecommendedSplit(null);
      }
    };

    fetchRecommendedSplit();

    return () => {
      cancelled = true;
    };
  }, [activeMesocycle, completedWorkouts]);

  // Get all unique muscle groups from workout exercises
  const workoutMuscleGroups = useMemo(() => {
    if (!workout || !exercises) return [];

    const muscleGroupSet = new Set<MuscleGroup>();
    workout.exercises.forEach((workoutEx) => {
      const exercise = exercises.find((ex) => ex.id === workoutEx.exerciseId);
      if (exercise) {
        exercise.muscleGroups.forEach((mg) => muscleGroupSet.add(mg));
      }
    });

    return Array.from(muscleGroupSet);
  }, [workout, exercises]);

  // Get the split day name if this workout is from a split
  const splitDayName = useMemo(() => {
    if (!workout?.splitDayId || !activeMesocycle) return null;
    const split = activeMesocycle.splitDays.find(
      (s) => s.id === workout.splitDayId
    );
    return split?.name || null;
  }, [workout, activeMesocycle]);

  const handleStartWorkout = () => {
    // If mesocycle has split days configured, show split selector
    if (
      activeMesocycle &&
      activeMesocycle.splitDays &&
      activeMesocycle.splitDays.length > 0
    ) {
      setShowSplitSelector(true);
    } else {
      // No mesocycle or no splits configured, start empty workout
      startWorkout();
      // If a template is selected, activate it for the workout
      if (selectedTemplate) {
        setActiveWorkoutTemplate(selectedTemplate);
        setTemplateDayIndex(0);
      }
    }
  };

  const handleSplitSelect = async (splitDayId: string) => {
    setShowSplitSelector(false);
    if (!activeMesocycle) return;

    try {
      await startWorkoutFromSplit(activeMesocycle.id, splitDayId);

      // Find the selected split to show its name
      const selectedSplit = activeMesocycle.splitDays.find(
        (s) => s.id === splitDayId
      );
      if (selectedSplit) {
        showToast(
          `Starting ${selectedSplit.name} with ${selectedSplit.exercises?.length || 0} exercises`,
          'success'
        );
      }
    } catch (error) {
      showToast(
        'Failed to start workout from split. Starting empty workout instead.',
        'error'
      );
      console.error('Error starting workout from split:', error);
      // Fall back to empty workout
      startWorkout();
    }
  };

  const handleCancelSplitSelection = () => {
    setShowSplitSelector(false);
    // Start empty workout if user cancels split selection
    startWorkout();
  };

  const handleEndWorkout = async () => {
    if (!workout || workout.exercises.length === 0) {
      showToast(
        'Please add at least one exercise before ending the workout.',
        'error'
      );
      return;
    }

    // Show feedback prompt
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = async (feedback: WorkoutFeedbackType) => {
    setShowFeedback(false);
    await endWorkout(feedback);
    showToast('Workout saved successfully!', 'success');
    // Clear active template after workout ends
    setActiveWorkoutTemplate(null);
    setTemplateDayIndex(0);
  };

  const handleSkipFeedback = async () => {
    setShowFeedback(false);
    await endWorkout();
    showToast('Workout saved successfully!', 'success');
    // Clear active template after workout ends
    setActiveWorkoutTemplate(null);
    setTemplateDayIndex(0);
  };

  const handleCancelWorkout = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelWorkout = () => {
    cancelWorkout();
    setShowCancelDialog(false);
    showToast('Workout cancelled', 'info');
    // Clear active template when workout is cancelled
    setActiveWorkoutTemplate(null);
    setTemplateDayIndex(0);
  };

  const handleAddExercise = (exerciseId: string) => {
    addExercise(exerciseId);
    setShowExerciseSelector(false);
  };

  const handleSetComplete = () => {
    // Show rest timer when a set is completed
    setShowRestTimer(true);
  };

  const handleTemplateSelect = (template: ProgramTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    showToast(
      `Template "${template.name}" selected! Start your workout to use it.`,
      'success'
    );
  };

  const handleSkipTemplate = () => {
    setShowTemplateSelector(false);
    setSelectedTemplate(null);
  };

  if (!isActive) {
    return (
      <div className="workout-session-container">
        <div className="workout-start-screen">
          <h1>Ready to Train?</h1>

          {!activeMesocycle ? (
            <div className="no-mesocycle-prompt">
              <div className="info-box info-box-warning">
                <h3>⚠️ No Active Mesocycle</h3>
                <p>
                  For best results, you should create a mesocycle before
                  starting your workouts. Mesocycles provide structured
                  progression, planned deloads, and volume management.
                </p>
                <p>
                  <strong>Benefits of mesocycle-based training:</strong>
                </p>
                <ul>
                  <li>Progressive overload tracking</li>
                  <li>Planned recovery weeks</li>
                  <li>Auto-regulation based on feedback</li>
                  <li>Better long-term results</li>
                </ul>
                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('mesocycles');
                    }
                  }}
                  className="btn-primary btn-large"
                  style={{ marginTop: '1rem' }}
                >
                  📊 Create Your First Mesocycle
                </button>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <p className="text-muted">
                  Or continue without a mesocycle (not recommended for optimal
                  progress):
                </p>
                <button
                  onClick={handleStartWorkout}
                  className="btn-secondary"
                  style={{ marginTop: '0.5rem' }}
                >
                  Start Workout Without Mesocycle
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>Start a new workout session to log your training.</p>
              <div className="mesocycle-context-banner">
                <span className="banner-icon">📅</span>
                <div>
                  <div className="banner-title">{activeMesocycle.name}</div>
                  <div className="banner-subtitle">
                    {getMesocycleWeekDescription(
                      activeMesocycle,
                      activeMesocycle.currentWeek
                    )}
                  </div>
                </div>
              </div>
              {selectedTemplate && (
                <div className="template-selected-banner">
                  <span className="banner-icon">📋</span>
                  <div>
                    <div className="banner-title">
                      Template: {selectedTemplate.name}
                    </div>
                    <div className="banner-subtitle">
                      {selectedTemplate.daysPerWeek} days/week •{' '}
                      {selectedTemplate.targetLevel}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="banner-clear-btn"
                    aria-label="Clear template"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="workout-start-actions">
                <button
                  onClick={handleStartWorkout}
                  className="btn-primary btn-large"
                >
                  🏋️ Start Workout
                </button>
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="btn-secondary btn-large"
                >
                  📋 Browse Templates
                </button>
              </div>
            </>
          )}
        </div>

        {showTemplateSelector && (
          <TemplateSelector
            isOpen={showTemplateSelector}
            onSelectTemplate={handleTemplateSelect}
            onSkip={handleSkipTemplate}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}

        {showSplitSelector &&
          activeMesocycle &&
          completedWorkouts &&
          recommendedSplit && (
            <SplitDaySelector
              mesocycle={activeMesocycle}
              completedWorkouts={completedWorkouts}
              recommendedSplit={recommendedSplit}
              onSelect={handleSplitSelect}
              onCancel={handleCancelSplitSelection}
            />
          )}

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  if (!workout) {
    return null;
  }

  const workoutDuration = Math.round(
    (new Date().getTime() - workout.date.getTime()) / 60000
  );

  return (
    <div className="workout-session-container">
      {mesocycleContext && (
        <div className="mesocycle-context-banner active-workout">
          <span className="banner-icon">📅</span>
          <span className="banner-text">{mesocycleContext}</span>
        </div>
      )}
      {splitDayName && (
        <div className="split-day-banner">
          <span className="banner-icon">🎯</span>
          <span className="banner-text">Training: {splitDayName}</span>
        </div>
      )}
      <div className="workout-header">
        <div className="workout-header-info">
          <h1>Active Workout</h1>
          <div className="workout-meta">
            <span className="workout-time">⏱️ {workoutDuration} min</span>
            <span className="workout-exercises">
              💪 {workout.exercises.length} exercises
            </span>
          </div>
        </div>
        <div className="workout-header-actions">
          <button onClick={handleCancelWorkout} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleEndWorkout} className="btn-primary">
            Finish Workout
          </button>
        </div>
      </div>

      <div className="workout-content">
        {activeWorkoutTemplate && (
          <TemplateGuide
            template={activeWorkoutTemplate}
            currentDayIndex={templateDayIndex}
            onChangeDayIndex={setTemplateDayIndex}
            onDismiss={() => setActiveWorkoutTemplate(null)}
          />
        )}

        {workout.exercises.length === 0 && (
          <div className="empty-workout-state">
            <p>
              No exercises added yet. Add your first exercise to get started!
            </p>
          </div>
        )}

        {workout.exercises.map((workoutExercise, index) => {
          const exercise = exercises?.find(
            (ex) => ex.id === workoutExercise.exerciseId
          );
          if (!exercise) return null;

          return (
            <WorkoutExerciseCard
              key={workoutExercise.exerciseId}
              exercise={exercise}
              workoutExercise={workoutExercise}
              exerciseNumber={index + 1}
              onAddSet={() => addSet(workoutExercise.exerciseId)}
              onRemoveSet={(setId) =>
                removeSet(workoutExercise.exerciseId, setId)
              }
              onUpdateSet={(setId, updates) =>
                updateSet(workoutExercise.exerciseId, setId, updates)
              }
              onUpdateNotes={(notes) =>
                updateExerciseNotes(workoutExercise.exerciseId, notes)
              }
              onRemoveExercise={() =>
                removeExercise(workoutExercise.exerciseId)
              }
              onSetComplete={handleSetComplete}
            />
          );
        })}

        <button
          onClick={() => setShowExerciseSelector(true)}
          className="btn-add-exercise"
        >
          + Add Exercise
        </button>

        <div className="workout-notes-section">
          <label htmlFor="workout-notes">Workout Notes (optional)</label>
          <textarea
            id="workout-notes"
            value={workout.notes || ''}
            onChange={(e) => updateWorkoutNotes(e.target.value)}
            placeholder="Add notes about your workout..."
            rows={3}
          />
        </div>
      </div>

      {showExerciseSelector && (
        <ExerciseSelector
          exercises={exercises || []}
          selectedExerciseIds={workout.exercises.map((ex) => ex.exerciseId)}
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}

      {showCancelDialog && (
        <ConfirmDialog
          title="Cancel Workout?"
          message="Are you sure you want to cancel this workout? All unsaved progress will be lost."
          confirmLabel="Cancel Workout"
          cancelLabel="Keep Training"
          onConfirm={confirmCancelWorkout}
          onCancel={() => setShowCancelDialog(false)}
          variant="danger"
        />
      )}

      {showRestTimer && <RestTimer onClose={() => setShowRestTimer(false)} />}

      {showFeedback && (
        <WorkoutFeedback
          muscleGroups={workoutMuscleGroups}
          onSubmit={handleFeedbackSubmit}
          onSkip={handleSkipFeedback}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
