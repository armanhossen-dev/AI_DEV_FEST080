# upay Sentinel — Backend API & Service Contract

**Platform**: upay Sentinel — Trust & Risk Intelligence  
**Document**: `docs/BACKEND_CONTRACT.md`  
**Purpose**: Stable contract specification for services, endpoints, input schemas, and return types.

---

## 1. Risk Evaluation & Analysis

### `analyzeTransaction(transactionId: string): Promise<MasterRiskAnalysisResult>`
- **Description**: Orchestrates full multi-stage risk evaluation for a transaction (feature extraction, XGBoost fraud scoring, Isolation Forest anomaly detection, behavioral baseline comparison, risk fusion, explainability factors, advisory action generation, and database persistence).
- **Parameters**: `transactionId` (UUID string).
- **Returns**:
```typescript
{
  transactionId: string;
  fraudProbability: number;     // 0.00 – 1.00
  fraudScore: number;           // 0 – 100
  anomalyScore: number;         // 0 – 100
  behaviorScore: number;        // 0 – 100
  contextualScore: number;      // 0 – 100
  finalRiskScore: number;       // 0 – 100 (Calibrated composite)
  riskLevel: "low" | "medium" | "high" | "critical";
  confidence: number;           // 0 – 100 (Calculated independently)
  factors: Array<{
    factor_code: string;
    factor_name: string;
    description: string;
    contribution: number;
    severity: "low" | "medium" | "high" | "critical";
    evidence: string;
  }>;
  recommendation: {
    actionCode: "ALLOW" | "MONITOR" | "VERIFY" | "HOLD";
    title: string;
    description: string;
    advisoryDisclaimer: string;
  };
  modelVersion: string;
}
```

---

## 2. Transactions Service

### `getTransactions(options?: GetTransactionsOptions): Promise<GetTransactionsResult>`
- **Parameters**:
  - `page`: number (default: 1)
  - `limit`: number (default: 25)
  - `search`: string (filters by reference, sender, receiver, location)
  - `riskLevel`: `"all" | "low" | "medium" | "high" | "critical"`
  - `status`: `"all" | "completed" | "pending" | "held" | "blocked" | "under_review"`
  - `sortBy`: `"recent" | "risk" | "amount"`
- **Returns**: `{ transactions: DbTransactionWithAssessment[], totalCount: number }`

### `getTransaction(id: string): Promise<{ transaction: DbTransaction; assessment: RiskAssessment; features: TransactionFeatures; factors: RiskFactorItem[] } | null>`
- **Parameters**: `id` (UUID or transaction reference string).

### `searchTransactions(query: string, limit?: number)`
- **Parameters**: `query` (search keyword), `limit` (optional, default: 10).

### `getRecentTransactions(limit?: number, customerId?: string)`
- **Parameters**: `limit` (max 25), `customerId` (optional customer filter).

### `getRelatedTransactions(transactionId: string, limit?: number)`
- **Parameters**: `transactionId` (anchor transaction ID), `limit` (default: 5).

---

## 3. Investigation & Human Decision Services

### `getInvestigations(statusFilter?: string): Promise<InvestigationCase[]>`
- **Parameters**: `statusFilter` (`"all" | "open" | "investigating" | "resolved" | "escalated"`).

### `getInvestigation(id: string): Promise<InvestigationCase | null>`
- **Parameters**: `id` (case UUID).

### `createInvestigation(params)`
- **Parameters**: `{ transactionId: string, assignedTo?: string, priority?: RiskSeverity, initialNotes?: string }`.

### `assignInvestigation(investigationId: string, assignee: string, actorName: string)`
- **Action**: Updates assignee and records immutable audit action.

### `addInvestigatorNote(investigationId: string, noteText: string, actorName: string)`
- **Action**: Appends note to case and logs audit event.

### `approveTransaction(transactionId: string, actorName: string, notes?: string)`
- **Human Action**: Marks status as `completed`, resolves active investigation, logs audit record.

### `holdTransaction(transactionId: string, actorName: string, notes?: string)`
- **Human Action**: Marks status as `held`, transitions investigation to `investigating`, logs audit record.

### `blockTransaction(transactionId: string, actorName: string, notes?: string)`
- **Human Action**: Marks status as `blocked`, resolves investigation with decision `blocked`, logs audit record.

### `escalateInvestigation(transactionId: string, actorName: string, notes?: string)`
- **Human Action**: Marks status as `under_review`, sets priority to `critical`, logs audit record.

### `markFalsePositive(transactionId: string, actorName: string, notes?: string)`
- **Human Action**: Marks decision as `false_positive`, sets status `completed`, logs audit record.

### `getAuditTrail(investigationId: string): Promise<InvestigationAction[]>`
- **Returns**: Complete chronological list of investigator actions.

---

## 4. Sentinel Copilot AI Intelligence

### `askSentinelCopilot(params: { question: string; transactionId?: string; investigationId?: string }): Promise<CopilotResponse>`
- **Endpoint**: `POST /api/copilot/chat`
- **Output Schema**: Strict Zod validation
```typescript
{
  intent: string;
  summary: string;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_score: number;
  key_findings: string[];
  evidence: string[];
  recommended_actions: string[];
  requires_human_review: boolean;
  confidence: number;
  referenced_transaction_ids: string[];
  referenced_investigation_ids: string[];
  activity_trace: string[];
}
```

### `generateDailyRiskBriefing(): Promise<RiskBriefingResult>`
- **Endpoint**: `GET /api/copilot/briefing`
- **Returns**: Real-time aggregated briefing with critical alert count, high-risk alert count, open investigations, prevented loss, and emerging fraud patterns.

---

## 5. Analytics & Dashboard Telemetry

### `fetchAnalyticsData(): Promise<AnalyticsData>`
- **Endpoint**: `GET /api/analytics`
- **Returns**: Live fleetwide metrics (`transactionsMonitored`, `highRiskTransactions`, `criticalAlerts`, `underInvestigation`, `blockedTransactions`, `estimatedPreventedLoss`, `falsePositiveRate`, `riskDistribution`, `topRiskFactors`).
