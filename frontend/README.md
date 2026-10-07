# upay Sentinel — Fraud Defense Cloud Frontend

Next-generation AI Trust & Risk Intelligence Client Interface built for the **DIU CPC × upay AI Hackathon 2026**.

---

## ⚡ Features & UI Suites

- **3D Geospatial Defense Grid**: Real-time Three.js orbital globe showing Bangladesh MFS hubs (Dhaka Central, Chattogram, Sylhet, Rajshahi, Khulna), streaming transaction packets, live TPS velocity counter.
- **Judge Demo Hub**: One-click attack simulation (Account Takeover ATO, Mule Ring Syndicate, SIM Swap Drain, Smurfing Burst, Normal Merchant Pay).
- **Intelligence Suite**:
  - `Overview`: Live telemetry wave charts, risk distribution donut, KPI cards, AI intelligence insights.
  - `Transaction Monitor`: Real-time streaming transaction ledger with filters, search, and slide-out inspection drawer.
  - `Risk Intelligence`: Breakdown of XGBoost model, Isolation Forest anomaly scoring, and regulatory rule engine.
  - `Fraud Network`: Interactive graph topology visualization of mule cluster networks.
  - `Investigations`: Case dossier management, evidence timelines, and human oversight actions.
  - `Customers`: Behavioral profiles, baseline deviation indicators, KYC tiers.
  - `Alert Center`: Risk triage, severity tags, and escalation workflows.
  - `Analytics`: Risk trends, financial loss prevention ROI, and audit logs.
- **Audit Reports & Compliance**: One-click downloadable compliance summary.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The frontend development server will launch at: **`http://localhost:5173`**

All `/api/*` endpoints are automatically proxied to the backend at `http://localhost:3001`.

### 3. Production Build
```bash
npm run build
npm run preview
```
