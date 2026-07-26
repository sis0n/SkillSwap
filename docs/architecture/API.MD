# SkillSwap API Specification

> Version: 2.1.0 (MVP)
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

# Languages

| Method | Endpoint      | Auth  |
| ------ | ------------- | ----- |
| GET    | /languages    | Guest |

## GET /languages

Get the list of supported languages. Languages are system-managed reference data (CLDR curated subset). This endpoint is public and unauthenticated.

**Auth:** Guest (no authentication required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Languages retrieved.",
  "data": {
    "languages": [
      {
        "id": 1,
        "code": "en",
        "name": "English",
        "native_name": "English"
      },
      {
        "id": 2,
        "code": "es",
        "name": "Spanish",
        "native_name": "Español"
      }
    ]
  }
}
```

---

# Current User

| Method | Endpoint                            | Auth  |
| ------ | ----------------------------------- | ----- |
| GET    | /languages                          | Guest |
| GET    | /me                                 | User  |
| GET    | /me/profile                         | User  |
| PUT    | /me/profile                         | User  |
| POST   | /me/avatar                          | User  |
| DELETE | /me/avatar                          | User  |
| GET    | /me/availability                    | User  |
| PUT    | /me/availability                    | User  |
| GET    | /me/portfolio-links                 | User  |
| POST   | /me/portfolio-links                 | User  |
| PUT    | /me/portfolio-links/{portfolioLink} | User  |
| DELETE | /me/portfolio-links/{portfolioLink} | User  |
| PUT    | /me/portfolio-links/reorder         | User  |

---

# Public Users

| Method | Endpoint                  | Auth  |
| ------ | ------------------------- | ----- |
| GET    | /users/{username}         | Guest |
| GET    | /users/{username}/reviews | Guest |

---

# Portfolio Links

Portfolio links are external URLs to a user's work or social profiles across 11 supported platforms. Each user can have multiple links, manually reorderable.

| Method | Endpoint                            | Auth  |
| ------ | ----------------------------------- | ----- |
| GET    | /me/portfolio-links                 | User  |
| POST   | /me/portfolio-links                 | User  |
| PUT    | /me/portfolio-links/{portfolioLink} | User  |
| DELETE | /me/portfolio-links/{portfolioLink} | User  |
| PUT    | /me/portfolio-links/reorder         | User  |

---

## GET /me/portfolio-links

Get all portfolio links for the authenticated user, ordered by display_order.

**Auth:** User (Sanctum session)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Portfolio links retrieved.",
  "data": {
    "portfolio_links": [
      {
        "id": 1,
        "platform": "github",
        "url": "github.com/johndoe",
        "display_order": 0
      },
      {
        "id": 2,
        "platform": "linkedin",
        "url": "linkedin.com/in/johndoe",
        "display_order": 1
      }
    ]
  }
}
```

---

## POST /me/portfolio-links

Create a new portfolio link.

**Auth:** User (Sanctum session)

**Request:**
```json
{
  "platform": "github",
  "url": "github.com/johndoe"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Portfolio link created.",
  "data": {
    "portfolio_link": {
      "id": 1,
      "platform": "github",
      "url": "github.com/johndoe",
      "display_order": 0
    }
  }
}
```

**Error — Invalid platform (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "platform": ["The selected platform is invalid."]
  }
}
```

**Error — Invalid URL for platform (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "url": ["The url must be a valid github URL."]
  }
}
```

**Validation Rules:**

| Field    | Rules                                    |
| -------- | ---------------------------------------- |
| platform | string, required, in:github,gitlab,...   |
| url      | string, required, max:500, ValidPortfolioUrl |

---

## PUT /me/portfolio-links/{portfolioLink}

Update an existing portfolio link. Only the owner can update their links.

**Auth:** User (Sanctum session)

**Request:**
```json
{
  "platform": "linkedin",
  "url": "linkedin.com/in/johndoe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Portfolio link updated.",
  "data": {
    "portfolio_link": {
      "id": 1,
      "platform": "linkedin",
      "url": "linkedin.com/in/johndoe",
      "display_order": 0
    }
  }
}
```

**Error — Forbidden (403):**
```json
{
  "success": false,
  "message": "You do not own this portfolio link."
}
```

---

## DELETE /me/portfolio-links/{portfolioLink}

Delete a portfolio link. Display order of remaining links is compacted.

**Auth:** User (Sanctum session)

**Success Response (204):** No content

---

## PUT /me/portfolio-links/reorder

Reorder all portfolio links by providing an ordered array of link IDs.

**Auth:** User (Sanctum session)

**Request:**
```json
{
  "ordered_ids": [2, 1]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Portfolio links reordered.",
  "data": {
    "portfolio_links": [
      {
        "id": 2,
        "platform": "linkedin",
        "url": "linkedin.com/in/johndoe",
        "display_order": 0
      },
      {
        "id": 1,
        "platform": "github",
        "url": "github.com/johndoe",
        "display_order": 1
      }
    ]
  }
}
```

**Validation Rules:**

| Field        | Rules                    |
| ------------ | ------------------------ |
| ordered_ids  | array, required          |
| ordered_ids.*| integer, exists:portfolio_links,id |

---

## GET /me/profile

Get the authenticated user's profile including personal information and availability.

**Auth:** User (Sanctum session)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved.",
  "data": {
    "user": {
      "id": 1,
      "role": {
        "id": 2,
        "name": "User",
        "slug": "user"
      },
      "first_name": "John",
      "middle_name": null,
      "last_name": "Doe",
      "suffix": null,
      "username": "johndoe",
      "email": "john@example.com",
      "email_verified_at": "2026-07-24T12:00:00.000000Z",
      "created_at": "2026-07-24T12:00:00.000000Z",
      "updated_at": "2026-07-24T12:00:00.000000Z",
      "profile": {
        "bio": "Full-stack developer passionate about teaching.",
        "headline": "Full-stack Developer & Mentor",
        "avatar_url": "https://api.skillswap.com/storage/avatars/abc123.jpg",
        "location": "Manila, Philippines",
        "website": "https://johndoe.dev",
        "experience_level": "intermediate",
        "timezone": "Asia/Manila"
      },
      "languages": [
        {
          "code": "en",
          "name": "English",
          "native_name": "English",
          "proficiency": "native"
        },
        {
          "code": "es",
          "name": "Spanish",
          "native_name": "Español",
          "proficiency": "intermediate"
        }
      ],
      "availability": [
        {
          "id": 1,
          "day_of_week": 1,
          "day_label": "Monday",
          "start_time": "09:00:00",
          "end_time": "12:00:00"
        },
        {
          "id": 2,
          "day_of_week": 3,
          "day_label": "Wednesday",
          "start_time": "14:00:00",
          "end_time": "17:00:00"
        }
      ],
      "portfolio_links": [
        {
          "id": 1,
          "platform": "github",
          "url": "github.com/johndoe",
          "display_order": 0
        },
        {
          "id": 2,
          "platform": "linkedin",
          "url": "linkedin.com/in/johndoe",
          "display_order": 1
        }
      ]
    }
  }
}
```

**Error — Unauthenticated (401):**
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

---

## PUT /me/profile

Update the authenticated user's profile fields. Creates a profile record if one does not already exist.

**Auth:** User (Sanctum session)

**Request:**
```json
{
  "headline": "Full-stack Developer & Mentor",
  "bio": "Full-stack developer passionate about teaching.",
  "location": "Manila, Philippines",
  "experience_level": "intermediate",
  "timezone": "Asia/Manila",
  "languages": [
    {
      "code": "en",
      "proficiency": "native"
    },
    {
      "code": "es",
      "proficiency": "intermediate"
    }
  ],
  "portfolio_links": [
    {
      "platform": "github",
      "url": "github.com/johndoe"
    },
    {
      "platform": "linkedin",
      "url": "linkedin.com/in/johndoe"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated.",
  "data": {
    "profile": {
      "bio": "Full-stack developer passionate about teaching.",
      "headline": "Full-stack Developer & Mentor",
      "avatar_url": null,
      "location": "Manila, Philippines",
      "website": "https://johndoe.dev",
      "experience_level": "intermediate",
      "timezone": "Asia/Manila"
    }
  }
}
```

**Error — Validation (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "bio": ["The bio field must not be greater than 500 characters."],
    "website": ["The website field must be a valid URL."],
    "experience_level": ["The selected experience level is invalid."]
  }
}
```

**Validation Rules:**

| Field                          | Rules                                    |
| ------------------------------ | ---------------------------------------- |
| headline                       | string, max:100, nullable                |
| bio                            | string, max:500, nullable                |
| location                       | string, max:100, nullable                |
| website                        | string, url, max:200, nullable           |
| experience_level               | string, in:beginner,intermediate,advanced, nullable |
| timezone                       | string, max:50, nullable                 |
| languages                      | array, nullable                          |
| languages.*.code               | string, exists:languages,code, required_with:languages |
| languages.*.proficiency        | string, in:native,fluent,intermediate,beginner, required_with:languages |
| portfolio_links                | array, nullable                          |
| portfolio_links.*.platform     | string, in:github,gitlab,..., required_with:portfolio_links |
| portfolio_links.*.url          | string, max:500, required_with:portfolio_links |

---

## GET /users/{username}

Get a user's public profile. Only public fields are returned.

**Auth:** Guest (no authentication required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved.",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "middle_name": null,
      "last_name": "Doe",
      "suffix": null,
      "username": "johndoe",
      "created_at": "2026-07-24T12:00:00.000000Z",
      "profile": {
        "bio": "Full-stack developer passionate about teaching.",
        "headline": "Full-stack Developer & Mentor",
        "avatar_url": "https://api.skillswap.com/storage/avatars/abc123.jpg",
        "location": "Manila, Philippines",
        "experience_level": "intermediate",
        "timezone": "Asia/Manila"
      },
      "languages": [
        {
          "code": "en",
          "name": "English",
          "native_name": "English",
          "proficiency": "native"
        }
      ],
      "availability": [
        {
          "id": 1,
          "day_of_week": 1,
          "day_label": "Monday",
          "start_time": "09:00:00",
          "end_time": "12:00:00"
        }
      ],
      "portfolio_links": [
        {
          "id": 1,
          "platform": "github",
          "url": "github.com/johndoe",
          "display_order": 0
        }
      ]
    }
  }
}
```

**Notes:**
- Email, email_verified_at, role, and updated_at are never exposed
- Languages are public (all users can see another user's languages)
- Timezone is public
- Availability is included only if the user has set any slots

**Error — Not Found (404):**
```json
{
  "success": false,
  "message": "User not found."
}
```

---

## POST /me/avatar

Upload a profile picture. Replaces any existing avatar.

**Auth:** User (Sanctum session)

**Request:** multipart/form-data

| Field  | Type | Required | Notes                     |
| ------ | ---- | -------- | ------------------------- |
| avatar | file | Yes      | jpeg, png, webp, gif, max 2MB |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded.",
  "data": {
    "avatar_url": "https://api.skillswap.com/storage/avatars/abc123.jpg"
  }
}
```

**Error — Validation (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "avatar": ["The avatar must be an image.", "The avatar must not be greater than 2048 kilobytes."]
  }
}
```

---

## DELETE /me/avatar

Remove the profile picture. Sets avatar to null.

**Auth:** User (Sanctum session)

**Success Response (204):** No content

Succeeds even if the user has no avatar (idempotent).

---

## GET /me/availability

Get all availability slots for the authenticated user.

**Auth:** User (Sanctum session)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Availability retrieved.",
  "data": {
    "availability": [
      {
        "id": 1,
        "day_of_week": 1,
        "day_label": "Monday",
        "start_time": "09:00:00",
        "end_time": "12:00:00"
      }
    ]
  }
}
```

---

## PUT /me/availability

Replace all availability slots for the authenticated user. This is a full replacement — the client sends the complete desired schedule and the backend replaces all existing slots.

**Auth:** User (Sanctum session)

**Request:**
```json
{
  "availability": [
    {
      "day_of_week": 1,
      "start_time": "09:00:00",
      "end_time": "12:00:00"
    },
    {
      "day_of_week": 3,
      "start_time": "14:00:00",
      "end_time": "17:00:00"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Availability updated.",
  "data": {
    "availability": [
      {
        "id": 1,
        "day_of_week": 1,
        "day_label": "Monday",
        "start_time": "09:00:00",
        "end_time": "12:00:00"
      },
      {
        "id": 2,
        "day_of_week": 3,
        "day_label": "Wednesday",
        "start_time": "14:00:00",
        "end_time": "17:00:00"
      }
    ]
  }
}
```

**Error — Validation (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "availability.0.day_of_week": ["The day_of_week must be between 0 and 6."],
    "availability.0.start_time": ["The start_time must be before end_time."]
  }
}
```

**Validation Rules:**

| Field                           | Rules                                    |
| ------------------------------- | ---------------------------------------- |
| availability                    | array, nullable                          |
| availability.*.day_of_week      | integer, between:0,6, required           |
| availability.*.start_time       | date_format:H:i:s, required              |
| availability.*.end_time         | date_format:H:i:s, required, after:start_time |

**Notes:**
- Sending an empty array (`"availability": []`) clears all slots
- Each slot's start_time must be before its end_time
- Overlapping slots on the same day are not validated server-side (client should prevent)

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
- View public profiles (`GET /users/{username}`)

Authenticated User

- View own profile (`GET /me/profile`)
- Edit profile (`PUT /me/profile`)
- Upload avatar (`POST /me/avatar`)
- Remove avatar (`DELETE /me/avatar`)
- View own availability (`GET /me/availability`)
- Update availability (`PUT /me/availability`)
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
