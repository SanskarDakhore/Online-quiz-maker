# MongoDB Connection Test Guide

## Connection String
Your MongoDB connection string is:
```
mongodb+srv://romabanik4_db_user:8dQxZft95F8rUTQL@onlinequizmaking.aeenpfm.mongodb.net/quizmaster?retryWrites=true&w=majority
```

## Testing Connection

### Option 1: Using MongoDB Compass
1. Download and install MongoDB Compass if you haven't already
2. Open MongoDB Compass
3. Paste the connection string above
4. Click "Connect"

### Option 2: Using Command Line
Run this command in your terminal:
```bash
mongosh "mongodb+srv://romabanik4_db_user:8dQxZft95F8rUTQL@onlinequizmaking.aeenpfm.mongodb.net/quizmaster?retryWrites=true&w=majority"
```

## Common Connection Issues

### 1. IP Not Whitelisted
**Solution**: Add your IP to MongoDB Atlas whitelist
- Go to MongoDB Atlas Dashboard
- Network Access → Add IP Address
- Use "Add Current IP Address" or add `0.0.0.0/0` for development

### 2. Incorrect Credentials
**Solution**: Verify username and password
- Check if the username/password in the connection string is correct
- Reset password if needed in MongoDB Atlas

### 3. Cluster Paused
**Solution**: Resume cluster
- Go to Clusters in MongoDB Atlas
- Check if your cluster is paused
- Click "Resume" if it is paused

## After Fixing Connection

1. Restart your backend server:
```bash
cd d:\Capstone\server
npm start
```

2. Check health endpoint again:
```bash
curl.exe -s http://localhost:5000/api/health
```

You should see:
```json
{"status":"OK","message":"QuizMaster API is running","database":"Connected"}
```