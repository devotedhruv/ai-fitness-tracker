# 04 - API Reference (REST v1)

All endpoints are versioned under `/api/v1`. Interactive Swagger documentation is available at [`/api/docs`](http://localhost:4000/api/docs) and raw OpenAPI 3.0 specification is available at [`/api/docs.json`](http://localhost:4000/api/docs.json).

Exported schema path: [`/docs/api/openapi.json`](file:///home/dhruv/Documents/exercise-app/docs/api/openapi.json).

---

## Standard Error Response Format
All errors return consistent JSON:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Input validation failed",
  "details": {
    "fieldErrors": {
      "email": ["Invalid email address"]
    }
  }
}
```

---

## 1. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register`
Creates an athlete account and initializes user progression states.
```json
// Request Body
{
  "email": "alex@fittrack.app",
  "password": "Password123!",
  "displayName": "Alex Runner",
  "units": "METRIC",
  "experienceLevel": "INTERMEDIATE",
  "fitnessGoal": "Muscle Gain",
  "daysPerWeek": 4,
  "equipment": ["Dumbbells", "Pull-up Bar"]
}

// Response (201 Created)
{
  "user": {
    "id": "c1f7b031-...",
    "email": "alex@fittrack.app",
    "profile": { ... }
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "4a7f01c89...",
    "expiresIn": 900
  }
}
```

### `POST /api/v1/auth/login`
```json
// Request Body
{
  "email": "demo@fittrack.app",
  "password": "Password123!"
}

// Response (200 OK)
{
  "user": { "id": "...", "email": "demo@fittrack.app", "profile": { ... } },
  "tokens": { "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }
}
```

### `POST /api/v1/auth/refresh`
Rotates the refresh token securely.
```json
// Request Body
{
  "refreshToken": "4a7f01c89..."
}

// Response (200 OK)
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "9d81e3a47...",
    "expiresIn": 900
  }
}
```

### `POST /api/v1/auth/logout`
Revokes the active refresh token.
```json
// Request Body
{
  "refreshToken": "9d81e3a47..."
}
```

---

## 2. User Profile (`/api/v1/users/me`)

- `GET /api/v1/users/me`: Returns profile, unit preferences, and calisthenics skill level states.
- `PATCH /api/v1/users/me`: Updates display name, units (`METRIC`/`IMPERIAL`), experience level, and equipment.
- `DELETE /api/v1/users/me`: Permanently purges user account and cascaded records (GDPR compliance).

---

## 3. Exercises (`/api/v1/exercises`)

### `GET /api/v1/exercises`
Query Parameters:
- `search` (string): Search exercise name.
- `type` (`GYM` | `CALISTHENICS`)
- `muscleGroup` (`CHEST` | `BACK` | `LEGS` | `SHOULDERS` | `BICEPS` | `TRICEPS` | `CORE` | `GLUTES` | `FULL_BODY`)
- `equipment` (string): Filter by equipment tag.
- `page` (number, default: 1)
- `limit` (number, default: 20)

```json
// Response (200 OK)
{
  "items": [
    {
      "id": "82ba47de-...",
      "name": "Barbell Bench Press",
      "type": "GYM",
      "primaryMuscle": "CHEST",
      "secondaryMuscles": ["TRICEPS", "SHOULDERS"],
      "muscleGroups": ["CHEST", "TRICEPS", "SHOULDERS"],
      "equipment": ["Barbell", "Flat Bench"],
      "instructions": [...],
      "formTips": [...],
      "commonMistakes": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 66,
    "totalPages": 4
  }
}
```

### `GET /api/v1/exercises/:id`
Returns full exercise details, including instructions, cues, and progression node mappings.

---

## 4. Calisthenics Progressions (`/api/v1/progressions`)

### `GET /api/v1/progressions`
Returns all 5 progression trees (`PUSH`, `PULL`, `LEGS`, `CORE`, `HANDSTAND`). When authenticated, each level node includes its current user status: `MASTERED`, `CURRENT`, or `LOCKED`.

### `POST /api/v1/progressions/evaluate`
```json
// Request Body
{
  "skill": "PUSH"
}

// Response (200 OK)
{
  "unlocked": true,
  "previousLevel": 3,
  "newLevel": 4,
  "message": "Congratulations! Level 4 unlocked in PUSH progression!"
}
```
