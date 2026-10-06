# 09 - Testing Strategy

## 1. Testing Pyramid

| Layer | Focus Areas | Framework |
|---|---|---|
| **Unit Tests** | PR detection logic, Haversine formula, pace calculations, progression unlock criteria, JWT token utilities | Jest, `ts-jest` |
| **Integration Tests** | Auth flows, workout sessions CRUD, idempotent sync queue ingestion | Supertest, Jest |
| **Frontend Tests** | Reusable components (Button, Card, Chip, Input), theme provider, store actions | Jest, React Native Testing Library |
| **End-to-End** | Critical happy path: create workout -> log sets -> finish -> check history | Mocked API integration test |

## 2. Test Execution Commands
```bash
# Backend unit & integration tests
cd backend && npm test

# Frontend component & logic tests
cd frontend && npm test
```
