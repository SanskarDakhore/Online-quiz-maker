# Fix Connection Issues - Step by Step Guide

## Current Issue
Your MongoDB database shows as "Disconnected" in the health check:
```json
{"status":"OK","message":"QuizMaster API is running","database":"Disconnected"}
```

## Solution Steps

### Step 1: Whitelist Your IP Address in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in with your credentials
3. Select your cluster
4. Go to **Network Access** in the left sidebar
5. Click **Add IP Address**
6. Enter your current IP: `47.11.23.112`
7. Click **Confirm**

Alternative for development: Add `0.0.0.0/0` to allow access from anywhere

### Step 2: Restart Both Servers

**Terminal 1 - Backend Server:**
```bash
cd d:\Capstone\server
npm start
```

**Terminal 2 - Frontend Server:**
```bash
cd d:\Capstone
npm run dev
```

### Step 3: Verify Connection

Check if the database is now connected:
```bash
curl.exe -s http://localhost:5000/api/health
```

You should see:
```json
{"status":"OK","message":"QuizMaster API is running","database":"Connected"}
```

## If Still Not Working

### Option 1: Check Cluster Status
1. In MongoDB Atlas, go to **Clusters**
2. Check if your cluster is paused
3. If paused, click **Resume**

### Option 2: Verify Credentials
1. In MongoDB Atlas, go to **Database Access**
2. Verify the user `romabanik4_db_user` exists
3. Reset password if needed

### Option 3: Use Local Database Fallback
The application is designed to work even without MongoDB connection:
- Authentication will work with local storage
- Some features may be limited
- Data won't persist between sessions

## Test Credentials

Once fixed, you can use these test accounts:

**Teacher/Admin:**
- Email: admin@test.com
- Password: Admin123!

**Student:**
- Email: student@test.com
- Password: Student123!

## Access the Application

Open your browser and go to: http://localhost:3001

## Troubleshooting Commands

### Check Backend Health
```bash
curl.exe -s http://localhost:5000/api/health
```

### Check Your IP
```bash
curl.exe -s https://api.ipify.org
```

### Restart Backend Server
```bash
cd d:\Capstone\server
npm start
```

### Restart Frontend Server
```bash
cd d:\Capstone
npm run dev
```