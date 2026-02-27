# Frontend - LMS & Knowledge Intelligence Platform

## Overview
Modern, responsive frontend application for learners, trainers, and leadership.

## Structure
```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # State management
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── styles/          # Global styles
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global CSS
├── package.json
└── vite.config.js
```

## Tech Stack
- **Framework**: React 18 with JavaScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand / Redux Toolkit
- **Routing**: React Router v6
- **API Client**: Axios
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Video Player**: Video.js

## Pages

### Learner Interface
- `/` - Dashboard (enrolled courses, progress)
- `/courses` - Browse available courses
- `/courses/:id` - Course details
- `/learn/:courseId` - Learning interface
- `/search` - AI-powered knowledge search
- `/qa` - Question & Answer interface
- `/revision` - AI revision assistant
- `/profile` - User profile

### Trainer Interface
- `/trainer/dashboard` - Trainer dashboard
- `/trainer/courses` - Manage courses
- `/trainer/courses/new` - Create course
- `/trainer/courses/:id/edit` - Edit course
- `/trainer/upload` - Upload content
- `/trainer/analytics` - Course analytics

### Leadership Interface
- `/leadership/dashboard` - Overview & metrics
- `/leadership/readiness` - Team readiness dashboard
- `/leadership/courses` - Course performance
- `/leadership/analytics` - Advanced analytics

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
npm run preview
```

## Team Assignment
**Frontend/UX Team (2-3 members)**
- Member 1: Learner Interface & Components
- Member 2: Trainer & Content Management Interface
- Member 3: Leadership Dashboard & Analytics
