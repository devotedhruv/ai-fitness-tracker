# FitTrack Frontend Mobile App 📱

FitTrack mobile application engineered with React Native, Expo, Expo Router, Zustand, TanStack Query, and SQLite.

---

## 🛠️ Features & Tech Stack
- **Framework**: Expo (React Native) with Expo Router (file-based navigation)
- **Design Tokens**: Custom Light (Cream/Orange) and Dark (Black/Orange) theme tokens
- **Local Storage**: `expo-sqlite` for offline-first data retention and sync queue
- **Location & GPS**: `expo-location` with `expo-task-manager` background tracking
- **State Management**: Zustand for UI & active workout/run state, TanStack Query for remote API data

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Ensure `EXPO_PUBLIC_API_URL` points to your backend instance (use your machine's LAN IP if testing on a physical phone).

### 3. Run Dev Server
```bash
# Start Expo development server
npm start

# Run directly on web for rapid desktop testing
npm run web

# Run on Android emulator / physical device
npm run android

# Run on iOS simulator
npm run ios
```

### 4. Code Quality & Type Check
```bash
npm run typecheck
npm run lint
```
