import { useEffect, useState } from 'react';
import Layout from './layouts/Layout';
import { useExercises, addExercise } from './hooks/useDatabase';
import type { BeforeInstallPromptEvent } from './types/global';
import './App.css';

function App() {
  const exercises = useExercises();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
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

  const handleAddSampleExercise = async () => {
    await addExercise({
      name: 'Bench Press',
      category: 'barbell',
      muscleGroups: ['chest', 'triceps', 'shoulders'],
      notes: 'Compound exercise for upper body strength',
      isCustom: true,
    });
  };

  return (
    <Layout>
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

        <section className="hero">
          <h1 className="hero-title">Welcome to Repstack</h1>
          <p className="hero-subtitle">
            Open Source Hypertrophy Training Application
          </p>
          <p className="hero-description">
            Build muscle with science-based training programs. Privacy-first,
            offline-capable, and completely free.
          </p>
        </section>

        <section className="features">
          <h2>PWA Features Active</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>✅ Offline Support</h3>
              <p>Works without internet connection using Service Workers</p>
            </div>
            <div className="feature-card">
              <h3>✅ Local Storage</h3>
              <p>Your data stays with you using IndexedDB</p>
            </div>
            <div className="feature-card">
              <h3>✅ Installable</h3>
              <p>Install on any device as a native app</p>
            </div>
            <div className="feature-card">
              <h3>✅ Responsive</h3>
              <p>Mobile-first design that works everywhere</p>
            </div>
          </div>
        </section>

        <section className="demo">
          <h2>IndexedDB Demo</h2>
          <button onClick={handleAddSampleExercise} className="demo-btn">
            Add Sample Exercise
          </button>
          <div className="exercise-list">
            <h3>Exercises ({exercises?.length || 0}):</h3>
            {exercises?.map((exercise) => (
              <div key={exercise.id} className="exercise-item">
                <strong>{exercise.name}</strong> - {exercise.category}
                <br />
                <small>Muscle groups: {exercise.muscleGroups.join(', ')}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default App;
