# Debugging Fixes for Session Expiration Issue

## Problem
Users are experiencing "session expired" errors when trying to publish quizzes, causing them to be redirected to the login page.

## Debugging Enhancements Added

### 1. Backend Authentication Middleware (`server/middleware/auth.js`)
- Added detailed logging to see what's happening during token verification
- Logging decoded token information
- Logging user lookup results
- Added logging to authorization middleware

### 2. Backend Quiz Routes (`server/routes/quizzes.js`)
- Added detailed logging to the publish quiz endpoint
- Logging user information, quiz ID, and request body
- Logging success/failure outcomes

### 3. Frontend API Service (`src/services/api.js`)
- Added logging to publishQuiz, createQuiz, and updateQuiz functions
- Logging request parameters and results
- Enhanced error logging

### 4. Frontend Components
- Added logging to TeacherQuizzes.jsx togglePublish function
- Added logging to QuizCreator.jsx saveQuiz function

## How to Use These Debugging Enhancements

1. Restart both the backend and frontend servers
2. Open browser developer tools (F12) to view console logs
3. Open terminal/command prompt to view backend server logs
4. Try to publish a quiz again
5. Check both frontend console and backend terminal for detailed logs

## What to Look For

### Frontend Console (Browser Developer Tools)
- "Saving quiz with publish status:" messages
- "Publishing quiz:" messages
- "Creating quiz with data:" or "Updating quiz:" messages
- Any error messages

### Backend Terminal/Console
- "Decoded token:" messages
- "User found:" messages
- "Publish quiz request received" messages
- "Checking authorization for roles:" messages
- Any error messages

## Expected Flow When Working Correctly
1. User clicks "Publish Quiz"
2. Frontend logs "Saving quiz with publish status: true"
3. Frontend logs "Creating quiz with data:" or "Updating quiz:"
4. Backend logs "Decoded token:" with user information
5. Backend logs "User found:" with user details
6. Backend logs "Checking authorization for roles:" with "teacher" role
7. Backend logs "Publish quiz request received"
8. Backend logs "Quiz published/unpublished successfully"
9. Frontend logs "Quiz created/updated successfully"
10. Frontend logs "Quiz saved successfully, navigating to quizzes page"

## If the Issue Persists
Check for these specific error messages:
- "User not found for uid:" (indicates token/user mismatch)
- "No user object found in request" (indicates authentication failure)
- "User role [role] not in allowed roles" (indicates authorization failure)
- Any database connection errors
- Any JWT verification errors

These enhanced logs will help identify exactly where in the authentication/publishing flow the issue is occurring.