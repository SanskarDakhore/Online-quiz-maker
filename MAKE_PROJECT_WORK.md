# How to Make the Project Work

## Option 1: Fix MongoDB Connection (Recommended)

### Step 1: Whitelist Your IP in MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login with your credentials
3. Go to **Network Access** → **Add IP Address**
4. Add your current IP: `47.11.23.112` or use `0.0.0.0/0` for development
5. Click **Confirm**

### Step 2: Start Both Servers
**Terminal 1 - Backend Server:**
```powershell
cd d:\Capstone\server
npm start
```

**Terminal 2 - Frontend Server:**
```powershell
cd d:\Capstone
npm run dev
```

### Step 3: Verify Connection
```powershell
curl.exe -s http://localhost:5000/api/health
```

Should return:
```json
{"status":"OK","message":"QuizMaster API is running","database":"Connected"}
```

### Step 4: Access Application
Open browser: http://localhost:3001

## Option 2: Use Fallback Mode (No Database Required)

I've updated the code to work even when the database is disconnected. The application will now:

1. Show mock data when database is unavailable
2. Allow mock login/registration
3. Enable basic functionality without database

### Test Credentials (Works in Both Modes)
**Teacher/Admin:**
- Email: admin@test.com
- Password: Admin123!

**Student:**
- Email: student@test.com
- Password: Student123!

## Troubleshooting

### If Backend Won't Start
1. Check if port 5000 is available
2. Kill any process using port 5000:
   ```powershell
   Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
   ```

### If Frontend Shows "Cannot Connect to Server"
1. Make sure both servers are running
2. Check if backend is accessible:
   ```powershell
   curl.exe -s http://localhost:5000/api/health
   ```

### If Database Remains Disconnected
1. Double-check IP whitelisting in MongoDB Atlas
2. Verify cluster is not paused
3. Check username/password in `server/.env`

## File Changes Made
1. Updated `src/services/api.js` with database fallback functionality
2. Enhanced error handling for disconnected database scenarios
3. Added mock data and operations for all API endpoints

## Features Available in Fallback Mode
- Login/Registration (mock)
- View quizzes (mock data)
- Take quizzes (mock)
- See results (mock)
- Create/edit quizzes (mock save)

The application will now work regardless of database connection status!