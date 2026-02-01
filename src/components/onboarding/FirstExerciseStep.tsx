/**
 * First exercise prompt step - Encourages users to add their first exercise
 */

interface FirstExerciseStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function FirstExerciseStep({
  onNext,
  onBack,
  onSkip,
}: FirstExerciseStepProps) {
  return (
    <div className="onboarding-step first-exercise-step">
      <div className="step-content">
        <div className="illustration">
          <span className="icon-large">💪</span>
        </div>

        <h2>Add Your First Exercise</h2>
        <p className="step-description">
          Get started by adding an exercise you'll be doing in your workouts.
          You can create exercises with custom names and categories (machine,
          barbell, dumbbell, etc.).
        </p>

        <div className="example-box">
          <h3>Example Exercises</h3>
          <ul className="example-list">
            <li>Barbell Bench Press</li>
            <li>Lat Pulldown</li>
            <li>Leg Press</li>
            <li>Dumbbell Shoulder Press</li>
          </ul>
        </div>

        <p className="helper-text">
          Don't worry - starter exercises have already been added to get you
          going, but you can create custom ones anytime!
        </p>

        <div className="step-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <div className="action-group">
            <button type="button" className="btn btn-text" onClick={onSkip}>
              Skip for now
            </button>
            <button type="button" className="btn btn-primary" onClick={onNext}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
