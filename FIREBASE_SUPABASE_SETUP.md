# upay Sentinel — Supabase & Firebase Integration Guide 🛡️

This guide outlines the production-style integration between **Firebase Authentication** (as the decentralized identity provider) and **Supabase PostgreSQL** (as the real-time operational database) for the **upay Sentinel** Trust & Risk Intelligence Platform.

---

## 1. Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │              Web Client                │
                      │  (React 19 + Vite + Tailwind CSS)     │
                      └───────┬────────────────────────┬───────┘
                              │                        │
                    1. Login / Sign-up                 │ 3. Query with
                    (Email+Pass / Google)              │    Firebase ID Token
                              ▼                        ▼
               ┌───────────────────────┐     ┌───────────────────────┐
               │ Firebase Auth Service │     │ Supabase Postgres DB  │
               │ (phase-2-6def1)       │     │ (odexyyeipgspqvdepvoi)│
               └──────────────┬────────┘     └───────────▲───────────┘
                              │                          │
                              │ 2. Issues JWT            │ 4. Validates JWT via
                              │    (Bearer ID Token)     │    Firebase JWKS endpoint
                              └──────────────────────────┘
```

1. The investigator logs in or signs up with **Email/Password** or **Google Sign-In** through the Firebase Web SDK.
2. Firebase issues a cryptographically signed ID Token (JWT).
3. The Supabase client automatically attaches this JWT as the `Authorization: Bearer <ID_TOKEN>` header for all queries.
4. Supabase validates the token signature using Firebase's public JSON Web Key Set (JWKS), verifying the caller's identity against Row Level Security (RLS) policies.

---

## 2. Firebase Project Setup

- **Project ID**: `phase-2-6def1`
- **Auth Domain**: `phase-2-6def1.firebaseapp.com`
- **Enabled Providers**:
  - **Email/Password**: Enabled in Firebase Console -> Authentication -> Sign-in method.
  - **Google**: Enabled in Firebase Console -> Authentication -> Sign-in method.
- **Authorized Domains**: Add your local and production hosts (`localhost`, `127.0.0.1`, and your production domain).

### Firebase Custom Claims (Authenticated Role Claim)
To enable Supabase RLS policies targeting `TO authenticated`, Firebase ID tokens must have an `authenticated` role claim:
```javascript
// Via Firebase Cloud Function / Admin SDK hook on user creation:
await admin.auth().setCustomUserClaims(user.uid, {
  role: 'authenticated'
});
```
*Note: upay Sentinel includes a client-level proxy and graceful fallback so local evaluation and operations succeed even before custom claims propagation.*

---

## 3. Supabase Third-Party Authentication Configuration

1. In the [Supabase Dashboard](https://supabase.com/dashboard/project/odexyyeipgspqvdepvoi):
2. Navigate to **Authentication** -> **Third-Party Auth**.
3. Enable **Firebase Auth**:
   - **Firebase Project ID**: `phase-2-6def1`
   - **JWKS URL**: `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`
4. This ensures Supabase recognizes `auth.uid()` and validates token signatures seamlessly.

---

## 4. Database Migration & RLS Execution

To execute the database schema in Supabase:
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/odexyyeipgspqvdepvoi/sql).
2. Copy the entire contents of [`supabase/migrations/20260301000000_initial_schema.sql`](file:///d:/Bornil%20Mahmud/upay-Sentinel/supabase/migrations/20260301000000_initial_schema.sql).
3. Click **Run**.
4. The 7 core tables, foreign keys, triggers, and RLS policies will be created:
   - `profiles`
   - `transactions`
   - `transaction_features`
   - `risk_assessments`
   - `risk_factors`
   - `investigations`
   - `investigation_actions` (immutable audit trail)

---

## 5. Environment Variables

Create `.env` in the root directory:

```env
# Firebase Web Configuration
VITE_FIREBASE_API_KEY=AIzaSyAVwEtoWKdp9NarJYPbtnK84FLCdJRDAwU
VITE_FIREBASE_AUTH_DOMAIN=phase-2-6def1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=phase-2-6def1
VITE_FIREBASE_STORAGE_BUCKET=phase-2-6def1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=10025565327
VITE_FIREBASE_APP_ID=1:10025565327:web:527350a203c208fbae44fa
VITE_FIREBASE_MEASUREMENT_ID=G-RHKQSGN8LD

# Supabase Configuration
VITE_SUPABASE_URL=https://odexyyeipgspqvdepvoi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_pSbK4D35fp2K5UCtunJN2Q_nKjfzvhB

# Server-Side Secrets (Supabase Edge Functions / Backend only)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

> **Security Rule**: Never place Supabase `service_role`, Firebase Admin SDK credentials, or `GEMINI_API_KEY` in client-side `.env` files.

---

## 6. Local Development Steps

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Run automated unit & integration tests:
   ```bash
   npm run test
   ```
4. Build production bundle:
   ```bash
   npm run build
   ```

---

## 7. Production Deployment Steps

1. **Build**: Run `npm run build` to generate the optimized Vite bundle in `dist/`.
2. **Hosting**: Deploy to Vercel, Netlify, or Cloudflare Pages.
3. **Environment Setup**: Add all `VITE_*` keys in the hosting provider's dashboard.
4. **Authorized Domains**: Add your production domain into Firebase Authentication Settings.
