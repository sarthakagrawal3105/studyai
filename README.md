# 🎓 StudyAI — Your Personalized AI Tutor

StudyAI is a next-generation, all-in-one AI study platform designed to transform how students approach their curriculum. By leveraging the power of Google’s Gemini API, StudyAI parses complex syllabi, generates personalized learning roadmaps, and creates intelligent assessment loops to ensure mastery of every topic.

---

## ✨ Key Features

### 📅 AI Syllabus Planner
Upload your syllabus or text and watch StudyAI generate a **week-by-week study roadmap**. It breaks down complex subjects into digestible topics with specific learning objectives.

### 📝 Intelligent Test Engine (MCQs)
Complete a topic and instantly generate a **10-question MCQ assessment**. The AI evaluates your understanding and tracks your performance over time.

### 🔄 Advanced API Key Rotation
Built-in resilience against 429 rate limits. StudyAI dynamically cycles through multiple Gemini API keys to ensure uninterrupted service, even on free tier quotas.

### 📱 Cross-Platform Support
Built with **Capacitor**, StudyAI runs seamlessly as a modern web application and as a native **Android application**.

### 📊 Progress Tracking & Dashboard
Visualize your study streaks, topic completion rates, and subject mastery through a sleek, animated dashboard.

### 🌌 3D Knowledge Graph
Interactive 3D visualization of your study subjects and topics using `react-force-graph-3d`, helping you see the connections between your learnings.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/) (with custom key rotation logic)
- **Database**: [PostgreSQL (Supabase)](https://supabase.com/) via [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/) (Phone & Google login)
- **Mobile**: [Capacitor JS](https://capacitorjs.com/) (Android)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or later
- A Supabase project (for PostgreSQL)
- Firebase project credentials
- Gemini API Key(s)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sarthakagrawal3105/studyai.git
   cd studyai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file and add your credentials:
   ```env
   # Database
   DATABASE_URL="your_supabase_postgresql_url"

   # AI - Add multiple keys separated by commas for rotation
   GEMINI_API_KEY="key1, key2, key3"

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY="..."
   # ... other firebase vars
   ```

4. **Database Migration:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📱 Mobile Deployment (Android)

To sync the web build with the Android project:

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## 🧩 Project Structure

- `/app`: Next.js pages, actions, and layouts.
- `/components`: Reusable UI components (Sidebar, Navbar, AI Cards).
- `/lib`: Core utilities (Gemini rotation logic, Firebase config, Prisma client).
- `/prisma`: Database schema and migrations.
- `/android`: Capacitor-generated Android project files.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ for students, by [Sarthak Agrawal](https://github.com/sarthakagrawal3105)**
