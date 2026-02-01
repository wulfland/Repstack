/**
 * Main Onboarding component
 * Guides new users through initial setup
 */

import { useState } from 'react';
import WelcomeStep from './WelcomeStep';
import ProfileSetupStep from './ProfileSetupStep';
import TrainingSplitStep from './TrainingSplitStep';
import FirstExerciseStep from './FirstExerciseStep';
import QuickTourStep from './QuickTourStep';
import ProgressIndicator from './ProgressIndicator';
import './Onboarding.css';

export interface OnboardingData {
  name: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  units: 'metric' | 'imperial';
  trainingSplit?:
    | 'upper_lower'
    | 'push_pull_legs'
    | 'full_body'
    | 'bro_split'
    | 'custom';
  skipFirstExercise?: boolean;
  skipTour?: boolean;
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export default function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    experienceLevel: 'beginner',
    units: 'metric',
  });

  const steps = [
    { id: 'welcome', title: 'Welcome', optional: false },
    { id: 'profile', title: 'Profile', optional: false },
    { id: 'split', title: 'Training Split', optional: true },
    { id: 'exercise', title: 'First Exercise', optional: true },
    { id: 'tour', title: 'Quick Tour', optional: true },
  ];

  const handleNext = (stepData?: Partial<OnboardingData>) => {
    if (stepData) {
      setOnboardingData({ ...onboardingData, ...stepData });
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed all steps
      onComplete({ ...onboardingData, ...stepData });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step, complete onboarding
      onComplete(onboardingData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} onSkip={onSkip} />;
      case 1:
        return (
          <ProfileSetupStep
            initialData={onboardingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <TrainingSplitStep
            initialSplit={onboardingData.trainingSplit}
            experienceLevel={onboardingData.experienceLevel}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkipStep}
          />
        );
      case 3:
        return (
          <FirstExerciseStep
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkipStep}
          />
        );
      case 4:
        return (
          <QuickTourStep
            onComplete={() => onComplete(onboardingData)}
            onBack={handleBack}
            onSkip={() => onComplete(onboardingData)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <ProgressIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={(index) => {
          // Allow going back to completed steps
          if (index < currentStep) {
            setCurrentStep(index);
          }
        }}
      />
      <div className="onboarding-content">{renderStep()}</div>
    </div>
  );
}
