# 📚 QuizMaster - Online Quiz Making Platform

A complete, feature-rich online quiz platform built with React, Firebase, and modern web technologies. Supports both teachers (quiz creators) and students (quiz takers) with advanced features like tab-switch detection, real-time analytics, badge system, and fun Easter eggs!

## ✨ Features

### 🎓 For Teachers
- **Complete Quiz Management**
  - Create unlimited quizzes with custom questions
  - Add 4 options per question with correct answer selection
  - Upload images for questions
  - Add explanations for answers
  - Preview quizzes before publishing
  - Edit and delete existing quizzes
  - Publish/Unpublish quizzes

- **Interactive Admin Dashboard**
  - Real-time statistics and analytics
  - Beautiful charts showing quiz performance (Chart.js)
  - View number of attempts and average scores
  - Side navigation with smooth animations
  - Responsive design for all devices

- **Quiz Configuration**
  - Set quiz title, description, category, difficulty
  - Configure timer (per quiz or per question)
  - Multiple categories (Science, Math, History, Technology, etc.)
  - Three difficulty levels (Easy, Medium, Hard)

### 👨‍🎓 For Students
- **Quiz Library**
  - Browse all published quizzes
  - Filter by category and difficulty
  - Search functionality
  - Beautiful card-based layout

- **Interactive Quiz Taking**
  - Clean, distraction-free interface
  - Timer with visual countdown
  - Progress bar showing completion
  - Navigate between questions
  - **Auto-exit on tab switching** (max 3 switches allowed)
  - **Auto-submit on time expiry**
  - Answer review before submission

- **Results & Analytics**
  - Detailed score breakdown
  - View correct and incorrect answers
  - Read explanations for each question
  - Badge system for achievements
  - Personal profile with quiz history
  - Track progress over time

- **Badge System**
  - 🎯 Quiz Rookie - First quiz
  - ⚡ Fast Solver - Complete quickly
  - 💯 Perfect Score - 100% accuracy
  - 🏆 Top Ranker - Score above 90%
  - And more!

### 🎨 Easter Eggs & Fun Features
- **Secret Dark Mode** - Use Konami Code (↑↑↓↓←→←→BA) to unlock
- **Dancing Icon** - Click the logo 5 times
- **Quiz Mascot** - Random helpful tips appear during use
- **Dark Mode Toggle** - Floating button for theme switching
- Smooth animations and micro-interactions throughout

### 🎨 UI/UX Features
- **Glass-morphism** design elements
- **Framer Motion** animations
- Responsive design (mobile, tablet, desktop)
- Soft blue & purple color palette
- Hover effects and tooltips
- Loading states and skeleton screens
- Real-time form validation

## 🛠️ Tech Stack

- **Frontend**: React 19 with Vite
- **Routing**: React Router DOM v7
- **Authentication**: Firebase Authentication (Email/Password + Google Sign-In)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (for quiz images)
- **Animations**: Framer Motion
- **Charts**: Chart.js + React-Chartjs-2
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Emoji-based icons

## 📁 Project Structure

```
quiz-platform/
├── src/
│   ├── components/
│   │   ├── Teacher/
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── TeacherDashboard.css
│   │   │   ├── QuizCreator.jsx
│   │   │   └── QuizCreator.css
│   │   ├── Student/
│   │   │   ├── StudentQuizzes.jsx
│   │   │   ├── StudentQuizzes.css
│   │   │   ├── QuizPlayer.jsx
│   │   │   ├── QuizPlayer.css
│   │   │   ├── QuizResult.jsx
│   │   │   ├── QuizResult.css
│   │   │   ├── StudentProfile.jsx
│   │   │   └── StudentProfile.css
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Auth.css
│   │   ├── ProtectedRoute.jsx
│   │   ├── EasterEggs.jsx
│   │   └── EasterEggs.css
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── firebase/
│   │   └── config.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone or download the project**
   ```bash
   cd Capstone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project
   
   c. Enable the following services:
      - **Authentication** (Email/Password + Google)
      - **Firestore Database**
      - **Storage**
   
   d. Get your Firebase configuration:
      - Go to Project Settings
      - Scroll to "Your apps" section
      - Click on the web app icon (</>)
      - Copy the configuration object

   e. Update `src/firebase/config.js` with your credentials:
      ```javascript
      const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
      };
      ```

4. **Set up Firestore Security Rules**

   In Firebase Console > Firestore Database > Rules, use:
   ```
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

5. **Set up Firebase Storage Rules**

   In Firebase Console > Storage > Rules, use:
   ```
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

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - The app will automatically open at `http://localhost:3000`

## 📖 Usage Guide

### For Teachers

1. **Register as a Teacher**
   - Go to `/register`
   - Fill in your details
   - Select "Teacher" role
   - Create account

2. **Create a Quiz**
   - Navigate to "Create Quiz"
   - Fill in quiz information (title, description, category, difficulty, timer)
   - Add questions with 4 options each
   - Mark correct answers
   - Optionally add images and explanations
   - Preview your quiz
   - Publish when ready

3. **Manage Quizzes**
   - View all your quizzes in the dashboard
   - See statistics (attempts, average score)
   - Edit or delete quizzes
   - Publish/Unpublish quizzes

### For Students

1. **Register as a Student**
   - Go to `/register`
   - Fill in your details
   - Select "Student" role
   - Create account

2. **Take a Quiz**
   - Browse available quizzes
   - Filter by category or difficulty
   - Click "Start Quiz"
   - Read the rules carefully
   - Answer questions within the time limit
   - **Important**: Don't switch tabs or windows!
   - Submit when done

3. **View Results**
   - See your score and performance
   - Review correct and incorrect answers
   - Read explanations
   - Earn badges for achievements

4. **Track Progress**
   - Visit your profile
   - View quiz history
   - Check earned badges
   - Monitor average score

## 🎯 Key Features Explained

### Tab-Switch Detection
The quiz player monitors user activity and detects:
- Tab switches (using `visibilitychange` event)
- Window focus loss (using `blur` event)
- Maximum 3 violations allowed
- Auto-submit on limit exceeded

### Timer System
- Countdown timer with visual warning when low
- Can be set per quiz or per question
- Auto-submit when time expires
- Time tracking for performance badges

### Badge System
Students earn badges based on:
- Quiz completion
- Speed of completion
- Score percentage
- Consistency
- Special achievements

### Dark Mode
- Toggle between light and dark themes
- Persistent across sessions
- Secret Konami Code unlock
- Smooth theme transitions

## 🔧 Build for Production

```bash
npm run build
```

The build files will be in the `dist` folder, ready for deployment.

## 🌐 Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase:
   ```bash
   firebase init
   ```
   - Select "Hosting"
   - Choose your project
   - Set public directory to `dist`
   - Configure as single-page app: Yes

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

### Deploy to Vercel/Netlify

1. Push your code to GitHub
2. Connect your repository to Vercel or Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy!

## 📝 Firebase Database Structure

### Users Collection
```javascript
users: {
  uid: {
    name: string,
    email: string,
    role: "teacher" | "student",
    createdAt: timestamp,
    badges: string[] // For students
  }
}
```

### Quizzes Collection
```javascript
quizzes: {
  quizId: {
    title: string,
    description: string,
    category: string,
    difficulty: "Easy" | "Medium" | "Hard",
    timer: number,
    timerPerQuestion: boolean,
    questions: [{
      questionText: string,
      options: string[4],
      correctAnswer: number,
      explanation: string,
      imageUrl: string
    }],
    createdBy: uid,
    published: boolean,
    createdAt: timestamp
  }
}
```

### Results Collection
```javascript
results: {
  resultId: {
    quizId: string,
    studentId: uid,
    score: number,
    correctAnswers: number,
    totalQuestions: number,
    answers: number[],
    timestamp: timestamp,
    autoSubmitted: boolean,
    autoSubmitReason: string,
    tabSwitchCount: number
  }
}
```

## 🎨 Customization

### Color Palette
Edit `src/index.css` to change colors:
```css
:root {
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --accent: #ec4899;
  /* ... more colors */
}
```

### Easter Eggs
Add more Easter eggs in `src/components/EasterEggs.jsx`

## 🐛 Troubleshooting

### Firebase Errors
- Ensure all Firebase services are enabled
- Check security rules
- Verify API keys are correct

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

### Authentication Issues
- Enable Email/Password authentication in Firebase Console
- For Google Sign-In, add authorized domains

## 📄 License

This project is created for educational purposes.

## 🙏 Acknowledgments

- React Team for the amazing framework
- Firebase for backend services
- Framer Motion for smooth animations
- Chart.js for beautiful charts

## 📞 Support

For issues or questions, please refer to the Firebase documentation or React documentation.

---

**Built with ❤️ using React and Firebase**

Enjoy using QuizMaster! 🎉
