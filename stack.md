# IT Community App — Tech Stack

> **Budget:** $0 (Free Tier, 2026)
> **Target:** IT Students | Cross-platform Mobile (iOS & Android)

---

## Overview

This stack is purpose-built for a zero-budget IT community app in 2026. Every tool is chosen for security, modern developer experience, and a viable free tier. The combination of PASETO tokens, Argon2id hashing, and strict schema validation makes this one of the most hardened free-tier stacks available.

---

## 1. Frontend

### Mobile UI — React Native + NativeWind

- Cross-platform framework targeting both iOS and Android from a single codebase.
- **NativeWind** brings Tailwind CSS utility classes into React Native, enabling rapid and consistent modern styling without a separate stylesheet system.

### Secure Storage — Expo Secure Store

- Stores PASETO tokens using the device's hardware-level **Secure Enclave**.
- Tokens are encrypted at rest and never exposed to JavaScript memory or local storage.
- Zero cost — ships with the Expo SDK.

### Validation — Phaistos

- Enforces **strict schema validation** on all incoming and outgoing JSON payloads.
- Rejects any data that does not exactly match the defined student or job schemas.
- Acts as the last line of defense against malformed or malicious data on the client side.

---

## 2. Authentication

### Identity — PASETO v4.local

| Feature | PASETO v4.local | JWT (for comparison) |
|---|---|---|
| Payload visibility | Encrypted (hidden) | Base64-encoded (visible) |
| Algorithm switching attacks | Immune | Vulnerable |
| Standard | Versioned, opinionated | Flexible (often misconfigured) |
| Cost | Free | Free |

- `v4.local` uses **XChaCha20-Poly1305** symmetric encryption — the payload is fully hidden from the client.
- No algorithm negotiation means no algorithm-switching attack surface.

### Passwords — Argon2id

- Winner of the **Password Hashing Competition (PHC)**.
- Resistant to GPU cracking, side-channel attacks, and time-memory trade-off attacks.
- Superior to bcrypt and PBKDF2 in all modern threat models.
- Recommended by OWASP as the first-choice password hashing algorithm.

---

## 3. Backend

### API Runtime — Node.js + Express

- Event-driven, non-blocking I/O — ideal for real-time community features.
- Hosted on **Render** or **Railway** (both offer free tiers in 2026).
- Lightweight setup with minimal configuration overhead for student teams.

### Protection — Helmet + Rate Limiter

| Middleware | Role |
|---|---|
| `helmet` | Sets secure HTTP headers; mitigates XSS, clickjacking, MIME sniffing |
| `express-rate-limit` | Blocks brute-force login and API abuse attempts |

- Both packages are free and install via npm.
- Together they handle the most common Layer 7 web attack vectors out of the box.

---

## 4. Database

### Metadata — MongoDB Atlas (Free Tier)

- **Free tier:** 512 MB shared cluster — sufficient for user profiles, organization details, and group chat logs.
- Flexible document model maps cleanly to the User and Organization schemas.
- Built-in Atlas Search available if full-text search is needed later.
- No credit card required for the free tier.

**Stores:**
- User profiles
- Organization details
- Group chat logs

---

## 5. Media Storage

### Images & Files — Cloudinary (Free Tier)

- **Free tier:** 25 credits/month.
- Automatic image and video categorization, transformation, and CDN delivery.
- Handles profile pictures, organization logos, and any user-uploaded media.
- SDKs available for both React Native (upload) and Node.js (server-side management).

---

## 6. Live Features

### Video Calls — Agora SDK

- High-quality, low-latency group video calls.
- **Free tier:** Generous monthly free minutes — suitable for a student community app at early scale.
- Simple SDK integration for React Native.
- Supports group video, voice, and interactive streaming channels.

---

## Full Stack Summary

| Layer | Component | Technology | Free Tier |
|---|---|---|---|
| Frontend | Mobile UI | React Native + NativeWind | ✅ Free |
| Frontend | Secure Storage | Expo Secure Store | ✅ Free |
| Frontend | Validation | Phaistos | ✅ Free |
| Auth | Identity Tokens | PASETO v4.local | ✅ Free |
| Auth | Password Hashing | Argon2id | ✅ Free |
| Backend | API Runtime | Node.js + Express | ✅ Free |
| Backend | Protection | Helmet + Rate Limiter | ✅ Free |
| Database | Metadata | MongoDB Atlas | ✅ 512 MB |
| Storage | Media / Files | Cloudinary | ✅ 25 Credits/mo |
| Live | Video Calls | Agora SDK | ✅ Free minutes/mo |

---

## Security Highlights

- **No plain-text tokens** — PASETO v4.local encrypts the entire payload.
- **No weak hashing** — Argon2id replaces bcrypt at every layer.
- **No unvalidated data** — Phaistos enforces strict schema contracts.
- **No exposed storage** — Expo Secure Store uses hardware-level encryption.
- **No unprotected endpoints** — Helmet + Rate Limiter cover HTTP and brute-force vectors.

---

*Last updated: 2026 | Budget target: $0/month*
