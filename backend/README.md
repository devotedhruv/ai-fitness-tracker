# FitTrack Backend API 🚀

REST API service for FitTrack built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

---

## 🛠️ Tech Stack
- **Framework**: Express (layered architecture: controllers -> services -> repositories)
- **Database**: PostgreSQL 17 + Prisma ORM
- **Auth**: JWT access tokens + hashed refresh tokens (argon2/bcrypt)
- **Validation**: Zod schema validation
- **Documentation**: Swagger UI & OpenAPI 3.0 at `/api/docs`
- **Testing**: Jest + Supertest

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
Ensure PostgreSQL is running (`docker compose up postgres -d` in the root).

### 3. Database Migration & Seed
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
API running on: `http://localhost:4000/api/v1`  
Swagger UI docs: `http://localhost:4000/api/docs`

### 5. Build for Production
```bash
npm run build
npm start
```

### 6. Tests & Linting
```bash
npm test
npm run lint
```
