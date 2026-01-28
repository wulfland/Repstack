/**
 * Main dashboard for mesocycle management
 */

import { useState } from 'react';
import {
  useMesocycles,
  useActiveMesocycle,
  createMesocycle,
  updateMesocycle,
} from '../../hooks/useDatabase';
import type { Mesocycle } from '../../types/models';
import MesocycleCard from './MesocycleCard';
import MesocycleForm from './MesocycleForm';
import SplitProgressTracker from './SplitProgressTracker';
import './MesocycleDashboard.css';

export default function MesocycleDashboard() {
  const allMesocycles = useMesocycles();
  const activeMesocycle = useActiveMesocycle();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>(
    'active'
  );

  const filteredMesocycles = allMesocycles?.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'active') return m.status === 'active';
    if (filter === 'completed')
      return m.status === 'completed' || m.status === 'abandoned';
    return true;
  });

  const handleCreateMesocycle = async (
    mesocycle: Omit<Mesocycle, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      await createMesocycle(mesocycle);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create mesocycle:', error);
      throw error;
    }
  };

  const handleCompleteMesocycle = async (id: string) => {
    try {
      await updateMesocycle(id, {
        status: 'completed',
      });
    } catch (error) {
      console.error('Failed to complete mesocycle:', error);
    }
  };

  const handleAbandonMesocycle = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to abandon this mesocycle? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await updateMesocycle(id, {
        status: 'abandoned',
      });
    } catch (error) {
      console.error('Failed to abandon mesocycle:', error);
    }
  };

  const handleCreateClick = () => {
    if (activeMesocycle) {
      if (
        !confirm(
          'You already have an active mesocycle. Creating a new one will mark the current mesocycle as completed. Continue?'
        )
      ) {
        return;
      }
      // Complete the current active mesocycle
      handleCompleteMesocycle(activeMesocycle.id);
    }
    setShowForm(true);
  };

  const handleStartWorkout = (splitDayId: string) => {
    // Store the selected split day ID in localStorage for the workout session to pick up
    localStorage.setItem('selectedSplitDayId', splitDayId);
    // In a real app with routing, we would navigate to /workout
    // For now, we'll just alert (the parent App component would handle navigation)
    alert(
      'Navigate to workout session with split day: ' + splitDayId + '\n\n' +
      'Note: Full integration requires navigation support in the parent component.'
    );
  };

  return (
    <div className="mesocycle-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Mesocycles</h1>
          <p className="dashboard-subtitle">
            Manage your training blocks and periodization
          </p>
        </div>
        <button onClick={handleCreateClick} className="btn btn-primary">
          + Create Mesocycle
        </button>
      </div>

      {/* Active Mesocycle Split Progress */}
      {activeMesocycle && filter === 'active' && (
        <SplitProgressTracker
          mesocycle={activeMesocycle}
          onStartWorkout={handleStartWorkout}
        />
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          History
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {/* Empty State */}
      {(!filteredMesocycles || filteredMesocycles.length === 0) && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3 className="empty-state-title">
            {filter === 'active'
              ? 'No Active Mesocycle'
              : filter === 'completed'
                ? 'No Completed Mesocycles'
                : 'No Mesocycles Yet'}
          </h3>
          <p className="empty-state-text">
            {filter === 'active'
              ? 'Create a mesocycle to start tracking your training blocks and progressive overload.'
              : filter === 'completed'
                ? 'Complete a mesocycle to see it here.'
                : 'Create your first mesocycle to start structured periodized training.'}
          </p>
          {filter === 'active' && (
            <button onClick={handleCreateClick} className="btn btn-primary">
              + Create Your First Mesocycle
            </button>
          )}
        </div>
      )}

      {/* Mesocycle List */}
      {filteredMesocycles && filteredMesocycles.length > 0 && (
        <div className="mesocycle-list">
          {filteredMesocycles.map((mesocycle) => (
            <MesocycleCard
              key={mesocycle.id}
              mesocycle={mesocycle}
              onComplete={handleCompleteMesocycle}
              onAbandon={handleAbandonMesocycle}
            />
          ))}
        </div>
      )}

      {/* Create Form Dialog */}
      <MesocycleForm
        isOpen={showForm}
        onSave={handleCreateMesocycle}
        onCancel={() => setShowForm(false)}
      />
    </div>
  );
}
