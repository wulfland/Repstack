import { useEffect, useState } from 'react';
import Layout from './layouts/Layout';
import ExerciseList from './components/exercises/ExerciseList';
import WorkoutSession from './components/workouts/WorkoutSession';
import MesocycleDashboard from './components/mesocycles/MesocycleDashboard';
import ProgressTracker from './components/progress/ProgressTracker';
import Settings from './components/settings/Settings';
import Onboarding, {
  type OnboardingData,
} from './components/onboarding/Onboarding';
import {
  useExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  useUserProfiles,
  createUserProfile,
  updateUserProfile,
  createMesocycle,
} from './hooks/useDatabase';
import { seedStarterExercises } from './lib/seedData';
import { seedSampleMesocycle } from './lib/seedMesocycle';
import { generateSplitDays } from './lib/generateSplitDays';
import { db } from './db';
import type { BeforeInstallPromptEvent } from './types/global';
import type { Exercise } from './types/models';
import './App.css';

type Page = 'mesocycles' | 'workout' | 'exercises' | 'progress' | 'settings';

function App() {
  const exercises = useExercises();
  const userProfiles = useUserProfiles();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('mesocycles');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if we should show onboarding
  useEffect(() => {
    if (userProfiles !== undefined) {
      if (userProfiles.length === 0) {
        // No profile exists, show onboarding
        setShowOnboarding(true);
      } else {
        const profile = userProfiles[0];
        // Show onboarding if user hasn't completed it
        setShowOnboarding(!profile.onboardingCompleted);
      }
    }
  }, [userProfiles]);

  // Apply theme based on user profile
  useEffect(() => {
    const profile =
      userProfiles && userProfiles.length > 0 ? userProfiles[0] : null;

    if (!profile) return;

    const theme = profile.preferences.theme;

    const applyTheme = () => {
      if (theme === 'system') {
        // Use current system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const prefersDark = mediaQuery.matches;
        document.documentElement.setAttribute(
          'data-theme',
          prefersDark ? 'dark' : 'light'
        );
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    };

    // Apply theme immediately based on current preference
    applyTheme();

    // When using system theme, listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (event: MediaQueryListEvent) => {
        document.documentElement.setAttribute(
          'data-theme',
          event.matches ? 'dark' : 'light'
        );
      };

      // Modern browsers
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange);
      } else if (typeof mediaQuery.addListener === 'function') {
        // Backward compatibility
        mediaQuery.addListener(handleChange);
      }

      return () => {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleChange);
        } else if (typeof mediaQuery.removeListener === 'function') {
          mediaQuery.removeListener(handleChange);
        }
      };
    }

    // If not using system theme, no listeners to clean up
    return;
  }, [userProfiles]);

  useEffect(() => {
    // Seed starter exercises on first load
    const initializeData = async () => {
      try {
        const exercisesSeeded = await seedStarterExercises();
        // If exercises were seeded, also seed a sample mesocycle
        if (exercisesSeeded) {
          await seedSampleMesocycle();
        }
      } catch (error) {
        console.error('Error seeding data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleCreateExercise = async (
    exerciseData: Omit<Exercise, 'id' | 'createdAt'>
  ) => {
    await createExercise(exerciseData);
  };

  const handleUpdateExercise = async (
    id: string,
    exerciseData: Partial<Exercise>
  ) => {
    await updateExercise(id, exerciseData);
  };

  const handleDeleteExercise = async (id: string) => {
    await deleteExercise(id);
  };

  const checkExerciseHasHistory = async (id: string): Promise<boolean> => {
    const workoutsWithExercise = await db.workouts
      .filter((workout) => workout.exercises.some((ex) => ex.exerciseId === id))
      .count();

    const referencingTrainingSessionsCount = await db.trainingSessions
      .where('exerciseId')
      .equals(id)
      .count();

    return workoutsWithExercise > 0 || referencingTrainingSessionsCount > 0;
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      const profile =
        userProfiles && userProfiles.length > 0 ? userProfiles[0] : null;

      if (profile) {
        // Update existing profile
        await updateUserProfile(profile.id, {
          name: data.name || 'User',
          experienceLevel: data.experienceLevel,
          preferences: {
            ...profile.preferences,
            units: data.units,
          },
          defaultTrainingSplit: data.trainingSplit,
          onboardingCompleted: true,
        });
      } else {
        // Create new profile
        await createUserProfile({
          name: data.name || 'User',
          experienceLevel: data.experienceLevel,
          preferences: {
            units: data.units,
            theme: 'system',
            firstDayOfWeek: 1,
            defaultRestTimerSeconds: 90,
            restTimerSound: true,
            restTimerVibration: true,
            showRIRByDefault: true,
            autoAdvanceSet: false,
          },
          defaultTrainingSplit: data.trainingSplit,
          onboardingCompleted: true,
        });
      }

      // Create mesocycle if requested
      if (data.createMesocycle && data.trainingSplit && data.mesocycleWeeks) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + data.mesocycleWeeks * 7);

        const splitDays = generateSplitDays(data.trainingSplit);

        await createMesocycle({
          name: data.mesocycleName || 'My First Mesocycle',
          startDate,
          endDate,
          durationWeeks: data.mesocycleWeeks,
          currentWeek: 1,
          deloadWeek: data.mesocycleWeeks, // Last week is deload
          trainingSplit: data.trainingSplit,
          splitDays,
          status: 'active',
          notes: 'Created during onboarding',
        });
      }

      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const handleOnboardingSkip = async () => {
    try {
      const profile =
        userProfiles && userProfiles.length > 0 ? userProfiles[0] : null;

      if (profile) {
        // Just mark onboarding as completed
        await updateUserProfile(profile.id, {
          onboardingCompleted: true,
        });
      } else {
        // Create default profile
        await createUserProfile({
          name: 'User',
          experienceLevel: 'beginner',
          preferences: {
            units: 'metric',
            theme: 'system',
            firstDayOfWeek: 1,
            defaultRestTimerSeconds: 90,
            restTimerSound: true,
            restTimerVibration: true,
            showRIRByDefault: true,
            autoAdvanceSet: false,
          },
          onboardingCompleted: true,
        });
      }

      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="app-container">
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show onboarding if user hasn't completed it
  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <div className="app-container">
        <div className="status-bar">
          <span className={`status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
          {installPrompt && (
            <button onClick={handleInstallClick} className="install-btn">
              📱 Install App
            </button>
          )}
        </div>

        {currentPage === 'mesocycles' && <MesocycleDashboard />}

        {currentPage === 'workout' && <WorkoutSession />}

        {currentPage === 'exercises' && (
          <ExerciseList
            exercises={exercises || []}
            onCreateExercise={handleCreateExercise}
            onUpdateExercise={handleUpdateExercise}
            onDeleteExercise={handleDeleteExercise}
            checkExerciseHasHistory={checkExerciseHasHistory}
          />
        )}

        {currentPage === 'progress' && <ProgressTracker />}

        {currentPage === 'settings' && (
          <Settings
            installPrompt={installPrompt}
            onInstallClick={handleInstallClick}
          />
        )}
      </div>
    </Layout>
  );
}

export default App;
