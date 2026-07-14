# ChildVision: A Multi-Modal AI System for Holistic Growth & Developmental Monitoring in Toddlers

ChildVision is an advanced, parent-facing AI screening and monitoring platform designed to support early detection of developmental delays, malnutrition indicators, and environmental safety risks in toddlers (aged 0 to 5 years). 

This repository contains the **Phase 0 Dashboard Portal Skeleton**, built as a responsive, high-performance web application utilizing **Next.js (App Router)** and **Vanilla CSS** for premium aesthetics and maximum deployment flexibility.

---

## 🌟 Key Features (Phase 0 Skeleton)

- **Premium Responsive Landing Page**: A beautifully designed product overview, module descriptions, and quick navigation.
- **Mock Authentication & Registration**: Parents can register their account, detail their toddler's profile (name, gender, date of birth), sign in, and establish active dashboard portal sessions.
- **Dynamic Age Calculation**: Translates toddler birthdates into months, conforming to WHO anthropometric tracking standards.
- **Unified Parent Dashboard**: 
  - **Daily Snapshot & Metrics**: Dynamic placeholder panels for height, weight, and safety status.
  - **Circular Wellness Score**: Interactive radial score indicator showing scanning readiness.
  - **Tabbed Module Navigation**: Accessible layouts displaying future capabilities for each of the 4 core AI modules.
  - **Database Configuration Settings**: Inputs for future MongoDB or Firebase Web configurations to support longitudinal data persistence.

---

## 🛠️ The 4 Core AI Modules (Future Roadmap)

### 🟦 Module 1 — Physical Growth Monitoring
- **Height Estimation**: Dual-coordinate keypoint parsing using MediaPipe Pose, scaled with known 30cm calibration references.
- **Weight Estimation**: Body volume approximations integrating 2D silhouettes and MiDaS monocular depth maps.
- **WHO Z-Scores**: Dynamic statistical calculations lookup (LMS method) to map stunting and wasting percentages.
- **Malnutrition CNN**: Transfer learning on pre-trained ResNet-50 / EfficientNet models to classify physical malnutrition.

### 🟩 Module 2 — Nutritional Health Screening
- **Conjunctival Pallor**: Precise eyelid segmentation mapped to the LAB color space (A-channel) for anemia screening.
- **Oedema Analysis**: Cheekbone-to-jaw ratio landmark math to spot protein-deficiency swelling.
- **MUAC Measurements**: Mask R-CNN upper arm segmentation + dual-view ellipse formula ($C \approx \pi \sqrt{2(a^2 + b^2)}$) utilizing an A4 paper calibration reference.
- **Meal Logs**: Food classification (Food-101) linked to the USDA API for dietary diversity cross-referencing.

### 🟨 Module 3 — Behavioral & Cognitive Monitoring
- **Motor Milestones**: ViTPose/HRNet gross motor classification (crawling, standing, walking, gait analysis).
- **Gaze Tracking**: MediaPipe Face Mesh iris positioning to calculate social gaze ratios (ASD screening signal).
- **Sound-Response**: Evaluates auditory-response latency (3D head yaw/pitch orientation checks after audio triggers).
- **Social & Play**: YOLOv8-pose multi-person tracking, mutual gaze vectors, and VideoMAE play-type classifiers.

### 🟥 Module 4 — Environment Interaction & Safety
- **Danger Zones**: OpenCV dynamic polygon boundaries around household hazards (stairs, kitchen) with YOLOv8 baby trackers.
- **Safety Logs**: Fall detection (torso angle + velocity limits) and night-mode prone sleep posture alerts.
- **Screen Time & Objects**: Gaze-to-screen intersection logs and cognitive stimulation interaction timers.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GamerBhai02/ChildVision_MP.git
   cd ChildVision_MP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## ⚡ Deployment

This application is fully build-verified and ready for instant deployment on cloud platforms.

### Vercel (Recommended)
The project is optimized for Vercel serverless functions and frontend delivery.
1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and import `ChildVision_MP` from your GitHub account.
3. Leave build settings as default (Next.js preset) and click **Deploy**.

### Render
To deploy on Render:
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect this GitHub repository.
3. Configure the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

---

## 📂 Project Structure

```
ChildVision_MP/
├── public/                 # Static assets
└── src/
    └── app/                # App Router Pages
        ├── dashboard/      # Portal View (Overview, Module Tabs, DB Configuration)
        ├── login/          # Parent Login Form
        ├── signup/         # Parent Registration & Toddler Setup
        ├── globals.css     # Premium Vanilla CSS Design Tokens & Styles
        ├── layout.tsx      # Global Meta Tags & Page Glow Wrappers
        └── page.tsx        # Product Landing Page
```

---

## 🔒 Security & Privacy

ChildVision is built on data-privacy principles. Face recognition and video parsing are client-side operations (using edge models) where possible. No audio/video data is transmitted without explicit parental authorization. Database inputs are securely configured via parent settings.
