# 🧠 ResearchAI

### An AI-powered research assistant for document summarization, contextual Q&A, and semantic document retrieval

Document Intelligence • Gemini AI • RAG • PostgreSQL • pgvector • JWT Authentication • Next.js • Fastify

---

🌐 **Live Demo:** https://research-ai-gilt.vercel.app

⚙️ **Backend API:** https://research-ai-4nsv.onrender.com

📦 **GitHub:** https://github.com/MohanThebeginner/Research-AI

---

> ResearchAI is a full-stack AI application that allows users to upload research documents, generate AI-powered summaries, and ask contextual questions about their documents. It also supports optional semantic retrieval through Gemini embeddings and PostgreSQL pgvector.

---

# 📑 Table of Contents

* [Overview](#-overview)
* [Why ResearchAI?](#-why-researchai)
* [Screenshots](#-screenshots)
* [Features](#-features)
* [Architecture](#-architecture)
* [Document Processing Flow](#-document-processing-flow)
* [RAG Pipeline](#-rag-pipeline)
* [Tech Stack](#-tech-stack)
* [Project Structure](#-project-structure)
* [Database Schema](#-database-schema)
* [API Reference](#-api-reference)
* [Security](#-security)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Deployment](#-deployment)
* [Testing](#-testing)
* [Design Decisions](#-design-decisions)
* [Future Improvements](#-future-improvements)
* [License](#-license)

---

# 📖 Overview

ResearchAI is a full-stack research assistant designed to help users understand and interact with documents using Large Language Models.

Users can:

* Create an account
* Authenticate securely
* Upload research documents
* Extract text from uploaded files
* Generate concise AI summaries
* Ask questions about a document
* Continue multi-turn conversations
* View previous questions and answers
* Index documents for semantic retrieval
* Retrieve relevant document chunks using vector similarity

The application combines a modern Next.js frontend with a Fastify backend, PostgreSQL for persistent data, Gemini for generative AI and embeddings, and pgvector for semantic document retrieval.

---

# 💡 Why ResearchAI?

Traditional document analysis requires users to manually search through large amounts of text.

ResearchAI provides a conversational interface over uploaded documents.

Instead of:

```text
Upload document
      ↓
Manually read
      ↓
Search for information
      ↓
Interpret results
```

ResearchAI provides:

```text
Upload document
      ↓
Extract text
      ↓
Generate summary
      ↓
Ask questions
      ↓
Retrieve relevant context
      ↓
Generate grounded answer
```

The project demonstrates several real-world full-stack and AI engineering concepts:

* REST API design
* JWT authentication
* PostgreSQL schema modeling
* ORM-based database access
* Document processing
* LLM integration
* Prompt-based document summarization
* Conversational AI
* Vector embeddings
* Semantic similarity search
* RAG-based question answering
* Cloud deployment

---

# ✨ Features

## 🔐 Authentication

ResearchAI provides user authentication through JWT.

Features:

* User registration
* Login
* Password hashing
* JWT access tokens
* Refresh tokens
* Protected API routes
* User-specific document access
* Logout
* Current-user endpoint

Passwords are never stored directly. Passwords are hashed using `bcryptjs`.

---

## 📄 Document Management

Users can upload and manage their research documents.

Supported formats:

* PDF
* TXT

Document features:

* Upload
* Text extraction
* Document listing
* Document details
* Rename
* Delete
* Upload status tracking

Maximum upload size:

```text
10 MB
```

The application also limits the amount of extracted text processed by the AI layer to control context size and API usage.

---

## 📝 AI Summarization

ResearchAI uses Google Gemini to generate document summaries.

The summarization prompt requests:

1. Executive summary
2. Key points
3. Important facts
4. Final takeaway

The generated summary is stored in PostgreSQL and can be viewed from the document detail page.

---

## 💬 Contextual AI Chat

Users can ask follow-up questions about an uploaded document.

Example:

```text
User:
What are the main challenges discussed in the report?

ResearchAI:
The report identifies three major challenges...
```

The system stores conversations and messages in PostgreSQL.

Each conversation is associated with:

```text
User
  ↓
Document
  ↓
Conversation
  ↓
Messages
```

---

## 🧠 Retrieval-Augmented Generation

ResearchAI supports an optional RAG workflow.

A document can be indexed from the document details page.

The indexing process:

```text
Document Text
     ↓
Chunking
     ↓
Gemini Embeddings
     ↓
768-dimensional vectors
     ↓
PostgreSQL + pgvector
```

When a user asks a question:

```text
User Question
      ↓
Generate Question Embedding
      ↓
pgvector Similarity Search
      ↓
Retrieve Top 4 Chunks
      ↓
Add Context to Prompt
      ↓
Gemini
      ↓
Answer
```

If a document has not been indexed, the application falls back to truncated document context.

This allows the application to remain functional even when RAG indexing has not been performed.

---

## 📊 Dashboard

The dashboard provides an overview of the user's research activity.

Current information includes:

* Total documents
* Document activity
* Recent documents
* Document status
* Quick access to the document library

---

# 🏗 Architecture

```mermaid
flowchart LR

User --> NextJS

NextJS --> Fastify

Fastify --> Auth
Fastify --> Documents
Fastify --> AI
Fastify --> RAG
Fastify --> Dashboard

Auth --> PostgreSQL
Documents --> PostgreSQL
AI --> PostgreSQL
RAG --> PostgreSQL

Documents --> CloudStorage

AI --> Gemini
RAG --> Gemini
```

Production deployment:

```mermaid
flowchart LR

Browser

Browser --> Vercel

Vercel --> Render

Render --> Neon

Render --> Cloudinary

Render --> Gemini

Neon --> pgvector
```

---

# 🔄 Document Processing Flow

```mermaid
sequenceDiagram

participant User
participant Frontend
participant Backend
participant Storage
participant Database
participant Gemini

User->>Frontend: Select document
Frontend->>Backend: Multipart upload

Backend->>Backend: Validate file
Backend->>Backend: Extract text

Backend->>Storage: Store original document
Storage-->>Backend: Storage URL

Backend->>Database: Store metadata + extracted text

Backend-->>Frontend: Upload result

User->>Frontend: Generate summary
Frontend->>Backend: POST /ai/summarize/:documentId

Backend->>Gemini: Summarization prompt
Gemini-->>Backend: Summary

Backend->>Database: Store summary
Backend-->>Frontend: Return summary
```

---

# 🔎 RAG Pipeline

ResearchAI uses PostgreSQL with pgvector for semantic retrieval.

## Indexing

```text
Document
   ↓
Extracted Text
   ↓
Chunk Text
   ↓
Generate Gemini Embedding
   ↓
Store Vector
```

Each embedding record contains:

* Document ID
* Chunk text
* Chunk index
* 768-dimensional embedding

---

## Retrieval

```text
Question
   ↓
Gemini Embedding
   ↓
Vector Similarity Search
   ↓
Top 4 Relevant Chunks
   ↓
LLM Context
   ↓
Generated Answer
```

The project uses pgvector's vector distance operator for similarity retrieval.

---

# 🛠 Tech Stack

## Frontend

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS
* Axios
* TanStack Query

---

## Backend

* Node.js
* Fastify
* JavaScript (ES Modules)
* Zod
* JWT
* bcryptjs
* Fastify Multipart
* PDF parsing

---

## Database

* PostgreSQL
* Drizzle ORM
* pgvector

---

## AI

* Google Gemini
* Gemini text generation
* Gemini embeddings

---

## Storage

* Cloudinary

Cloud storage is used for persistent document storage in production instead of relying on the backend's local filesystem.

---

## Deployment

| Component    | Platform      |
| ------------ | ------------- |
| Frontend     | Vercel        |
| Backend      | Render        |
| PostgreSQL   | Neon          |
| File Storage | Cloudinary    |
| AI           | Google Gemini |

---

# 📂 Project Structure

```text
researchai/
│
├── frontend/
│   │
│   ├── app/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   │   └── [id]/
│   │   ├── login/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── AppShell.tsx
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── gemini.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── documentController.js
│   │   │   ├── aiController.js
│   │   │   ├── ragController.js
│   │   │   └── dashboardController.js
│   │   │
│   │   ├── db/
│   │   │   └── schema.js
│   │   │
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── embeddingService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── chunker.js
│   │   │   ├── fileExtractor.js
│   │   │   ├── hash.js
│   │   │   ├── jwt.js
│   │   │   └── validators.js
│   │   │
│   │   └── server.js
│   │
│   ├── drizzle.config.js
│   ├── .env.example
│   └── package.json
│
├── ai-chat-topic.md
├── dashboard-topic.md
├── document-upload-topic.md
├── rag-topic.md
├── topic.md
├── .gitignore
└── README.md
```

---

# 🗄 Database Schema

The PostgreSQL database contains the following main entities.

## Users

```text
users
├── id
├── name
├── email
├── password_hash
├── role
├── created_at
└── updated_at
```

---

## Documents

```text
documents
├── id
├── owner_id
├── filename
├── original_name
├── file_type
├── size
├── storage_url
├── extracted_text
├── summary
├── upload_status
├── is_indexed
├── created_at
└── updated_at
```

---

## Conversations

```text
conversations
├── id
├── document_id
├── user_id
└── created_at
```

---

## Messages

```text
messages
├── id
├── conversation_id
├── sender
├── content
├── tokens
├── latency
└── created_at
```

---

## Embeddings

```text
embeddings
├── id
├── document_id
├── chunk_text
├── chunk_index
├── embedding vector(768)
└── created_at
```

Relationships:

```text
User
 │
 └──< Documents
         │
         ├──< Conversations
         │       │
         │       └──< Messages
         │
         └──< Embeddings
```

Foreign keys use cascading deletes for dependent document data.

---

# 📡 API Reference

All protected endpoints require authentication.

## Health

| Method | Endpoint       | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/healthcheck` | Backend health check |

---

## Authentication

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/api/v1/auth/register` | Register a new user    |
| POST   | `/api/v1/auth/login`    | Authenticate user      |
| POST   | `/api/v1/auth/refresh`  | Refresh access token   |
| POST   | `/api/v1/auth/logout`   | Logout                 |
| GET    | `/api/v1/auth/me`       | Get authenticated user |

---

## Documents

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| POST   | `/api/v1/documents`           | Upload a document      |
| GET    | `/api/v1/documents`           | Get user's documents   |
| GET    | `/api/v1/documents/:id`       | Get document details   |
| PUT    | `/api/v1/documents/:id`       | Rename document        |
| DELETE | `/api/v1/documents/:id`       | Delete document        |
| POST   | `/api/v1/documents/:id/index` | Index document for RAG |

---

## AI

| Method | Endpoint                           | Description               |
| ------ | ---------------------------------- | ------------------------- |
| POST   | `/api/v1/ai/summarize/:documentId` | Generate document summary |
| POST   | `/api/v1/ai/chat/:documentId`      | Ask a question            |
| GET    | `/api/v1/ai/history/:documentId`   | Get conversation history  |

---

## Dashboard

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/v1/dashboard/stats` | Get dashboard statistics |

---

# 🔐 Security

ResearchAI implements several application-level security controls.

### Authentication

* JWT-based authentication
* Password hashing with bcryptjs
* Protected backend routes

### Authorization

Users can only access documents belonging to their authenticated account.

For example:

```text
User A
  ↓
Document A ✅

User A
  ↓
Document B owned by User B ❌
```

### Validation

Request bodies are validated using Zod schemas.

Validation covers:

* Registration
* Login
* Document rename
* Chat requests

### File Validation

Uploaded files are checked for:

* Supported MIME type
* Maximum file size
* Extractable text

### CORS

The backend is configured to accept requests from the deployed frontend origin.

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js 20+
* PostgreSQL
* Git
* Gemini API key

For RAG functionality:

* PostgreSQL with pgvector support

---

## Clone Repository

```bash
git clone https://github.com/MohanThebeginner/Research-AI.git

cd Research-AI
```

---

# ⚙️ Backend Setup

```bash
cd backend

npm install
```

Create:

```text
.env
```

from:

```text
.env.example
```

Configure the required environment variables.

Run database migrations:

```bash
npm run db:migrate
```

Start the development server:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/healthcheck
```

---

# 🖥 Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 🔐 Environment Variables

## Backend

```env
PORT=5000

DATABASE_URL=postgresql://user:password@localhost:5432/researchai

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

FRONTEND_URL=http://localhost:3000

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3-flash-preview

GEMINI_EMBEDDING_MODEL=text-embedding-004

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> Never commit `.env` files or API secrets to GitHub.

---

## Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production:

```env
NEXT_PUBLIC_API_URL=https://research-ai-4nsv.onrender.com
```

---

# 🌍 Deployment

ResearchAI is designed as a separated frontend/backend deployment.

```text
                Internet
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Vercel             Render
      Next.js            Fastify API
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
            Neon       Cloudinary     Gemini
         PostgreSQL      Storage       API
```

## Frontend

Deploy the `frontend` directory to Vercel.

Set:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

For a monorepo, configure the Vercel **Root Directory** as:

```text
frontend
```

Framework:

```text
Next.js
```

Leave the Output Directory empty and allow Vercel to handle the Next.js build output.

---

## Backend

Deploy the `backend` directory to Render.

Start command:

```bash
npm start
```

Configure the required backend environment variables.

The backend listens on:

```text
0.0.0.0
```

and uses Render's `PORT` environment variable.

---

## PostgreSQL

Neon PostgreSQL is used as the production database.

Set:

```env
DATABASE_URL=your_neon_connection_string
```

For RAG functionality, PostgreSQL must support the `vector` extension.

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Cloud Storage

Production document files are stored using Cloudinary rather than relying on the backend's local filesystem.

Required variables:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Cloudinary credentials remain on the backend and are never exposed to the frontend.

---

# 🧪 Testing

The primary development validation flow includes:

### Authentication

* Registration
* Duplicate email handling
* Login
* Invalid credentials
* Protected routes

### Documents

* PDF upload
* TXT upload
* Invalid file type
* File size validation
* Text extraction
* Rename
* Delete
* Ownership checks

### AI

* Summary generation
* Chat questions
* Conversation persistence
* Missing document handling
* Gemini rate-limit handling

### RAG

* Document indexing
* Text chunking
* Embedding generation
* Vector storage
* Similarity retrieval
* RAG-based answers

---

# 🧩 Design Decisions

## Why Fastify?

Fastify provides a lightweight and performant Node.js backend framework with a plugin-oriented architecture.

It is used for:

* REST APIs
* Authentication middleware
* Multipart uploads
* CORS
* Request handling

---

## Why Drizzle ORM?

Drizzle provides type-safe SQL-oriented database access while keeping the underlying PostgreSQL model explicit.

It is used for:

* Schema definition
* Queries
* Inserts
* Updates
* Deletes
* Database migrations

---

## Why PostgreSQL?

PostgreSQL provides reliable relational storage for:

* Users
* Documents
* Conversations
* Messages

It also supports pgvector, allowing the same database to store semantic embeddings.

---

## Why Gemini?

Gemini provides both:

* Text generation
* Embedding generation

This allows the application to use a single AI provider for summarization, conversational Q&A, and semantic retrieval.

---

## Why RAG?

Sending an entire document to an LLM for every question is inefficient and scales poorly with document size.

RAG reduces the context sent to the model by retrieving only the most relevant document chunks.

```text
Full Document
     ↓
Chunk + Embed
     ↓
Vector Search
     ↓
Relevant Chunks
     ↓
LLM
```

---

# 📈 Future Improvements

Potential improvements include:

* Streaming AI responses
* Background document processing
* Queue-based document ingestion
* Better PDF extraction for scanned documents
* OCR support
* Hybrid keyword + vector retrieval
* Reranking retrieved chunks
* Citation/source references in AI answers
* Token usage analytics
* Request rate limiting
* Automated tests
* E2E testing
* Sentry monitoring
* OpenAPI/Swagger documentation
* CI/CD pipeline
* Docker support
* Better document search
* Pagination
* Multi-document research sessions
* Improved authentication with secure httpOnly cookies
* Admin analytics

---

# 🤝 Contributing

Contributions and improvements are welcome.

### Create a branch

```bash
git checkout -b feature/my-feature
```

### Make changes

```bash
git add .
```

### Commit

```bash
git commit -m "feat: add feature"
```

### Push

```bash
git push origin feature/my-feature
```

Then open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

### Built to explore full-stack AI application architecture, document intelligence, and retrieval-augmented generation.
