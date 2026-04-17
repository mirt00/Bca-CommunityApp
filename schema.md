# Database Schema Documentation

---

## 1. User Schema

Represents individual users of the platform. Users can register via OAuth providers (Google, LinkedIn, GitHub) or directly with email.

### Fields

| Field             | Type     | Required | Constraints / Notes                                              |
|-------------------|----------|----------|------------------------------------------------------------------|
| `profilePicture`  | File/URL | Optional | Uploaded image; stored as a URL reference                       |
| `fullName`        | String   | Required | User's full legal name                                           |
| `nickname`        | String   | Optional | Display name / username                                          |
| `bio`             | String   | Optional | Short personal description                                       |
| `dateOfBirth`     | Date     | Required | Format: `YYYY-MM-DD`                                             |
| `batch`           | String   | Required | Academic batch / graduation year (e.g., `2022`, `2023–2025`)    |
| `faculty`         | String   | Required | Faculty or department name                                       |
| `organizationName`| String   | Optional | Name of the organization the user belongs to                     |
| `email`           | String   | Required | Unique; used for password reset and identity verification        |
| `password`        | String   | Required | Hashed; minimum 8 characters                                     |
| `linkedin`        | String   | Required | Full LinkedIn profile URL — **mandatory on profile**             |
| `github`          | String   | Required | Full GitHub profile URL — **mandatory on profile**               |

### Authentication & OAuth

Users may sign up or log in using any of the following providers:

| Provider  | Notes                                     |
|-----------|-------------------------------------------|
| Google    | OAuth 2.0; email auto-populated           |
| LinkedIn  | OAuth 2.0; LinkedIn URL auto-populated    |
| GitHub    | OAuth 2.0; GitHub URL auto-populated      |

> **Note:** Regardless of the sign-up method, `linkedin` and `github` fields are **mandatory** on the user profile and must be filled in before the profile is considered complete.

### Profile Management

- Users can **edit** any profile field at any time.
- Users can **reset their password** from the account settings page (requires current password).
- Users who **forget their password** can trigger a password reset link via their registered email address.

---

## 2. Organization Schema

Represents an organization or club that can be associated with users on the platform.

### Fields

| Field             | Type     | Required | Constraints / Notes                                              |
|-------------------|----------|----------|------------------------------------------------------------------|
| `organizationLogo`| File/URL | Optional | Uploaded image; stored as a URL reference                       |
| `organizationName`| String   | Required | Unique name of the organization                                  |
| `establishedDate` | Date     | Required | Format: `YYYY-MM-DD`                                             |
| `location`        | String   | Required | City, country or full address                                    |
| `facebookPage`    | String   | Optional | Full Facebook page URL                                           |
| `website`         | String   | Optional | Full URL of the official website                                 |
| `linkedin`        | String   | Optional | Full LinkedIn organization page URL                              |

---

## 3. Relationships

```
User ──────────────── Organization
(organizationName)    (organizationName)

Many users can belong to one organization.
```

---

## 4. Notes & Conventions

- All URLs must be fully qualified (e.g., `https://linkedin.com/in/username`).
- All dates use the `YYYY-MM-DD` ISO 8601 format.
- Passwords are **never** stored in plain text — always hashed (e.g., bcrypt).
- `email` is the primary identifier for password recovery flows.
- OAuth-linked accounts can still set a local password for fallback access.
