# Database Architecture Documentation

## Overview

Repstack uses IndexedDB as its primary data storage mechanism, implemented via Dexie.js. This provides a robust, type-safe, and offline-first storage solution for all user data.

## Database Schema

The database is named `RepstackDB` and uses a versioned schema approach to support future migrations.

### Current Version: 2

#### Tables

1. **userProfiles** - User account and preference data
2. **exercises** - Exercise library (custom and built-in)
3. **workouts** - Complete workout sessions
4. **workoutSets** - Individual sets within workouts
5. **trainingSessions** - Auto-regulation feedback data
6. **mesocycles** - Training program blocks

## Data Models

### UserProfile

Stores user account information and preferences.

```typescript
interface UserProfile {
  id: string;                    // UUID
  name: string;                  // User's display name
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    units: 'metric' | 'imperial';  // Weight units
    theme: 'light' | 'dark' | 'system';  // UI theme
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- Primary: `id`
- Secondary: `createdAt`, `updatedAt`

### Exercise

Defines exercises in the user's library.

```typescript
interface Exercise {
  id: string;                    // UUID
  name: string;                  // Exercise name (e.g., "Bench Press")
  category: 'machine' | 'barbell' | 'dumbbell' | 'bodyweight' | 'cable' | 'other';
  muscleGroups: MuscleGroup[];   // Target muscles
  equipment?: string;            // Required equipment
  notes?: string;                // User notes
  isCustom: boolean;             // User-created vs built-in
  createdAt: Date;
}
```

**Indexes:**
- Primary: `id`
- Secondary: `name`, `category`, `isCustom`, `createdAt`

**MuscleGroup Type:**
```typescript
type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders'
  | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves';
```

### Workout

Represents a complete training session.

```typescript
interface Workout {
  id: string;                    // UUID
  date: Date;                    // When workout occurred
  exercises: WorkoutExercise[];  // Exercises performed
  notes?: string;                // Session notes
  completed: boolean;            // Completion status
  duration?: number;             // Duration in minutes
  createdAt: Date;
  updatedAt: Date;
}

interface WorkoutExercise {
  exerciseId: string;            // Reference to Exercise
  sets: WorkoutSet[];            // Sets performed
  notes?: string;                // Exercise-specific notes
}
```

**Indexes:**
- Primary: `id`
- Secondary: `date`, `completed`, `createdAt`, `updatedAt`

### WorkoutSet

Individual set data within a workout.

```typescript
interface WorkoutSet {
  id: string;                    // UUID
  exerciseId: string;            // Reference to Exercise
  setNumber: number;             // Set sequence number
  targetReps: number;            // Planned reps
  actualReps?: number;           // Completed reps
  weight: number;                // Weight used
  rir?: number;                  // Reps In Reserve (0-10)
  completed: boolean;            // Whether set was finished
}
```

**Indexes:**
- Primary: `id`
- Secondary: `exerciseId`, `completed`

**RIR (Reps In Reserve):**
- 0 = Complete failure
- 1-2 = Very close to failure (hypertrophy sweet spot)
- 3-4 = Moderate effort
- 5+ = Conservative approach

### TrainingSession

Auto-regulation feedback for progressive overload tracking.

```typescript
interface TrainingSession {
  id: string;                    // UUID
  workoutId: string;             // Reference to Workout
  exerciseId: string;            // Reference to Exercise
  date: Date;                    // Session date
  pump: number;                  // Pump quality (1-5)
  soreness: number;              // Muscle soreness (1-5)
  fatigue: number;               // Overall fatigue (1-5)
  performance: 'excellent' | 'good' | 'average' | 'poor';
  notes?: string;                // Feedback notes
  createdAt: Date;
}
```

**Indexes:**
- Primary: `id`
- Secondary: `workoutId`, `exerciseId`, `date`, `createdAt`

**Rating Scales:**
- **Pump (1-5):** Quality of muscle pump during exercise
- **Soreness (1-5):** Muscle soreness 24-48 hours post-workout
- **Fatigue (1-5):** Overall recovery state

### Mesocycle

Training program blocks (typically 4-6 weeks).

```typescript
interface Mesocycle {
  id: string;                    // UUID
  name: string;                  // Program name
  startDate: Date;               // Program start
  endDate: Date;                 // Program end
  weekNumber: number;            // Current week (1-12)
  trainingSplit: 'upper_lower' | 'push_pull_legs' | 'full_body' | 'bro_split' | 'custom';
  isDeloadWeek: boolean;         // Reduced volume week
  status: 'planned' | 'active' | 'completed';
  notes?: string;                // Program notes
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- Primary: `id`
- Secondary: `startDate`, `endDate`, `weekNumber`, `status`, `createdAt`, `updatedAt`

**Training Splits:**
- **upper_lower:** 4-day split (2 upper, 2 lower)
- **push_pull_legs:** 6-day split
- **full_body:** 3-day split
- **bro_split:** 5-day split (one muscle per day)
- **custom:** User-defined split

## CRUD Operations

All database operations are available through the service layer (`src/db/service.ts`) with full validation.

### Example Usage

```typescript
import { 
  createExercise, 
  getAllExercises,
  updateExercise 
} from './db/service';

// Create
const id = await createExercise({
  name: 'Barbell Squat',
  category: 'barbell',
  muscleGroups: ['quads', 'glutes', 'hamstrings'],
  isCustom: true,
});

// Read
const exercises = await getAllExercises();

// Update
await updateExercise(id, {
  notes: 'Focus on depth and form',
});

// Delete
await deleteExercise(id);
```

### React Hooks

For reactive queries in React components:

```typescript
import { useExercises, useActiveMesocycle } from './hooks/useDatabase';

function MyComponent() {
  const exercises = useExercises();
  const mesocycle = useActiveMesocycle();
  
  // Data updates automatically when database changes
  return <div>{exercises?.length} exercises</div>;
}
```

## Data Validation

All data is validated before storage using validators in `src/lib/validation.ts`.

### Validation Rules

- **Names:** Required, 1-100 characters, sanitized
- **Exercise names:** Required, 1-200 characters
- **Reps:** 1-100 range
- **Weight:** Non-negative
- **RIR:** 0-10 range
- **Ratings (pump, soreness, fatigue):** 1-5 scale
- **Dates:** Cannot be in future (workouts)
- **Duration:** 0-720 minutes (12 hours max)

### Sanitization

All string inputs are sanitized to prevent XSS:
- Trimmed whitespace
- HTML tags removed (`< >` characters)

## Migrations

The database supports schema versioning for safe migrations.

### Version 1 → Version 2

- Renamed `users` table to `userProfiles`
- Added `workoutSets` table (separated from workouts)
- Added `trainingSessions` table (new feature)
- Enhanced indexes for better query performance
- Updated data types (number IDs → UUIDs)

Migration code automatically converts old data to new format.

## Performance Considerations

### Indexes

Strategic indexes are used for common queries:
- Date-based queries (workouts by date range)
- Status-based queries (active mesocycle)
- Category-based queries (exercises by type)

### Efficient Queries

```typescript
// Good: Uses index
const recentWorkouts = await db.workouts
  .where('date')
  .between(startDate, endDate)
  .toArray();

// Avoid: Table scan
const customExercises = await db.exercises
  .filter(e => e.isCustom)  // No index on boolean
  .toArray();
```

### Data Size Management

- Typical workout: ~2-5 KB
- 1000 workouts: ~2-5 MB
- IndexedDB quota: 50+ MB (varies by browser)

## Data Export/Import

Users can export and import their data for backup and portability.

```typescript
import { exportData, importData } from './db/service';

// Export to JSON
const json = await exportData();
// Save to file or cloud

// Import from JSON
await importData(json);
```

Export format includes:
- All database tables
- Timestamp
- Schema version

## Privacy & Security

- **Local-first:** All data stored on user's device
- **No tracking:** No analytics or telemetry
- **Encrypted storage:** Browser handles encryption at rest
- **Data portability:** Full export/import capability
- **Clear data:** Users can delete all data anytime

## Future Enhancements

### Phase 2
- Volume landmarks tracking (MEV, MAV, MRV)
- Exercise history analytics
- Progress photos (stored separately)

### Phase 3 (SaaS)
- Cloud sync capability
- Multi-device synchronization
- Backup and restore

## Troubleshooting

### Database won't open
```typescript
// Clear and reinitialize
await db.delete();
location.reload();
```

### Migration errors
Check browser console for specific error messages. May need to export data, clear database, and re-import.

### Storage quota exceeded
Export old data, clear database, and consider archiving old workouts.

## References

- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Renaissance Periodization Training Principles](https://renaissanceperiodization.com/)
