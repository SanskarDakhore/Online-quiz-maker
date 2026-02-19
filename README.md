# QuizMaster - Online Quiz Platform

QuizMaster is a role-based quiz platform where teachers create and publish quizzes, and students attempt quizzes with secure server-side evaluation.

## Folder Structure
Only `README.md` is in root. Everything else is grouped into `frontend/` or `backend/`.

```text
online-quiz-maker-remote/
|-- README.md
|-- frontend/
|   |-- src/
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- vercel.json
|   |-- node_modules/
|   `-- dist/
`-- backend/
    |-- api/                      # serverless-style API handlers
    |   |-- auth/
    |   |-- quizzes/
    |   |-- results/
    |   `-- _lib/
    |-- server/                   # Express API for local backend run
    |   |-- routes/
    |   |-- models/
    |   |-- middleware/
    |   |-- utils/
    |   `-- package.json
    |-- scripts/                  # test/setup scripts moved from root
    `-- docs/                     # project docs moved from root
```

## Run Locally

### 1) Install frontend dependencies
```bash
cd frontend
npm install
```

### 2) Install backend dependencies
```bash
cd ../backend/server
npm install
```

### 3) Run backend (Express)
```bash
cd ../server
npm run dev
```
Backend: `http://localhost:5000`

### 4) Run frontend (Vite)
```bash
cd ../../frontend
npm run dev
```
Frontend: `http://localhost:3000` (or Vite-assigned port)

### Convenience commands (from `frontend/`)
```bash
npm run dev:frontend
npm run dev:backend
npm run build
```

## Environment Variables

### Backend (`backend/server/.env`)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
PORT=5000
```

### Frontend (`frontend/.env`, optional)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Notes
- Structure was reorganized only for readability/grouping; feature behavior remains the same.
- API routes and frontend imports were updated to match the new grouped directories.
