# Server Connection Issue Fix

## Problem
Users are seeing "Cannot connect to the server. Please make sure the backend is running" on both student and admin login pages.

## Root Cause
The backend server was not running, which prevented the frontend from connecting to the API.

## Solution
Both the backend and frontend servers need to be running simultaneously:

### 1. Start the Backend Server
```bash
cd d:\Capstone\server
npm start
```

Expected output:
```
Server is running on port 5000
MongoDB Connected: [MongoDB host]
```

### 2. Start the Frontend Server
```bash
cd d:\Capstone
npm run dev
```

Expected output:
```
VITE v[version] ready in [time] ms
➜ Local: http://localhost:3001/
```

## Verification Steps

### 1. Check Backend Health
Visit: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "OK",
  "message": "QuizMaster API is running",
  "database": "Connected"
}
```

### 2. Access the Application
Open your browser and go to: http://localhost:3001

### 3. Test Login Credentials
Use these test credentials:

**Teacher/Admin:**
- Email: admin@test.com
- Password: Admin123!

**Student:**
- Email: student@test.com
- Password: Student123!

## Troubleshooting

### If Backend Won't Start
1. Check MongoDB Atlas connection string in `server/.env`
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Verify MongoDB Atlas cluster is running (not paused)

### If Frontend Can't Connect
1. Ensure both servers are running
2. Check browser console for CORS errors
3. Verify API_BASE_URL in `src/services/api.js` is correct

### Port Conflicts
- Backend: Port 5000 (change in `server/.env` if needed)
- Frontend: Port 3001 (auto-incremented from 3000 if in use)

## Current Status
✅ Backend server is running on port 5000
✅ Frontend server is running on port 3001
✅ MongoDB is connected
✅ API is accessible

You should now be able to access the application at http://localhost:3001 and log in with the test credentials above.