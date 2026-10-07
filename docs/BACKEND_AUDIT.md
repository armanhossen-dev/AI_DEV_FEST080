# upay Sentinel — Backend Forensic Audit Report

**Audit Date**: 2026-10-07  
**Platform**: upay Sentinel — AI-Powered Trust & Risk Intelligence Platform  
**Scope**: Backend, Data, Security, Machine Learning, Gemini Agent, API Services  
**Constraint Enforced**: **Zero UI Modifications**. All frontend components, styles, layouts, and pages remain strictly untouched.

---

## 1. Current Architecture Overview

The system architecture implements an enterprise-grade digital financial risk intelligence pipeline:

```text
[Firebase Auth] ── ID Token ──> [Supabase Client / Postgres]
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  [Transactions]          [Customer Profiles]
                         │                         │
                         └────────────┬────────────┘
                                      ▼
                           [Feature Engineering]
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        [XGBoost Fraud Model]               [Isolation Forest Anomaly]
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      ▼
                              [Risk Fusion Engine]
                                (0–100 Score)
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
          [Explainable Factors]                [Advisory Action]
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      ▼
                        [Master Risk Orchestration]
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
          [Investigation Cases]                 [Audit Trail]
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      ▼
                          [Gemini Sentinel Copilot]
                       (Server-Side Tool Calling Loop)
                                      ▼
                              [Human Decision]
```

---

## 2. Feature Classification Summary

| Feature / Domain | Status | Evidence |
| :--- | :--- | :--- |
| **Firebase Auth Initialization** | `WORKING` | Initialized modular Firebase in `src/lib/firebase/firebase.ts`, session persistence, email/pwd and Google sign-in. |
| **Firebase → Supabase Auth Token** | `WORKING` | Bearer token passing via `src/lib/supabase/client.ts` with `authenticated` role claim. |
| **Supabase PostgreSQL Schema** | `WORKING` | 10 tables created with constraints, foreign keys, and indexes in migration scripts. |
| **Row Level Security (RLS)** | `WORKING` | Policies defined in migrations preventing unauthorized mutations and spoofing. |
| **Feature Extraction Engine** | `WORKING` | `src/lib/risk-engine/feature-extraction.ts` extracts deviations, novelty, and velocity. |
| **XGBoost Fraud Model** | `WORKING` | `src/lib/risk-engine/ml-adapters/xgboost-adapter.ts` with non-linear logistic tree splits. |
| **Isolation Forest Anomaly Model** | `WORKING` | `src/lib/risk-engine/ml-adapters/isolation-forest-adapter.ts` measuring isolation path depth. |
| **Velocity Model** | `WORKING` | `src/lib/risk-engine/velocity-model.ts` calculating 1m, 5m, 10m, and 1h sliding windows. |
| **Risk Fusion & Confidence** | `WORKING` | `src/lib/risk-engine/risk-fusion.ts` combining fraud, anomaly, behavioral, and contextual scores. |
| **Explainable AI Factors** | `WORKING` | `src/lib/risk-engine/explanation-generation.ts` generating factor items with evidence strings. |
| **Action Recommendation** | `WORKING` | `src/lib/risk-engine/action-recommendation.ts` generating advisory actions (ALLOW, MONITOR, VERIFY, HOLD). |
| **Master Risk Service Orchestrator** | `MISSING` | Need `analyzeTransaction(transactionId)` unifying load -> features -> models -> fusion -> persistence. |
| **Transaction Service APIs** | `PARTIALLY WORKING` | `fetchTransactions` exists; missing standard `getRecentTransactions`, `getRelatedTransactions`. |
| **Behavioral Profile Retrieval** | `PARTIALLY WORKING` | Model exists; missing dedicated `getCustomerBehaviorProfile(customerId)` backend service. |
| **Investigation Backend Services** | `PARTIALLY WORKING` | Basic fetch exists; missing dedicated `assignInvestigation`, `updateInvestigationStatus`, `addInvestigatorNote`. |
| **Human Decision Operations** | `PARTIALLY WORKING` | Basic decision exists; missing dedicated `approveTransaction`, `holdTransaction`, `blockTransaction`, `escalateInvestigation`, `markFalsePositive`. |
| **Immutable Audit Trail** | `PARTIALLY WORKING` | Table exists; missing dedicated `logAuditEvent` and `getAuditTrail` service helper. |
| **Gemini Tool Calling Loop** | `PARTIALLY WORKING` | Basic LLM invoke exists; missing multi-turn tool calling dispatcher for all 16 DB tools. |
| **AI Session & Message Persistence** | `MISSING` | Schema exists; missing persistence functions `createCopilotSession`, `saveCopilotMessage`. |
| **Synthetic Demo Data** | `WORKING` | 998 realistic Bangladesh transactions and 150 customer behavioral baselines in Supabase. |
| **Backend Integration Tests** | `PARTIALLY WORKING` | Risk engine unit tests pass; missing full master pipeline integration test. |

---

## 3. Detailed Component Breakdown

### 1. Master Risk Service (`analyzeTransaction`)
- **Current Implementation**: Features and models are executed separately in client services.
- **Status**: `MISSING`
- **Evidence**: No single `analyzeTransaction(transactionId)` function exists that accepts a transaction ID, loads history, computes features, runs models, fuses scores, and persists assessments.
- **Remediation**: Implement `src/lib/risk-engine/master-risk-service.ts` exporting `analyzeTransaction(transactionId)` and `analyzeTransactionObject(txn, baseline)`.

### 2. Transaction Services
- **Current Implementation**: `fetchTransactions`, `fetchTransactionById`, and `createLiveTransaction`.
- **Status**: `PARTIALLY WORKING`
- **Evidence**: No `getRecentTransactions()`, `getRelatedTransactions()`, or `searchTransactions()` exported functions.
- **Remediation**: Add standard exported methods to `src/services/transaction-service.ts` with pagination, ordering, and entity relationship lookups.

### 3. Customer Behavioral Profiling
- **Current Implementation**: `customer_behavior_profiles` table exists and seeded.
- **Status**: `PARTIALLY WORKING`
- **Evidence**: No dedicated service function `getCustomerBehaviorProfile(customerId)` that calculates deviation vectors against current transaction telemetry.
- **Remediation**: Implement `getCustomerBehaviorProfile` in `src/services/behavior-service.ts`.

### 4. Investigation Backend Services & Human Actions
- **Current Implementation**: `performInvestigationDecision` handles status update and basic insert.
- **Status**: `PARTIALLY WORKING`
- **Evidence**: Missing explicit functions `approveTransaction()`, `holdTransaction()`, `blockTransaction()`, `escalateInvestigation()`, `markFalsePositive()`, `assignInvestigation()`, `addInvestigatorNote()`.
- **Remediation**: Implement dedicated functions in `src/services/investigation-service.ts` enforcing state machine transitions and audit trails.

### 5. Gemini Sentinel Copilot & Tool Calling Loop
- **Current Implementation**: Single prompt-response with context injection in `server/index.ts`.
- **Status**: `PARTIALLY WORKING`
- **Evidence**: Gemini function calling tools (`get_transaction`, `get_risk_assessment`, `get_customer_behavior_profile`, `get_recent_transactions`, `get_investigation`, `search_transactions`, etc.) need a proper tool dispatcher and multi-turn execution.
- **Remediation**: Implement tool declarations and execution dispatcher in `server/copilot-tools.ts` and `src/services/copilot-service.ts`.

### 6. AI Agent Session & Message Persistence
- **Current Implementation**: Tables `ai_agent_sessions` and `ai_agent_messages` exist in PostgreSQL.
- **Status**: `MISSING`
- **Evidence**: Messages are stored only in React state in `CopilotPage.tsx`; database persistence helper is absent.
- **Remediation**: Create `src/services/copilot-persistence-service.ts` to manage sessions and message logs.

---

## 4. Backend Risks & Security Review
1. **Server-Side Secret Isolation**: `GEMINI_API_KEY` is configured strictly in server-side `.env` and `server/index.ts`. Client bundles never receive the API key.
2. **Database Authorization**: Supabase RLS policies are enabled across all 10 tables.
3. **Audit Immutability**: All investigator actions record actor ID, action type, previous status, new status, and timestamp.

---

## 5. Implementation Priority
1. `src/lib/risk-engine/master-risk-service.ts`: Implement `analyzeTransaction(transactionId)`.
2. `src/services/transaction-service.ts`: Add `getRecentTransactions`, `getRelatedTransactions`, `searchTransactions`.
3. `src/services/behavior-service.ts`: Implement `getCustomerBehaviorProfile(customerId)`.
4. `src/services/investigation-service.ts`: Implement human action functions and case management.
5. `server/copilot-tools.ts` & `src/services/copilot-service.ts`: Implement Gemini tool calling loop with safe Supabase tools.
6. `src/services/copilot-persistence-service.ts`: Implement AI session & message logging.
7. `src/tests/backend-integration.test.ts`: Write comprehensive end-to-end backend tests.
8. `docs/FIREBASE_SUPABASE_AUTH.md` & `docs/BACKEND_CONTRACT.md`: Create documentation.
