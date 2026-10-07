# upay Sentinel — Frontend Integration Status Report
**DIU CPC x upay AI Hackathon 2026**
**Project:** upay Sentinel (AI Fraud & Scam Intelligence Platform)
**Repository:** https://github.com/BornilMahmud/AI_DEV_FEST080.git
**Status:** FULLY INTEGRATED & OPERATIONAL

---

## 1. System Overview & Architecture

upay Sentinel is structured into a clean monorepo architecture:
- **`backend/`**: Express API gateway (port 3001), Supabase PostgreSQL 10-table relational schema with Row-Level Security, multi-model Risk Engine (XGBoost, Isolation Forest, Behavioral Baselines, Velocity Models), IP Intelligence, Bangladesh Geo-Risk, and Gemini 2.5 Copilot integration.
- **`frontend/`**: Upstream Next.js 15 + React 19 application (port 3000) featuring 3D Three.js interactive visualizations (`SentinelGlobe3D`, `CyberDefenseShield3D`, `FraudNetwork3D`), real-time threat feed, attack simulation runner, BFIU compliance report generator, and a global floating Sentinel AI Copilot widget in the bottom-right corner.
- **Port Forwarder / Backward Compatibility**: Background daemon forwarder on port 5173 redirecting automatically to port 3000.

```text
                  ┌────────────────────────────────────────┐
                  │       upay Sentinel Operations         │
                  │   Next.js 15 UI (http://localhost:3000)│
                  └───────────────────┬────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     Next.js Route Handlers    │             │      Express API Gateway      │
│   - /api/gemini/chat          │             │    (http://localhost:3001)    │
│   - /api/gemini/investigate   │             │   - /api/health               │
│   - /api/transactions         │             │   - /api/transactions         │
└──────────────┬────────────────┘             │   - /api/transactions/:id/dec │
               │                              │   - /api/copilot/chat         │
               ▼                              │   - /api/analytics            │
┌───────────────────────────────┐             └──────────────┬────────────────┘
│     Google Gemini 2.5 API     │                            │
│   (Timeout guard + Fallback)  │                            ▼
└───────────────────────────────┘             ┌───────────────────────────────┐
                                              │      Supabase PostgreSQL      │
                                              │    10 Tables, RLS, Realtime   │
                                              └───────────────────────────────┘
```

---

## 2. Integration Status by Subsystem

### A. Backend Features Found & Verified
- **Supabase Database Schema**: 10 tables actively populated with 998 transactions, risk assessments, behavioral profiles, and audit trails.
- **Express Backend Gateway**: Port 3001 active and healthy (`/api/health` returning 200 OK).
- **ML & Risk Engine**: Multi-stage risk scoring combining XGBoost fraud probability, Isolation Forest anomaly scoring, and dynamic 30-day customer envelopes.
- **IP Intelligence**: VPN, Tor exit node, datacenter ASN, and proxy detection signals.
- **Geo-Risk Engine**: 64 districts in Bangladesh with regional hubs (Dhaka, Chattogram, Sylhet, Rajshahi, Khulna).
- **Gemini Copilot**: Dual integration via Google GenAI (`gemini-2.5-flash`) with fast 5s timeout guard and deterministic grounded fallback.

### B. Frontend Features Connected & Verified
- **Overview Dashboard (`OverviewView.tsx`)**: Live KPI metrics (scanned volume, flagged count, prevented loss ৳318.5M BDT, active cases), 3D Sentinel Globe, and quick scenario triggers.
- **3D Sentinel Globe (`SentinelGlobe3D.tsx`)**: Three.js canvas visualizing Bangladesh regional hubs with real-time TPS counters (1,425+ TPS), threat rings, and transfer arcs.
- **Transaction Monitor (`TransactionMonitorView.tsx`)**: Real-time transaction list with multi-tier risk tags (Critical, High, Medium, Low), search, and live streaming simulator toggle.
- **Transaction Drawer (`TransactionDrawer.tsx`)**: Slide-out panel presenting TreeSHAP attribution factors, device fingerprinting, and approximate IP location.
- **Risk Intelligence (`RiskIntelligenceView.tsx`)**: 3D Cyber Defense Shield, ML benchmark metrics (Accuracy 96.4%, F1 0.94), ROC-AUC curve, and behavioral envelopes.
- **3D Fraud Network (`FraudNetwork3D.tsx`)**: Interactive 3D network topology analyzing Mule Syndicate Cluster #17 with wallet node details.
- **Investigation Workspace (`InvestigationsView.tsx`, `InvestigationDetailView.tsx`)**: Priority dossiers, chronological evidence audit timeline, and human decision buttons (APPROVE, HOLD, BLOCK, ESCALATE).
- **Customer Intelligence (`CustomerIntelligenceView.tsx`)**: Customer profile analysis, 30-day baseline deviation, and device trust telemetry.
- **Alert Center (`AlertCenterView.tsx`)**: Real-time triage feed with unread count badges and severity filtering.
- **Analytics View (`AnalyticsView.tsx`)**: ROI loss prevention charts, typology distributions, and resolution statistics.
- **Simulation Modal (`SimulationModal.tsx`)**: Interactive attack scenario injector supporting Account Takeover (ATO), Mule Syndicate, Velocity Burst, and SIM Swap.
- **Compliance Export (`ReportExportModal.tsx`)**: Bangladesh Bank BFIU Suspicious Transaction Report (STR/SAR) export in PDF/JSON formats.
- **Floating AI Assistant (`page.tsx`)**: Global bottom-right floating button (`fixed bottom-6 right-6 z-50`) with pulsing gold aura and online status badge that launches the Gemini Copilot assistant anywhere across all views.

---

## 3. Localhost Verification Details

- **Frontend URL**: `http://localhost:3000` (Status: 200 OK)
- **Forwarder URL**: `http://localhost:5173` (Status: 302 Redirect -> `http://localhost:3000`)
- **Backend API URL**: `http://localhost:3001` (Status: 200 OK)
- **Health Check Endpoint**: `http://localhost:3001/api/health`
- **Gemini Chat Endpoint**: `http://localhost:3000/api/gemini/chat` (Response Latency: <2.0s)
- **Build Status**: `next build` compiled 7/7 static pages with 0 errors.

---

## 4. Preservation & Design Integrity

- **Unchanged Because Already Good**:
  - Upstream 3D Three.js modules (`SentinelGlobe3D`, `CyberDefenseShield3D`, `FraudNetwork3D`)
  - Navigation architecture and responsive sidebar
  - Cyber-defense dark theme tokens and color palette
  - High-density fintech operational layout
- **Targeted Improvements Made**:
  - Attached persistent floating launcher in bottom-right for Sentinel AI Copilot with Gemini 2.5
  - Made `SentinelAssistant` adaptable for both embedded and floating modes
  - Added robust fetch timeout guards to ensure fast, failure-proof responses
  - Clean monorepo separation into `frontend/` and `backend/`
