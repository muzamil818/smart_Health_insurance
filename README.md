# Smart Health Insurance — Claim Processing & Fraud Detection Portal

A full-stack (MERN) system that digitises the complete health-insurance claim
lifecycle: submission, **automated eligibility validation**, **rule-based fraud
risk scoring**, officer adjudication, member notification, and a tamper-evident
audit trail — across four role-separated portals.

---

## 1. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, lucide-react |
| Backend | Node.js, Express 5, Mongoose 9 |
| Database | MongoDB (Atlas) |
| Auth | JWT (`Bearer` token), bcrypt password hashing |
| Uploads | multer (disk storage, 5 MB limit, images/PDF/Word only) |

---

## 2. Running the project

### Prerequisites
- Node.js 18+
- A MongoDB connection string

### Backend

```bash
cd server
npm install
# create .env from the template and fill in your values
cp .env.example .env
npm start                     # http://localhost:5000
```

`server/.env`:

```
PORT=5000
MONGODB_URI=<your mongodb connection string>
JWT_SECRET=<any long random string>
```

### Frontend

```bash
cd client
npm install
npm run dev                   # http://localhost:5173
```

### Seed demo data (recommended before a demo)

```bash
cd server
npm run seed:demo -- --reset  # wipes and rebuilds a full demo dataset
npm run seed:demo             # additive: keeps whatever already exists
```

There is also `npm run seed:admin`, which creates only an admin account.

---

## 3. Demo accounts

Created by `npm run seed:demo`:

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@shi.local` | `Admin123!` |
| Insurance Officer | `officer@shi.local` | `Officer123!` |
| Hospital (City General) | `hospital@shi.local` | `Hospital123!` |
| Policyholder (Ayesha) | `ayesha@shi.local` | `Member123!` |
| Policyholder (Bilal) | `bilal@shi.local` | `Member123!` |
| Policyholder (Zara) | `zara@shi.local` | `Member123!` |

Login redirects each role to its own portal automatically. Policyholder, hospital
and officer accounts can be self-registered; **administrator cannot** — see
**Account provisioning** below.

---

## 4. The claim lifecycle

```
Admin issues policy + empanels hospital
        │
        ▼
Hospital submits claim  ──►  attaches medical report + hospital bill
        │
        ▼
Server runs, on every submission and every new document:
   • 7 eligibility checks   (claimValidation.js)
   • 5 weighted fraud rules (fraudScoring.js)  →  0-100 score
        │
        ▼
Officer reviews checklist + risk breakdown + documents
   →  approve / reject / request more information
        │
        ▼
Policyholder notified   +   AuditLog entry written
```

### The 7 eligibility checks — `server/src/services/claimValidation.js`

1. Policy exists
2. Policy belongs to the named policyholder
3. Policy is active and within its validity dates
4. Treatment appears on the policy's covered-treatment list
5. Hospital is currently empanelled (`isEligible`)
6. Claim amount is within the coverage limit
7. Both a **medical report** and a **hospital bill** are attached

### The 5 fraud rules — `server/src/services/fraudScoring.js`

| Rule | Points | Trigger |
|---|---|---|
| Unusually high claim amount | +30 | ≥ $500,000, or ≥ 70% of the coverage limit |
| Duplicate claim | +30 | Same member + hospital + treatment + amount within 90 days |
| Multiple recent claims | +20 | ≥ 3 other claims by the member within 30 days |
| Treatment / policy mismatch | +20 | Treatment not on the covered list |
| Suspicious hospital pattern | +20 | ≥ 8 other claims from that hospital within 30 days |

Score is capped at 100. Tiers: **low 0–30**, **medium 31–60**, **high 61+**.

---

## 5. Role permissions

| Capability | Admin | Officer | Hospital | Policyholder |
|---|:--:|:--:|:--:|:--:|
| Register hospitals, toggle empanelment | ✓ | | | |
| Issue / cancel policies | ✓ | | | |
| Create & delete user accounts | ✓ | | | |
| View audit trail | ✓ | | | |
| View all claims | ✓ | ✓ | own facility | own claims |
| Submit claims & upload documents | | | ✓ | |
| Approve / reject / request info | | ✓ | | |
| View fraud risk scores | ✓ | ✓ | ✓ | — |

**What the administrator does.** The admin is the system's setup-and-oversight
role — it configures the data every other role depends on, and audits what they
did. It never files or decides claims itself:

1. **Empanels hospitals** — registers facilities and suspends/reinstates them.
   A suspended hospital fails check 5 of validation, so its claims cannot pass.
2. **Issues policies** — sets each member's coverage limit, validity window and
   covered-treatment list. Those values drive validation checks 3, 4 and 6 and
   the fraud rules for high amount and treatment mismatch.
3. **Manages accounts** — creates any role (including other admins) and deletes
   users.
4. **Reads the audit trail** — every submission, document upload, automated
   fraud evaluation and officer decision, with actor and timestamp.
5. **Reads system reports** — entity counts, claim status breakdown, and the
   number of high-risk scores.

Without an admin there are no hospitals and no policies, so **no claim can pass
validation** — which is why `npm run seed:admin` / `seed:demo` exists to create
the first one.

### Account provisioning

Sign-up (`POST /auth/register`) is open to **policyholder**, **hospital** and
**officer**. Registering as a hospital also creates and links a `Hospital`
facility record so the account can file claims immediately.

**`admin` cannot be self-registered** — it is rejected with `403`. An
administrator can read every user record and the entire audit trail, so the role
is granted only by an existing administrator (**Admin → User Management**, which
is itself admin-guarded) or by `npm run seed:admin`. The block lives in the
controller, not just in the UI: removing the option from the dropdown is not the
only line of defence, and an unrecognised role value falls back to
`policyholder` rather than being trusted.

Two further properties worth noting:

- Email is unique, so one address maps to exactly one role. A member cannot
  escalate by re-registering the same credentials — the API returns
  *"User already exists"*.
- Forging the cached role in `localStorage` renders a portal shell but every API
  call still returns `403`, because authorisation is derived from the signed JWT
  server-side and never from the client.

Enforced server-side by `protect` + `authorize(...roles)` in
`server/src/middleware/authMiddleware.js`, plus per-record ownership checks in
`server/src/utils/access.js`. The fraud score is deliberately **not** surfaced in
the policyholder UI — members see the eligibility checklist and the officer's
decision instead.

---

## 6. Seeded dataset

`npm run seed:demo -- --reset` produces a spread that exercises every tier:

| Claim | Member | Risk | Validation |
|---|---|---|---|
| Dermatology Consultation | Zara | **0** — low, nothing fired | 7/7 |
| MRI Scan | Ayesha | 20 — low | 7/7 |
| Physiotherapy | Ayesha | 20 — low | 7/7 |
| General Checkup | Bilal | 20 — low | 7/7 |
| Appendectomy | Ayesha | 20 — low | **5/7** — suspended hospital, no bill |
| Cardiology Consultation | Ayesha | **50 — medium** | 7/7 |
| Cosmetic Rhinoplasty | Ayesha | **70 — high** | **6/7** — treatment not covered |
| Dental Surgery ×3 | Bilal | **80 — high** | 7/7 |

Three decisions are pre-recorded (one approved, one rejected, one
information-requested) so the dashboards are populated on first load.

---

## 7. Suggested demo walkthrough

1. **Landing page** — the workflow, the four roles, and both engines at a glance.
2. **Admin** (`admin@shi.local`) — Hospitals (note Northside is *suspended*),
   Policies (covered-treatment lists), then the **Audit Trail** showing
   submissions, automated fraud evaluations, and officer decisions.
3. **Officer** (`officer@shi.local`) — open the review queue, then open a
   **Dental Surgery** claim: 80/100 high risk with *Unusually high claim
   amount*, *Duplicate claim*, and *Multiple recent claims* all listed with
   their point values, beside a 7/7 eligibility checklist. Contrast with
   **Cosmetic Rhinoplasty** (6/7 — treatment not covered) and
   **Appendectomy** (5/7 — suspended hospital, missing bill).
   Then **Fraud Analytics** for the rule specification and live portfolio.
4. **Hospital** (`hospital@shi.local`) — submit a new claim for Zara, attaching
   both documents, and watch validation pass 7/7 immediately.
   *(Submitting here pushes City General past 8 claims in 30 days, so the
   "Suspicious hospital pattern" rule fires on the new claim — a live
   demonstration of the fifth rule.)*
5. **Policyholder** (`ayesha@shi.local`) — coverage balance, claim history, the
   eligibility checklist, the officer's remarks, and notifications.

---

## 8. Project structure

```
server/src
  models/       User, Hospital, Policy, Claim, ClaimDocument,
                FraudScore, ApprovalRecord, Notification, AuditLog
  services/     claimValidation, fraudScoring, claimProcessing,
                notificationService, auditService
  controllers/  auth, user, hospital, policy, claim, document,
                notification, admin
  routes/       one router per resource, each role-guarded
  middleware/   authMiddleware, uploadMiddleware, errorMiddleware
  utils/        access (shared claim-ownership checks)
  scripts/      seedAdmin, seedDemo

client/src
  pages/
    Home, Nav, NotFound
    auth/         Auth (login + registration)
    admin/        Dashboard, Users, Hospitals, Policies, AuditLogs
    officer/      Dashboard, Claims, ClaimReview, FraudAnalytics
    hospital/     Dashboard, MyClaims, SubmitClaim, ClaimDetails,
                  Notifications, Profile
    policyholder/ Dashboard, MyPolicy, Claims, ClaimDetails, Notifications
  components/   ClaimVisuals (StatusBadge, RiskBadge, FraudScoreCard,
                ValidationChecklist)
  services/     one typed API client per resource
```

Each portal has a layout that verifies the session and the role before
rendering, and redirects to `/auth` otherwise.

---

## 9. API reference

All routes are prefixed `/api`. Every route except register/login requires
`Authorization: Bearer <token>`.

| Method | Route | Roles |
|---|---|---|
| POST | `/auth/register` · `/auth/login` | public |
| GET | `/auth/me` | any |
| GET/POST | `/users` | admin (GET also hospital) |
| GET/PUT/DELETE | `/users/:id` | admin (GET also hospital) |
| POST | `/hospitals` | admin |
| GET | `/hospitals` | admin, officer |
| GET | `/hospitals/:id` | admin, officer, hospital (own only) |
| PUT | `/hospitals/:id` | admin |
| POST | `/policies` | admin |
| GET | `/policies` | admin, officer, hospital |
| GET | `/policies/my-policy` | policyholder |
| GET | `/policies/:id` | admin, officer, hospital, policyholder (own) |
| PUT | `/policies/:id` | admin |
| POST | `/claims` | hospital |
| GET | `/claims` | admin, officer, hospital (own facility) |
| GET | `/claims/my-claims` | policyholder |
| GET | `/claims/:id` | any with access to that claim |
| PUT | `/claims/:id` | hospital (only when info requested), admin |
| PUT | `/claims/:id/approve` · `/reject` · `/request-information` | officer |
| GET | `/claims/:id/fraud-score` | officer, admin |
| POST | `/claims/:id/calculate-fraud-score` | officer, admin |
| POST | `/documents` | hospital |
| GET | `/documents/:claimId` | any with access to that claim |
| GET | `/fraud/rules` | admin, officer |
| GET | `/notifications` · PUT `/notifications/:id/read` | any (own) |
| GET | `/admin/reports` · `/admin/fraud-rules` · `/admin/audit-logs` | admin |

Uploaded documents are served statically from `/uploads`.
