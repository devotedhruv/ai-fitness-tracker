# Changelog

All notable changes to the FitTrack project will be documented in this file.

## [Phase 2: Frontend Foundation & Design System] - 2026-10-03
### Added
- Strict design tokens implemented for Dark Mode (`#0A0A0A` / `#FF7A00`) and Light Mode (`#FFF8EC` / `#F26B00`).
- Dynamic `ThemeProvider` with support for `System` (default), `Light`, and `Dark` modes.
- Reusable atomic component library with WCAG AA compliance and min 48px tap targets:
  - `Button` (Primary, Secondary, Ghost, Danger), `Card`, `Input`, `Chip`, `StatTile`, `BottomSheet`, `EmptyState`, `SkeletonLoader`, `StateView`.
- 4-Tab navigation architecture with custom tab bar: `Today`, `Train`, `Progress`, `Profile`.
- Authentication flow: Login (with demo credentials shortcut), Registration, Forgot Password.
- 5-step interactive onboarding questionnaire: Goal, Level, Days/Week, Equipment, and Units.
- Zustand `authStore` and API client communicating with backend `/api/v1`.
- Jest unit tests for design tokens and authentication state (8 passing tests).

## [Phase 1: Backend Foundation] - 2026-10-03
### Added
- Complete Prisma schema with 16 entity models and foreign keys.
- Production seed dataset containing 66 exercises across all 9 muscle groups and 5 progression trees.
- Layered backend architecture: `controllers` -> `services` -> `repositories`.
- JWT authentication with secure SHA-256 refresh token rotation and bcrypt password hashing.
- Auth endpoints: `register`, `login`, `refresh`, `logout`, `forgot-password`.
- User endpoints: `GET /me`, `PATCH /me`, `DELETE /me` (GDPR compliance).
- Exercise search & filtering API with pagination and detail endpoints.
- Calisthenics progression tree endpoint with automated unlock evaluation.
- Swagger UI interactive documentation at `/api/docs` and exported OpenAPI 3.0 specification at `/docs/api/openapi.json`.
- Jest integration test suites covering Auth, Exercises, and Progressions (14 passing tests).

## [Phase 0: Repo Scaffolding] - 2026-10-03
### Added
- Monorepo folder layout (`backend`, `frontend`, `docs`).
- Docker Compose configuration for PostgreSQL 17 on port 5432.
- Complete documentation suite (PRD, architecture, schema, design system, UX flows, GPS specs, deployment, testing, and security).
