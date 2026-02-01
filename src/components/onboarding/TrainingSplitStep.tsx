/**
 * Training split selection step - Helps users choose their training program structure
 */

import { useState } from 'react';
import type { OnboardingData } from './Onboarding';

interface TrainingSplitStepProps {
  initialSplit?: OnboardingData['trainingSplit'];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  onSkip: () => void;
}

type TrainingSplit =
  | 'upper_lower'
  | 'push_pull_legs'
  | 'full_body'
  | 'bro_split'
  | 'custom';

interface SplitOption {
  id: TrainingSplit;
  name: string;
  description: string;
  daysPerWeek: string;
  recommendedFor: string[];
}

const splitOptions: SplitOption[] = [
  {
    id: 'full_body',
    name: 'Full Body',
    description:
      'Train all major muscle groups each session. Great for beginners or those with limited time.',
    daysPerWeek: '2-3 days',
    recommendedFor: ['beginner'],
  },
  {
    id: 'upper_lower',
    name: 'Upper/Lower',
    description:
      'Alternate between upper body and lower body days. Balanced and efficient split.',
    daysPerWeek: '4 days',
    recommendedFor: ['beginner', 'intermediate'],
  },
  {
    id: 'push_pull_legs',
    name: 'Push/Pull/Legs',
    description:
      'Divide training into pushing movements, pulling movements, and legs. Popular and effective.',
    daysPerWeek: '3-6 days',
    recommendedFor: ['intermediate', 'advanced'],
  },
  {
    id: 'bro_split',
    name: 'Body Part Split',
    description:
      'Focus on one or two muscle groups per day. Allows high volume per muscle.',
    daysPerWeek: '4-6 days',
    recommendedFor: ['intermediate', 'advanced'],
  },
];

export default function TrainingSplitStep({
  initialSplit,
  experienceLevel,
  onNext,
  onBack,
  onSkip,
}: TrainingSplitStepProps) {
  const [selectedSplit, setSelectedSplit] = useState<TrainingSplit | undefined>(
    initialSplit
  );

  const handleContinue = () => {
    onNext({ trainingSplit: selectedSplit });
  };

  const handleSkip = () => {
    onNext({ trainingSplit: undefined });
    onSkip();
  };

  return (
    <div className="onboarding-step training-split-step">
      <div className="step-content">
        <h2>Choose Your Training Split</h2>
        <p className="step-description">
          Select a training program structure that fits your schedule and goals. You can
          change this later.
        </p>

        <div className="split-options">
          {splitOptions.map((option) => {
            const isRecommended = option.recommendedFor.includes(experienceLevel);
            return (
              <label key={option.id} className="split-option">
                <input
                  type="radio"
                  name="trainingSplit"
                  value={option.id}
                  checked={selectedSplit === option.id}
                  onChange={() => setSelectedSplit(option.id)}
                />
                <div className="split-card">
                  {isRecommended && (
                    <span className="recommended-badge">Recommended</span>
                  )}
                  <h3>{option.name}</h3>
                  <p className="split-description">{option.description}</p>
                  <div className="split-meta">
                    <span className="days-per-week">{option.daysPerWeek}</span>
                  </div>
                </div>
              </label>
            );
          })}

          <label className="split-option">
            <input
              type="radio"
              name="trainingSplit"
              value="custom"
              checked={selectedSplit === 'custom'}
              onChange={() => setSelectedSplit('custom')}
            />
            <div className="split-card">
              <h3>Custom Split</h3>
              <p className="split-description">
                Create your own training schedule from scratch.
              </p>
            </div>
          </label>
        </div>

        <div className="step-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
          <div className="action-group">
            <button type="button" className="btn btn-text" onClick={handleSkip}>
              Skip for now
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleContinue}
              disabled={!selectedSplit}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
