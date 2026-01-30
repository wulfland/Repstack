/**
 * Settings page component
 * Allows users to customize their Repstack experience
 */

import { useState, useEffect } from 'react';
import {
  useUserProfiles,
  createUserProfile,
  updateUserProfile,
  exportData,
  importData,
  clearAllData,
} from '../../hooks/useDatabase';
import ConfirmDialog from '../common/ConfirmDialog';
import type { UserProfile } from '../../types/models';
import type { BeforeInstallPromptEvent } from '../../types/global';
import './Settings.css';

interface SettingsProps {
  installPrompt: BeforeInstallPromptEvent | null;
  onInstallClick: () => void;
}

export default function Settings({
  installPrompt,
  onInstallClick,
}: SettingsProps) {
  const userProfiles = useUserProfiles();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importFileContent, setImportFileContent] = useState<string>('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Get the first user profile or null
  const profile =
    userProfiles && userProfiles.length > 0 ? userProfiles[0] : null;

  // Create default profile if none exists
  useEffect(() => {
    if (userProfiles && userProfiles.length === 0) {
      const createDefaultProfile = async () => {
        const id = await createUserProfile({
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
        });
        // Refetch will happen automatically via useLiveQuery
        console.log('Created default profile:', id);
      };
      createDefaultProfile();
    }
  }, [userProfiles]);

  // Apply theme
  useEffect(() => {
    if (!profile) return;

    const theme = profile.preferences.theme;
    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      document.documentElement.setAttribute(
        'data-theme',
        prefersDark ? 'dark' : 'light'
      );
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [profile]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateProfile = async (
    updates: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    if (!profile) return;

    try {
      await updateUserProfile(profile.id, updates);
      showMessage('success', 'Settings saved');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showMessage('error', 'Failed to save settings');
    }
  };

  const handleExportData = async () => {
    try {
      const jsonData = await exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repstack-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage('success', 'Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      showMessage('error', 'Failed to export data');
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportFileContent(content);
      setShowImportConfirm(true);
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleConfirmImport = async () => {
    try {
      await importData(importFileContent);
      setShowImportConfirm(false);
      setImportFileContent('');
      showMessage('success', 'Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      showMessage(
        'error',
        error instanceof Error ? error.message : 'Failed to import data'
      );
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData();
      setShowClearConfirm(false);
      showMessage('success', 'All data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
      showMessage('error', 'Failed to clear data');
    }
  };

  if (!profile) {
    return (
      <div className="settings-container">
        <div className="loading-state">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      {message && (
        <div className={`settings-message ${message.type}`}>{message.text}</div>
      )}

      {/* Profile Section */}
      <section className="settings-section">
        <h2>Profile</h2>

        <div className="settings-field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={profile.name}
            onChange={(e) => handleUpdateProfile({ name: e.target.value })}
            placeholder="Your name"
          />
        </div>

        <div className="settings-field">
          <label htmlFor="experience">Experience Level</label>
          <select
            id="experience"
            value={profile.experienceLevel}
            onChange={(e) =>
              handleUpdateProfile({
                experienceLevel: e.target
                  .value as UserProfile['experienceLevel'],
              })
            }
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="settings-field">
          <label htmlFor="defaultSplit">Default Training Split</label>
          <select
            id="defaultSplit"
            value={profile.defaultTrainingSplit || ''}
            onChange={(e) =>
              handleUpdateProfile({
                defaultTrainingSplit: e.target
                  .value as UserProfile['defaultTrainingSplit'],
              })
            }
          >
            <option value="">None</option>
            <option value="upper_lower">Upper/Lower</option>
            <option value="push_pull_legs">Push/Pull/Legs</option>
            <option value="full_body">Full Body</option>
            <option value="bro_split">Bro Split</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="settings-section">
        <h2>Preferences</h2>

        <div className="settings-field">
          <label htmlFor="units">Units</label>
          <select
            id="units"
            value={profile.preferences.units}
            onChange={(e) =>
              handleUpdateProfile({
                preferences: {
                  ...profile.preferences,
                  units: e.target.value as 'metric' | 'imperial',
                },
              })
            }
          >
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lb, in)</option>
          </select>
        </div>

        <div className="settings-field">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={profile.preferences.theme}
            onChange={(e) =>
              handleUpdateProfile({
                preferences: {
                  ...profile.preferences,
                  theme: e.target.value as 'light' | 'dark' | 'system',
                },
              })
            }
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="settings-field">
          <label htmlFor="firstDayOfWeek">First Day of Week</label>
          <select
            id="firstDayOfWeek"
            value={profile.preferences.firstDayOfWeek}
            onChange={(e) =>
              handleUpdateProfile({
                preferences: {
                  ...profile.preferences,
                  firstDayOfWeek: parseInt(e.target.value) as 0 | 1 | 6,
                },
              })
            }
          >
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="6">Saturday</option>
          </select>
        </div>
      </section>

      {/* Workout Settings Section */}
      <section className="settings-section">
        <h2>Workout Settings</h2>

        <div className="settings-field">
          <label htmlFor="restTimer">Default Rest Timer</label>
          <div className="rest-timer-control">
            <input
              id="restTimer"
              type="range"
              min="30"
              max="300"
              step="15"
              value={profile.preferences.defaultRestTimerSeconds}
              onChange={(e) =>
                handleUpdateProfile({
                  preferences: {
                    ...profile.preferences,
                    defaultRestTimerSeconds: parseInt(e.target.value),
                  },
                })
              }
            />
            <span className="rest-timer-value">
              {Math.floor(profile.preferences.defaultRestTimerSeconds / 60)}:
              {(profile.preferences.defaultRestTimerSeconds % 60)
                .toString()
                .padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="settings-field settings-toggle">
          <label htmlFor="restTimerSound">Rest Timer Sound</label>
          <input
            id="restTimerSound"
            type="checkbox"
            checked={profile.preferences.restTimerSound}
            onChange={(e) =>
              handleUpdateProfile({
                preferences: {
                  ...profile.preferences,
                  restTimerSound: e.target.checked,
                },
              })
            }
          />
        </div>

        <div className="settings-field settings-toggle">
          <label htmlFor="restTimerVibration">Rest Timer Vibration</label>
          <input
            id="restTimerVibration"
            type="checkbox"
            checked={profile.preferences.restTimerVibration}
            onChange={(e) =>
              handleUpdateProfile({
                preferences: {
                  ...profile.preferences,
                  restTimerVibration: e.target.checked,
                },
              })
            }
          />
        </div>

        <div className="settings-field settings-toggle">
          <label htmlFor="showRIR">Show RIR Field by Default</label>
          <input
            id="showRIR"
            type="checkbox"
            checked={profile.preferences.showRIRByDefault}
            onChange={(e) =>
              handleUpdateProfile({
                preferences: {
                  ...profile.preferences,
                  showRIRByDefault: e.target.checked,
                },
              })
            }
          />
        </div>

        <div className="settings-field settings-toggle">
          <label htmlFor="autoAdvance">Auto-Advance to Next Set</label>
          <input
            id="autoAdvance"
            type="checkbox"
            checked={profile.preferences.autoAdvanceSet}
            onChange={(e) =>
              handleUpdateProfile({
                preferences: {
                  ...profile.preferences,
                  autoAdvanceSet: e.target.checked,
                },
              })
            }
          />
        </div>
      </section>

      {/* Data Management Section */}
      <section className="settings-section">
        <h2>Data Management</h2>

        <div className="settings-field">
          <button onClick={handleExportData} className="btn-secondary">
            📥 Export All Data
          </button>
          <p className="field-description">
            Download all your data as a JSON file for backup
          </p>
        </div>

        <div className="settings-field">
          <label htmlFor="import-file" className="btn-secondary">
            📤 Import Data
          </label>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
          <p className="field-description">
            Restore data from a backup file (replaces all current data)
          </p>
        </div>

        <div className="settings-field">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn-danger"
          >
            🗑️ Clear All Data
          </button>
          <p className="field-description">
            Permanently delete all your data (cannot be undone)
          </p>
        </div>
      </section>

      {/* PWA Install Section */}
      {installPrompt && (
        <section className="settings-section">
          <h2>Install App</h2>
          <div className="settings-field">
            <button onClick={onInstallClick} className="btn-primary">
              📱 Install Repstack
            </button>
            <p className="field-description">
              Install Repstack as an app on your device for offline access
            </p>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="settings-section">
        <h2>About</h2>

        <div className="about-info">
          <div className="about-item">
            <strong>Version:</strong> 0.0.0
          </div>
          <div className="about-item">
            <strong>License:</strong> MIT License
          </div>
          <div className="about-item">
            <strong>GitHub:</strong>{' '}
            <a
              href="https://github.com/wulfland/Repstack"
              target="_blank"
              rel="noopener noreferrer"
            >
              wulfland/Repstack
            </a>
          </div>
        </div>

        <div className="about-acknowledgments">
          <h3>Acknowledgments</h3>
          <p>
            Repstack is inspired by evidence-based training principles from
            Renaissance Periodization and built by the open source fitness
            community.
          </p>
          <p>
            <strong>Disclaimer:</strong> This is an independent open source
            project and is not affiliated with or endorsed by Renaissance
            Periodization.
          </p>
        </div>
      </section>

      {/* Confirmation Dialogs */}
      {showClearConfirm && (
        <ConfirmDialog
          title="Clear All Data?"
          message="This will permanently delete all your workouts, exercises, mesocycles, and settings. This action cannot be undone. Are you sure?"
          confirmLabel="Clear All Data"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleClearAllData}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {showImportConfirm && (
        <ConfirmDialog
          title="Import Data?"
          message="This will replace all your current data with the imported data. Your existing workouts, exercises, and settings will be lost. Are you sure?"
          confirmLabel="Import Data"
          cancelLabel="Cancel"
          variant="warning"
          onConfirm={handleConfirmImport}
          onCancel={() => {
            setShowImportConfirm(false);
            setImportFileContent('');
          }}
        />
      )}
    </div>
  );
}
