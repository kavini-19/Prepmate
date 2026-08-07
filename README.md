# PrepMate — AI-Powered Placement Preparation Platform

🚀 **Live Application**: [https://prepmate-cyan.vercel.app](https://prepmate-cyan.vercel.app)

A full-stack, production-ready platform to help engineering students crack placements at top companies.

---

## Features

- **Secure JWT auth** — email/password + Google OAuth, protected routes
- **Personalized Dashboard** — streaks, XP, stats, upcoming drives, today's tasks
- **AI Learning Roadmap** — Gemini-powered, based on target company & skill level
- **Coding Practice** — 1000+ problems with topic filters, difficulty, bookmarks, hints, solutions
- **Aptitude Module** — timed quizzes across 4 categories with instant scoring & explanations
- **AI Mock Interview** — HR + Technical chat with real-time evaluation and feedback
- **Resume Analyzer** — PDF upload, ATS scoring, keyword analysis, AI suggestions
- **Company Prep** — interview process, coding topics, HR questions, experiences per company
- **AI Study Planner** — weekly schedule, daily challenges, streak tracking
- **Progress Analytics** — Recharts dashboards (coding, aptitude, interview, study hours)
- **Markdown Notes** — tagged, bookmarked, live preview
- **AI Chatbot** — placement Q&A, DSA explanations, interview tips
- **Achievements** — badges, XP, levels, leaderboard
- **Notifications** — drives, contests, reminders
- **Resource Library** — PDFs, cheat sheets, notes, videos
- **Admin Dashboard** — user management, content, broadcast notifications, analytics

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS        |
| UI         | Shadcn UI (Radix UI), Framer Motion, Recharts   |
| State      | Zustand (persisted)                             |
| Forms      | React Hook Form + Zod                           |
| Backend    | FastAPI, SQLAlchemy 2.0, Alembic                |
| Database   | PostgreSQL                                      |
| Auth       | JWT (python-jose), bcrypt (passlib)             |
| AI         | Google Gemini 1.5 Flash API                     |
| File Store | Cloudinary (optional)                           |

---

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/yourname/prepmate.git
cd prepmate
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your DATABASE_URL and GEMINI_API_KEY

# Create PostgreSQL database
# psql -U postgres -c "CREATE DATABASE prepmate_db;"

# Run migrations
alembic upgrade head

# Start server
python main.py
# Server runs at http://localhost:8000
# API docs: http://localhost:8000/api/docs
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev
# App runs at http://localhost:3000
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable                   | Description                        |
|----------------------------|------------------------------------|
| `DATABASE_URL`             | PostgreSQL connection string       |
| `SECRET_KEY`               | JWT signing key (min 32 chars)     |
| `GEMINI_API_KEY`           | Google Gemini API key              |
| `GOOGLE_CLIENT_ID`         | Google OAuth client ID (optional)  |
| `CLOUDINARY_CLOUD_NAME`    | Cloudinary config (optional)       |

### Frontend — `frontend/.env`

| Variable              | Description                      |
|-----------------------|----------------------------------|
| `VITE_API_URL`        | Backend API base URL             |
| `VITE_GEMINI_API_KEY` | Gemini key for client-side AI    |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID         |

---

## Demo Login

The app includes a **Demo Login** button on the login page — no backend required. It creates a mock user session so you can explore all pages instantly.

To use the admin panel, use:
- Email: `admin@prepmate.dev`
- Password: `admin1234`
- Role: `admin`

---

## Project Structure

```
prepmate/
├── backend/
│   ├── app/
│   │   ├── api/routes/     # auth, coding, aptitude, ai, notes, ...
│   │   ├── core/           # config, database, security, deps
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # ai_service.py (Gemini integration)
│   │   └── main.py         # FastAPI app entry
│   ├── alembic/            # Database migrations
│   ├── requirements.txt
│   └── main.py             # uvicorn entry point
│
└── frontend/
    ├── src/
    │   ├── api/            # axios client, auth, ai endpoints
    │   ├── components/
    │   │   ├── layout/     # Sidebar, Header, MainLayout, AuthGuard
    │   │   ├── shared/     # StatCard, PageHeader, LoadingSpinner
    │   │   └── ui/         # Shadcn components (button, card, ...)
    │   ├── constants/      # nav items, topics, XP config
    │   ├── hooks/          # use-toast
    │   ├── lib/            # utils, mockData
    │   ├── pages/          # all page components
    │   ├── store/          # zustand (authStore, uiStore)
    │   ├── types/          # TypeScript interfaces
    │   └── App.tsx         # router config
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## API Endpoints

| Method | Endpoint                    | Description               |
|--------|-----------------------------|---------------------------|
| POST   | `/api/auth/register`        | Register new user         |
| POST   | `/api/auth/login`           | Login, returns JWT        |
| POST   | `/api/auth/google`          | Google OAuth login        |
| GET    | `/api/auth/me`              | Get current user          |
| PATCH  | `/api/auth/profile`         | Update profile            |
| GET    | `/api/coding/problems`      | List problems (paginated) |
| GET    | `/api/coding/problems/:slug`| Get problem detail        |
| POST   | `/api/coding/submit`        | Submit solution           |
| POST   | `/api/coding/bookmark/:id`  | Toggle bookmark           |
| GET    | `/api/aptitude/questions`   | Get quiz questions        |
| POST   | `/api/aptitude/submit`      | Submit quiz answers       |
| POST   | `/api/ai/chat`              | AI chatbot                |
| POST   | `/api/ai/roadmap`           | Generate learning roadmap |
| POST   | `/api/ai/resume-analyze`    | Analyze resume            |
| POST   | `/api/ai/evaluate-answer`   | Evaluate interview answer |
| POST   | `/api/ai/analyze-code`      | AI code review            |
| POST   | `/api/ai/study-plan`        | Generate study plan       |
| GET    | `/api/companies`            | List companies            |
| GET    | `/api/companies/:slug`      | Company detail            |
| GET    | `/api/analytics/dashboard`  | User analytics            |
| GET    | `/api/notes`                | List user notes           |
| POST   | `/api/notes`                | Create note               |
| PATCH  | `/api/notes/:id`            | Update note               |
| GET    | `/api/notifications`        | List notifications        |
| GET    | `/api/resources`            | List resources            |
| GET    | `/api/admin/overview`       | Admin stats (admin only)  |

---

## Building for Production

```bash
# Frontend build
cd frontend
npm run build
# Output: frontend/dist/

# Backend — use gunicorn or uvicorn with workers
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## License

MIT License — free for personal and commercial use.
