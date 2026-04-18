# Database Schema Documentation

---

## 1. User Schema

Represents authentication data for all users (students, admins, organizations).

### Fields

| Field             | Type     | Required | Constraints / Notes                                              |
|-------------------|----------|----------|------------------------------------------------------------------|
| `email`           | String   | Required | Unique; used for login and password reset                        |
| `passwordHash`    | String   | Required | Hashed password; minimum 8 characters                            |
| `isApproved`      | Boolean  | Required | `false` for pending students, `true` for approved users and orgs |
| `role`            | String   | Required | Enum: `student`, `admin`, `organization`                         |
| `oauthProviders`  | Object   | Optional | OAuth provider data (Google, LinkedIn, GitHub)                  |
| `resetToken`      | String   | Optional | Single-use password reset token                                  |
| `resetTokenExpiry`| Date     | Optional | Expiry time for reset token                                      |

---

## 2. UserProfile Schema

Represents profile information for individual users (students and organization representatives).

### Fields

| Field             | Type     | Required | Constraints / Notes                                              |
|-------------------|----------|----------|------------------------------------------------------------------|
| `userId`          | ObjectId | Required | Reference to User document                                       |
| `profilePicture`  | String   | Optional | Cloudinary URL for profile picture                               |
| `fullName`        | String   | Required | User's full legal name                                           |
| `nickname`        | String   | Optional | Display name / username                                          |
| `bio`             | String   | Optional | Short personal description                                       |
| `dateOfBirth`     | Date     | Required | For students only                                                |
| `batch`           | String   | Required | Academic batch (for students only)                               |
| `faculty`         | String   | Required | Faculty/department (for students only)                           |
| `organizationId`  | ObjectId | Optional | Reference to Organization (for organization users)               |
| `linkedin`        | String   | Required | Full LinkedIn profile URL                                        |
| `github`          | String   | Required | Full GitHub profile URL                                          |

---

## 3. Organization Schema

Represents organizations that can have user representatives on the platform.

### Fields

| Field             | Type     | Required | Constraints / Notes                                              |
|-------------------|----------|----------|------------------------------------------------------------------|
| `organizationName`| String   | Required | Unique name of the organization                                  |
| `logo`            | String   | Optional | Cloudinary URL for organization logo                             |
| `establishedDate` | Date     | Required | When the organization was founded                                |
| `location`        | String   | Required | City, country or full address                                    |
| `website`         | String   | Optional | Official website URL                                             |
| `socials.facebook`| String   | Optional | Facebook page URL                                               |
| `socials.linkedin`| String   | Optional | LinkedIn organization page URL                                   |

---

## 4. Relationships

```
User (role: 'student'/'organization')
├── UserProfile (contains personal info)
│   └── organizationId → Organization (for org users)
└── Authentication data

User (role: 'admin')
└── UserProfile (contains personal info)
    └── No organization association

Organization
└── Referenced by UserProfile.organizationId
```

---

## 5. Authentication & Authorization

### User Roles
- **Student**: Regular users who need admin approval
- **Organization**: Organization representatives (auto-approved)
- **Admin**: Platform administrators (auto-approved)

### Approval Process
- Students register → `isApproved: false` → Admin approval required
- Organizations register → `isApproved: true` → No approval needed
- Admins are created by other admins → `isApproved: true`

### Access Control
- Admin routes: `role === 'admin' || role === 'organization'`
- Student approval: Only admins and organizations can approve/reject
- Group creation: Any approved user can create groups

---

## 6. Notes & Conventions

- All URLs must be fully qualified (e.g., `https://linkedin.com/in/username`).
- All dates use ISO 8601 format.
- Passwords are **never** stored in plain text — always hashed with Argon2id.
- `email` is the primary identifier for authentication.
- OAuth providers store access tokens for API integration.
- Organizations have separate profiles from their representatives.
