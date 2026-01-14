/**
 * Database functionality test script
 * Run this in the browser console to verify the database works correctly
 */

import {
  createUserProfile,
  createExercise,
  createWorkout,
  createTrainingSession,
  createMesocycle,
  getAllUserProfiles,
  getAllExercises,
  getAllWorkouts,
  exportData,
} from '../db/service';

export async function runDatabaseTests() {
  console.log('🧪 Starting database tests...\n');

  try {
    // Test 1: Create User Profile
    console.log('Test 1: Creating user profile...');
    const userId = await createUserProfile({
      name: 'Test User',
      experienceLevel: 'intermediate',
      preferences: {
        units: 'metric',
        theme: 'dark',
      },
    });
    console.log('✅ User profile created with ID:', userId);

    // Test 2: Create Exercises
    console.log('\nTest 2: Creating exercises...');
    const exerciseId1 = await createExercise({
      name: 'Bench Press',
      category: 'barbell',
      muscleGroups: ['chest', 'triceps', 'shoulders'],
      equipment: 'Barbell, Bench',
      notes: 'Compound upper body exercise',
      isCustom: true,
    });
    console.log('✅ Exercise 1 created with ID:', exerciseId1);

    const exerciseId2 = await createExercise({
      name: 'Squat',
      category: 'barbell',
      muscleGroups: ['quads', 'glutes', 'hamstrings'],
      equipment: 'Barbell, Squat Rack',
      isCustom: true,
    });
    console.log('✅ Exercise 2 created with ID:', exerciseId2);

    // Test 3: Create Workout
    console.log('\nTest 3: Creating workout...');
    const workoutId = await createWorkout({
      date: new Date(),
      exercises: [
        {
          exerciseId: exerciseId1,
          sets: [
            {
              id: crypto.randomUUID(),
              exerciseId: exerciseId1,
              setNumber: 1,
              targetReps: 10,
              actualReps: 10,
              weight: 100,
              rir: 2,
              completed: true,
            },
            {
              id: crypto.randomUUID(),
              exerciseId: exerciseId1,
              setNumber: 2,
              targetReps: 10,
              actualReps: 9,
              weight: 100,
              rir: 1,
              completed: true,
            },
          ],
          notes: 'Good depth on all reps',
        },
      ],
      completed: true,
      duration: 60,
      notes: 'Great session!',
    });
    console.log('✅ Workout created with ID:', workoutId);

    // Test 4: Create Training Session
    console.log('\nTest 4: Creating training session feedback...');
    const sessionId = await createTrainingSession({
      workoutId: workoutId,
      exerciseId: exerciseId1,
      date: new Date(),
      pump: 4,
      soreness: 3,
      fatigue: 2,
      performance: 'good',
      notes: 'Good pump, felt strong',
    });
    console.log('✅ Training session created with ID:', sessionId);

    // Test 5: Create Mesocycle
    console.log('\nTest 5: Creating mesocycle...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 42); // 6 weeks

    const mesocycleId = await createMesocycle({
      name: 'Hypertrophy Block 1',
      startDate: startDate,
      endDate: endDate,
      weekNumber: 1,
      trainingSplit: 'push_pull_legs',
      isDeloadWeek: false,
      status: 'active',
      notes: 'Focus on progressive overload',
    });
    console.log('✅ Mesocycle created with ID:', mesocycleId);

    // Test 6: Query data
    console.log('\nTest 6: Querying all data...');
    const profiles = await getAllUserProfiles();
    const exercises = await getAllExercises();
    const workouts = await getAllWorkouts();

    console.log(`✅ Found ${profiles.length} user profile(s)`);
    console.log(`✅ Found ${exercises.length} exercise(s)`);
    console.log(`✅ Found ${workouts.length} workout(s)`);

    // Test 7: Export data
    console.log('\nTest 7: Exporting data...');
    const exportedData = await exportData();
    const dataSize = (exportedData.length / 1024).toFixed(2);
    console.log(`✅ Data exported successfully (${dataSize} KB)`);

    console.log('\n🎉 All tests passed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - User Profiles: ${profiles.length}`);
    console.log(`  - Exercises: ${exercises.length}`);
    console.log(`  - Workouts: ${workouts.length}`);
    console.log(`  - Data size: ${dataSize} KB`);

    return {
      success: true,
      profiles,
      exercises,
      workouts,
      exportedData,
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Auto-run in development
if (import.meta.env.DEV) {
  console.log('Run runDatabaseTests() in the console to test the database');
}
