# BALYRA: Build. Move. Become. ⚔️⚡

BALYRA is a high-performance, production-grade fitness application engineered for gym athletes, calisthenics practitioners, runners, and lifters. It combines real-time workout tracking, an offline-resilient library of **1,324+ verified exercises**, intelligent routine builders, streak tracking, cultural discipline milestones, and full dark/light theme synchronization.

---

## 📱 Releases & Installation

The production release Android APK is located in:
```text
releases/balyra-v1.0.0.apk
```

### Installing via USB / ADB
```bash
adb install -r releases/balyra-v1.0.0.apk
```

### Direct Phone Installation
1. Transfer `balyra-v1.0.0.apk` to your Android device (via Google Drive, USB file transfer, or Telegram).
2. Tap the APK file in your phone's File Manager.
3. Allow "Install from unknown sources" if prompted, and complete installation.

---

## ⚡ Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Mobile Framework** | React Native (Expo SDK 52) | TypeScript, Expo Router file-based navigation |
| **State & Persistence** | Zustand + `persist` middleware | FileSystem JSON store surviving app restarts & reinstalls |
| **Cloud Database** | Supabase (PostgreSQL 17) | 1,324 exercises, profiles, workouts, and routines |
| **Offline Resilience** | Client Fallback Catalog | Complete bundled exercises with GitHub CDN media links |
| **Design System** | BALYRA Unified Design Tokens | Pure Dark/Light palette with Lime `#B8F500` / Gold accent |
| **Error Handling** | AppErrorBoundary & Graceful Fallbacks | Production-grade recovery UI catching unexpected errors |
| **Under Construction** | Standardized Feature Gates | Honest, branded UI for features undergoing native ML tuning |
| **Backend API (Optional)** | Python 3.11 / Django REST | Dockerized PostgreSQL / Swagger documentation |

---

## 📁 Monorepo Layout

```text
/exercise-app
├── frontend/                # React Native Expo Mobile App
│   ├── app/                 # Expo Router file-based navigation
│   │   ├── (tabs)/          # Core Tabs: Today, Train, Progress, Profile, Community
│   │   ├── auth/            # Sign In, Sign Up, Password Reset
│   │   └── workout/         # Active Session Tracker, Vision Tracker, Routine Builder
│   ├── src/
│   │   ├── components/ui/   # Unified Design System (Buttons, Cards, Logos, Modals)
│   │   ├── services/        # Supabase, Exercise Media, Vision Analyzers, Storage
│   │   ├── stores/          # Zustand Stores (auth, activeWorkout, routine, social)
│   │   └── theme/           # Color tokens, typography, radii, dark/light definitions
│   └── android/             # Generated Android native Gradle project
├── backend/                 # Optional Django REST Framework microservice
├── releases/                # Standalone release APKs
│   └── balyra-v1.0.0.apk
├── docs/                    # Architecture, design system, and API documentation
└── README.md                # Project documentation
```

---

## 🚀 Development Setup

### 1. Prerequisites
- Node.js 18+ & npm
- JDK 17 (`/usr/lib/jvm/java-17-openjdk`)
- Android SDK (`platforms/android-34`, `build-tools/36.0.0`)

### 2. Frontend Setup
```bash
cd frontend
npm install

# Copy environment variables
cp .env.example .env

# Run TypeScript typecheck
npm run typecheck

# Run automated test suites (30 suites, 222 tests)
npm test

# Start development server
npx expo start
```

### 3. Building Android Release APK
```bash
cd frontend
npx expo prebuild --platform android --clean
cd android
JAVA_HOME=/usr/lib/jvm/java-17-openjdk ANDROID_HOME=$HOME/Android/Sdk ./gradlew assembleRelease
```
The compiled APK will be generated at:
`frontend/android/app/build/outputs/apk/release/app-release.apk`

---

## 🛡️ Production Verification & Quality Assurance

- **0 TypeScript Errors**: Verified across all 150+ components with `tsc --noEmit`.
- **222 Unit & Integration Tests Passing**: 30 Jest test suites verifying state stores, calculations, token consistency, and safety fallbacks.
- **Real Supabase Connectivity**: 1,324 exercises loaded dynamically with offline image fallback.
- **Robust Storage**: Uses native file system storage for auth tokens, active workouts, and custom routines.
- **No Mock or Fake Data**: Authentic user profiles, real exercise metrics, and transparent under-construction notices for native ML models.

---

## 📄 License & Attribution
Designed and built for athletes. BALYRA — *Build. Move. Become.*
