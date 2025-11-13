# 🚀 Quick Setup Guide - QuizMaster

## Step 1: Firebase Setup (REQUIRED)

### 1.1 Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Enter project name (e.g., "quizmaster-app")
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"
4. Enable **Google Sign-In** (optional):
   - Click "Google"
   - Toggle "Enable"
   - Add support email
   - Click "Save"

### 1.3 Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create Database"
3. Select "Start in test mode" (we'll add rules later)
4. Choose a location (closest to your users)
5. Click "Enable"

### 1.4 Set Up Storage
1. Go to **Storage**
2. Click "Get Started"
3. Select "Start in test mode"
4. Click "Next" and "Done"

### 1.5 Get Your Config
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon (</>)
4. Register app (nickname: "QuizMaster")
5. Copy the config object

### 1.6 Update Firebase Config
Open `src/firebase/config.js` and replace with your values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // Your API Key
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc..."
};
```

## Step 2: Run the Application

```bash
# Make sure you're in the Capstone directory
cd D:\Capstone

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The app will open at http://localhost:3000

## Step 3: Test the Application

### Create Teacher Account
1. Click "Register"
2. Fill in details
3. Select "Teacher" role
4. Register

### Create Student Account
1. Logout
2. Click "Register" again
3. Fill in details
4. Select "Student" role
5. Register

### As Teacher
1. Create a quiz from dashboard
2. Add questions with options
3. Mark correct answers
4. Preview and publish

### As Student
1. Browse quizzes
2. Start a quiz
3. **Don't switch tabs!** (max 3 times)
4. Answer questions
5. Submit and view results

## Step 4: Production Firestore Rules

For production, update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    match /results/{resultId} {
      allow read: if request.auth != null && 
        (resource.data.studentId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher');
      allow create: if request.auth != null;
    }
  }
}
```

## Step 5: Production Storage Rules

Update Storage rules in Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /quiz-images/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

## 🎯 Features to Try

### Easter Eggs
- **Konami Code**: Press ↑↑↓↓←→←→BA to toggle dark mode
- **Dancing Icon**: Click the QuizMaster logo 5 times
- **Quiz Mascot**: Wait for the owl to appear with tips
- **Dark Mode Toggle**: Click the floating sun/moon button

### Tab Switch Detection
- Start a quiz
- Try switching tabs
- You'll get a warning (max 3 switches)
- Quiz auto-submits if limit exceeded

### Badge System
- Complete quizzes to earn badges
- Get perfect scores (100%)
- Complete quizzes quickly
- Score above 90%

## 🐛 Troubleshooting

### "Firebase not initialized" error
- Make sure you've updated `src/firebase/config.js` with your actual Firebase credentials

### Authentication errors
- Check that Email/Password auth is enabled in Firebase Console
- For Google Sign-In, make sure it's enabled and configured

### Can't create quiz
- Make sure you're logged in as a Teacher
- Check Firestore rules allow teachers to create quizzes

### Images not uploading
- Check Firebase Storage is enabled
- Verify Storage rules allow authenticated uploads
- Image must be under 5MB

### App not starting
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📱 Test Accounts (Create These)

**Teacher Account:**
- Email: teacher@test.com
- Password: test123

**Student Account:**
- Email: student@test.com
- Password: test123

## 🎨 Customization

### Change Colors
Edit `src/index.css`:
```css
:root {
  --primary: #6366f1;     /* Main color */
  --secondary: #8b5cf6;   /* Secondary color */
  --accent: #ec4899;      /* Accent color */
}
```

### Add More Categories
Edit quiz creator options in `src/components/Teacher/QuizCreator.jsx`

### Modify Timer Limits
Change default timer in quiz creation form

## ✅ Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Config file updated with Firebase credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Teacher account created and tested
- [ ] Student account created and tested
- [ ] Quiz created and published
- [ ] Quiz taken and completed
- [ ] Results viewed
- [ ] Firestore rules updated for production
- [ ] Storage rules updated for production

## 🚀 Ready to Deploy?

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
firebase login
firebase init
firebase deploy
```

---

**Need Help?**
- Check the main README.md for detailed documentation
- Review Firebase Console for any service issues
- Ensure all Firebase services are properly configured

**Enjoy QuizMaster! 🎉**
