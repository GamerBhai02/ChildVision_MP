# ChildVision: A Multi-Modal AI System for Holistic Growth & Developmental Monitoring in Toddlers

ChildVision is an advanced, parent-facing AI screening and monitoring platform designed to support early detection of developmental delays, malnutrition indicators, and environmental safety risks in toddlers (aged 0 to 5 years). 

This repository contains the **Phase 0 & Phase 1 Production App**, built as a responsive, high-performance web application utilizing **Next.js (App Router)**, **Vanilla CSS** for premium aesthetics, **Firebase** for cloud authentication, **Firestore** for longitudinal data tracking, and **Google Gemini 2.5 Flash** for clinical growth evaluations.

---

## 🌟 Key Features

### 🔑 Phase 0: Authentication & Core Infrastructure (Complete)
- **Premium Responsive Landing Page**: A beautifully designed product overview, module descriptions, and quick navigation.
- **Firebase Cloud Authentication**: Secure parent registration and login running in the cloud via Firebase Auth (`createUserWithEmailAndPassword` & `signInWithEmailAndPassword`).
- **Firestore User Profiles**: On sign-up, stores parent and toddler data (name, gender, date of birth) in a Firestore `users` collection.
- **Dynamic Age Calculation**: Translates toddler birthdates into months dynamically, conforming to WHO anthropometric standards.
- **Secure Portal Sessions**: Implements Firebase state observers (`onAuthStateChanged`). Unauthenticated attempts to access `/dashboard` are immediately redirected to `/login`.

### 📈 Phase 1: Physical Growth Monitoring & WHO Standards (Complete)
- **Official WHO Z-Scores**: Dynamic anthropometric calculations for Weight-for-Age (WAZ), Height-for-Age (HAZ), and BMI-for-Age (BAZ) using the `@pedi-growth/core` LMS table library.
- **WHO Body Proportions Analysis**: Computes the Head-to-Height Ratio (healthy range: 50%–60%) and Weight-for-Height/Length wasting indices (WFL/WFH) to monitor skeletal proportions.
- **Parent observations**: Tracks limb symmetry and spinal posture alignment reported directly by parents.
- **Interactive SVG Growth Charts**: Custom, responsive SVG graphs mapping historical growth points against standard WHO percentile curves (Median, -2 SD, +2 SD, -3 SD, +3 SD lines). Supports Height, Weight, BMI, and Head Circumference tabs.
- **Longitudinal History Log**: Flat dashboard grid listing historical measurements, exact WHO percentiles, and Z-scores, with Firestore deletion support.
- **CDC Measurement Accordions**: In-app toggled instructions walking parents through official U.S. CDC standards for measuring height and weight accurately.
- **Gemini AI Pediatric Growth Coach**: Integrated Next.js App Router API route (`/api/analyze-growth`) sending child growth timelines and visual posture logs to Google Gemini 2.5 Flash. Returns pediatrician-grade reviews, risk flags, and care guidelines, saved inside Firestore logs. Includes a medical clinical fallback if no API key is set.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- A Firebase project ([Firebase Console](https://console.firebase.google.com/))
- (Optional) A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### Configuration (Environment Variables)

To test the application locally, connect it to your Firebase instance and Gemini:

1. Create a `.env.local` file at the root of the project:
   ```bash
   cp .env.example .env.local
   ```
2. Open your new `.env.local` file and populate it with your credentials:
   ```env
   # Firebase App Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA1...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Gemini AI Config
   GEMINI_API_KEY=AIzaSyYourGeminiKeyHere...
   ```

### Firebase Setup
Before launching, make sure the following are enabled in your **Firebase Console**:
1. **Authentication**: Enable the **Email/Password** sign-in provider.
2. **Cloud Firestore**: Create a database (start in **Test Mode** for initial local testing).

---

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the local development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser. Register an account and log toddler growth stats in the Physical tab.

---

## ⚡ Deployment

This application is fully build-verified and ready for instant deployment on cloud platforms.

### Vercel (Recommended)
1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and import `ChildVision_MP` from your GitHub account.
3. In the **Environment Variables** configuration section, copy the keys and values from your `.env.local` file (including `GEMINI_API_KEY`).
4. Click **Deploy**.

---

## 📂 Project Structure

```
ChildVision_MP/
├── public/                 # Static assets
└── src/
    ├── lib/
    │   ├── firebase.ts     # Firebase Auth and Firestore Initialization
    │   ├── growth.ts       # Z-score metric computations and Firestore queries
    │   └── whoCurves.ts    # WHO LMS reference curve loaders
    └── app/                # App Router Pages
        ├── api/
        │   └── analyze-growth/ # Gemini AI Pediatric Growth Coach Route
        │       └── route.ts
        ├── dashboard/      # Portal View (Overview, Modules, Curves, Config)
        │   ├── GrowthChart.tsx # SVG Percentile plotting component
        │   └── page.tsx
        ├── login/          # Firebase Authentication login
        ├── signup/         # Firebase parent registration and toddler details
        ├── globals.css     # Premium Vanilla CSS Design Tokens & Styles
        ├── layout.tsx      # Global Meta Tags & Page Glow Wrappers
        └── page.tsx        # Product Landing Page
```

---

## 🛠️ Future AI Roadmap (Next Phases)

- **Module 2 — Nutritional Health**: Anemia conjunctiva pallor analysis (LAB A-channel), cheek Oedema ratios, and MUAC arm segmentation.
- **Module 3 — Behavioral & Cognitive**: Motor coordination milestone classifiers (ViTPose), gaze-ASD screeners, name-response latency, and VideoMAE play patterns.
- **Module 4 — Environment & Safety**: YOLOv8 infant detection inside custom OpenCV safety polygons, sleep posture safety checks, and screen time calculators.
