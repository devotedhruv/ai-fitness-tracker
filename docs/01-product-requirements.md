# 01 - Product Requirements Document (PRD)

## 1. Executive Summary
FitTrack is an all-in-one, minimalist fitness application combining gym resistance training, calisthenics skill progressions, and outdoor GPS run tracking into an offline-first mobile experience.

## 2. Target Personas
- **The Hybrid Athlete**: Trains strength 3x a week (gym + bodyweight) and runs outdoors 2x a week. Wants a single unified app without bloated social feeds or paywalls.
- **The Calisthenics Trainee**: Focuses on bodyweight mastery and needs clear, step-by-step unlockable skill trees (e.g., progression to One-Arm Push-up or Handstand).
- **The Outdoor Runner**: Needs reliable GPS route mapping, live audio/screen splits, auto-pause, and elevation/pace statistics.

## 3. Core Features
### 3.1 Exercise Library & Routine Builder
- 60+ seeded exercises spanning Gym and Calisthenics.
- Filterable by 9 muscle groups (Chest, Back, Legs, Shoulders, Biceps, Triceps, Core, Glutes, Full Body) and equipment.
- Form tips, common mistakes, easier/harder variations.
- Custom routine creation with superset support.

### 3.2 Active Workout Logging
- Set-by-set logging (Weight, Reps, RPE, Completion status).
- Time-based logging for isometric holds (Plank, L-sit, Wall sit).
- Pre-filled weights/reps based on previous session.
- Automatic rest timer with audio/haptic alert.
- Automatic Personal Record (PR) detection for max weight, volume, and reps.

### 3.3 Calisthenics Progression Trees
- Visual mastery trees across 5 skill lines (Push, Pull, Legs, Core, Handstand).
- Node states: `Locked`, `Current`, `Mastered`.
- Clear unlock criteria (e.g., log 3 sets of 10 clean reps to unlock the next level).

### 3.4 Outdoor GPS Run Tracking
- Live GPS tracking with background location support via `expo-task-manager`.
- Real-time metrics: Elapsed time, current pace, average pace, distance, elevation gain.
- Live polyline map rendering with pace gradient.
- Route smoothing via moving-average filter and Haversine distance calculation.
- Auto-pause when stationary; screen wake-lock and touch protection lock.
- Kilometer splits and post-run summary card.

### 3.5 Analytics & Progress
- Weekly goal ring and streak counter.
- Workout history calendar.
- Exercise progression charts (volume, weight, estimated 1RM).
- Weekly muscle heatmap (body diagram indicating muscle volume).

### 3.6 Offline-First & Data Sovereignty
- Local SQLite database writes on device first.
- Idempotent background synchronization when network is restored.
- Full data export (CSV workouts, GPX runs) and GDPR account deletion.

## 4. Out of Scope (v1)
- Live social feeds / leaderboards / follow mechanics.
- In-app payment / subscription paywalls (100% free open architecture).
- Direct Bluetooth heart rate chest strap integration (reserved for v2).
