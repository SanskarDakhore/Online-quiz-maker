# Project Running Status

## ✅ Servers Running Successfully

### Backend Server
- **Status**: ✅ Running
- **Port**: 5000
- **Database**: ✅ Connected
- **Health Check**: ✅ OK

### Frontend Server
- **Status**: ✅ Running
- **Port**: 3001 (fallback from 3000)
- **URL**: http://localhost:3001

## 🔧 Connection Details

### MongoDB Connection
```json
{
  "status": "OK",
  "message": "QuizMaster API is running",
  "database": "Connected"
}
```

### Database Host
- **Host**: ac-ckkmkhv-shard-00-02.aeenpfm.mongodb.net

## 🌐 Access URLs

### Application
- **Main URL**: http://localhost:3001

### API Endpoints
- **Health Check**: http://localhost:5000/api/health
- **Auth Endpoints**: http://localhost:5000/api/auth
- **Quiz Endpoints**: http://localhost:5000/api/quizzes
- **Result Endpoints**: http://localhost:5000/api/results

## 🔐 Test Credentials

### Teacher/Admin Account
- **Email**: admin@test.com
- **Password**: Admin123!

### Student Account
- **Email**: student@test.com
- **Password**: Student123!

## 📋 Available Features

### Teacher Features
- ✅ Create quizzes
- ✅ Edit quizzes
- ✅ Publish/unpublish quizzes
- ✅ View quiz results
- ✅ Manage quizzes

### Student Features
- ✅ Browse available quizzes
- ✅ Take quizzes
- ✅ View results
- ✅ View certificates
- ✅ Manage profile

## ⚙️ Technical Details

### Server Processes
1. **Backend**: Node.js/Express server on port 5000
2. **Frontend**: Vite development server on port 3001

### Technologies
- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens

## 🛠️ Troubleshooting

### If Issues Occur
1. **Restart servers**: Kill both terminals and restart
2. **Check ports**: Ensure ports 5000 and 3001 are free
3. **Verify MongoDB**: Check Atlas dashboard for cluster status

### Commands to Restart
```powershell
# Kill processes on ports
Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Get-NetTCPConnection -LocalPort 3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Start backend
cd d:\Capstone\server; npm start

# Start frontend (separate terminal)
cd d:\Capstone; npm run dev
```

The project is now fully operational with all features working correctly!