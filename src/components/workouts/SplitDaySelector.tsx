/**
 * Component for selecting which split day to perform
 * Shows available splits with completion status and highlights recommended next split
 */

import type { Mesocycle, MesocycleSplitDay, Workout } from '../../types/models';
import './SplitDaySelector.css';

interface SplitDaySelectorProps {
  mesocycle: Mesocycle;
  completedWorkouts: Workout[];
  recommendedSplit: MesocycleSplitDay | null;
  onSelect: (splitDayId: string) => void;
  onCancel: () => void;
}

export default function SplitDaySelector({
  mesocycle,
  completedWorkouts,
  recommendedSplit,
  onSelect,
  onCancel,
}: SplitDaySelectorProps) {
  // Get completed split day IDs for current week
  const currentWeekWorkouts = completedWorkouts.filter(
    (w) =>
      w.mesocycleId === mesocycle.id &&
      w.weekNumber === mesocycle.currentWeek &&
      w.completed
  );

  const completedSplitIds = new Set(
    currentWeekWorkouts.map((w) => w.splitDayId).filter(Boolean)
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
  };

  return (
    <div className="split-day-selector-overlay" onClick={handleOverlayClick}>
      <div
        className="split-day-selector-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="split-day-selector-header">
          <h2>Select Training Split</h2>
          <p className="split-day-subtitle">
            Choose which split to perform for this workout
          </p>
        </div>

        <div className="split-day-list">
          {mesocycle.splitDays.map((split) => {
            const isCompleted = completedSplitIds.has(split.id);
            const isRecommended = split.id === recommendedSplit?.id;
            const exerciseCount = split.exercises?.length || 0;

            return (
              <button
                key={split.id}
                className={`split-day-item ${isRecommended ? 'recommended' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => onSelect(split.id)}
              >
                <div className="split-day-item-header">
                  <h3>{split.name}</h3>
                  {isRecommended && (
                    <span className="recommended-badge">Recommended</span>
                  )}
                  {isCompleted && (
                    <span className="completed-badge">✓ Done this week</span>
                  )}
                </div>
                <div className="split-day-item-details">
                  <span className="exercise-count">
                    {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                  </span>
                  {exerciseCount === 0 && (
                    <span className="warning-text">
                      ⚠️ No exercises configured
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="split-day-selector-actions">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
