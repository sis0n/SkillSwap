# SkillSwap API Specification

> Version: 2.0.0 (MVP)
> API Style: REST
> Base URL: /api/v1
> Authentication: Laravel Sanctum SPA (Session-based)
> Response: JSON

---

# Overview

This document defines the MVP API contract for SkillSwap.

---

# API Standards

- RESTful endpoints
- JSON request/response
- Versioned API (`/api/v1`)
- Authenticated endpoints require Sanctum SPA session authentication
- CSRF protection via `/sanctum/csrf-cookie`
- Pagination for list endpoints

---

# Success Response

```json
{
  "success": true,
  "message": "Request successful.",
  "data": {}
}
```

# Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {}
}
```

---

# HTTP Status Codes

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Validation Error
- 429 Too Many Requests
- 500 Internal Server Error

---

# Authentication

| Method | Endpoint                      | Auth  |
| ------ | ----------------------------- | ----- |
| POST   | /auth/register                | Guest |
| POST   | /auth/login                   | Guest |
| POST   | /auth/logout                  | User  |
| GET    | /auth/me                      | User  |
| POST   | /auth/email/send-code         | Guest |
| POST   | /auth/email/verify-code       | Guest |
| GET    | /auth/{provider}/redirect     | Guest |
| GET    | /auth/{provider}/callback     | Guest |

## POST /auth/register

Register a new user account. Handles four distinct cases based on the email state.

**Auth:** Guest

**Request:**
```json
{
  "first_name": "John",
  "middle_name": null,
  "last_name": "Doe",
  "suffix": null,
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Case 1 — Email does not exist (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "email": "john@example.com"
  }
}
```

**Case 2 — Email exists and is verified (409 Conflict):**
```json
{
  "success": false,
  "message": "This email is already registered.",
  "errors": {
    "email": ["This email is already registered."]
  }
}
```

**Case 3 — Email exists, unverified, code still valid (200 OK):**
```json
{
  "success": true,
  "message": "A verification code has already been sent to this email.",
  "data": {
    "email": "john@example.com"
  }
}
```

**Case 4 — Email exists, unverified, code expired (200 OK):**
```json
{
  "success": true,
  "message": "Registration successful. A new verification code has been sent to your email.",
  "data": {
    "email": "john@example.com"
  }
}
```

---

## POST /auth/login

Authenticate with email and password. Only verified accounts can log in.

**Auth:** Guest

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "role": {
        "id": 2,
        "name": "User",
        "slug": "user"
      },
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "email_verified_at": "2026-07-24T12:00:00.000000Z",
      "created_at": "2026-07-24T12:00:00.000000Z",
      "updated_at": "2026-07-24T12:00:00.000000Z"
    }
  }
}
```

**Error — Invalid credentials (401):**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

**Error — Unverified email (403):**
```json
{
  "success": false,
  "message": "Please verify your email before logging in.",
  "errors": {
    "email": ["Email not yet verified."],
    "requires_verification": true
  }
}
```

---

## Email Verification (6-Digit Code)

### POST /auth/email/send-code

Send or resend a 6-digit verification code. Enforces a 60-second cooldown between requests.

**Auth:** Guest (requires email)

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent.",
  "data": {
    "expires_at": "2026-07-24T12:30:00.000000Z"
  }
}
```

**Error — Cooldown active (429):**
```json
{
  "success": false,
  "message": "Please wait before requesting a new code.",
  "errors": {
    "retry_after": 45
  }
}
```

**Error — Already verified (400):**
```json
{
  "success": false,
  "message": "Email already verified."
}
```

### POST /auth/email/verify-code

Verify an email address using a 6-digit code.

**Auth:** Guest (requires email and code)

**Request:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

**Error — Invalid code (422):**
```json
{
  "success": false,
  "message": "Invalid verification code.",
  "errors": {
    "code": ["The verification code is invalid."]
  }
}
```

**Error — Expired code (422):**
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new one.",
  "errors": {
    "code": ["The verification code has expired. Please request a new one."]
  }
}
```

**Error — No code found (422):**
```json
{
  "success": false,
  "message": "No verification code found. Please request a new one.",
  "errors": {
    "code": ["No verification code found. Please request a new one."]
  }
}
```

**Error — Already verified (200):**
```json
{
  "success": true,
  "message": "Email already verified."
}
```

---

## OAuth Authentication

OAuth endpoints are web routes (not API routes) because they require browser redirects.

These endpoints work with any configured provider (currently: `google`).

Adding a new provider requires:
1. Adding provider config to `config/services.php`
2. Adding the provider to `SocialAuthService::PROVIDERS` whitelist

### GET /auth/{provider}/redirect

Redirect the user to the provider's OAuth consent screen.

**Auth:** Guest

**Response:** 302 Redirect to provider's OAuth URL.

### GET /auth/{provider}/callback

Handle the OAuth callback from the provider.

**Auth:** Guest (but establishes a session on success)

**Case 1 — Provider account already linked:**
- Authenticate the existing linked user.
- Regenerate the session.
- Redirect to `FRONTEND_URL/auth/callback`.

**Case 2 — Email exists but never linked to provider:**
- Link the provider account to the existing user.
- Auto-verify the email if unverified (provider confirms verification).
- Authenticate, regenerate session.
- Redirect to `FRONTEND_URL/auth/callback`.

**Case 2 — Rejection (existing link cannot be overwritten):**
- If the user already has a different provider account linked.
- Redirect to `FRONTEND_URL/login?error=...`.

**Case 3 — New email:**
- Create a new user with `Hash::make(Str::random(64))` as password.
- Save the provider identifier and avatar URL.
- Set `email_verified_at` automatically.
- Authenticate, regenerate session.
- Redirect to `FRONTEND_URL/auth/callback`.

**Error — Unverified provider email:**
- Redirect to `FRONTEND_URL/login?error=...`.

**Error — Provider exception or invalid state:**
- Redirect to `FRONTEND_URL/login?error=...`.

---

# Current User

| Method | Endpoint |
| ------ | -------- |
| GET    | /me      |
| PUT    | /me      |

Update Fields

- first_name
- middle_name
- last_name
- suffix
- bio
- avatar
- location

---

# Public Users

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | /users/{username}         |
| GET    | /users/{username}/reviews |

---

# Skill Categories

| Method | Endpoint          |
| ------ | ----------------- |
| GET    | /skill-categories |

---

# Skills

| Method | Endpoint     |
| ------ | ------------ |
| GET    | /skills      |
| GET    | /skills/{id} |
| POST   | /skills      |

Create Skill

- category_id
- name

---

# My Skills

| Method | Endpoint        |
| ------ | --------------- |
| GET    | /me/skills      |
| POST   | /me/skills      |
| PUT    | /me/skills/{id} |
| DELETE | /me/skills/{id} |

Body

- skill_id
- type (teaching|learning)
- title
- description
- experience_level
- years_of_experience
- teaching_style
- portfolio_url

---

# Marketplace

| Method | Endpoint     |
| ------ | ------------ |
| GET    | /marketplace |

Supported Query Parameters

- search
- category
- type
- experience
- page
- per_page

Example

GET /marketplace?search=Laravel&category=Programming&type=teaching

---

# Exchange Requests

| Method | Endpoint                        |
| ------ | ------------------------------- |
| GET    | /exchange-requests              |
| GET    | /exchange-requests/{id}         |
| POST   | /exchange-requests              |
| PATCH  | /exchange-requests/{id}/accept  |
| PATCH  | /exchange-requests/{id}/decline |
| PATCH  | /exchange-requests/{id}/cancel  |

Create Body

- receiver_id
- teaching_skill_id
- learning_skill_id
- message

---

# Conversations

| Method | Endpoint            |
| ------ | ------------------- |
| GET    | /conversations      |
| GET    | /conversations/{id} |

Only available after an exchange request is accepted.

---

# Messages

| Method | Endpoint                     |
| ------ | ---------------------------- |
| GET    | /conversations/{id}/messages |
| POST   | /conversations/{id}/messages |

Body

- message

---

# Learning Sessions

| Method | Endpoint                         |
| ------ | -------------------------------- |
| GET    | /learning-sessions               |
| POST   | /learning-sessions               |
| GET    | /learning-sessions/{id}          |
| PUT    | /learning-sessions/{id}          |
| PATCH  | /learning-sessions/{id}/complete |
| DELETE | /learning-sessions/{id}          |

Body

- exchange_request_id
- title
- description
- start_time
- end_time
- meeting_link

---

# Session Resources

| Method | Endpoint                          |
| ------ | --------------------------------- |
| GET    | /learning-sessions/{id}/resources |
| POST   | /learning-sessions/{id}/resources |
| DELETE | /session-resources/{id}           |

---

# Reviews

| Method | Endpoint                  |
| ------ | ------------------------- |
| POST   | /reviews                  |
| GET    | /users/{username}/reviews |

Body

- learning_session_id
- rating
- comment

Only users that completed a session can submit reviews.

---

# Pagination

```json
{
  "data": [],
  "links": {},
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 0
  }
}
```

---

# Permissions

Guest

- Register
- Login
- Browse marketplace
- View public profiles

Authenticated User

- Manage profile
- Manage skills
- Send exchange requests
- Message matched users
- Schedule sessions
- Leave reviews

---

# Future Endpoints

- Notifications
- AI Matching
- Skill Credits
- Certificates
- Video Calling
- Group Learning
