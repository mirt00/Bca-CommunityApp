# IT Community App — Folder Structure

> Monorepo layout with three root-level workspaces: `/client`, `/server`, and `/shared`.

---

## Root

```
/
├── /client               # React Native (Expo) — Mobile App
├── /server               # Node.js + Express — REST API
├── /shared               # Phaistos Schemas & Shared Utility Logic
├── .gitignore
└── package.json          # Root scripts — runs client & server simultaneously
```

---

## /server

Backend API — Node.js + Express. Handles authentication, business logic, database access, file uploads, and real-time group chat.

```
/server
├── /config               # External service connections & secret loaders
│   ├── db.js             # MongoDB Atlas connection (Mongoose)
│   ├── cloudinary.js     # Cloudinary SDK setup & upload config
│   └── paseto.js         # PASETO v4.local key generation & token helpers
│
├── /controllers          # Business logic — one file per domain
│   ├── authController.js # Register, login, password reset, OAuth callbacks
│   ├── userController.js # Profile CRUD, avatar upload, account settings
│   └── groupController.js# Group creation, membership, chat message handling
│
├── /middlewares          # Security gates — applied per route or globally
│   ├── authMiddleware.js # PASETO token verification + isApproved status check
│   ├── validator.js      # Phaistos schema validation runner (request body)
│   └── rateLimiter.js    # express-rate-limit config — brute-force protection
│
├── /models               # Mongoose schemas — maps to MongoDB collections
│   ├── User.js           # User profile, hashed password, OAuth provider refs
│   ├── Organization.js   # Org details, logo URL, social links
│   └── Message.js        # Group chat messages, sender ref, timestamps
│
├── /routes               # Express routers — maps HTTP methods to controllers
│   ├── authRoutes.js     # POST /register, POST /login, POST /reset-password
│   ├── groupRoutes.js    # GET/POST /groups, GET /groups/:id/messages
│   └── fileRoutes.js     # POST /upload, GET /files/:groupId
│
├── .env                  # Secret keys — never committed to version control
│   │                     # Contains: PASETO_SECRET, CLOUDINARY_URL,
│   │                     #           MONGO_URI, AGORA_APP_ID
│
└── index.js              # Entry point — initialises Express, mounts routes
```

---

## /client

Mobile app — React Native + Expo + NativeWind. Feature-based folder structure for scalability.

```
/client
├── /assets               # Static assets bundled with the app
│   ├── /images           # Logos, placeholders, background images
│   ├── /fonts            # Custom font files (.ttf / .otf)
│   └── /icons            # App icons and tab bar icons
│
├── /src
│   ├── /api              # Network layer
│   │   ├── axiosConfig.js      # Axios instance with base URL & auth headers
│   │   └── endpoints/          # One file per domain (auth.js, user.js, etc.)
│   │
│   ├── /components       # Reusable, stateless UI elements
│   │   ├── /ui           # Primitive Tailwind components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Modal.jsx
│   │   └── /shared       # Composite components used across features
│   │       ├── FilePreview.jsx   # Renders image / video / document previews
│   │       ├── Avatar.jsx
│   │       └── LoadingSpinner.jsx
│   │
│   ├── /features         # Self-contained feature modules
│   │   ├── /auth         # Authentication flows
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── SignupScreen.jsx
│   │   │   └── ResetPasswordScreen.jsx
│   │   │
│   │   ├── /chat         # Group messaging
│   │   │   ├── ChatScreen.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── socketService.js  # Socket.io or WS connection logic
│   │   │
│   │   ├── /files        # File gallery per group or location
│   │   │   ├── FileGalleryScreen.jsx
│   │   │   └── FileUploader.jsx
│   │   │
│   │   └── /video        # Agora video call integration
│   │       ├── VideoCallScreen.jsx
│   │       └── agoraService.js   # Agora SDK init, join/leave channel logic
│   │
│   ├── /navigation       # App navigation structure
│   │   ├── StackNavigator.jsx    # Screen-level stack (Auth flow, Detail views)
│   │   └── TabNavigator.jsx      # Bottom tab bar (Home, Chat, Files, Profile)
│   │
│   ├── /store            # Global client-side state
│   │   ├── authStore.js          # Current user, token, login/logout actions
│   │   ├── chatStore.js          # Active group, messages cache
│   │   └── index.js              # Zustand store exports (or Context providers)
│   │
│   ├── /utils            # Pure helper functions — no UI, no side effects
│   │   ├── dateFormatter.js      # Relative timestamps ("2 hours ago")
│   │   ├── fileZipper.js         # Zip multiple files before upload
│   │   └── tokenHelper.js        # Read / clear token from Expo Secure Store
│   │
│   └── App.js            # Entry point — wraps NavigationContainer & Store
│
├── tailwind.config.js    # NativeWind configuration — theme, custom colours
└── app.json              # Expo config — app name, icons, permissions, plugins
```

---

## /shared

Framework-agnostic code consumed by both `/client` and `/server`. Keeps validation schemas and constants in one place to prevent drift between the two sides.

```
/shared
├── /schemas              # Phaistos validation schemas
│   ├── user.schema.json          # Validates user registration & profile payloads
│   ├── message.schema.json       # Validates chat message structure
│   └── organization.schema.json  # Validates org creation & update payloads
│
└── /constants            # Shared strings, enums, and type references
    ├── roles.js                  # e.g. ADMIN, MEMBER, MODERATOR
    ├── routes.js                 # API route name constants
    └── errorMessages.js          # Standardised error strings used on both ends
```

---

## Key Conventions

| Convention | Rule |
|---|---|
| Feature isolation | Each feature in `/features` owns its screens, components, and services |
| No logic in routes | `/routes` only maps URLs to controllers — zero business logic |
| Shared schemas | Phaistos schemas live in `/shared` — imported by both client validator and server middleware |
| Secrets | All secrets live in `.env` — never hardcoded, never committed |
| Naming | Files use `camelCase.js` for logic, `PascalCase.jsx` for React components |

---

*Monorepo · React Native + Expo · Node.js + Express · MongoDB Atlas · 2026*
