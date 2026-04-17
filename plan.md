# IT Community App — Development Plan

> **Total Phases:** 6
> **Budget:** $0 | **Stack:** React Native · Node.js · MongoDB Atlas · PASETO · Phaistos
> **Approach:** Security-first, schema-driven, monorepo architecture

---

## Phase 1 — Architecture & Shared Validation

**Goal:** Establish the foundational "truth" of the application using a centralized schema.

### 1.1 Monorepo Initialization

Set up a unified workspace that allows `/client`, `/server`, and `/shared` to run together from the root, sharing dependencies and scripts.

```
/
├── /client       # React Native (Expo)
├── /server       # Node.js + Express
├── /shared       # Schemas & constants consumed by both sides
└── package.json  # Root scripts — starts client & server simultaneously
```

### 1.2 Phaistos Schema Definition

Author strict JSON schemas in `/shared/schemas/`. Any payload that does not exactly match a schema is rejected before it reaches business logic.

| Schema File | Key Constraints |
|---|---|
| `user.schema.json` | LinkedIn & GitHub URLs mandatory; Batch and Faculty must match allowed formats |
| `organization.schema.json` | Website and Establish Date required for verification eligibility |
| `jobPost.schema.json` | Title, company, link, and tags all required; no free-form unstructured posts |
| `message.schema.json` | Must carry a valid Group ID; direct/private message structure is rejected |

### 1.3 Core Infrastructure Provisioning

- **MongoDB Atlas** — Create a free-tier (512 MB) cluster. Define three environments as separate Atlas projects or database namespaces: `dev`, `staging`, `production`.
- **Cloudinary** — Create an account and configure hierarchical folder structure:

```
cloudinary/
├── /avatars          # User profile pictures
├── /org-logos        # Organization logos
└── /groups
    ├── /docs         # PDF, Docx
    ├── /media        # MP4, Mov
    └── /resources    # Zip, code files
```

**Deliverables:** Working monorepo, all schemas authored and peer-reviewed, Atlas + Cloudinary accounts live with folder structure in place.

---

## Phase 2 — Security & Identity Layer

**Goal:** Implement the "Identity-as-a-Service" logic using the most modern cryptographic standards.

### 2.1 Advanced Password Hashing — Argon2id

Integrate `argon2` (npm) for all password storage. Argon2id is the OWASP first-choice algorithm — resistant to GPU cracking and side-channel attacks.

```
Registration  →  argon2.hash(plainPassword)      →  store hash in DB
Login         →  argon2.verify(hash, submitted)  →  pass or reject
```

Never store plain text. Never use bcrypt or MD5.

### 2.2 PASETO v4.local Token System

Configure `paseto` (npm) with a symmetric `v4.local` key. Token payload is **fully encrypted** — unlike JWT, the claims are invisible to the client.

**Token payload structure:**

```json
{
  "userId": "abc123",
  "role": "student",
  "isApproved": false,
  "exp": "2026-07-01T00:00:00Z"
}
```

- Token is issued on login and stored client-side in Expo Secure Store.
- `isApproved` flag is embedded and re-verified on every protected request.

### 2.3 Access Control Middleware

Two security gates are applied per route:

| Middleware | File | Responsibility |
|---|---|---|
| **Validation Guard** | `validator.js` | Intercepts all incoming request bodies and runs Phaistos schema validation before the request reaches any controller |
| **Identity Guard** | `authMiddleware.js` | Decrypts the PASETO token, checks expiry, and verifies `isApproved === true` before granting access to community features |

Route protection order: `rateLimiter → validator → authMiddleware → controller`

### 2.4 Traffic Sanitization

- **Helmet.js** — Sets secure HTTP response headers. Mitigates XSS, clickjacking, MIME sniffing, and information disclosure.
- **Rate-Limiter-Flexible** — Blocks automated brute-force attacks. Separate limits for auth endpoints (strict) and general API (relaxed).

**Deliverables:** Argon2id hashing live, PASETO token issue/verify cycle working, all three middleware layers tested, Helmet + rate limiter applied globally.

---

## Phase 3 — Organization & Approval Workflow

**Goal:** Build the administrative bridge between the Organization and the Student.

### 3.1 The Approval Logic

Organizations receive a restricted set of endpoints to review pending student registrations. The review UI surfaces the student's LinkedIn and GitHub profile URLs (both mandatory from the schema) for manual verification.

```
GET  /admin/pending-students       # List students with isApproved: false
GET  /admin/students/:id/profile   # View LinkedIn, GitHub, Faculty, Batch
POST /admin/students/:id/approve   # Toggle isApproved → true
POST /admin/students/:id/reject    # Remove or flag the account
```

All admin routes are guarded by an additional `isAdmin` role check inside `authMiddleware.js`.

### 3.2 Status Management

When an organization approves a student, the backend:

1. Updates `isApproved: true` in the User document in MongoDB.
2. Issues a **fresh PASETO token** reflecting the new approval state.
3. The new token is delivered to the student via the approval email.

This ensures the student's session permissions update without requiring them to re-enter a password.

### 3.3 Email Automation

Integrate a secure SMTP service (e.g., **Resend** or **Brevo** — both free tiers) for two transactional email types:

| Email Type | Trigger | Content |
|---|---|---|
| Account Approval | `isApproved` toggled to `true` | Confirmation message + new PASETO token or login prompt |
| Password Reset | User requests reset | Time-limited reset link (expires in 15 minutes) |

Reset tokens are single-use, stored temporarily in MongoDB with a `TTL` index, and invalidated immediately upon use.

**Deliverables:** Admin approval endpoints live, `isApproved` flag updates correctly reflected in new tokens, both email flows tested end-to-end.

---

## Phase 4 — Mobile Interface & Secure Storage

**Goal:** Develop the cross-platform frontend with a focus on token safety and navigation security.

### 4.1 UI Framework — React Native + NativeWind

- Build all screens using **React Native** (Expo managed workflow).
- Style exclusively with **NativeWind** (Tailwind CSS utility classes) — no inline StyleSheet objects.
- Design tokens defined in `tailwind.config.js` for consistent color, spacing, and typography across iOS and Android.

### 4.2 Hardened Token Storage — Expo Secure Store

- On login, the PASETO token is written to **Expo Secure Store** — hardware-backed keystore on the device.
- Token is never stored in AsyncStorage, Redux, or Zustand state.
- On logout, the token is explicitly deleted from Secure Store.

```javascript
// Store
await SecureStore.setItemAsync('paseto_token', token);

// Read
const token = await SecureStore.getItemAsync('paseto_token');

// Delete
await SecureStore.deleteItemAsync('paseto_token');
```

### 4.3 Navigation Security — Stack Separation

Two completely separate navigator stacks prevent unauthorized screen access at the navigation layer:

```
App.js
├── AuthStack (Public)
│   ├── LoginScreen
│   ├── SignupScreen
│   └── ResetPasswordScreen
│
└── CommunityStack (Restricted — requires isApproved token)
    ├── HomeScreen
    ├── ChatScreen
    ├── FileGalleryScreen
    ├── VideoCallScreen
    └── ProfileScreen
```

On app launch, the token is read from Secure Store. If absent or invalid, the user is routed to `AuthStack`. The `CommunityStack` is never rendered for unauthenticated sessions.

**Deliverables:** All screens scaffolded, NativeWind theme configured, Secure Store token lifecycle working, navigation stack separation enforced.

---

## Phase 5 — Messaging & Asset Management

**Goal:** Implement real-time communication and the "Specific Place" file repository.

### 5.1 Socket-Driven Group Chat

- Deploy **Socket.io** (or native WebSockets) on the Express server.
- Messages are broadcast **by Group ID only** — no private or direct messaging.
- Every message payload is validated against `message.schema.json` before being saved or broadcast.
- Chat history is persisted in the `Message` MongoDB collection and paginated on load.

```
Client joins room:   socket.join(groupId)
Client sends message: emit('message', { groupId, content, senderId })
Server broadcasts:   io.to(groupId).emit('message', validatedPayload)
```

### 5.2 The Smart File Sorter

Backend middleware reads the uploaded file's extension and routes it to the correct Cloudinary folder automatically:

| Extension | Category | Cloudinary Destination |
|---|---|---|
| `.pdf`, `.docx` | Docs | `/groups/docs/` |
| `.mp4`, `.mov` | Media | `/groups/media/` |
| `.zip`, code files | Resources | `/groups/resources/` |

Unknown extensions are rejected with a `415 Unsupported Media Type` response.

### 5.3 Repository UI — Tabbed File Gallery

A tabbed screen in the mobile app allows students to browse the filtered asset library for their group:

```
FileGalleryScreen
├── [Docs]       # PDF / Docx viewer list
├── [Media]      # Video thumbnails
└── [Resources]  # Zip and code file downloads
```

Files are fetched from the backend filtered by `groupId` and `fileType`, then rendered with the `FilePreview` shared component.

**Deliverables:** Real-time group chat working with schema validation, Smart Sorter routing files to correct Cloudinary folders, tabbed file gallery rendering all three categories.

---

## Phase 6 — Professional Utilities & Deployment

**Goal:** Finalize high-value features and move to the production environment.

### 6.1 Job Hub

A dedicated tab or group view surfaces verified job opportunities only. Job posts are validated against `jobPost.schema.json` and can only be created by accounts with the `organization` or `admin` role. Students can filter by tag (e.g., `frontend`, `internship`, `remote`).

### 6.2 Video Integration — Agora SDK

- Integrate **Agora RTC SDK** for React Native.
- Group video calls are initiated from within a Group screen.
- Each call is tied to a `channelName` derived from the Group ID — no ad-hoc or private channels.
- Agora's free monthly minutes are sufficient for student community scale.

```javascript
// Join a video channel
await agoraEngine.joinChannel(token, groupId, null, uid);
```

### 6.3 Production Deployment

| Task | Tool | Notes |
|---|---|---|
| API Hosting | Render or Railway | Deploy from GitHub; set all secrets as Environment Variables — never in code |
| Environment Variables | `.env` → platform dashboard | `PASETO_SECRET`, `MONGO_URI`, `CLOUDINARY_URL`, `AGORA_APP_ID`, `SMTP_KEY` |
| MongoDB Indexing | Atlas UI or Mongoose | Index `email`, `batch`, `faculty`, `isApproved`, and job `tags` for fast queries |
| Expo Build | EAS Build (free tier) | Generate production `.apk` / `.ipa` for distribution |

**Deliverables:** Job Hub live with role-gated posting, Agora video calls working per group, API deployed on Render/Railway, MongoDB indexes applied, production Expo build generated.

---

## Phase Summary

| Phase | Focus | Key Output |
|---|---|---|
| 1 | Architecture & Schemas | Monorepo live, all Phaistos schemas authored, Atlas + Cloudinary provisioned |
| 2 | Security & Identity | Argon2id + PASETO cycle working, three middleware layers active |
| 3 | Approval Workflow | Admin endpoints live, `isApproved` token updates, email automation working |
| 4 | Mobile UI | All screens built, Secure Store token lifecycle, navigation stacks separated |
| 5 | Chat & Files | Real-time group chat, Smart Sorter, tabbed file gallery |
| 6 | Utilities & Deploy | Job Hub, Agora video, full production deployment |

---

*IT Community App · 6-Phase Plan · $0 Budget · 2026*
