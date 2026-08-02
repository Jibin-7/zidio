# Project LOOP — AI Customer-Feedback Intelligence Platform

![Project LOOP Logo](/public/window.svg)

Project LOOP is a corporate-grade, multi-tenant web application designed to help SaaS companies ingest, cluster, and make sense of their scattered customer feedback. Support tickets, app-store reviews, survey responses, and sales notes are ingested into a unified database where AI categorizes them, detects trending themes, and even answers plain-English questions grounded in your actual customer feedback.

This project was built to satisfy the **Zidio Development Internship Project** rubric for the Web Development track.

---

## 🚀 Tech Stack

Project LOOP is built on a modern, robust, production-ready stack:

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth (Auth.js) with Role-Based Access Control (RBAC)
- **AI Intelligence**: Google Gemini (via `@google/genai` SDK v2) for zero-shot classification, generative narrative, and RAG.
- **Charts**: Recharts
- **Validation**: Zod
- **Deployment**: Vercel

---

## 📐 Architecture Summary

LOOP follows a strict three-tier architecture ensuring robust security and AI integration:

1. **Client Layer**: React Server & Client Components render the UI and call local Next.js Route Handlers. The client *never* communicates directly with the database or the AI provider.
2. **API Layer**: Route handlers authenticate the user session, enforce RBAC roles (ADMIN, ANALYST, VIEWER), and strictly scope *every* Prisma query by `workspaceId` ensuring zero cross-tenant data leakage.
3. **Services & Data Layer**: The API layer orchestrates Prisma calls to PostgreSQL and makes authenticated, server-side calls to the Gemini API to execute the structured classification, VoC report generation, and Ask LOOP RAG pipelines.

---

## 🔒 Demo Credentials Checklist

To verify the Role-Based Access Control (RBAC) implementation, use the following seeded credentials on the live deployment:

- **Admin Account**: `admin@acme.com` / `password123`
  - *Permissions*: Full access (manage members, import feedback, generate AI reports)
- **Analyst Account**: `analyst@acme.com` / `password123`
  - *Permissions*: Can ingest feedback, view dashboards, run Ask LOOP
- **Viewer Account**: `viewer@acme.com` / `password123`
  - *Permissions*: Strictly Read-only access to dashboards and generated reports

---

## 💻 Local Setup Steps

Follow these steps to run Project LOOP on your local machine:

### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/your-username/project-loop.git
cd project-loop
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (do not commit this file). Add the following variables:
```env
# Database connection string (e.g., Neon or Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# NextAuth Secret for JWT signing
NEXTAUTH_SECRET="generate-a-secure-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Configuration (Gemini API)
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Initialize the Database & Run Migrations
Run the Prisma migrations to build the tables in your Postgres database:
```bash
npx prisma migrate dev --name init
```

### 4. Seed the Database
Populate the database with a test workspace, users, themes, and 120+ mock feedback items across various channels:
```bash
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📸 Screenshots

*(Replace these with actual screenshots of your application before submitting)*

- **Dashboard**: [Insert Dashboard Screenshot]
- **Feedback Inbox**: [Insert Inbox Screenshot]
- **Ask LOOP AI**: [Insert Ask LOOP Screenshot]
- **VoC Report Generation**: [Insert Report Screenshot]

---

*Built with ❤️ during the Zidio Development Internship.*
