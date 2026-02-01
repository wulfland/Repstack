/**
 * Welcome step - First screen of onboarding
 */

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export default function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <div className="onboarding-step welcome-step">
      <div className="step-content">
        <div className="logo-container">
          <h1 className="logo-text">Repstack</h1>
          <p className="tagline">Evidence-Based Hypertrophy Training</p>
        </div>

        <div className="value-proposition">
          <h2>Build Muscle with Science</h2>
          <p>
            Repstack helps you apply proven hypertrophy training principles to maximize
            muscle growth through progressive overload, auto-regulation, and structured
            mesocycles.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Track workouts & progress</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Auto-regulate training volume</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Structured mesocycle programs</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Privacy-first & offline-ready</span>
            </div>
          </div>
        </div>

        <div className="step-actions">
          <button className="btn btn-primary btn-large" onClick={onNext}>
            Get Started
          </button>
          <button className="btn btn-text" onClick={onSkip}>
            Skip Setup
          </button>
        </div>
      </div>
    </div>
  );
}
