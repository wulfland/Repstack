import { useEffect, useState } from 'react';
import Layout from './layouts/Layout';
import ExerciseList from './components/exercises/ExerciseList';
import WorkoutSession from './components/workouts/WorkoutSession';
import MesocycleDashboard from './components/mesocycles/MesocycleDashboard';
import ProgressTracker from './components/progress/ProgressTracker';
import {
  useExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from './hooks/useDatabase';
import { seedStarterExercises } from './lib/seedData';
import { seedSampleMesocycle } from './lib/seedMesocycle';
import { db } from './db';
import type { BeforeInstallPromptEvent } from './types/global';
import type { Exercise } from './types/models';
import './App.css';

type Page = 'workout' | 'exercises' | 'mesocycles' | 'progress';

function App() {
  const exercises = useExercises();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('workout');

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

        {currentPage === 'workout' && <WorkoutSession />}

        {currentPage === 'mesocycles' && <MesocycleDashboard />}

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
      </div>
    </Layout>
  );
}

export default App;
