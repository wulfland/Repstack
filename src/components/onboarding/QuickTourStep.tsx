/**
 * Quick tour step - Brief overview of main features
 */

import { useState } from 'react';

interface QuickTourStepProps {
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface TourSlide {
  icon: string;
  title: string;
  description: string;
}

const tourSlides: TourSlide[] = [
  {
    icon: '🏋️',
    title: 'Log Workouts',
    description:
      'Track your sets, reps, and weight for each exercise. The app remembers your previous performance to help with progressive overload.',
  },
  {
    icon: '📚',
    title: 'Exercise Library',
    description:
      'Browse starter exercises or create your own custom exercises with categories like machine, barbell, and dumbbell.',
  },
  {
    icon: '📊',
    title: 'Mesocycle Programs',
    description:
      'Structure your training into 4-6 week blocks with planned progression and deload weeks for optimal muscle growth.',
  },
  {
    icon: '📈',
    title: 'Track Progress',
    description:
      'View your training history, analyze trends, and see how your strength and volume progress over time.',
  },
  {
    icon: '⚙️',
    title: 'Customize Settings',
    description:
      'Adjust units, rest timer preferences, and other settings to personalize your training experience.',
  },
];

export default function QuickTourStep({
  onComplete,
  onBack,
  onSkip,
}: QuickTourStepProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < tourSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = tourSlides[currentSlide];

  return (
    <div className="onboarding-step quick-tour-step">
      <div className="step-content">
        <h2>Quick Tour</h2>
        <p className="step-description">
          Here's a brief overview of what you can do with Repstack.
        </p>

        <div className="tour-slide">
          <div className="slide-icon">{slide.icon}</div>
          <h3>{slide.title}</h3>
          <p>{slide.description}</p>
        </div>

        <div className="tour-dots">
          {tourSlides.map((_, index) => (
            <button
              key={index}
              className={`tour-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : undefined}
            >
              <span className="dot-inner" />
            </button>
          ))}
        </div>

        <div className="slide-counter">
          {currentSlide + 1} of {tourSlides.length}
        </div>

        <div className="step-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={currentSlide === 0 ? onBack : handlePrevious}
          >
            {currentSlide === 0 ? 'Back' : 'Previous'}
          </button>
          <div className="action-group">
            <button type="button" className="btn btn-text" onClick={onSkip}>
              Skip Tour
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              {currentSlide < tourSlides.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
