/**
 * Rest timer component for tracking rest between sets
 * Provides countdown with skip and extend options
 */

import { useRestTimer } from '../../hooks/useRestTimer';
import { useEffect, useRef, useCallback } from 'react';
import './RestTimer.css';

interface RestTimerProps {
  onClose: () => void;
}

export default function RestTimer({ onClose }: RestTimerProps) {
  const {
    timeRemaining,
    isRunning,
    isPaused,
    isComplete,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    extendTimer,
  } = useRestTimer({
    defaultRestSeconds: 90,
    audioEnabled: false,
    vibrationEnabled: true,
  });

  const dialogRef = useRef<HTMLDivElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);

  // Helper functions - declared before useEffect hooks that use them
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkip = useCallback(() => {
    stopTimer();
    onClose();
  }, [stopTimer, onClose]);

  // Announce time remaining for screen readers
  useEffect(() => {
    if (isRunning && timeRemaining > 0 && timeRemaining % 30 === 0) {
      if (announceRef.current) {
        announceRef.current.textContent = `${formatTime(timeRemaining)} remaining`;
      }
    }
  }, [timeRemaining, isRunning]);

  useEffect(() => {
    if (isComplete && announceRef.current) {
      announceRef.current.textContent =
        'Rest complete! Ready for your next set?';
    }
  }, [isComplete]);

  // Handle ESC key and focus trap
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleSkip();
      }
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [handleSkip]);

  const handleStart = (seconds: number) => {
    startTimer(seconds);
  };

  const handleExtend = (seconds: number) => {
    extendTimer(seconds);
  };

  if (isComplete) {
    return (
      <div
        className="rest-timer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rest-complete-title"
      >
        <div className="rest-timer-content complete" ref={dialogRef}>
          <div
            ref={announceRef}
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          />
          <h2 id="rest-complete-title">Rest Complete! 💪</h2>
          <p>Ready for your next set?</p>
          <button onClick={onClose} className="btn-primary btn-large" autoFocus>
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (!isRunning) {
    return (
      <div
        className="rest-timer-modal"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rest-timer-title"
      >
        <div
          className="rest-timer-content"
          onClick={(e) => e.stopPropagation()}
          ref={dialogRef}
        >
          <div
            ref={announceRef}
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          />
          <h2 id="rest-timer-title">Rest Timer</h2>
          <p>How long do you want to rest?</p>
          <div className="rest-timer-presets">
            <button
              onClick={() => handleStart(60)}
              className="rest-timer-preset-btn"
              aria-label="Rest for 1 minute"
            >
              1:00
            </button>
            <button
              onClick={() => handleStart(90)}
              className="rest-timer-preset-btn"
              aria-label="Rest for 1 minute 30 seconds"
            >
              1:30
            </button>
            <button
              onClick={() => handleStart(120)}
              className="rest-timer-preset-btn"
              aria-label="Rest for 2 minutes"
            >
              2:00
            </button>
            <button
              onClick={() => handleStart(180)}
              className="rest-timer-preset-btn"
              aria-label="Rest for 3 minutes"
            >
              3:00
            </button>
          </div>
          <button onClick={onClose} className="btn-secondary">
            Skip Rest Timer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rest-timer-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rest-timer-active-title"
    >
      <div className="rest-timer-content" ref={dialogRef}>
        <div
          ref={announceRef}
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        />
        <h2 id="rest-timer-active-title">Rest Timer</h2>
        <div className="rest-timer-display">
          <div className="rest-timer-circle">
            <span
              className="rest-timer-time"
              aria-label={`${formatTime(timeRemaining)} remaining`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="rest-timer-controls">
          {!isPaused ? (
            <button
              onClick={pauseTimer}
              className="btn-secondary"
              aria-label="Pause rest timer"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="btn-primary"
              aria-label="Resume rest timer"
            >
              Resume
            </button>
          )}
        </div>

        <div className="rest-timer-extend">
          <button
            onClick={() => handleExtend(-15)}
            className="btn-extend"
            disabled={timeRemaining < 15}
            aria-label="Decrease rest time by 15 seconds"
          >
            -15s
          </button>
          <button
            onClick={() => handleExtend(15)}
            className="btn-extend"
            aria-label="Increase rest time by 15 seconds"
          >
            +15s
          </button>
          <button
            onClick={() => handleExtend(30)}
            className="btn-extend"
            aria-label="Increase rest time by 30 seconds"
          >
            +30s
          </button>
        </div>

        <button
          onClick={handleSkip}
          className="btn-skip"
          aria-label="Skip rest timer and continue"
        >
          Skip Rest
        </button>
      </div>
    </div>
  );
}
