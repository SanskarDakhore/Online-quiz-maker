# QuizMaster - Online Quiz Platform

QuizMaster is a role-based quiz platform where teachers create/publish quizzes and students attempt them with secure result evaluation.

## Tech Stack
- Frontend: React + Vite + React Router + Framer Motion + Chart.js
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT
- Deployment-ready API: Vercel serverless routes in `api/`

## Implemented Core Logic
- Role-based auth (`teacher`, `student`) with protected routes
- Teacher quiz lifecycle:
  - Create draft quiz
  - Edit/update quiz
  - Publish/unpublish quiz
  - View quiz attempts/results
- Student flow:
  - Browse published quizzes
  - Attempt quiz with timer, anti-tab-switch check, hint usage
  - Auto-submit on violations/time expiry
  - View result / pending result (based on release mode)
  - Download certificate
- Security/data integrity:
  - Server-side scoring (client score is not trusted)
  - Student quiz payload hides answer keys (`correctAnswer`)
  - Access control on results (student sees own, teacher sees only own-quiz attempts)

## Project Structure
```text
online-quiz-maker-remote/
├── src/                      # React app
├── server/                   # Express API (local backend)
├── api/                      # Vercel serverless API routes
├── package.json              # frontend + shared deps
└── server/package.json       # express server deps/scripts
```

## Environment Variables

### 1) Express server (`server/.env`)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
PORT=5000
```

### 2) Frontend (`.env` at root, optional but recommended for local)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3) Optional Atlas resume API (for `/api/activate-db`)
```env
ATLAS_PUBLIC_KEY=...
ATLAS_PRIVATE_KEY=...
ATLAS_GROUP_ID=...
ATLAS_CLUSTER_NAME=...
```

## How to Run (Local Development)

### Step 1: Install dependencies
```bash
# root (frontend + shared deps used by api/)
npm install

# express backend
cd server
npm install
```

### Step 2: Run backend
```bash
cd server
npm run dev
```
Backend runs at `http://localhost:5000`.

### Step 3: Run frontend
```bash
# from project root
npm run dev
```
Frontend runs at Vite dev URL (usually `http://localhost:5173`).

## Auth and Routing Workflow

### Public
- `/login`
- `/register`

### Teacher
- `/teacher/dashboard`
- `/teacher/quizzes`
- `/teacher/create-quiz`
- `/teacher/edit-quiz/:quizId`
- `/teacher/results/:quizId`

### Student
- `/student/quizzes`
- `/student/quiz/:quizId`
- `/student/result/:resultId`
- `/student/result-pending/:resultId`
- `/student/certificate/:resultId`
- `/student/profile`

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Quizzes
- `GET /api/quizzes` (published list for students)
- `GET /api/quizzes/my-quizzes` (teacher-owned)
- `POST /api/quizzes` (teacher create)
- `GET /api/quizzes/:quizId`
- `PUT /api/quizzes/:quizId`
- `DELETE /api/quizzes/:quizId`
- `PATCH /api/quizzes/:quizId/publish`

### Results
- `POST /api/results` (student submit; server computes score)
- `GET /api/results/my-results` (student history)
- `GET /api/results/:resultId` (authorized access only)
- `GET /api/results/quiz/:quizId` (teacher for own quiz)

## Build
```bash
npm run build
```

## Notes
- Keep `JWT_SECRET` set in every environment.
- If deploying on Vercel with serverless routes, set `MONGODB_URI` and `JWT_SECRET` in Vercel env vars.
