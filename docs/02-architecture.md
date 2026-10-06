# 02 - System Architecture & Data Flow

## 1. High-Level Architecture Overview

FitTrack follows a strictly decoupled, offline-first client-server architecture:

```mermaid
graph TD
    subgraph Mobile_App [Frontend (React Native / Expo)]
        UI[Expo Router UI Layer]
        State[Zustand Stores]
        Query[TanStack Query Cache]
        SQLite[(expo-sqlite Local DB)]
        SyncEngine[Sync & Queue Engine]
        GPS[expo-location + task-manager]
    end

    subgraph Backend_API [REST API (Node.js / Express)]
        Gateway[Helmet, CORS & Rate Limiter]
        Auth[JWT & Session Middleware]
        Controllers[API v1 Controllers]
        Services[Business Logic & PR Engine]
        Repo[Prisma ORM Repositories]
    end

    subgraph Database [Storage Tier]
        Postgres[(PostgreSQL 17)]
    end

    UI --> State
    UI --> Query
    State --> SQLite
    GPS --> SQLite
    SyncEngine --> SQLite
    SyncEngine -- HTTPS REST (Bearer JWT) --> Gateway
    Gateway --> Auth
    Auth --> Controllers
    Controllers --> Services
    Services --> Repo
    Repo --> Postgres
```

## 2. Frontend / Backend Separation Rules
- **No Shared Code Imports**: The mobile app and backend are standalone packages with separate `package.json` files and separate tooling.
- **Contract Enforcement**: Communication is strictly via REST API over `/api/v1` matching the OpenAPI 3.0 specification.
- **Type Generation**: Client API models are derived directly from the OpenAPI schema.

## 3. Offline-First Synchronization Strategy
1. **Client-Generated UUIDs**: All entities (`WorkoutSession`, `WorkoutSet`, `Run`, `Routine`) use UUIDv4 primary keys generated on the client.
2. **Local Write-Ahead Queue**:
   - When a workout or run is completed, it is saved immediately to local `expo-sqlite`.
   - An entry is appended to a local `sync_queue` table with action `UPSERT` or `DELETE`.
3. **Idempotent Batch Sync**:
   - The sync engine checks network connectivity via `NetInfo`.
   - Pending changes are batched to `POST /api/v1/sync`.
   - The backend processes items in an idempotent transaction: existing records are updated based on `updatedAt` timestamps; new records are inserted.
   - Successful items are purged from `sync_queue`.
