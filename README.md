# 🚶‍♂️ UrbanEase AI — Accessibility-First Urban Mobility

**Inclusive navigation, voice guidance, and barrier intelligence for smarter, barrier-free cities.**

> UrbanEase AI is designed around how people actually move — providing step-free routing, ramp verification, voice interaction in Indian languages, and community barrier reporting.

---

## 🌟 Key Features

- 🗺️ **Interactive OpenStreetMap + Leaflet Engine**: Real pedestrian routing rendered live with step-by-step maneuvers and accessible custom markers.
- 🦽 **Accessibility-First Routing (OSRM)**: Calculates step-free paths, avoids steep slopes and broken elevators, with live accessibility score evaluation.
- 🎙️ **Multilingual Voice Assistant**: Natural speech synthesis and voice commands in **English, Hindi (हिंदी), and Marathi (मराठी)** powered by the native Web Speech API.
- 📍 **Live Geocoding (Nominatim)**: Instant location and landmark search across Mumbai (Bandra West, Hill Road, Dadar, etc.) with automatic fallback.
- 🚧 **Community Barrier Reporting**: Report broken ramps, blocked sidewalks, missing audio zebra crossings, and potholes with automatic sync to **Supabase** (with resilient local offline fallback).
- ⚙️ **Personalized Mobility Profiles**: Tailor navigation for wheelchairs, motorized mobility, walkers, visually impaired users, or strollers.
- 🌓 **High-Contrast & Low-Sensory Modes**: Meets WCAG 2.1 AA accessibility standards with accessible font scaling and high-contrast palettes.
- 📊 **Smart City IoT & Analytics**: Real-time sensor simulation for accessible pedestrian crossings, curb status, and elevator uptime.
- 🎓 **Academic Curriculum Mapping**: Demonstrates principles from Computer Networks, Theory of Computation, IoT, Cybersecurity, and Data Warehousing & Mining.

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Runtime & Framework** | React 19, TypeScript 5.7, Vite 8 |
| **Styling** | Tailwind CSS v4, Custom CSS tokens |
| **Mapping Engine** | Leaflet 1.9, OpenStreetMap |
| **Pedestrian Routing** | Project OSRM Public Pedestrian API |
| **Geocoding** | Nominatim (OpenStreetMap) |
| **Cloud Backend** | Supabase (PostgreSQL, Row Level Security, Auth) |
| **Speech Engine** | Native Web Speech Recognition & SpeechSynthesis |
| **Icons** | Custom Accessible SVG Icons & Lucide React |

---

## 🚀 Quick Start Guide (Run Locally)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or newer recommended)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (or your preferred editor)

### 2. Clone the Repository
```bash
git clone https://github.com/nidhidubey55578-web/UrbanEaseAI.git
cd UrbanEaseAI
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Copy `.env.example` to create your `.env.local`:
```bash
cp .env.example .env.local
```
*(On Windows PowerShell, use `Copy-Item .env.example .env.local`)*

Open `.env.local` and add your Supabase credentials (optional — the app works fully offline with local fallback even without Supabase):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OSRM_API_BASE=https://router.project-osrm.org
VITE_NOMINATIM_API_BASE=https://nominatim.openstreetmap.org
```

### 5. Launch the Development Server
```bash
npm run dev
```

Open **[http://localhost:8443](http://localhost:8443)** in your browser to interact with the application.

---

## 📂 Project Structure

```
UrbanEaseAI/
├── .env.example              # Template environment variables
├── .gitignore                # Git ignore configuration
├── index.html                # Application HTML shell
├── package.json              # Dependencies and build scripts
├── vite.config.ts            # Vite & Tailwind CSS configuration
├── supabase/
│   └── schema.sql            # Supabase database schema & RLS policies
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Main controller with 32 interactive screens
    ├── index.css             # Design system tokens and styles
    ├── types.ts              # Core TypeScript type definitions
    ├── components/
    │   ├── Icons.tsx         # Accessible SVG icon suite
    │   └── InteractiveMap.tsx# Leaflet interactive map component
    ├── data/
    │   └── mockData.ts       # Mumbai landmarks, routes, and academic data
    ├── i18n/
    │   └── translations.ts   # English, Hindi & Marathi translations
    ├── lib/
    │   └── supabase.ts       # Supabase client and sync services
    └── services/
        └── routingService.ts # Real OSRM and Nominatim integration
```

---

## 🗄️ Database Setup (Supabase)

To enable live cloud sync for barrier reports and user preferences:

1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** from the left navigation.
4. Copy and paste the contents of `supabase/schema.sql` and click **Run**.
5. Copy your **Project URL** and **anon public key** from *Project Settings → API* into `.env.local`.

---

## 📱 Interactive Screens Included

1. **Splash & Brand Intro**: Accessible welcome screen with smooth transitions
2. **Onboarding Carousel**: 4-part mobility feature tour
3. **Accessibility Setup**: Fine-grained mobility requirements
4. **Voice Assistant Setup**: Voice control in English, Hindi, or Marathi
5. **Home Dashboard**: Quick actions, nearby accessible transit, and city status
6. **Voice Interactive Screen**: Real-time microphone listening and spoken responses
7. **Route Planner**: Origin/destination search with accessibility filters
8. **Route Comparison**: Compare routes A, B, and C by slope, time, and step-free score
9. **Turn-by-Turn Journey**: Active navigation with live maneuver cues and map view
10. **Barrier Reporting**: Multi-step barrier submission with severity levels
11. **Saved Places**: Frequently visited accessible venues
12. **Smart City IoT Monitor**: Sensor status across pedestrian crossings
13. **Academic System Mapping**: Semester V Computer Engineering project curriculum alignment

---

## 📄 License

This prototype is created for educational and academic research purposes under the **MIT License**.
