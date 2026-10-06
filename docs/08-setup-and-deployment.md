# 08 - Setup & Deployment Guide

## 1. Development Prerequisites
- **Node.js**: v20 or v22 LTS (v26 compatible)
- **Docker**: Engine 24+ and Docker Compose v2
- **Mobile**: Expo Go on iOS or Android, or local Xcode/Android Studio emulators

## 2. Local Setup
```bash
# 1. Clone & Enter
cd /home/dhruv/Documents/exercise-app

# 2. Boot Database Service
docker compose up postgres -d

# 3. Setup Backend
cd backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev

# 4. Setup Frontend
cd ../frontend
npm install
cp .env.example .env
npm start
```

## 3. Environment Variables

### Backend (`/backend/.env`)
```ini
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://fittrack:fittrack_password@localhost:5432/fittrack_db?schema=public"
JWT_SECRET="fittrack_jwt_access_secret_key_change_in_prod"
JWT_REFRESH_SECRET="fittrack_jwt_refresh_secret_key_change_in_prod"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:19006,http://localhost:8081,*"
RATE_LIMIT_MAX=200
```

### Frontend (`/frontend/.env`)
```ini
EXPO_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

## 4. Production Deployment
- **Backend Container**: Deploy with Docker Compose or Kubernetes using the multi-stage `Dockerfile`.
- **Database**: Managed PostgreSQL (AWS RDS, Supabase, Neon, or GCP Cloud SQL).
- **Frontend App**: Built via EAS (Expo Application Services) producing standard `.ipa` and `.aab` packages for Apple App Store and Google Play Store.
