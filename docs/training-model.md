# Training Model

The hypertrophy concepts Repstack is built on, and where they appear in the
code. Recommendations follow evidence-based hypertrophy principles in the
style of Renaissance Periodization: progressive overload, auto-regulation
from feedback, mesocycle periodization and planned deloads.

Types referenced here live in `src/types/models.ts`.

## Volume landmarks

Weekly hard sets per muscle group (`VolumeLandmarks`):

- **MV, Maintenance Volume**: the minimum that keeps muscle.
- **MEV, Minimum Effective Volume**: the minimum that produces growth.
- **MAV, Maximum Adaptive Volume**: the range where most growth happens.
- **MRV, Maximum Recoverable Volume**: the most you can recover from.
  Going past it means accumulating fatigue, not more growth.

A mesocycle starts near MEV and adds volume week to week toward MRV.

## Training variables

- Sets per muscle group per week. Per exercise in a mesocycle:
  `MesocycleExercise.targetSets`, typically 2–5.
- Reps per set (`targetRepsMin`–`targetRepsMax`), 5–30 for hypertrophy:
  - 5–8: strength-oriented hypertrophy
  - 8–15: the default range for most exercises
  - 15–30: metabolic stress and pump work
- RIR, Reps In Reserve (`WorkoutSet.rir`): stored as 0–10, with 0–4 used
  for auto-regulation. RIR goes down as the mesocycle progresses.
- Frequency: each muscle trained 2–6 times per week.
- Exercise selection and variation across mesocycles.

## Mesocycles

A training block of 4–6 weeks (`Mesocycle.durationWeeks`) with one planned
deload week (`deloadWeek`, usually the last). How
`getMesocycleWeekDescription` in `src/lib/mesocycleUtils.ts` labels weeks:

- Weeks 1–2: accumulation, starting at moderate volume.
- Second to last week: intensification.
- Last week: peak, unless it is the deload.
- Deload week: much less volume and intensity, so fatigue can drop.

After the deload the next mesocycle starts again near MEV, ideally with
slightly higher loads.

Splits (`trainingSplit`): upper/lower, push/pull/legs, full body, bro split,
custom. Templates in `src/lib/programTemplates.ts` cover the first three.

## Auto-regulation inputs

Collected after training. Nothing in `src/lib/` adjusts volume from them
yet; the rough rule below is the intended behavior.

- Pump, 1–5 (`MuscleGroupFeedback.pump`, `TrainingSession.pump`)
- Soreness, 1–5 (`soreness`)
- Fatigue, 1–5 (`TrainingSession.fatigue`)
- Performance: weight and reps achieved, and an `excellent`–`poor` rating
- Overall recovery (`RecoveryStatus`): `well_recovered` to `very_fatigued`

Rough rule: a good pump with little soreness and stable performance means
there is room to add sets. Heavy soreness, falling performance or high
fatigue means hold volume or reduce it.

## Muscle groups

- Push: chest, shoulders, triceps
- Pull: back, biceps, rear delts
- Legs: quads, hamstrings, glutes, calves
- Core: abs, obliques

The exact list is the `MuscleGroup` type.

## Exercises

Exercises are user-created, with a category (machine, barbell, dumbbell,
bodyweight, cable, other), target muscle groups and equipment. Starter exercises
are in `src/lib/starterExercises.ts`.

## Adding a training feature

Describe its scientific basis here: what it does, why, and which of the
concepts above it relies on. If a rule is a simplification, say so.
