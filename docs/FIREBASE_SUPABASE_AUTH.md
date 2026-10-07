# Firebase to Supabase Authentication Architecture

**Platform**: upay Sentinel — Trust & Risk Intelligence  
**Document**: `docs/FIREBASE_SUPABASE_AUTH.md`

---

## 1. Authentication Trust Model

upay Sentinel utilizes **Firebase Authentication** as the identity authority and **Supabase PostgreSQL** as the persistent data and security policy store.

```text
[Investigator] 
       │ 1. Sign In (Email/Password or Google)
       ▼
[Firebase Auth]
       │ 2. Issues Signed JWT (ID Token) with standard claims
       ▼
[Frontend Application]
       │ 3. Sets Supabase Authorization header: Bearer <FIREBASE_ID_TOKEN>
       ▼
[Supabase Client]
       │ 4. Passes Token to PostgreSQL REST / Realtime Gateway
       ▼
[Supabase PostgreSQL RLS]
       │ 5. Validates JWT signature using Firebase Project Public Keys
       │    Evaluates auth.uid() == firebase_uid
       ▼
[Protected Tables & Audit Trails]
```

---

## 2. Configuration Parameters

### Firebase Web Client (`.env`):
```env
VITE_FIREBASE_API_KEY=AIzaSyAVwEtoWKdp9NarJYPbtnK84FLCdJRDAwU
VITE_FIREBASE_AUTH_DOMAIN=phase-2-6def1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=phase-2-6def1
VITE_FIREBASE_STORAGE_BUCKET=phase-2-6def1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=10025565327
VITE_FIREBASE_APP_ID=1:10025565327:web:527350a203c208fbae44fa
VITE_FIREBASE_MEASUREMENT_ID=G-RHKQSGN8LD
```

### Supabase Client (`.env`):
```env
VITE_SUPABASE_URL=https://odexyyeipgspqvdepvoi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_pSbK4D35fp2K5UCtunJN2Q_nKjfzvhB
```

---

## 3. ID Token Handshake Implementation

In [`src/lib/supabase/client.ts`](file:///d:/Bornil%20Mahmud/upay-Sentinel/src/lib/supabase/client.ts):

```typescript
export function setSupabaseAuthToken(token: string | null) {
  if (token) {
    (supabase as any).rest.headers["Authorization"] = `Bearer ${token}`;
  } else {
    delete (supabase as any).rest.headers["Authorization"];
  }
}
```

When an investigator authenticates via `signInWithEmailAndPassword` or Google OAuth:
1. `firebaseUser.getIdToken()` retrieves the current valid JWT.
2. `setSupabaseAuthToken(token)` attaches it as the Bearer token for all Subsequent Supabase REST and GraphQL operations.
3. On user sign-out (`signOut(auth)`), the Authorization header is wiped immediately.

---

## 4. Row Level Security (RLS) Mapping

Supabase extracts claims from the verified JWT:
- `auth.jwt() ->> 'sub'` or `auth.uid()` corresponds to the Firebase UID.
- In `profiles`, `firebase_uid` maps 1:1 to the authenticated user.
- Investigators have role `'investigator'`, `'analyst'`, or `'admin'`.
- Normal users cannot tamper with `risk_assessments`, `transaction_features`, or `investigation_actions`.
- Direct manual updates to `final_risk_score` or model outputs are denied by database constraints.

---

## 5. Security Rules

1. **Zero Service-Role Leaks**: The Supabase `service_role` key is **never** compiled into the frontend bundle.
2. **Zero Firebase Admin Leaks**: Firebase Admin private keys are prohibited from client code.
3. **Session Persistence**: Auth state is maintained via `browserLocalPersistence` across page reloads and browser restarts.
