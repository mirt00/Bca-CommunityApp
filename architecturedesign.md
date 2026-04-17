# IT Community App — Architecture Design

> **Pattern:** Monorepo · Feature-Based · Security-First
> **Budget:** $0 | **Platform:** iOS & Android (Cross-platform)
> **Last Updated:** 2026

---

## 1. System Overview

The IT Community App is a mobile-first platform for IT students and organizations. It is built on a three-layer monorepo architecture where a shared validation core enforces data contracts across both the frontend and backend simultaneously.

```
┌─────────────────────────────────────────────────────────────┐
│                        MONOREPO ROOT                        │
│                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│   │   /client   │  │   /server   │  │    /shared      │   │
│   │             │  │             │  │                 │   │
│   │ React Native│  │  Node.js +  │  │ Phaistos JSON   │   │
│   │ + NativeWind│  │  Express    │  │ Schemas &       │   │
│   │ + Expo      │  │             │  │ Constants       │   │
│   └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
│          │                │                   │            │
│          └────────────────┴───────────────────┘            │
│                    Shared Schema Contract                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT                             │
│                   React Native + Expo                            │
│                                                                  │
│  ┌────────────┐  ┌─────────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Auth Stack │  │  Community  │  │  Agora   │  │  Expo     │  │
│  │ (Public)   │  │  Stack      │  │  SDK     │  │  Secure   │  │
│  │            │  │ (Protected) │  │  Video   │  │  Store    │  │
│  └────────────┘  └─────────────┘  └──────────┘  └───────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │  HTTPS + PASETO Token
                               │  (Encrypted Payload)
┌──────────────────────────────▼───────────────────────────────────┐
│                        API GATEWAY                               │
│                   Node.js + Express                              │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Rate Limiter│→ │  Validator   │→ │    Auth Middleware      │  │
│  │ (Flexible)  │  │  (Phaistos)  │  │ PASETO Decrypt +       │  │
│  │             │  │              │  │ isApproved Check        │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     CONTROLLERS                          │   │
│  │  authController  │  userController  │  groupController  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
          ┌────────────────┼───────────────────┐
          ▼                ▼                   ▼
┌─────────────────┐ ┌────────────┐  ┌─────────────────────┐
│  MongoDB Atlas  │ │ Cloudinary │  │    SMTP Service     │
│  (Metadata)     │ │ (Media)    │  │  (Resend / Brevo)   │
│  Free 512MB     │ │ Free 25cr  │  │  Password Reset &   │
│                 │ │            │  │  Approval Emails    │
│  · Users        │ │ · Avatars  │  └─────────────────────┘
│  · Orgs         │ │ · Org Logos│
│  · Messages     │ │ · Docs     │
│  · Job Posts    │ │ · Media    │
└─────────────────┘ │ · Resources│
                    └────────────┘
```

---

## 3. Security Architecture

Security is enforced in layers. Every request passes through three gates before reaching business logic.

```
Incoming Request
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  GATE 1: Traffic Sanitization                       │
│                                                     │
│  ┌─────────────────┐    ┌────────────────────────┐  │
│  │  Helmet.js      │    │  Rate-Limiter-Flexible │  │
│  │                 │    │                        │  │
│  │  · XSS headers  │    │  Auth routes: strict   │  │
│  │  · Clickjacking │    │  API routes: relaxed   │  │
│  │  · MIME sniff   │    │  Blocks brute-force    │  │
│  └─────────────────┘    └────────────────────────┘  │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  GATE 2: Schema Validation (Phaistos)               │
│                                                     │
│  Request Body → Phaistos.validate(schema, body)     │
│                                                     │
│  PASS  → proceed to Gate 3                         │
│  FAIL  → 400 Bad Request (schema mismatch details) │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  GATE 3: Identity & Authorization (PASETO v4.local) │
│                                                     │
│  Token from Header → Decrypt with symmetric key    │
│                                                     │
│  Checks:                                            │
│  · Token valid & not expired                       │
│  · isApproved === true  (community routes)         │
│  · role === 'admin'     (admin routes only)        │
│                                                     │
│  PASS  → attach user context, call controller      │
│  FAIL  → 401 Unauthorized                          │
└─────────────────────────────────────────────────────┘
      │
      ▼
  Controller
```

### Password Security — Argon2id Flow

```
Registration:
  plainPassword  →  argon2.hash(password, { type: argon2id })  →  store hash

Login:
  submitted  →  argon2.verify(storedHash, submitted)  →  issue PASETO token
```

### PASETO v4.local Token Structure

```
┌───────────────────────────────────────────────────┐
│               PASETO v4.local Token               │
│                                                   │
│  Header:   v4.local  (versioned, no negotiation) │
│                                                   │
│  Payload:  FULLY ENCRYPTED (XChaCha20-Poly1305)  │
│  ┌─────────────────────────────────────────────┐ │
│  │  {                                          │ │
│  │    "userId":     "abc123",                  │ │
│  │    "role":       "student",                 │ │
│  │    "isApproved": true,                      │ │
│  │    "exp":        "2026-07-01T00:00:00Z"     │ │
│  │  }                                          │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Storage:  Expo Secure Store (hardware keystore) │
└───────────────────────────────────────────────────┘
```

---

## 4. Database Architecture

### MongoDB Collections

```
MongoDB Atlas — Free Tier (512 MB)
│
├── users
│   ├── _id, fullName, nickname, email (unique, indexed)
│   ├── passwordHash (Argon2id)
│   ├── profilePicture (Cloudinary URL)
│   ├── bio, dateOfBirth, batch (indexed), faculty (indexed)
│   ├── linkedin (required), github (required)
│   ├── organizationName
│   ├── isApproved (boolean, indexed)
│   ├── role  ("student" | "admin" | "organization")
│   └── oauthProviders  { google, linkedin, github }
│
├── organizations
│   ├── _id, organizationName (unique, indexed)
│   ├── logo (Cloudinary URL)
│   ├── establishedDate, location
│   ├── website (required for verification)
│   └── socials  { facebook, linkedin }
│
├── messages
│   ├── _id, groupId (indexed), senderId (ref: users)
│   ├── content, fileUrl, fileType
│   └── createdAt (TTL candidate for old messages)
│
└── jobPosts
    ├── _id, groupId (indexed), postedBy (ref: users)
    ├── title, company, link
    ├── tags  [ "frontend", "internship", "remote" ] (indexed)
    └── createdAt
```

### Indexes

| Collection | Field(s) | Purpose |
|---|---|---|
| `users` | `email` | Unique lookup on login / reset |
| `users` | `isApproved` | Filter pending approval queue |
| `users` | `batch`, `faculty` | Profile search & filtering |
| `organizations` | `organizationName` | Unique org lookup |
| `messages` | `groupId` | Fast chat history per group |
| `jobPosts` | `groupId`, `tags` | Job Hub filtering |

---

## 5. Media Storage Architecture

```
Cloudinary — Free Tier (25 Credits/month)
│
└── /it-community-app
    ├── /avatars              ← User profile pictures
    │     Format: user_{userId}.jpg
    │
    ├── /org-logos            ← Organization logos
    │     Format: org_{orgId}.jpg
    │
    └── /groups
          ├── /docs           ← .pdf, .docx
          │     Format: group_{groupId}/doc_{timestamp}
          │
          ├── /media          ← .mp4, .mov
          │     Format: group_{groupId}/vid_{timestamp}
          │
          └── /resources      ← .zip, code files
                Format: group_{groupId}/res_{timestamp}
```

### Smart File Sorter Logic

```
Upload Request
      │
      ▼
  Read file extension
      │
      ├── .pdf / .docx   →  /groups/docs/       →  type: "doc"
      ├── .mp4 / .mov    →  /groups/media/      →  type: "media"
      ├── .zip / .code   →  /groups/resources/  →  type: "resource"
      └── unknown        →  415 Unsupported Media Type
```

---

## 6. Authentication & Approval Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   STUDENT REGISTRATION FLOW                  │
└──────────────────────────────────────────────────────────────┘

Student                   Server                  Organization Admin
   │                         │                            │
   │── POST /register ───────▶│                            │
   │   { fullName, email,     │                            │
   │     password, linkedin,  │                            │
   │     github, batch }      │                            │
   │                         │                            │
   │                    Phaistos validates                 │
   │                    Argon2id hashes pw                │
   │                    isApproved = false                │
   │                    Save to MongoDB                   │
   │◀── 201 Created ─────────│                            │
   │                         │                            │
   │   (Account pending)     │── Notify admin ───────────▶│
   │                         │   (new pending student)    │
   │                         │                            │
   │                         │◀── GET /admin/pending ─────│
   │                         │── Return student list ────▶│
   │                         │   (with LinkedIn, GitHub)  │
   │                         │                            │
   │                         │◀── POST /admin/:id/approve─│
   │                         │                            │
   │                    isApproved = true                 │
   │                    Issue new PASETO token            │
   │                         │── Approval email ─────────▶│──→ Student
   │                         │   (with login prompt)      │
   │                         │                            │
   │── POST /login ──────────▶│                            │
   │◀── PASETO token ─────────│                            │
   │                         │                            │
   │  Store in Secure Store  │                            │
   │  Enter CommunityStack   │                            │
```

---

## 7. Real-Time Messaging Architecture

```
┌─────────────────────────────────────────────────────┐
│              SOCKET.IO GROUP CHAT                   │
└─────────────────────────────────────────────────────┘

Client A              Socket Server              Client B
   │                       │                       │
   │── authenticate ───────▶│                       │
   │   (PASETO token)       │                       │
   │                  Verify token                  │
   │                  isApproved check              │
   │◀── connected ──────────│                       │
   │                        │                       │
   │── join(groupId) ───────▶│◀── join(groupId) ─────│
   │                   io.room(groupId)              │
   │                        │                       │
   │── emit('message') ─────▶│                       │
   │   { groupId,           │                       │
   │     content,           │ Phaistos validates    │
   │     senderId }         │ Save to MongoDB       │
   │                        │── broadcast ──────────▶│
   │◀───────────────────────│── broadcast            │
   │                        │                       │

Rules:
  · Messages scoped to groupId only — no private DMs
  · Every payload validated against message.schema.json
  · Chat history paginated from MongoDB on room join
```

---

## 8. Mobile Navigation Architecture

```
App.js
│
├── READ token from Expo Secure Store on launch
│
├── Token absent / invalid / expired
│   └── AuthStack (Public)
│       ├── LoginScreen
│       ├── SignupScreen
│       └── ResetPasswordScreen
│
└── Token valid + isApproved === true
    └── CommunityStack (Protected)
        │
        └── Bottom Tab Navigator
            ├── HomeScreen          (groups overview)
            ├── ChatScreen          (Socket.io group chat)
            ├── FileGalleryScreen   (tabbed: Docs / Media / Resources)
            │     ├── [Docs]
            │     ├── [Media]
            │     └── [Resources]
            ├── JobHubScreen        (org-posted opportunities)
            ├── VideoCallScreen     (Agora SDK per group)
            └── ProfileScreen       (edit profile, settings)
```

---

## 9. Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   PRODUCTION ENVIRONMENT                 │
└──────────────────────────────────────────────────────────┘

  Mobile App                     API Server
┌──────────┐                  ┌────────────────┐
│  Expo    │                  │ Render /       │
│  EAS     │──── HTTPS ──────▶│ Railway        │
│  Build   │                  │ (Free Tier)    │
│          │                  │                │
│  .apk    │                  │ ENV VARIABLES: │
│  .ipa    │                  │ PASETO_SECRET  │
└──────────┘                  │ MONGO_URI      │
                              │ CLOUDINARY_URL │
                              │ AGORA_APP_ID   │
                              │ SMTP_KEY       │
                              └───────┬────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
   │  MongoDB Atlas  │    │   Cloudinary    │    │  SMTP Service   │
   │  Free Cluster   │    │   Free Tier     │    │  Resend/Brevo   │
   │  512 MB         │    │   25 Credits    │    │  Free Tier      │
   └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environment Variables Reference

| Variable | Used In | Purpose |
|---|---|---|
| `PASETO_SECRET` | `config/paseto.js` | Symmetric key for token encryption/decryption |
| `MONGO_URI` | `config/db.js` | MongoDB Atlas connection string |
| `CLOUDINARY_URL` | `config/cloudinary.js` | Cloudinary API credentials |
| `AGORA_APP_ID` | `controllers/groupController.js` | Agora RTC app identifier |
| `SMTP_KEY` | Email service config | Transactional email API key |

> **Rule:** No secret ever appears in source code. All values are injected via environment variables on the hosting platform.

---

## 10. Shared Schema Contract

The `/shared` directory is the single source of truth for data shapes. Both the client-side Phaistos validator and the server-side validation middleware import from the same schema files, eliminating drift between frontend and backend expectations.

```
/shared/schemas/
│
├── user.schema.json
│   Required: fullName, email, password, dateOfBirth,
│             batch, faculty, linkedin, github
│   Patterns: linkedin must match linkedin.com/in/...
│             github must match github.com/...
│
├── organization.schema.json
│   Required: organizationName, establishedDate,
│             location, website
│   Optional: facebook, linkedin, logo
│
├── message.schema.json
│   Required: groupId, senderId, content
│   Forbidden: recipientId (no DMs allowed)
│
└── jobPost.schema.json
    Required: title, company, link, tags[]
    Constraint: tags must be from approved enum list
```

---

## 11. Technology Decisions Summary

| Decision | Choice | Reason |
|---|---|---|
| Token format | PASETO v4.local | Encrypted payload; immune to algorithm-switching attacks |
| Password hashing | Argon2id | OWASP first choice; GPU and side-channel resistant |
| Schema validation | Phaistos | Strict rejection of non-compliant payloads on both client and server |
| Token storage | Expo Secure Store | Hardware-backed keystore; never in JS memory |
| Database | MongoDB Atlas | Flexible document model; free 512 MB tier |
| Media storage | Cloudinary | Auto-categorization; CDN delivery; free 25 credits/month |
| Video calls | Agora SDK | Low-latency group calls; generous free monthly minutes |
| Styling | NativeWind | Tailwind CSS in React Native; single design token source |
| Hosting | Render / Railway | Git-connected deployment; free tier; env var support |

---

*IT Community App · Architecture Design · $0 Budget · 2026*
