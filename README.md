# InfratechAI QA Manager

A modern, high-velocity QA Test Execution, Test Suite Management, and Defect Tracking web application built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons**. Pre-configured for **Firebase Firestore** real-time sync and **Vercel** zero-configuration deployment.

---

## ✨ Features

- 🏢 **Multi-Project Workspaces**: Manage independent testing workspaces and release suites.
- 📊 **Executive QA Dashboard**: Live pass rate, execution coverage progress bar, defect metrics, and suite breakdowns.
- ⚡ **Lightning Test Execution Workspace**:
  - Keyboard shortcuts: `P` (Pass), `F` (Fail & Log Bug), `B` (Blocked), `N` (Next), `/` (Search).
  - Floating action dock.
  - Auto-saving state with persistent test notes and actual results.
- 🐞 **Complete Defect & Issues Tracking**:
  - Full lifecycle tracking: `Open`, `In Progress`, `Resolved`, `Closed`.
  - Severity (`Critical`, `High`, `Medium`, `Low`) and Priority (`P0` - `P3`) badges.
  - Automatic linkage to failed test cases.
- 📥 **Intelligent Bulk Import**:
  - Plain-text parser supporting `TC001`, `Steps:`, and `Expected Result:` patterns.
  - Side-by-side live preview before importing.
- 💾 **Dual-Layer Database**:
  - Works out-of-the-box in **Local Storage mode** (zero configuration required).
  - Instantly activates **Firebase Firestore cloud sync** when credentials are provided.
  - One-click JSON backup export and restore.

---

## 📁 Project Structure

```
InfratechAI_QA_Manager/
├── .env.example                  # Template for Firebase environment variables
├── vercel.json                   # Vercel SPA routing and asset caching
├── package.json                  # Dependencies & build scripts
├── vite.config.js                # Vite + React + Tailwind v4 config
├── index.html                    # HTML entry point with Inter font
├── src/
│   ├── main.jsx                  # React DOM mount point
│   ├── App.jsx                   # Core application container & state router
│   ├── index.css                 # Tailwind directives & global styling
│   ├── config/
│   │   └── firebase.js           # Firebase app initialization & status detection
│   ├── services/
│   │   ├── db.js                 # Unified database (Firestore + LocalStorage fallback)
│   │   └── parser.js             # Bulk plain-text parser logic
│   ├── constants/
│   │   └── seedData.js           # Initial demo test cases, files, and defects
│   ├── utils/
│   │   └── formatters.js         # Date formatting, IDs, and badge styles
│   └── components/
│       ├── layout/
│       │   └── Sidebar.jsx       # Left sidebar navigation, project switch & cloud pill
│       ├── projects/
│       │   └── ProjectsView.jsx  # Workspace cards & project creator
│       ├── dashboard/
│       │   └── DashboardView.jsx # KPI cards, coverage bar, defect breakdown
│       ├── execution/
│       │   └── ExecutionWorkspace.jsx # Test runner with floating dock & hotkeys
│       ├── testFiles/
│       │   └── TestFilesView.jsx # Test suites management & test case table
│       ├── bugs/
│       │   └── BugsView.jsx      # Defects management, status board & filters
│       ├── import/
│       │   └── BulkImportView.jsx# Text parser & batch import preview
│       └── modals/
│           ├── BugModal.jsx      # Defect logger modal
│           └── FirebaseModal.jsx # Cloud setup instructions & sync status
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The app will open immediately in **Local Storage mode** with sample test data ready for execution.

---

## 🔥 Connecting Firebase Firestore

To make the app persist in the cloud across all your devices:

1. Visit the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Go to **Build → Firestore Database** and click **Create Database**. Set your private user-scoped security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Only authenticated users can access their own private workspace data
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
3. Go to **Build → Authentication** → **Sign-in method** → Enable **Email/Password**.

3. Go to **Project Settings** (gear icon) → **General** → scroll down to **Your apps** and click the **Web (`</>`)** icon.
4. Register your app name and copy the `firebaseConfig` keys.
5. Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```
6. Fill in your Firebase values:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-app
   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
   VITE_FIREBASE_APP_ID=1:123456789:web:...
   ```
7. Restart your dev server (`npm run dev`). The status badge in the sidebar will display **Firestore Synced** in green!

---

## 🌐 Deploying to Vercel (Live in 2 minutes)

### Option A: Using GitHub & Vercel Dashboard (Recommended)
1. Push this directory to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of InfratechAI QA Manager"
   git branch -M main
   git remote add origin https://github.com/your-username/InfratechAI_QA_Manager.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) and click **Add New... → Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add the same `VITE_FIREBASE_*` variables from your `.env.local`.
5. Click **Deploy**. Vercel will build and deploy your application automatically with a custom `*.vercel.app` URL.

### Option B: Using Vercel CLI
```bash
npm i -g vercel
vercel
```
Follow the prompts and provide your environment variables when prompted.

---

## ⌨️ Keyboard Shortcuts (Test Execution)

| Key | Action |
| --- | --- |
| `P` | Mark test case **Pass** and auto-advance to next test |
| `F` | Mark test case **Fail** and open Defect Logger popup |
| `B` | Mark test case **Blocked** |
| `N` | Next test case (`Shift + N` for previous test) |
| `/` | Focus search filter input |
