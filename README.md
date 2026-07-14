# ChildVision: A Multi-Modal AI System for Holistic Growth & Developmental Monitoring in Toddlers

ChildVision is an advanced, parent-facing AI screening and monitoring platform designed to support early detection of developmental delays, malnutrition indicators, and environmental safety risks in toddlers (aged 0 to 5 years). 

This repository contains the **Phase 0 Dashboard Portal Skeleton**, built as a responsive, high-performance web application utilizing **Next.js (App Router)**, **Vanilla CSS** for premium aesthetics, and **Firebase** for cloud authentication and database storage.

---

## 🌟 Key Features (Phase 0 Complete)

- **Premium Responsive Landing Page**: A beautifully designed product overview, module descriptions, and quick navigation.
- **Firebase Cloud Authentication**: Secure parent registration and login running in the cloud via Firebase Auth (`createUserWithEmailAndPassword` & `signInWithEmailAndPassword`).
- **Firestore User Profiles**: On sign-up, stores parent and toddler data (name, gender, date of birth) in a Firestore `users` collection.
- **Dynamic Age Calculation**: Translates toddler birthdates into months dynamically, conforming to WHO anthropometric standards.
- **Secure Portal Sessions**: Implements Firebase state observers (`onAuthStateChanged`). Unauthenticated attempts to access `/dashboard` are immediately redirected to `/login`.
- **Unified Parent Dashboard**: 
  - **Daily Snapshot & Metrics**: Dynamic placeholder panels for height, weight, and safety status.
  - **Circular Wellness Score**: Interactive radial score indicator showing scanning readiness.
  - **Tabbed Module Navigation**: Accessible layouts displaying future capabilities for each of the 4 core AI modules.
  - **Configuration Settings View**: Displays registered profile details and connection references.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- A Firebase project ([Firebase Console](https://console.firebase.google.com/))

### Configuration (Environment Variables)

To test the application locally, you must connect it to your Firebase instance:

1. Create a `.env.local` file at the root of the project:
   ```bash
   cp .env.example .env.local
   ```
2. Open your new `.env.local` file and populate it with your Firebase Web App credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA1...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Firebase Setup
Before launching, make sure the following are enabled in your **Firebase Console**:
1. **Authentication**: Enable the **Email/Password** sign-in provider.
2. **Cloud Firestore**: Create a database (start in **Test Mode** for initial local testing).

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the local development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser. Register an account and watch the console collections update in real time.

---

## ⚡ Deployment

This application is fully build-verified and ready for instant deployment on cloud platforms.

### Vercel (Recommended)
1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and import `ChildVision_MP` from your GitHub account.
3. In the **Environment Variables** configuration section, copy the keys and values from your `.env.local` file.
4. Click **Deploy**.

---

## 📂 Project Structure

```
ChildVision_MP/
├── public/                 # Static assets
└── src/
    ├── lib/
    │   └── firebase.ts     # Firebase Auth and Firestore Initialization
    └── app/                # App Router Pages
        ├── dashboard/      # Portal View (Overview, Module Tabs, Config)
        ├── login/          # Firebase Authentication login
        ├── signup/         # Firebase parent registration and toddler details
        ├── globals.css     # Premium Vanilla CSS Design Tokens & Styles
        ├── layout.tsx      # Global Meta Tags & Page Glow Wrappers
        └── page.tsx        # Product Landing Page
```

---

## 🛠️ Future AI Roadmap (Next Phases)

- **Module 1 — Physical Growth**: Height estimation using pose scale vectors and weight estimation via MiDaS depth cylinder approximations.
- **Module 2 — Nutritional Health**: Anemia conjunctiva pallor analysis (LAB A-channel), cheek Oedema ratios, and MUAC arm segmentation.
- **Module 3 — Behavioral & Cognitive**: Motor coordination milestone classifiers (ViTPose), gaze-ASD screeners, name-response latency, and VideoMAE play patterns.
- **Module 4 — Environment & Safety**: YOLOv8 infant detection inside custom OpenCV safety polygons, sleep posture safety checks, and screen time calculators.
