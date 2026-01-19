/**
 * Rest timer component for tracking rest between sets
 * Provides countdown with skip and extend options
 */

import { useRestTimer } from '../../hooks/useRestTimer';
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = (seconds: number) => {
    startTimer(seconds);
  };

  const handleSkip = () => {
    stopTimer();
    onClose();
  };

  const handleExtend = (seconds: number) => {
    extendTimer(seconds);
  };

  if (isComplete) {
    return (
      <div className="rest-timer-modal">
        <div className="rest-timer-content complete">
          <h2>Rest Complete! 💪</h2>
          <p>Ready for your next set?</p>
          <button onClick={onClose} className="btn-primary btn-large">
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (!isRunning) {
    return (
      <div className="rest-timer-modal" onClick={onClose}>
        <div className="rest-timer-content" onClick={(e) => e.stopPropagation()}>
          <h2>Rest Timer</h2>
          <p>How long do you want to rest?</p>
          <div className="rest-timer-presets">
            <button
              onClick={() => handleStart(60)}
              className="rest-timer-preset-btn"
            >
              1:00
            </button>
            <button
              onClick={() => handleStart(90)}
              className="rest-timer-preset-btn"
            >
              1:30
            </button>
            <button
              onClick={() => handleStart(120)}
              className="rest-timer-preset-btn"
            >
              2:00
            </button>
            <button
              onClick={() => handleStart(180)}
              className="rest-timer-preset-btn"
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
    <div className="rest-timer-modal">
      <div className="rest-timer-content">
        <h2>Rest Timer</h2>
        <div className="rest-timer-display">
          <div className="rest-timer-circle">
            <span className="rest-timer-time">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="rest-timer-controls">
          {!isPaused ? (
            <button onClick={pauseTimer} className="btn-secondary">
              Pause
            </button>
          ) : (
            <button onClick={resumeTimer} className="btn-primary">
              Resume
            </button>
          )}
        </div>

        <div className="rest-timer-extend">
          <button
            onClick={() => handleExtend(-15)}
            className="btn-extend"
            disabled={timeRemaining < 15}
          >
            -15s
          </button>
          <button onClick={() => handleExtend(15)} className="btn-extend">
            +15s
          </button>
          <button onClick={() => handleExtend(30)} className="btn-extend">
            +30s
          </button>
        </div>

        <button onClick={handleSkip} className="btn-skip">
          Skip Rest
        </button>
      </div>
    </div>
  );
}
