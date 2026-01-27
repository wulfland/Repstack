/**
 * Component for configuring exercises for all split days in a mesocycle
 */

import { useState } from 'react';
import type {
  Exercise,
  MesocycleSplitDay,
} from '../../types/models';
import SplitDayEditor from './SplitDayEditor';
import './MesocycleExerciseConfig.css';

interface MesocycleExerciseConfigProps {
  splitDays: MesocycleSplitDay[];
  exercises: Exercise[];
  onChange: (updatedSplitDays: MesocycleSplitDay[]) => void;
}

export default function MesocycleExerciseConfig({
  splitDays,
  exercises,
  onChange,
}: MesocycleExerciseConfigProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

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
    return splitDays.reduce(
      (total, day) => total + day.exercises.length,
      0
    );
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
              />
            )}
          </div>
        ))}
      </div>

      {getTotalExercisesAcrossAllDays() === 0 && (
        <div className="config-hint">
          <p>
            💡 <strong>Tip:</strong> Add exercises to each split day to
            pre-plan your workouts throughout the mesocycle.
          </p>
          <p>
            You can set target sets, rep ranges, and rest times for each
            exercise. Use drag-and-drop to reorder exercises within a split.
          </p>
        </div>
      )}
    </div>
  );
}
