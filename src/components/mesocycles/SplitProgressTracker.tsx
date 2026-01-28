/**
 * Component to display split progression within a mesocycle
 * Shows which splits have been completed in the current week
 */

import { useEffect, useState } from 'react';
import { getSplitCompletionStatus } from '../../db/service';
import type { MesocycleSplitDay, Mesocycle } from '../../types/models';
import './SplitProgressTracker.css';

interface SplitCompletionInfo {
  splitDay: MesocycleSplitDay;
  completed: boolean;
  completedDate?: Date;
}

interface SplitProgressTrackerProps {
  mesocycle: Mesocycle;
  onStartWorkout?: (splitDayId: string) => void;
}

export default function SplitProgressTracker({
  mesocycle,
  onStartWorkout,
}: SplitProgressTrackerProps) {
  const [splitStatus, setSplitStatus] = useState<SplitCompletionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSplitStatus() {
      setLoading(true);
      try {
        const status = await getSplitCompletionStatus(mesocycle.id);
        setSplitStatus(status);
      } catch (error) {
        console.error('Failed to load split completion status:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSplitStatus();

    // Reload every 30 seconds to catch updates
    const interval = setInterval(loadSplitStatus, 30000);
    return () => clearInterval(interval);
  }, [mesocycle.id, mesocycle.currentWeek]);

  const isDeloadWeek = mesocycle.currentWeek === mesocycle.deloadWeek;
  const progress = (mesocycle.currentWeek / mesocycle.durationWeeks) * 100;

  // Find next recommended split
  const nextSplit = splitStatus.find((s) => !s.completed)?.splitDay;
  const allCompleted =
    splitStatus.length > 0 && splitStatus.every((s) => s.completed);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="split-progress-tracker loading">
        <p>Loading split progress...</p>
      </div>
    );
  }

  if (splitStatus.length === 0) {
    return (
      <div className="split-progress-tracker empty">
        <p>No split configuration found for this mesocycle.</p>
      </div>
    );
  }

  return (
    <div
      className={`split-progress-tracker ${isDeloadWeek ? 'deload-week' : ''}`}
    >
      {/* Header with week info */}
      <div className="tracker-header">
        <h3 className="tracker-title">
          {mesocycle.name} - Week {mesocycle.currentWeek} of{' '}
          {mesocycle.durationWeeks}
          {isDeloadWeek && <span className="deload-badge">🔄 Deload Week</span>}
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className={`progress-fill ${isDeloadWeek ? 'deload' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-label">{Math.round(progress)}%</span>
      </div>

      {/* This Week's Progress */}
      <div className="week-progress-section">
        <h4 className="section-title">This Week&apos;s Progress:</h4>

        <div className="split-cards">
          {splitStatus.map((info) => {
            const isNext = !allCompleted && info.splitDay.id === nextSplit?.id;

            return (
              <div
                key={info.splitDay.id}
                className={`split-card ${info.completed ? 'completed' : ''} ${isNext ? 'next' : ''}`}
              >
                <div className="split-card-header">
                  <span className="split-name">{info.splitDay.name}</span>
                  <span className="split-status">
                    {info.completed ? '✓' : isNext ? '★ Next' : ''}
                  </span>
                </div>
                {info.completedDate && (
                  <div className="split-date">
                    {formatDate(info.completedDate)}
                  </div>
                )}
                {!info.completed && info.splitDay.exercises.length > 0 && (
                  <div className="split-info">
                    {info.splitDay.exercises.length} exercise
                    {info.splitDay.exercises.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {allCompleted ? (
          <div className="completion-message">
            <span className="completion-icon">🎉</span>
            <p className="completion-text">All done this week!</p>
            <p className="completion-subtext">
              You can repeat splits or start next week&apos;s training
            </p>
          </div>
        ) : nextSplit && onStartWorkout ? (
          <button
            className="btn btn-primary start-workout-btn"
            onClick={() => onStartWorkout(nextSplit.id)}
          >
            Start Next Workout
          </button>
        ) : null}
      </div>

      {/* Deload Week Message */}
      {isDeloadWeek && (
        <div className="deload-message">
          <p>
            <strong>Deload Week:</strong> Reduce volume by 40-50% to facilitate
            recovery and prepare for the next training block.
          </p>
        </div>
      )}
    </div>
  );
}
