# Simplified Project Structure

This document outlines the current simplified structure of the QuizMaster application.

## Root Directory
```
quizmaster/
├── server/                 # Backend API
├── src/                    # Frontend source
├── README.md               # Main documentation
├── create-test-users.js    # Script to create test users
├── index.html              # HTML entry point
├── package.json            # Root package configuration
└── vite.config.js          # Vite configuration
```

## Backend (server/)
```
server/
├── config/                 # Database configuration
│   └── db.js              # MongoDB connection
├── middleware/             # Authentication middleware
│   └── auth.js            # JWT authentication middleware
├── models/                 # Database models
│   ├── Quiz.js            # Quiz model
│   ├── Result.js          # Result model
│   └── User.js            # User model
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── quizzes.js         # Quiz management routes
│   └── results.js         # Result management routes
├── create-test-users.js   # Script to create test users
├── debug-env.js           # Environment debugging script
├── package.json           # Server package configuration
├── server.js              # Main server file
├── setup-db.js            # Database setup script
├── test-db.js             # Database testing script
└── test-mongodb.js        # MongoDB connection test
```

## Frontend (src/)
```
src/
├── components/             # React components
│   ├── Auth/              # Authentication components
│   │   ├── Login.jsx      # Login form
│   │   ├── Register.jsx   # Registration form
│   │   └── Auth.css       # Authentication styles
│   ├── ProtectedRoute.jsx # Route protection component
│   ├── ProtectedRoute.css # Route protection styles
│   ├── Student/           # Student dashboard components
│   │   ├── Certificate.jsx     # Quiz completion certificate
│   │   ├── QuizPlayer.jsx      # Quiz taking interface
│   │   ├── QuizResult.jsx      # Quiz results display
│   │   ├── ResultPending.jsx   # Pending results display
│   │   ├── StudentProfile.jsx  # Student profile dashboard
│   │   └── StudentQuizzes.jsx  # Available quizzes list
│   └── Teacher/           # Teacher dashboard components
│       ├── QuizCreator.jsx     # Quiz creation/editing
│       ├── TeacherDashboard.jsx # Teacher main dashboard
│       └── TeacherQuizzes.jsx  # Teacher's quizzes management
├── contexts/              # React contexts
│   └── AuthContext.jsx    # Authentication context
├── services/              # API services
│   ├── api.js             # Main API service
│   ├── backupService.js   # Quiz progress backup
│   └── sessionService.js  # User session management
├── App.jsx                # Main application component
├── index.css              # Global styles
└── main.jsx               # Application entry point
```

## Key Features Retained

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (student/teacher)

### Student Features
- Quiz browsing and searching
- Quiz taking with timer
- Results viewing
- Performance tracking
- Certificate generation

### Teacher Features
- Quiz creation and editing
- Quiz management (publish/unpublish)
- Student result analytics
- Dashboard with statistics

### Technical Features
- Responsive design
- Tab-switch detection
- Session management
- RESTful API architecture
- MongoDB database integration

## Removed Components

The following non-essential components have been removed to simplify the structure:

1. **Firebase-related files** - All migrated to MongoDB
2. **Easter Eggs feature** - Non-essential fun features
3. **Session conflict handling** - Simplified authentication flow
4. **Extensive documentation** - Kept only essential README
5. **Testing scripts** - Removed development-only utilities
6. **Legacy migration files** - No longer needed

This simplified structure focuses on the core functionality of the QuizMaster application while maintaining all essential features.