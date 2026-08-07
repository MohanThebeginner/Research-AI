# 📌 Project Setup (Next.js + Fastify + Drizzle + PostgreSQL) — Complete Guide

## 📌 What is Project Setup?

Project Setup is the foundation phase where we prepare the skeleton of our full-stack application before writing any real feature. It means:

- Creating two separate codebases — a frontend (Next.js) and a backend (Fastify)
- Wiring up the database layer (PostgreSQL + Drizzle ORM) so the backend knows how to talk to a database
- Adding environment configuration so secrets (DB URL, JWT secrets, API keys) are never hardcoded
- Creating a basic "is the server alive" check (`/healthcheck`)

Think of it like building the foundation and plumbing of a house before you put in furniture. You don't decorate a room before the walls and pipes exist.

## 📌 Why Do We Need It?

Without proper project setup:

- ❌ Frontend and backend code get mixed together, making deployment hard
- ❌ Secrets like DB passwords or API keys get hardcoded and leaked in Git
- ❌ No way to verify the backend is even running before building features on top of it
- ❌ Database schema changes become messy without a migration tool

With proper project setup:

- ✅ Frontend (Vercel) and backend (Render) can be deployed independently
- ✅ `.env` files keep secrets out of the codebase and Git history
- ✅ `/healthcheck` gives an instant way to confirm the server is up
- ✅ Drizzle ORM gives us version-controlled, type-safe database migrations

## 📌 Architecture Overview

```
User (Browser)
      ↓
Next.js Frontend (App Router, Tailwind)
      ↓  (axios call to NEXT_PUBLIC_API_URL)
Fastify Backend (Node.js)
      ↓
Drizzle ORM
      ↓
PostgreSQL Database
```

Right now only one route exists end-to-end: the frontend home page calls `GET /healthcheck` on the backend to confirm it's alive. Every future feature (auth, document upload, AI chat) will follow this same shape — frontend calls a backend route, backend talks to the database through Drizzle, and a JSON response comes back.

## 📌 Database Design (So Far)

### Why This Table?

Only one table exists at this stage — `users` — because authentication (Phase 2) is the very next thing we build, and every other table (documents, conversations, messages) will reference `users.id` as the owner. It made sense to define the shape of `users` now even though we haven't wired up any queries against it yet.

### `users` Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role role_enum DEFAULT 'USER' NOT NULL,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);
```

| Column | Type | Purpose |
|---|---|---|
| id | UUID | Unique identifier for each user |
| name | VARCHAR(100) | Display name |
| email | VARCHAR(255) | Login identifier, must be unique |
| password_hash | TEXT | Bcrypt hash — never store plain text passwords |
| role | ENUM(USER, ADMIN) | Controls access to admin-only routes later |
| created_at / updated_at | TIMESTAMP | Standard audit columns |

**Why UUID instead of auto-increment integer?**
UUIDs don't reveal how many users exist (an integer ID like `/users/5` leaks that there are at least 5 users) and they're safer to expose in URLs or JWT payloads.

**Why is `password_hash` TEXT and not VARCHAR?**
Bcrypt hashes have a fixed-ish length but using TEXT avoids any risk of truncation if the hashing algorithm changes later.

**Real-world analogy:** think of `id` like a passport number — unique, never reused, and doesn't tell you anything about the person just by looking at it (unlike a sequential number that reveals "you're the 5th person registered").

Relationships (documents, conversations, messages tables) will be added in Phase 3 and 4 when those features are built.

## 📌 Dependencies

### Backend

| Package | What it is | Why we use it | Alternative |
|---|---|---|---|
| fastify | Web framework | Faster and lighter than Express, built-in schema validation | Express, Hono |
| @fastify/cors | CORS plugin | Lets the frontend (different port/domain) call the backend | Manual CORS headers |
| drizzle-orm | Type-safe ORM | Write SQL-like queries in JS with full type safety | Prisma, TypeORM |
| pg | PostgreSQL driver | Actual driver Drizzle uses to talk to Postgres | node-postgres alternatives |
| dotenv | Env loader | Loads `.env` file into `process.env` | Manual `process.env` setup |
| zod | Schema validation | Validates request bodies (used from Phase 2 onward) | Joi, Yup |
| bcryptjs | Password hashing | Hashes passwords before storing (used in Phase 2) | argon2 |
| jsonwebtoken | JWT | Issues/verifies auth tokens (used in Phase 2) | jose |
| drizzle-kit (dev) | Migration CLI | Generates and runs SQL migrations from our schema file | Prisma Migrate |

### Frontend

| Package | What it is | Why we use it |
|---|---|---|
| next | React framework | App Router, SSR, easy Vercel deployment |
| axios | HTTP client | Cleaner API than raw `fetch`, used to call backend |
| @tanstack/react-query | Server state manager | Caching/loading state for API calls (used from Phase 3 onward) |
| tailwindcss | Utility CSS | Fast styling without writing custom CSS files |

## 📌 API Overview

Only one route exists in this phase:

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| /healthcheck | GET | None | Confirms the server is running |

All authentication and feature routes (`/api/v1/auth/*`, `/api/v1/documents/*`, `/api/v1/ai/*`) are covered in their own `topic.md` files once those phases are built.

## 📌 `/healthcheck` — Deep Dive

**Route:** `GET /healthcheck`
**Headers:** None required
**Request Body:** None

**Response:**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2026-08-07T12:00:00.000Z"
}
```

**Code:**
```js
app.get("/healthcheck", async () => {
  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});
```

**Step-by-Step Flow:**
1. Browser/frontend sends `GET /healthcheck`
2. Fastify matches the route, runs the handler
3. Handler returns a plain JS object
4. Fastify automatically serializes it to JSON and sends it back with `200 OK`

**Deep Explanation:**
- `async` handler — Fastify supports async functions natively; whatever you `return` becomes the response body, no need to call `res.send()` manually.
- `process.uptime()` — a built-in Node.js function returning seconds since the process started. Useful for confirming the server hasn't silently restarted.
- No database call here — this route intentionally stays dependency-free so it works even if Postgres is down, which is exactly what a healthcheck is for.

## 📌 Folder Structure

```
researchai/
├── backend/
│   ├── src/
│   │   ├── config/       → DB connection setup
│   │   ├── db/           → Drizzle schema (table definitions)
│   │   ├── routes/       → Route definitions (empty for now, filled in Phase 2)
│   │   ├── controllers/  → Route handler logic (empty for now)
│   │   ├── middlewares/  → Auth guards, error handlers (empty for now)
│   │   ├── utils/        → Helper functions (empty for now)
│   │   └── server.js     → App entry point
│   ├── drizzle.config.js → Tells drizzle-kit where schema/migrations live
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── layout.tsx    → Root HTML shell
    │   ├── page.tsx      → Home page, pings backend healthcheck
    │   └── globals.css   → Tailwind directives
    ├── package.json
    ├── tailwind.config.ts
    └── .env.local.example
```

**Why separate `routes/` and `controllers/`?**
Routes just declare "this URL maps to this function." Controllers hold the actual logic. This separation means you can see every available endpoint at a glance in the routes file without wading through business logic.

## 📌 Request Lifecycle (Current State)

```
Browser
   ↓
Next.js page.tsx (useEffect on mount)
   ↓
axios.get(NEXT_PUBLIC_API_URL + "/healthcheck")
   ↓
Fastify CORS check (is frontend origin allowed?)
   ↓
Route handler runs
   ↓
JSON response
   ↓
React state updates → UI shows "Backend status: ok"
```

From Phase 2 onward, this lifecycle gains a **middleware** step between CORS and the route handler (JWT verification for protected routes).

## 📌 Error Handling (Current State)

At this stage there's only one failure mode to handle: the backend being unreachable.

- If `axios.get()` fails (network error, backend down, CORS blocked) → frontend catches it and shows `"backend not reachable"` instead of crashing
- `500` errors, validation errors (`400`), and auth errors (`401`/`403`) don't apply yet — those come with Phase 2 (Auth) and Phase 3 (Documents)

## 📌 Security (Current State)

- **CORS** — `@fastify/cors` is configured to only allow requests from `FRONTEND_URL`, so random websites can't call our API from a browser
- **Environment variables** — DB credentials and future API keys live in `.env` files, which are never committed to Git (add `.env` to `.gitignore`)
- JWT auth, bcrypt hashing, and input validation (Zod) are installed as dependencies now but wired up in Phase 2

## 📌 Common Mistakes

| ❌ Mistake | Why it's wrong | ✅ Correct approach |
|---|---|---|
| Committing `.env` to Git | Leaks DB password / API keys publicly | Commit `.env.example` only, add `.env` to `.gitignore` |
| Hardcoding `http://localhost:5000` in frontend code | Breaks in production | Use `NEXT_PUBLIC_API_URL` env variable |
| Skipping the healthcheck route | No way to verify deployment worked | Always add a healthcheck before building features |
| Putting DB queries directly in `server.js` | Becomes unmaintainable fast | Keep DB logic in `config/db.js` and later in controllers |

## 📌 Interview Questions & Answers

**Q1: Why did you choose Fastify over Express?**
Fastify has built-in schema-based validation, is faster due to its JSON serialization engine, and has a cleaner plugin system — which matters for a project with auth, file uploads, and AI calls.

**Q2: Why Drizzle ORM instead of writing raw SQL?**
Drizzle gives type safety (catches column typos at compile time) and a migration system, while still letting me write SQL-like, predictable queries instead of a heavy abstraction like Prisma's query engine.

**Q3: Why is the healthcheck route not connected to the database?**
Because a healthcheck should answer "is the server process alive," which is a different question from "is the database reachable." Keeping it dependency-free means it still responds even during a DB outage, which is useful for debugging where the failure actually is.

**Q4: What's the point of `.env.example`?**
It documents which environment variables the app needs without exposing real secrets — anyone cloning the repo copies it to `.env` and fills in their own values.

## 📌 Real-world Examples

- **Vercel / Render split deployment** — similar to how large companies (e.g., GitHub) deploy their web frontend and API backend as separate services that can scale and deploy independently
- **Healthcheck endpoints** — the same pattern AWS load balancers and Kubernetes use to decide if a container is "ready" to receive traffic

## 📌 Testing Checklist

**Backend**
- [ ] `npm run dev` starts without errors
- [ ] `GET http://localhost:5000/healthcheck` returns `200` with `status: "ok"`
- [ ] Server logs show Fastify's request log line for the healthcheck call

**Frontend**
- [ ] `npm run dev` starts without errors
- [ ] Home page loads at `http://localhost:3000`
- [ ] Page shows "Backend status: ok" when backend is running
- [ ] Page shows "backend not reachable" when backend is stopped (test by killing backend and refreshing)

## 📌 Summary

Key takeaways:
- ✅ Frontend and backend are fully separate codebases that talk over HTTP
- ✅ Drizzle + PostgreSQL is configured with one table (`users`) defined but not yet used
- ✅ Environment variables keep secrets out of the codebase
- ✅ `/healthcheck` is the first working end-to-end connection between frontend and backend
- ✅ Folder structure (routes/controllers/middlewares/utils) is ready for Phase 2 (Authentication)
