/**
 * Component for configuring exercises for all split days in a mesocycle
 */

import { useState } from 'react';
import type { Exercise, MesocycleSplitDay } from '../../types/models';
import SplitDayEditor from './SplitDayEditor';
import CopySplitDialog from './CopySplitDialog';
import ToastContainer from '../common/ToastContainer';
import { useToast } from '../../hooks/useToast';
import './MesocycleExerciseConfig.css';

interface MesocycleExerciseConfigProps {
  splitDays: MesocycleSplitDay[];
  exercises: Exercise[];
  onChange: (updatedSplitDays: MesocycleSplitDay[]) => void;
  mesocycleId?: string; // Optional: if provided, check for exercise history in this mesocycle
}

export default function MesocycleExerciseConfig({
  splitDays,
  exercises,
  onChange,
  mesocycleId,
}: MesocycleExerciseConfigProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [sourceSplitDayForCopy, setSourceSplitDayForCopy] =
    useState<MesocycleSplitDay | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  const handleSplitDayChange = (
    index: number,
    updatedSplitDay: MesocycleSplitDay
  ) => {
    const updatedSplitDays = [...splitDays];
    updatedSplitDays[index] = updatedSplitDay;
    onChange(updatedSplitDays);
  };

  const getTotalExercises = (splitDay: MesocycleSplitDay): number => {
    return splitDay.exercises.length;
  };

  const getTotalExercisesAcrossAllDays = (): number => {
    return splitDays.reduce((total, day) => total + day.exercises.length, 0);
  };

  const handleInitiateCopy = (splitDay: MesocycleSplitDay) => {
    if (splitDay.exercises.length === 0) {
      showToast('No exercises to copy from this split day', 'error');
      return;
    }
    setSourceSplitDayForCopy(splitDay);
    setShowCopyDialog(true);
  };

  const handleConfirmCopy = (
    targetSplitDayIds: string[],
    mode: 'replace' | 'append'
  ) => {
    if (!sourceSplitDayForCopy) return;

    const updatedSplitDays = splitDays.map((splitDay) => {
      // If this is a target split day, apply the copy
      if (targetSplitDayIds.includes(splitDay.id)) {
        // Deep copy exercises (MesocycleExercise has only primitive types, so spread is sufficient)
        let newExercises = sourceSplitDayForCopy.exercises.map((exercise) => ({
          ...exercise,
        }));

        if (mode === 'append' && splitDay.exercises.length > 0) {
          // Append: Add copied exercises after existing ones
          newExercises = [...splitDay.exercises, ...newExercises];
        }
        // If mode is 'replace' or target is empty, newExercises already contains only copied exercises

        // Update order values
        newExercises.forEach((ex, i) => {
          ex.order = i;
        });

        return {
          ...splitDay,
          exercises: newExercises,
        };
      }
      return splitDay;
    });

    onChange(updatedSplitDays);

    // Show success toast
    const targetCount = targetSplitDayIds.length;
    const exerciseCount = sourceSplitDayForCopy.exercises.length;
    showToast(
      `Copied ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} to ${targetCount} split${targetCount !== 1 ? 's' : ''}`,
      'success'
    );

    // Close dialog and reset state
    setShowCopyDialog(false);
    setSourceSplitDayForCopy(null);
  };

  const handleCancelCopy = () => {
    setShowCopyDialog(false);
    setSourceSplitDayForCopy(null);
  };

  return (
    <div className="mesocycle-exercise-config">
      <div className="config-header">
        <h2>Configure Exercises</h2>
        <div className="config-summary">
          {getTotalExercisesAcrossAllDays()} total exercises across{' '}
          {splitDays.length} split {splitDays.length === 1 ? 'day' : 'days'}
        </div>
      </div>

      <div className="split-tabs">
        {splitDays.map((splitDay, index) => (
          <button
            key={splitDay.id}
            type="button"
            className={`split-tab ${activeTabIndex === index ? 'active' : ''}`}
            onClick={() => setActiveTabIndex(index)}
          >
            <span className="split-tab-name">{splitDay.name}</span>
            {getTotalExercises(splitDay) > 0 && (
              <span className="split-tab-badge">
                {getTotalExercises(splitDay)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="split-content">
        {splitDays.map((splitDay, index) => (
          <div
            key={splitDay.id}
            className={`split-panel ${activeTabIndex === index ? 'active' : ''}`}
          >
            {activeTabIndex === index && (
              <SplitDayEditor
                splitDay={splitDay}
                exercises={exercises}
                onChange={(updatedSplitDay) =>
                  handleSplitDayChange(index, updatedSplitDay)
                }
                mesocycleId={mesocycleId}
                onCopy={() => handleInitiateCopy(splitDay)}
                canCopy={splitDays.length > 1}
              />
            )}
          </div>
        ))}
      </div>

      {getTotalExercisesAcrossAllDays() === 0 && (
        <div className="config-hint">
          <p>
            💡 <strong>Tip:</strong> Add exercises to each split day to pre-plan
            your workouts throughout the mesocycle.
          </p>
          <p>
            You can set target sets, rep ranges, and rest times for each
            exercise. Use drag-and-drop to reorder exercises within a split.
          </p>
        </div>
      )}

      {showCopyDialog && sourceSplitDayForCopy && (
        <CopySplitDialog
          sourceSplitDay={sourceSplitDayForCopy}
          availableSplitDays={splitDays}
          onConfirm={handleConfirmCopy}
          onCancel={handleCancelCopy}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
