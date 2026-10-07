# upay Sentinel 🛡️

**upay Sentinel** is an AI-powered Fraud & Scam Intelligence platform designed to identify, analyze, and mitigate fraudulent transactions (such as account takeovers, money mule syndicates, and micro-structuring velocity bursts) in real time. 

Built for the upay AI Hackathon, Sentinel leverages **Google's Gemini AI** to provide an intelligent Copilot for fraud analysts, automatically evaluating transaction telemetry and suggesting concrete mitigation steps.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Environment Setup
You need a Gemini API Key to power the AI features.
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a `.env` file in the root of the project (or copy from a template if one exists):
```bash
GEMINI_API_KEY=your_api_key_here
```

### 4. Running the Development Server
Because Next.js caches build files aggressively, if you encounter `.next/` caching errors, it is recommended to clear the cache before starting the server:

```bash
rm -rf .next
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Project Architecture & How It Works

This project is built using **Next.js 14+ (App Router)**, **React**, **Tailwind CSS**, and **Lucide Icons**. 

### Directory Structure

```text
upay-Sentinel/
├── .env                    # Environment variables (Gemini API Key)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/gemini/     # Backend API Routes connecting to Google Gemini
│   │   ├── globals.css     # Global CSS, Design Tokens, & Animations
│   │   ├── layout.tsx      # Root HTML layout and font definitions
│   │   └── page.tsx        # Main Application Shell (State management for sidebars & modals)
│   ├── components/         # React Components
│   │   ├── layout/         # Topbar, Sidebar, Navigation
│   │   ├── overview/       # Dashboard KPI Cards & Charts
│   │   ├── transactions/   # Transaction Monitoring List & Detail Drawer
│   │   ├── network/        # Fraud Network Intelligence & Node Graphs
│   │   ├── investigations/ # Deep-dive Investigation View & Sentinel Assistant Chat
│   │   ├── simulation/     # Attack Simulator Modal
│   │   └── ui/             # Reusable UI elements (AppTour walkthrough, Settings)
│   ├── lib/                # Utilities and API logic
│   │   ├── data.ts         # Mock dataset for dashboard, transactions, and ML training
│   │   ├── fraud-engine.ts # Rule-based deterministic scoring logic
│   │   ├── ml-engine.ts    # TensorFlow.js neural network for AI Overdrive scoring
│   │   └── gemini.ts       # Core logic for calling the Gemini API & Fallback behaviors
│   └── types/              # TypeScript interface definitions
```

### Core Features Explained

#### 1. The Dashboard Shell (`page.tsx` & `layout/`)
The main layout consists of a `Sidebar` and a `Topbar`. `page.tsx` acts as the master controller, maintaining the state for which view is currently active (Overview, Transactions, Investigations, etc.) and managing the visibility of sidebars and modals. It uses a robust, fluid, mobile-first CSS architecture defined in `globals.css`.

#### 2. AI Investigation Engine (`lib/gemini.ts` & `api/gemini/investigate`)
When a transaction is flagged or an analyst opens an investigation, the frontend hits the local Next.js `/api/gemini/investigate` route. 
- This route passes the transaction telemetry (Amount, Device, Location, Risk Score, etc.) to `lib/gemini.ts`.
- `gemini.ts` constructs a highly specific prompt instructing the Gemini model (e.g., `gemini-flash-latest`) to act as a fraud analyst.
- It asks the AI to answer three things: *What happened? Why is it risky? What should upay do next?*
- The AI's response is parsed as JSON and displayed in the **InvestigationDetailView**.

#### 3. Sentinel Copilot Chat (`SentinelAssistant.tsx` & `api/gemini/chat`)
Inside an active investigation, analysts can chat with the AI. 
- The chat context (Case ID, Customer, Amount, Risk Score) is bundled with the analyst's question.
- The Gemini model synthesizes an evidence-backed answer based on the transaction's unique topology and behavioral anomalies.
- If the Gemini API fails or times out, the system automatically degrades gracefully to a "High-fidelity heuristic synthesis" (local fallback logic) to ensure the analyst always receives guidance.

#### 4. Live Attack Simulator (`SimulationModal.tsx`)
To demonstrate the platform's capabilities, the topbar includes a "Simulate Attack" button (lightning bolt icon).
- This opens a modal where you can inject synthetic fraud vectors (e.g., a Mule Network Surge, Account Takeover, or Micro-structuring Burst).
- Injecting a transaction instantly adds it to the monitoring feed, calculates a risk score, and allows you to open a full AI investigation on it.

#### 5. Local Machine Learning Engine (`ml-engine.ts`)
The platform uses **TensorFlow.js** to train a lightweight sequential neural network directly in the browser upon startup.
- It leverages the dataset in `data.ts` to recognize patterns (velocity flags, location anomalies, new devices).
- When new transactions stream in, the ML model provides a probabilistic "AI Overdrive" score that can override legacy heuristic rules if it identifies hidden risk factors.

#### 6. Guided App Tour (`AppTour.tsx`)
A built-in interactive walkthrough (powered by `react-joyride`) guides new users through the platform, blurring the background to focus on key areas such as the Transaction Monitor, Simulator, and Network Intelligence views.

---

## 🎨 Design System
The UI relies heavily on a centralized design token system located in `src/app/globals.css`. It uses CSS variables (`--green`, `--red`, `--radius-lg`) to maintain a clean, professional, and consistent minimal aesthetic. It is fully responsive, utilizing CSS Grid and Flexbox to adapt from large desktop monitors down to mobile devices.
