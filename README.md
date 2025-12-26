# QuizMaster - Online Quiz Platform

QuizMaster is a modern, feature-rich online quiz platform that allows teachers to create and manage quizzes, while students can take quizzes and track their progress.

## 🚀 Key Features

### For Teachers
- **Quiz Creation**: Intuitive quiz builder with rich text editor
- **Question Management**: Multiple choice questions with explanations
- **Quiz Analytics**: Detailed performance statistics and charts
- **Result Management**: View and export student results
- **Publish Control**: Draft/publish workflow for quizzes

### For Students
- **Quiz Library**: Browse and search available quizzes
- **Quiz Taking**: Clean, distraction-free quiz interface
- **Instant Results**: Immediate feedback with detailed explanations
- **Progress Tracking**: Performance history and statistics
- **Achievements**: Badge system for motivation

### Technical Features
- **Modern UI**: Glass-morphism design with smooth animations
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Security**: Tab-switch detection and exam mode
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Fast loading and smooth interactions

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Framer Motion** for animations
- **Chart.js** for data visualization
- **CSS3** with custom properties

### Backend
- **Node.js** with Express.js
- **MongoDB Atlas** database with Mongoose ODM
- **JWT** for authentication
- **RESTful API** architecture

### Dev Tools
- **Vite** for fast development
- **ESLint** for code quality
- **Prettier** for code formatting

## 📋 Requirements

### Frontend
- Node.js v16+ 
- npm or yarn

### Backend
- Node.js v16+
- MongoDB Atlas account
- npm or yarn

## 🔧 Setup Instructions

### Database Setup

You have two options:

#### Option 1: Use Your Existing MongoDB Atlas Connection (Recommended)

1. Update `server/.env` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://romabanik4_db_user:YOUR_ACTUAL_PASSWORD@onlinequizmaking.aeenpfm.mongodb.net/quizmaster?retryWrites=true&w=majority
   ```
2. Replace `YOUR_ACTUAL_PASSWORD` with your MongoDB database user password

#### Option 2: Create a New MongoDB Atlas Account

1. Create a MongoDB Atlas account (see [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md))
2. Create a cluster and configure database access
3. Get your MongoDB connection string
4. Update `server/.env` with your MongoDB URI

### Database Management with MongoDB Compass

To easily view and manage your database:

1. Install MongoDB Compass from [MongoDB's website](https://www.mongodb.com/try/download/compass)
2. Follow the setup guide in [MONGODB_COMPASS_SETUP.md](MONGODB_COMPASS_SETUP.md)
3. Connect to your MongoDB Atlas cluster to view collections and data

### Test User Credentials

The application comes with pre-created test users for easy testing:

**Admin/Teacher:**
- Email: `admin@test.com`
- Password: `Admin123!`

**Student:**
- Email: `student@test.com`
- Password: `Student123!`

To create additional test users, run:
```bash
cd server
npm run create-test-users
```

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Test database connection
npm run test-db

# Start development server
npm run dev
```

### Auto-activate (resume) MongoDB Atlas when site is visited

If you deploy the frontend on Vercel (or any static host) and want the database cluster to be resumed automatically when users visit the site, the server exposes a small endpoint that will call the MongoDB Atlas Resume API.

1. Set these environment variables on the server (for example via Vercel Environment Variables or your hosting provider):

```
ATLAS_PUBLIC_KEY=your_atlas_api_public_key
ATLAS_PRIVATE_KEY=your_atlas_api_private_key
ATLAS_GROUP_ID=your_atlas_project_id
ATLAS_CLUSTER_NAME=your_cluster_name
VITE_API_BASE_URL=https://your-server.example.com/api
```

2. Deploy the backend (server) so the endpoint `/api/activate-db` is reachable. The frontend call is non-blocking and will return early if the env vars are not configured.

Security note: Do NOT put Atlas API keys in the frontend; they must remain server-side. The endpoint simply proxies a resume request to Atlas and returns the response.


### Frontend Setup

```bash
# In the root directory
npm install

# Start development server
npm run dev
```

## ✅ Verifying Student Dashboard Access

To verify that students can access the dashboard after login:

1. Follow the setup instructions above
2. Use the test student credentials to log in
3. Verify access to student features as described in [VERIFY_STUDENT_ACCESS.md](VERIFY_STUDENT_ACCESS.md)

## 🛠️ Troubleshooting

If you encounter issues with student login showing "failed to fetch":

1. Check [MONGODB_TROUBLESHOOTING.md](MONGODB_TROUBLESHOOTING.md) for detailed troubleshooting steps
2. Verify the MongoDB Atlas connection
3. Ensure your IP is whitelisted
4. Confirm database user credentials

## 🎮 Usage

1. **As Teacher**:
   - Register as a teacher
   - Create quizzes using the quiz builder
   - Publish quizzes for students
   - Monitor student progress and results

2. **As Student**:
   - Register as a student
   - Browse available quizzes
   - Take quizzes
   - View results and track progress

## 📁 Project Structure

```
quizmaster/
├── server/                 # Backend API
│   ├── config/             # Database configuration
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── services/           # Business logic
│   └── server.js           # Main server file
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── Auth/           # Authentication components
│   │   ├── Student/        # Student dashboard
│   │   └── Teacher/        # Teacher dashboard
│   ├── contexts/           # React contexts
│   ├── services/           # API services
│   └── App.jsx             # Main app component
├── public/                 # Static assets
└── README.md               # This file
```

## 🔒 Security Features

- **Tab Switch Detection**: Monitors and reports tab switching during quizzes
- **Auto-Submit**: Automatically submits quiz on suspicious activity
- **Session Management**: Single session per user
- **Role-Based Access**: Teachers and students have different permissions
- **Input Validation**: Client and server-side validation

## 📊 Analytics

- **Teacher Dashboard**: Quiz statistics, student performance
- **Student Profile**: Personal progress, badges, history
- **Quiz Results**: Detailed breakdown of answers
- **Performance Charts**: Visual representation of progress

## 🎨 UI/UX Features

- **Glass-Morphism Design**: Modern, clean interface
- **Dark Mode**: Automatic theme switching
- **Responsive Layout**: Works on all devices
- **Smooth Animations**: Framer Motion powered transitions
- **Accessibility**: WCAG compliant design

## 🏆 Gamification

- **Badge System**: Earn badges for achievements
- **Progress Tracking**: Visual progress indicators
- **Leaderboards**: (Future feature) Class rankings
- **Certificates**: Completion certificates

## 🚀 Deployment

### Backend
- Deploy Node.js server to any cloud provider (AWS, Heroku, etc.)
- Configure environment variables
- Set up MongoDB Atlas database

### Frontend
- Build with `npm run build`
- Deploy to any static hosting (Vercel, Netlify, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing library
- MongoDB team for the database solution
- All contributors and users of this platform

---

**Built with ❤️ for educators and students**