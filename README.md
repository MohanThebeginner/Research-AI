# ResearchAI

AI-powered research assistant — upload documents, get an instant AI summary, and ask follow-up questions grounded in the document content using Retrieval-Augmented Generation (RAG).

Built as a technical assignment for Kulp.AI's Full-Stack Developer role.

## Live Links

- Frontend: _add your Vercel URL here after deploying_
- Backend API: _add your Render URL here after deploying_
- GitHub: _add your repo URL here_

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios, TanStack Query

**Backend**
- Node.js + Fastify
- Drizzle ORM + PostgreSQL
- JWT authentication (access + refresh tokens)
- Zod validation
- Google Gemini API (`@google/genai`) for chat, summarization, and embeddings
- pgvector for semantic search (Agentic RAG)

**Database:** PostgreSQL (Neon recommended — supports pgvector natively)

## Features

- JWT-based authentication (register, login, refresh, protected routes)
- Document upload (PDF, TXT, DOCX) with automatic text extraction
- AI-generated document summaries (Gemini)
- Multi-turn AI chat grounded in document content, with persisted history
- Agentic RAG: documents can be chunked, embedded, and retrieved via pgvector cosine similarity instead of sending full text on every chat message
- Dashboard analytics: document count, storage used, AI request count, average response time

## Folder Structure

```
researchai/
├── backend/
│   └── src/
│       ├── config/         → DB + Gemini client setup
│       ├── controllers/    → route handler logic
│       ├── db/             → Drizzle schema
│       ├── middlewares/    → JWT auth guard
│       ├── routes/         → route definitions
│       ├── services/       → embedding/RAG service layer
│       └── utils/          → validation, hashing, JWT, chunking, file extraction
└── frontend/
    └── app/                → Next.js App Router pages
```

## Local Setup

### 1. Database

Create a PostgreSQL database (Neon recommended: [neon.tech](https://neon.tech)). Then enable the pgvector extension by running this directly against your database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/researchai
JWT_ACCESS_SECRET=some-long-random-string
JWT_REFRESH_SECRET=a-different-long-random-string
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

Get a Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Model names change over time — check [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) if you hit a 404 on the model name.

Run migrations and start the server:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

Confirm it's running: `GET http://localhost:5000/healthcheck` should return `{"status":"ok", ...}`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Visit `http://localhost:3000`.

## API Reference

All protected routes require `Authorization: Bearer <accessToken>`.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/v1/auth/register | No | Register a new user |
| POST | /api/v1/auth/login | No | Login, returns access + refresh tokens |
| POST | /api/v1/auth/refresh | No | Exchange refresh token for new access token |
| POST | /api/v1/auth/logout | No | Logout (stateless, client discards tokens) |
| GET | /api/v1/auth/me | Yes | Get current user |

### Documents

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/v1/documents | Yes | Upload a document (PDF/TXT/DOCX, max 10MB) |
| GET | /api/v1/documents | Yes | List your documents |
| GET | /api/v1/documents/:id | Yes | Get one document |
| PUT | /api/v1/documents/:id | Yes | Rename a document |
| DELETE | /api/v1/documents/:id | Yes | Delete a document |
| POST | /api/v1/documents/:id/index | Yes | Chunk + embed a document for RAG |

### AI

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/v1/ai/summarize/:documentId | Yes | Generate and save a document summary |
| POST | /api/v1/ai/chat/:documentId | Yes | Ask a question about a document |
| GET | /api/v1/ai/history/:documentId | Yes | Get conversation history |

### Dashboard

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /api/v1/dashboard/stats | Yes | Usage stats (documents, AI requests, storage, avg latency) |

### Health

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /healthcheck | No | Server status |

## Deployment

### Database — Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Run `CREATE EXTENSION IF NOT EXISTS vector;` in the Neon SQL editor
3. Copy the connection string for `DATABASE_URL`

### Backend — Render

1. Push this repo to GitHub
2. Create a new Web Service on [render.com](https://render.com), pointing at the `backend/` directory
3. Build command: `npm install`
4. Start command: `npm run start`
5. Add all variables from `backend/.env.example` in Render's environment settings, using your real Neon `DATABASE_URL` and Gemini key
6. Set `FRONTEND_URL` to your deployed Vercel URL once you have it (update after step below)
7. After deploying, run migrations once via Render's shell: `npm run db:migrate`

### Frontend — Vercel

1. Import this repo into [vercel.com](https://vercel.com), setting the root directory to `frontend/`
2. Add environment variable `NEXT_PUBLIC_API_URL` set to your Render backend URL
3. Deploy
4. Go back to Render and update `FRONTEND_URL` to your new Vercel URL, then redeploy the backend so CORS allows it

## Known Limitations / Future Improvements

Being upfront about the current gaps rather than overstating what's done:

- **Logout is stateless** — JWTs aren't blacklisted on logout, they just expire naturally. A production version would need a token blacklist (e.g., Redis) for real invalidation.
- **Token usage isn't tracked yet** — the `messages.tokens` column exists but isn't populated from Gemini's response metadata. Dashboard's `totalTokensUsed` currently always shows 0.
- **RAG is single-pass, not fully agentic** — the app always retrieves exactly once per question rather than letting the model decide when/if to retrieve, or retrieving multiple times.
- **Document indexing is synchronous** — large documents block the upload/index request rather than processing in a background job/queue.
- **One conversation per (document, user) pair** — no support yet for multiple separate chat threads on the same document.
- **No rate limiting on the API itself** — relies on Gemini's own rate limits; a production app should add its own request throttling (e.g., `@fastify/rate-limit`).

## License

Built for the Kulp.AI technical assignment.
