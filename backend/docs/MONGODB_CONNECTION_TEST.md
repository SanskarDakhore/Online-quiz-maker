# MongoDB Connection Test Guide

## Connection String
Store your MongoDB connection string only in `backend/server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
```

## Testing Connection

### Option 1: Using MongoDB Compass
1. Open MongoDB Compass.
2. Copy the `MONGODB_URI` value from your local `.env`.
3. Paste it into Compass and connect.

### Option 2: Using Command Line
Run this command in your terminal after loading your env:

```bash
mongosh "$MONGODB_URI"
```

## Common Connection Issues

### 1. Network Access
Confirm the database accepts connections from your current environment.

### 2. Credentials
Verify the username and password embedded in `MONGODB_URI`.

### 3. Database Availability
Confirm the cluster or database service is running.

## After Fixing Connection

1. Restart your backend server:

```bash
cd backend/server
npm start
```

2. Check the health endpoint using the URL from your environment config.
