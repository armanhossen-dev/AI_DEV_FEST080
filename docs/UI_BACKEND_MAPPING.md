# upay Sentinel — Existing UI to Backend Data & Service Mapping

**Platform**: upay Sentinel — Trust & Risk Intelligence  
**Document**: `docs/UI_BACKEND_MAPPING.md`  
**Core Principle**: The existing UI is preserved 100% as the source of truth. This mapping details the real database tables, backend services, and actions powering each existing visual element.

---

## 1. Authentication (`/login`, `/register`)

| Page | Current UI Element | Required Data | Source / Service | Database Table | Action | Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/login` | Email/Password Form | `email`, `password` | Firebase Modular SDK | `profiles` | `loginWithEmail()` | Firebase User + ID Token |
| `/login` | Google Sign-In Button | OAuth Credentials | Firebase Google Auth Provider | `profiles` | `loginWithGoogle()` | Firebase User + ID Token |
| `/login` | One-Click Judge Demo | Demo credentials | Firebase Auth Context | `profiles` | `loginWithDemo()` | Authenticated investigator session |
| `/register` | Registration Form | `email`, `password`, `fullName` | Firebase Auth + Supabase profile | `profiles` | `registerWithEmail()` | Profile created with role `investigator` |

---

## 2. Command Center Dashboard (`/dashboard`)

| Page | Current UI Element | Required Data | Source / Service | Database Table | Action | Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard` | Monitored KPI Card | Count of monitored transactions | `fetchAnalyticsData()` | `transactions` | Count query | Total transaction count (998+) |
| `/dashboard` | High Risk KPI Card | Count of high-risk transactions | `fetchAnalyticsData()` | `risk_assessments` | Filter `risk_level = 'high'` | Number of high-risk alerts |
| `/dashboard` | Critical Alerts KPI Card | Count of critical risk cases | `fetchAnalyticsData()` | `risk_assessments` | Filter `risk_level = 'critical'` | Count of critical transactions |
| `/dashboard` | Investigating KPI Card | Cases in progress | `fetchAnalyticsData()` | `investigations` | Filter `status = 'investigating'` | Active cases under review |
| `/dashboard` | Blocked Txns KPI Card | Disbursements blocked | `fetchAnalyticsData()` | `transactions` | Filter `transaction_status = 'blocked'` | Halted fraud attempts |
| `/dashboard` | Prevented Loss Card | Estimated protected BDT | `fetchAnalyticsData()` | `transactions` + `risk_assessments` | Aggregated BDT sum | Protected capital figure (৳46.8L) |
| `/dashboard` | Live Risk Stream | Stream of recent suspicious txns | `fetchTransactions({ limit: 8, sortBy: 'risk' })` | `transactions` + `risk_assessments` | Realtime select / range | Suspicious transactions array |
| `/dashboard` | Demo Scenario Launcher | Synthetic test cases | `createLiveTransaction(scenario)` | `transactions` + `risk_assessments` | Post transaction | Evaluates & redirects to detail |

---

## 3. Transaction Monitoring Feed (`/transactions`)

| Page | Current UI Element | Required Data | Source / Service | Database Table | Action | Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/transactions` | Search Input | Keyword / counterparty / city | `fetchTransactions({ search })` | `transactions` | ILIKE search | Matched transactions |
| `/transactions` | Risk Level Filter | `critical`, `high`, `medium`, `low` | `fetchTransactions({ riskLevel })` | `risk_assessments` | SQL equality filter | Filtered transactions array |
| `/transactions` | Status Filter | `completed`, `held`, `blocked`, `under_review` | `fetchTransactions({ status })` | `transactions` | Status filter | Status-filtered transactions |
| `/transactions` | Sort Selector | `recent`, `risk`, `amount` | `fetchTransactions({ sortBy })` | `transactions` | Order by clause | Sorted records |
| `/transactions` | Paginated Table | Page slice of 20 records | `fetchTransactions({ page, limit })` | `transactions` | Range pagination | Slice records + totalCount |

---

## 4. Transaction Deep Risk Detail (`/transactions/:id`)

| Page | Current UI Element | Required Data | Source / Service | Database Table | Action | Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/transactions/:id` | Header Profile | Reference, amount, sender, receiver | `fetchTransactionById(id)` | `transactions` | Select by ID | Complete transaction entity |
| `/transactions/:id` | Composite Risk Badge | 0–100 Risk Score, Level, Confidence | `fetchTransactionById(id)` | `risk_assessments` | Joined query | Score, Level, Confidence % |
| `/transactions/:id` | Model Output Triple | Fraud %, Anomaly %, Behavior % | `fetchTransactionById(id)` | `risk_assessments` | Assessment row | Supervised & unsupervised scores |
| `/transactions/:id` | Advisory Guidance Banner | Advisory action code & explanation | `fetchTransactionById(id)` | `risk_assessments` | Model output | ALLOW, MONITOR, VERIFY, HOLD |
| `/transactions/:id` | Top Risk Factors List | Factor code, contribution, evidence | `fetchTransactionById(id)` | `risk_factors` | Assessment ID lookup | Ordered contributing factor cards |
| `/transactions/:id` | Behavioral Comparison | Live transaction vs baseline envelope | `getCustomerBehaviorProfile()` | `customer_behavior_profiles` | Sender lookup | Median vs amount, active hours |
| `/transactions/:id` | Decision Button: APPROVE | Confirmation of legitimate transaction | `approveTransaction(id)` | `transactions`, `investigations`, `investigation_actions` | Update & audit | Status `completed`, case resolved |
| `/transactions/:id` | Decision Button: HOLD | Temporary hold of funds | `holdTransaction(id)` | `transactions`, `investigations`, `investigation_actions` | Update & audit | Status `held`, case in review |
| `/transactions/:id` | Decision Button: BLOCK | Disbursement blocked | `blockTransaction(id)` | `transactions`, `investigations`, `investigation_actions` | Update & audit | Status `blocked`, capital protected |
| `/transactions/:id` | Decision Button: ESCALATE | Transfer to Tier-2 incident desk | `escalateInvestigation(id)` | `transactions`, `investigations`, `investigation_actions` | Update & audit | Status `under_review`, priority `critical` |

---

## 5. Risk Alert Center (`/alerts`)

| Page | Current UI Element | Required Data | Source / Service | Database Table | Action | Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/alerts` | Alert Severity Filter | `all`, `critical`, `high`, `medium` | `fetchTransactions({ riskLevel })` | `risk_assessments` | Filter score >= 30 | Active operational alerts list |
| `/alerts` | Alert Cards | Reference, score, amount, status | `fetchTransactions()` | `transactions` + `risk_assessments` | Query | Alert item with direct link |

---

## 6. Investigation Workspace (`/investigations`, `/investigations/:id`)

| Page | Current UI Element | Required Data | Source / Service | Database Table | Action | Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/investigations` | Status Filter Bar | `open`, `investigating`, `resolved`, `escalated` | `fetchInvestigations(status)` | `investigations` | Status query | Filtered investigation cases |
| `/investigations/:id` | Case Summary Panel | Priority, assigned analyst, notes | `fetchInvestigationById(id)` | `investigations` | Primary lookup | Full case record |
| `/investigations/:id` | Investigator Notes Form | Text note string | `addInvestigatorNote(id, note)` | `investigation_actions` | Insert action | Audit log updated with timestamp |
| `/investigations/:id` | Audit Trail History | Chronological investigator actions | `getAuditTrail(id)` | `investigation_actions` | Case ID lookup | Ordered timeline events |

---

## 7. Sentinel Copilot AI Assistant (`/copilot`)

| Page | Current UI Element | Required Data | Source / Service | Database Table | Action | Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/copilot` | Natural Language Query Input | Investigation question | `askSentinelCopilot({ question })` | Supabase Postgres via Gemini Tools | Server-side `@google/genai` | Structured Zod validated response |
| `/copilot` | Daily Risk Briefing Button | Aggregated fleet status | `generateDailyRiskBriefing()` | `risk_assessments`, `investigations` | Database aggregation | Daily executive risk summary |
| `/copilot` | Evidence Citations | Referenced transactions / cases | `askSentinelCopilot()` | `transactions` | Tool execution | Direct links to referenced entities |
| `/copilot` | Activity Trace | Step-by-step agent tool logs | `askSentinelCopilot()` | Edge function / Backend tools | Tool telemetry | "Retrieved telemetry -> Loaded factors" |

---

## 8. Risk Analytics (`/analytics`)

| Page | Current UI Element | Required Data | Source / Service | Database Table | Action | Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/analytics` | Prevented Loss Metric | Cumulative preserved BDT | `fetchAnalyticsData()` | `transactions` | Sum of blocked/held txns | ৳46.8 Lakh BDT |
| `/analytics` | Risk Severity Distribution | Count by risk bracket | `fetchAnalyticsData()` | `risk_assessments` | Group by `risk_level` | Critical, High, Medium, Low breakdown |
| `/analytics` | Top Prevalent Factors | Frequency of risk factor codes | `fetchAnalyticsData()` | `risk_factors` | Count by `factor_name` | Ranked prevalence percentages |
