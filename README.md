# StudyAI

StudyAI is an all-in-one AI-powered study application that acts as a personalized tutor, helping students plan out what to study, identify their weaknesses, and generate tailored tests.

## Features Implemented So Far (Phase 1)
- **Premium Application Shell**: A sleek, rich UI with responsive Sidebar navigation, Top Navbar, and Dark/Light Mode toggle out-of-the-box (powered by TailwindCSS v4 and Lucide standard icons).
- **Local SQLite Database Engine**: Configured local database architecture using Prisma ORM. No external connection string required!
  - Data Models defined include: `Users`, `Subjects`, `Topics`, `Study Sessions` (Pomodoro), `Tests`, and `Notes`.

## Immediate Next Steps (Phase 2)
- Integrate **Firebase Phone/Google Authentication** to handle real Indian SMS OTPs directly on the platform without external redirects.
- Build the Interactive Dashboard interface to track completion rate and study streaks.
- Build the Subject & Topic Planner interface for syllabus tracking.

## Getting Started

First, install the latest dependencies (if not already done):
```bash
npm install
```

Then, run the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application in its current state. 

### Managing the Database

To view and edit the local database graphically, Prisma provides a built-in visualizer. Open a new terminal instance and run:
```bash
npx prisma studio
```
This will open a visual database browser on `localhost:5555`.
