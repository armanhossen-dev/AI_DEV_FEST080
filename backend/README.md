# upay Sentinel — Backend Intelligence Layer

Enterprise Risk & Trust Intelligence Backend for Mobile Financial Services (MFS) built for the **DIU CPC × upay AI Hackathon 2026**.

---

## ⚡ Tech Stack & Architecture

- **Runtime & Server**: Node.js + Express 5 + TypeScript + `tsx`
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **AI & Copilot**: Google Gemini 2.5 (`@google/genai` with Function Calling & Grounded Tool Execution)
- **ML Risk Engine**: XGBoost Fraud Scoring, Isolation Forest Anomaly Detection, Velocity Sliding Windows, Risk Fusion (0–100)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Verify `.env` has:
```env
PORT=3001
VITE_SUPABASE_URL=https://odexyyeipgspqvdepvoi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_pSbK4D35fp2K5UCtunJN2Q_nKjfzvhB
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Run Server
```bash
# Development mode with auto-reload
npm run dev

# Production start
npm start
```

Server runs on: **`http://localhost:3001`**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System telemetry, model states, DB connection |
| `GET` | `/api/transactions` | Paginated transactions with risk scores & filters |
| `POST` | `/api/transactions` | Ingest new transaction into pipeline |
| `POST` | `/api/risk/evaluate` | ML Ensemble risk scoring (0–100) & SHAP explainability |
| `POST` | `/api/scenarios/run` | One-click attack simulation (ATO, Mule Ring, SIM Swap, etc.) |
| `POST` | `/api/copilot/chat` | Gemini Copilot conversational assistant with tool calling |
| `POST` | `/api/copilot/explain` | Structured explanation of high-risk factors |
| `POST` | `/api/copilot/action` | AI recommended decision action (Approve / Hold / Block / Escalate) |
| `GET` | `/api/investigations` | Active investigation cases and dossiers |
| `GET` | `/api/metrics` | Portfolio metrics, loss prevention, volume stats |
