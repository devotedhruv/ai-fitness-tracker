# 10 - Security and Privacy Guide

## 1. Authentication & Session Security
- **Access Tokens**: Short-lived (15 minutes), signed with HMAC SHA-256 (`HS256`).
- **Refresh Tokens**: Long-lived (7 days), hashed with SHA-256 before persisting in the database.
- **Passwords**: Hashed with `bcrypt` (cost factor 12) or Argon2.
- **CSRF & Injection**: Helmet security headers, CORS origin whitelisting, parameterized SQL queries via Prisma ORM, and Zod input schema validation.

## 2. Location & Telemetry Privacy
- User GPS tracks are strictly personal data.
- GPS coordinates are never sent to third-party ad networks or analytics services.
- Coordinates stored on the server are linked exclusively to the authenticated user ID and can be completely wiped at any time.

## 3. GDPR Compliance
- **Right to Access**: `GET /api/v1/export/data` generates a complete downloadable archive of all user workouts, sets, runs, and telemetry.
- **Right to Erasure**: `DELETE /api/v1/users/me` permanently purges the user profile, refresh tokens, workout logs, runs, and metrics in a single database transaction.
