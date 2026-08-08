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
      ],
      "user_skills": {
        "teaching": [
          {
            "id": 1,
            "skill_id": 5,
            "skill": {
              "id": 5,
              "name": "Laravel",
              "slug": "laravel",
              "sort_order": 0,
              "categories": [
                {
                  "id": 1,
                  "name": "Programming",
                  "slug": "programming"
                }
              ]
            },
            "type": "teaching",
            "title": "Laravel Development",
            "description": "I can teach Laravel from basics to advanced topics.",
            "experience_level": "advanced",
            "years_of_experience": 5,
            "teaching_style": "Hands-on, project-based",
            "featured": true,
            "created_at": "2026-07-26T12:00:00.000000Z",
            "updated_at": "2026-07-26T12:00:00.000000Z"
          }
        ],
        "learning": [
          {
            "id": 2,
            "skill_id": 12,
            "skill": {
              "id": 12,
              "name": "Spanish",
              "slug": "spanish",
              "sort_order": 0,
              "categories": [
                {
                  "id": 4,
                  "name": "Languages",
                  "slug": "languages"
                }
              ]
            },
            "type": "learning",
            "title": "Spanish Language",
            "description": "I want to become fluent in conversational Spanish.",
            "experience_level": "beginner",
            "years_of_experience": null,
            "teaching_style": null,
            "featured": false,
            "created_at": "2026-07-26T12:00:00.000000Z",
            "updated_at": "2026-07-26T12:00:00.000000Z"
          }
        ]
      }
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
      ],
      "user_skills": {
        "teaching": [
          {
            "id": 1,
            "skill_id": 5,
            "skill": {
              "id": 5,
              "name": "Laravel",
              "slug": "laravel",
              "sort_order": 0,
              "categories": [
                {
                  "id": 1,
                  "name": "Programming",
                  "slug": "programming"
                }
              ]
            },
            "type": "teaching",
            "title": "Laravel Development",
            "description": "I can teach Laravel from basics to advanced topics.",
            "experience_level": "advanced",
            "years_of_experience": 5,
            "teaching_style": "Hands-on, project-based",
            "featured": true,
            "created_at": "2026-07-26T12:00:00.000000Z",
            "updated_at": "2026-07-26T12:00:00.000000Z"
          }
        ],
        "learning": [
          {
            "id": 2,
            "skill_id": 12,
            "skill": {
              "id": 12,
              "name": "Spanish",
              "slug": "spanish",
              "sort_order": 0,
              "categories": [
                {
                  "id": 4,
                  "name": "Languages",
                  "slug": "languages"
                }
              ]
            },
            "type": "learning",
            "title": "Spanish Language",
            "description": "I want to become fluent in conversational Spanish.",
            "experience_level": "beginner",
            "years_of_experience": null,
            "teaching_style": null,
            "featured": false,
            "created_at": "2026-07-26T12:00:00.000000Z",
            "updated_at": "2026-07-26T12:00:00.000000Z"
          }
        ]
      }
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

| Method | Endpoint          | Auth  |
| ------ | ----------------- | ----- |
| GET    | /skill-categories | Guest |

## GET /skill-categories

Get all skill categories, ordered by `sort_order` then alphabetically by name.

**Auth:** Guest (no authentication required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Skill categories retrieved.",
  "data": {
    "skill_categories": [
      {
        "id": 1,
        "name": "Programming",
        "slug": "programming",
        "icon": "code",
        "sort_order": 0
      },
      {
        "id": 2,
        "name": "Design",
        "slug": "design",
        "icon": "palette",
        "sort_order": 1
      }
    ]
  }
}
```

**Notes:**
- Categories are system-managed reference data. No create/edit/delete endpoints.
- Response order: `sort_order` ascending, then alphabetical by `name`.

---

# Skills

| Method | Endpoint     | Auth  |
| ------ | ------------ | ----- |
| GET    | /skills      | Guest |

## GET /skills

Search and filter available skills. Skills are system-managed reference data — users cannot create skills.

**Auth:** Guest (no authentication required)

**Query Parameters:**

| Parameter    | Type    | Required | Description                                    |
| ------------ | ------- | -------- | ---------------------------------------------- |
| search       | string  | No       | Search skills by name (partial match)          |
| category_id  | integer | No       | Filter by category ID                          |

**Examples:**
- `/skills` — list all skills
- `/skills?search=photo` — search for skills matching "photo"
- `/skills?category_id=4` — filter by photography category

**Success Response (200):**
```json
{
  "success": true,
  "message": "Skills retrieved.",
  "data": {
    "skills": [
      {
        "id": 1,
        "name": "PHP",
        "slug": "php",
        "sort_order": 0,
        "categories": [
          {
            "id": 1,
            "name": "Programming",
            "slug": "programming"
          }
        ]
      },
      {
        "id": 2,
        "name": "Laravel",
        "slug": "laravel",
        "sort_order": 1,
        "categories": [
          {
            "id": 1,
            "name": "Programming",
            "slug": "programming"
          }
        ]
      }
    ]
  }
}
```

**Notes:**
- Skills are a global catalog with unique names (case-insensitive normalized).
- Users can create custom skills via `POST /me/skills` using `skill_name` + `category_ids`.
- If a skill with the same normalized name already exists, the existing record is reused.
- Response order: `sort_order` ascending, then alphabetical by `name`.
- The `categories` array is ordered by `sort_order` ascending, then alphabetical by `name`.
- A skill can belong to multiple categories.

---

# My Skills

| Method | Endpoint          | Auth  |
| ------ | ----------------- | ----- |
| GET    | /me/skills        | User  |
| POST   | /me/skills        | User  |
| PUT    | /me/skills/{id}   | User  |
| DELETE | /me/skills/{id}   | User  |

---

## GET /me/skills

Get all skills for the authenticated user.

**Auth:** User (Sanctum session)

**Query Parameters:**

| Parameter    | Type    | Required | Description                                    |
| ------------ | ------- | -------- | ---------------------------------------------- |
| category_id  | integer | No       | Filter skills by category ID                   |

**Examples:**
- `/me/skills` — list all of my skills
- `/me/skills?category_id=3` — filter my skills by category ID 3

**Success Response (200):**
```json
{
  "success": true,
  "message": "User skills retrieved.",
  "data": {
    "user_skills": [
      {
        "id": 1,
        "skill_id": 5,
        "skill": {
          "id": 5,
          "name": "Laravel",
          "slug": "laravel",
          "sort_order": 0,
          "categories": [
            {
              "id": 1,
              "name": "Programming",
              "slug": "programming"
            }
          ]
        },
        "type": "teaching",
        "title": "Laravel Development",
        "description": "I can teach Laravel from basics to advanced topics.",
        "experience_level": "advanced",
        "years_of_experience": 5,
        "teaching_style": "Hands-on, project-based",
        "featured": true,
        "created_at": "2026-07-26T12:00:00.000000Z",
        "updated_at": "2026-07-26T12:00:00.000000Z"
      },
      {
        "id": 2,
        "skill_id": 12,
        "skill": {
          "id": 12,
          "name": "Spanish",
          "slug": "spanish",
          "sort_order": 0,
          "categories": [
            {
              "id": 4,
              "name": "Languages",
              "slug": "languages"
            }
          ]
        },
        "type": "learning",
        "title": "Spanish Language",
        "description": "I want to become fluent in conversational Spanish.",
        "experience_level": "beginner",
        "years_of_experience": null,
        "teaching_style": null,
        "featured": false,
        "created_at": "2026-07-26T12:00:00.000000Z",
        "updated_at": "2026-07-26T12:00:00.000000Z"
      }
    ]
  }
}
```

**Response Order (deterministic):**
1. Featured skills first (`featured = true`)
2. Teaching skills before learning skills
3. Alphabetical by skill name within each group

---

## POST /me/skills

Add a new skill for the authenticated user.

**Auth:** User (Sanctum session)

**Request:**
```json
{
  "skill_id": 5,
  "type": "teaching",
  "title": "Laravel Development",
  "description": "I can teach Laravel from basics to advanced topics.",
  "experience_level": "advanced",
  "years_of_experience": 5,
  "teaching_style": "Hands-on, project-based",
  "featured": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User skill created.",
  "data": {
    "user_skill": {
      "id": 1,
      "skill_id": 5,
      "skill": {
        "id": 5,
        "name": "Laravel",
        "slug": "laravel",
        "sort_order": 0,
        "categories": [
          {
            "id": 1,
            "name": "Programming",
            "slug": "programming"
          }
        ]
      },
      "type": "teaching",
      "title": "Laravel Development",
      "description": "I can teach Laravel from basics to advanced topics.",
      "experience_level": "advanced",
      "years_of_experience": 5,
      "teaching_style": "Hands-on, project-based",
      "featured": true,
      "created_at": "2026-07-26T12:00:00.000000Z",
      "updated_at": "2026-07-26T12:00:00.000000Z"
    }
  }
}
```

**Error — Duplicate (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "skill_id": ["You have already added this skill for teaching."]
  }
}
```

**Error — Skill limit reached (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "skill_id": ["You can only have up to 30 skills."]
  }
}
```

**Error — Featured limit reached (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "featured": ["You can only feature up to 3 skills."]
  }
}
```

**Validation Rules:**

| Field             | Rules                                                    |
| ----------------- | -------------------------------------------------------- |
| skill_id          | integer, required_without:skill_name, exists:skills,id   |
| skill_name        | string, required_without:skill_id, max:255               |
| category_ids      | array, required_with:skill_name, min:1                   |
| category_ids.*    | integer, distinct, exists:skill_categories,id            |
| type              | string, required, in:teaching,learning                   |
| title             | string, nullable, max:100                                |
| description       | string, nullable, max:1000                               |
| experience_level  | string, required, in:beginner,intermediate,advanced,expert |
| years_of_experience | integer, nullable, min:0, max:60                       |
| teaching_style    | string, nullable, max:500                                |
| featured          | boolean, nullable                                        |

**Note:** To add a skill from the existing system list, send `skill_id`. To create a new custom skill, send `skill_name` + `category_ids` (array) instead. Skill names are normalized (trimmed, spaces collapsed, case-insensitive lookup). If a matching name already exists, the existing record is reused (no duplicate created); provided categories are attached to the existing skill if not already present. New skills are auto-assigned a slug based on the skill name. A skill can belong to multiple categories.

**Business Rule — Duplicate Prevention:**
A user cannot add the exact same skill for the same purpose (type) twice.
- Teaching → PHP (existing) + Teaching → PHP (new) → **Rejected**
- Teaching → PHP (existing) + Learning → PHP (new) → **Allowed**
- Enforced at both the database level (unique composite index on `(user_id, skill_id, type)`) and the application validation layer.

**Business Rule — Skill Limit:**
A user can have a maximum of 30 skills total. Attempting to add a 31st skill is rejected.

**Business Rule — Featured Limit:**
A user can feature a maximum of 3 skills. Attempting to feature a 4th is rejected.

---

## PUT /me/skills/{userSkill}

Update an existing user skill. Only the owner can update their skill.

**Auth:** User (Sanctum session)

**Request:**
```json
{
  "title": "Advanced Laravel Development",
  "description": "I can teach Laravel, Livewire, and API development.",
  "experience_level": "expert",
  "years_of_experience": 6,
  "teaching_style": "Hands-on, project-based",
  "featured": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User skill updated.",
  "data": {
    "user_skill": {
      "id": 1,
      "skill_id": 5,
      "skill": { ... },
      "type": "teaching",
      "title": "Advanced Laravel Development",
      "description": "I can teach Laravel, Livewire, and API development.",
      "experience_level": "expert",
      "years_of_experience": 6,
      "teaching_style": "Hands-on, project-based",
      "featured": true,
      "created_at": "2026-07-26T12:00:00.000000Z",
      "updated_at": "2026-07-26T13:00:00.000000Z"
    }
  }
}
```

**Error — Forbidden (403):**
```json
{
  "success": false,
  "message": "You do not own this skill."
}
```

**Error — Featured limit (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "featured": ["You can only feature up to 3 skills."]
  }
}
```

**Validation Rules:**

| Field             | Rules                                                    |
| ----------------- | -------------------------------------------------------- |
| title             | string, nullable, max:100                                |
| description       | string, nullable, max:1000                               |
| experience_level  | string, nullable, in:beginner,intermediate,advanced,expert |
| years_of_experience | integer, nullable, min:0, max:60                       |
| teaching_style    | string, nullable, max:500                                |
| featured          | boolean, nullable                                        |

**Note:** `skill_id` and `type` cannot be changed after creation. To change the skill or type, delete and recreate.

---

## DELETE /me/skills/{userSkill}

Delete a user skill. Only the owner can delete their skill.

**Auth:** User (Sanctum session)

**Success Response (204):** No content

**Error — Forbidden (403):**
```json
{
  "success": false,
  "message": "You do not own this skill."
}
```

**Error — Active Exchange Request (422):**
```json
{
  "success": false,
  "message": "Cannot delete a skill that is part of an active exchange request."
}
```

---

# Discover

| Method | Endpoint      | Auth  |
| ------ | ------------- | ----- |
| GET    | /discover     | Guest |

## GET /discover

Browse and search potential learning partners. Returns a lightweight, paginated list of eligible users — those with a verified email, a completed profile, and at least one Discover-eligible skill — whose skills match the provided search criteria. No authentication required — anyone can discover potential partners.

**Auth:** Guest (no authentication required)

**Rate Limiting:** Uses the standard `throttle:api` middleware.

**Query Parameters:**

| Parameter        | Type    | Required | Description                                    |
| ---------------- | ------- | -------- | ---------------------------------------------- |
| q                | string  | No       | Search users by skill name (partial match, case-insensitive) |
| category_id      | integer | No       | Filter by skill category ID                    |
| type             | string  | No       | Filter by skill direction: `teaching` or `learning` |
| experience_level | string  | No       | Filter by skill-specific experience level: `beginner`, `intermediate`, `advanced`, `expert` |
| page             | integer | No       | Page number for pagination (default: 1)        |
| per_page         | integer | No       | Results per page (default: 20, max: 50)        |

**Examples:**
- `GET /discover` — browse all eligible users (paginated)
- `GET /discover?q=laravel` — search users by skill name
- `GET /discover?q=laravel&type=teaching` — search with type filter
- `GET /discover?category_id=1&experience_level=advanced` — filter by category + experience level

**Success Response (200):**
```json
{
  "success": true,
  "message": "Discover retrieved.",
  "data": {
    "users": [
      {
        "id": 1,
        "first_name": "John",
        "middle_name": null,
        "last_name": "Doe",
        "suffix": null,
        "username": "johndoe",
        "avatar_url": "https://api.skillswap.com/storage/avatars/abc123.jpg",
        "headline": "Full-stack Developer & Mentor",
        "location": "Manila, Philippines",
        "matched_skills": [
          {
            "id": 5,
            "name": "Laravel",
            "type": "teaching",
            "experience_level": "advanced"
          },
          {
            "id": 3,
            "name": "PHP",
            "type": "teaching",
            "experience_level": "intermediate"
          },
          {
            "id": 7,
            "name": "Vue.js",
            "type": "teaching",
            "experience_level": "intermediate"
          }
        ],
        "matched_skills_count": 3
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 20,
      "total": 100
    }
  }
}
```

**Notes:**
- `matched_skills` contains only skills that match the current search criteria and active filters — not the user's full skill list. Limited to the top 3 matching skills for preview. When no query or filter is provided, `matched_skills` shows the user's top 3 Discover-eligible skills as a preview. The full skill list is available on the user's public profile.
- `matched_skills_count` reflects the total number of the user's skills that remain after all active Discover search criteria and filters are applied. When no query or filter is provided, it reflects the user's total Discover-eligible skill count.
- **Search ranking** (when `q` is provided) uses deterministic relevance-based priority. Ranking is calculated after all active filters have been applied — only matching skills influence the order:
   1. Exact skill name match — skills whose name matches the search term exactly rank highest
   2. Partial skill name match — skills whose name matches the search term partially
   3. Number of matching skills — counted from the set of skills that remain after all active Discover search criteria and filters are applied. Users with more matching skills rank higher. Unrelated Discover-eligible skills are not counted.
   4. Alphabetical by `users.name` — final deterministic tie-breaker (`users.id`)
- **Browse mode** (no `q` parameter) does not use relevance ranking. Eligible users are returned in default ordering: alphabetical by `users.name` (tie-breaker: `users.id`).
- Search text is optional. Filters operate independently — users may browse using filters only.
- The authenticated user (if logged in) is excluded from results.
- Response uses Laravel's standard pagination meta structure.
- `experience_level` in `matched_skills` is skill-specific (`user_skills.experience_level`), not profile-wide.
- **Eligibility:** A user must satisfy all three requirements to appear in Discover: (1) email verified, (2) profile completed (5+ contributing fields — see FEATURES.MD Profile Completion), (3) at least one Discover-eligible skill. A Discover-eligible skill is a user_skill that is both approved and discoverable in Discover. For the MVP, all approved user skills are Discover-eligible — this terminology remains valid if future phases introduce visibility controls (private skills, moderation, suspension). Eligibility is evaluated automatically — no manual application or approval required. If a user later fails to satisfy any requirement, they are excluded from results until all requirements are met again.
- The MVP ranking intentionally excludes advanced signals (endorsements, completed exchanges, profile completeness, popularity, activity, reputation, AI recommendations). These are deferred to future phases — see BACKLOG.MD (items #1, #10, #13) for roadmap details.

**Error — Invalid category_id (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "category_id": ["The selected category_id is invalid."]
  }
}
```

**Error — Invalid type (422):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "type": ["The type must be one of: teaching, learning."]
  }
}
```

**Validation Rules:**

| Field             | Rules                                    |
| ----------------- | ---------------------------------------- |
| q                 | string, nullable, max:255                |
| category_id       | integer, nullable, exists:skill_categories,id |
| type              | string, nullable, in:teaching,learning   |
| experience_level  | string, nullable, in:beginner,intermediate,advanced,expert |
| page              | integer, nullable, min:1                 |
| per_page          | integer, nullable, min:1, max:50         |

---

# Development Environment Notes

## Discover Setup

The following environment/setup issues have been encountered during development and are not application bugs:

### Rate Limiter Registration
The `api` rate limiter (60 requests/min per IP) is registered in `AppServiceProvider`. If the rate limiter reference is missing, requests to `GET /discover` fail with:
```
Rate limiter [App\Models\User::api] is not defined
```

### Docker Redis Hostname
The `.env` file must use `REDIS_HOST=redis` (Docker service name, not `127.0.0.1`). Incorrect hostname causes:
```
Redis connection refused
```

### Pivot Table Migration
The `skill_category_skill` pivot table must exist for discover filtering by `category_id`. Missing migration causes:
```
Base table or view not found: skill_category_skill relation does not exist
```

### Eligible Seed Data
Fresh databases require eligible seeded users for Discover to return results. A user must satisfy all three requirements:
1. Email verified
2. Profile completion score ≥ 5
3. At least one user_skill

Without seeded data, the discover endpoint returns empty results (200 OK, `total: 0`).

---

# Exchange Requests

All exchange request endpoints are authenticated. They are scoped to the authenticated user via the `me/` prefix. The canonical business rules (state machine, ownership, duplicate, idempotency, eligibility, ordering, concurrency, notifications) live in FEATURES.MD → Exchange Requests (Phase 7); this section defines only the API contract.

**Terminology:** "active request" (duplicate guard) = status IN (`pending`, `accepted`); "active exchange" (Dashboard) = status `accepted` only. These are defined in FEATURES.MD → Terminology and are not redefined here.

| Method | Endpoint                                        | Description                          |
| ------ | ----------------------------------------------- | ------------------------------------ |
| GET    | /me/exchange-requests                           | List user's exchange requests        |
| GET    | /me/exchange-requests/{id}                      | Show a single exchange request       |
| POST   | /me/exchange-requests                           | Create a new exchange request        |
| PUT    | /me/exchange-requests/{id}                      | Update an exchange request (resets accepted → pending for re-confirmation) |
| PUT    | /me/exchange-requests/{id}/accept               | Accept a pending request (pending decider) |
| PUT    | /me/exchange-requests/{id}/decline              | Decline a pending request (pending decider) |
| PUT    | /me/exchange-requests/{id}/cancel               | Cancel a request (sender)            |

### Canonical HTTP Response Codes

All Exchange Request endpoints use the following codes. Endpoint descriptions below reference this table rather than redefining codes individually.

| Code | Meaning                                             |
| ---- | --------------------------------------------------- |
| 200  | Success                                             |
| 201  | Created                                             |
| 401  | Unauthenticated                                     |
| 403  | Forbidden (ownership violation)                     |
| 404  | Resource not found or intentionally hidden          |
| 422  | Validation failure or business rule violation (including idempotency replays and concurrency conflicts) |

**Note:** a request the user is not part of returns 404 or 403 depending on context — 403 when the resource exists but ownership fails, 404 when the resource does not exist or is intentionally hidden.

### Ownership Matrix

| Action  | Sender | Receiver | Other users |
| ------- | ------ | -------- | ----------- |
| Create  | ✅     | ❌ (403)  | ❌ (403)    |
| Accept  | ❌ (403)| ✅       | ❌ (403)    |
| Decline | ❌ (403)| ✅       | ❌ (403)    |
| Cancel  | ✅     | ❌ (403)  | ❌ (403)    |
| List    | ✅ (own) | ✅ (own) | ❌ (403)    |
| View    | ✅ (part) | ✅ (part) | ❌ (403)  |

### Ownership Lookup Flow

For any single-resource operation (Show, Accept, Decline, Cancel), the ownership check follows this exact flow:

```
Route Model Binding
  → resolve the ExchangeRequest by {id} from the URL
  → 404 if no request matches {id}
  → ownership validation
  → compare authenticated user (Auth::id()) against the resolved request's sender_id / receiver_id
  → if the user is neither sender nor receiver → 403 Forbidden
  → if the user is a party (sender or receiver) → proceed with the action, then enforce role-specific rules
     (e.g. only the pending decider may accept/decline — receiver for a new request, the non-editor after an edit;
     only the sender may cancel) → 403 for the wrong party
```

Notes:
- Binding is implicit (Laravel route model binding on the `{id}` / route parameter). A nonexistent id returns 404 before any ownership logic runs.
- Ownership (party check) is distinct from role (pending decider vs sender). Both must pass: a sender calling Accept fails the role check (403) even though they pass the party check.
- This applies uniformly to Show, Accept, Decline, and Cancel. Update additionally requires the pending-edit party rule (sender for `pending`, either party for `accepted`). List is scoped to the authenticated user at the query level and returns only the user's own requests (no ownership check needed per row).
- No formal Laravel Policy is used — ownership is enforced in the controller, consistent with the Phase 5 pattern.

### State Machine

The status field is one of: `pending`, `accepted`, `declined`, `cancelled`, `completed`.

```
pending
├── accepted    (pending decider — receiver for a new request, non-editor after an edit)
├── declined    (pending decider)
└── cancelled   (sender)

accepted
├── pending     (either party edits — resets for re-confirmation by the non-editor)
├── cancelled   (sender)
└── completed   (Phase 9 — not exposed in Phase 7)

declined   → terminal
cancelled  → terminal
completed  → terminal
```

All transitions not listed above are forbidden and return 422. Terminal states (`declined`, `cancelled`, `completed`) accept no further transitions. Transition endpoints are NOT idempotent — replaying a transition on a request that is not in the required source state returns 422.

### Create Exchange Request (POST /me/exchange-requests)

**Request Body:**

| Field              | Type    | Required | Description                                        |
| ------------------ | ------- | -------- | -------------------------------------------------- |
| receiver_id        | integer | yes      | ID of the user receiving the request               |
| teaching_skill_id  | integer | no       | ID of the sender's teaching user_skill (null/omitted = no skill offered) |
| learning_skill_id  | integer | no       | ID of the receiver's teaching user_skill (null = one-way) |
| message            | string  | no       | Optional message (max 500 characters)              |

**Validation Rules:**
- `receiver_id`: required, integer, exists:users,id
- `teaching_skill_id`: nullable, integer, exists:user_skills,id — if present, must belong to sender and be "teaching" type
- `learning_skill_id`: nullable, integer, exists:user_skills,id — must belong to receiver, must be "teaching" type
- At least one of `teaching_skill_id` / `learning_skill_id` must be provided: 422
- `message`: nullable, string, max:500 — trimmed of leading/trailing whitespace; if the trimmed value is empty it is stored as `null` (whitespace-only messages are never persisted as non-empty strings)
- `receiver_id` must not equal the authenticated user (self-request): 422
- No active request (status IN pending, accepted) for the same catalog `learning` skill from this sender to this receiver (same-direction, same-skill only; reverse-direction and different-skill requests are not blocked): 422
- Sender and receiver must each satisfy eligibility rules (verified email, profile completion ≥ 5, at least one skill): 422

**Success Response (201):**
```json
{
  "success": true,
  "message": "Exchange request sent.",
  "data": {
    "exchange_request": {
      "id": 1,
      "sender": { "...UserResource..." },
      "receiver": { "...UserResource..." },
      "teaching_skill": { "...UserSkillResource..." },
      "learning_skill": null,
      "message": "Let us learn together!",
      "status": "pending",
      "reconfirmation_required_by": null,
      "history": [],
      "created_at": "2026-07-29T12:00:00.000000Z",
      "updated_at": "2026-07-29T12:00:00.000000Z"
    }
  }
}
```

**Error Responses:**
- 401: Unauthenticated
- 422: Validation failed, or business rule violation (duplicate active request, wrong skill owner, self-request, ineligible sender or receiver, no skill provided)

### List Exchange Requests (GET /me/exchange-requests)

Returns all requests where the authenticated user is sender or receiver, ordered newest-first:

```
ORDER BY created_at DESC, id DESC
```

The `id DESC` tie-breaker guarantees deterministic ordering when `created_at` collides. The frontend relies on this contract and applies no client-side sorting.

**Query Parameters:**

| Parameter | Type    | Default | Description                                              |
| --------- | ------- | ------- | -------------------------------------------------------- |
| role      | enum    | none    | Filter by the user's role: `sender` or `receiver`. Omitting it returns both. |
| status    | enum    | none    | Filter by status: `pending`, `accepted`, `declined`, `cancelled`, `completed`. Omitting it returns all. |
| page      | integer | 1       | Page number.                                             |
| per_page  | integer | 20      | Results per page. Maximum 50.                            |

**Pagination:** identical to Discover — `page` default 1, `per_page` default 20, maximum 50. Values outside these bounds are clamped. Pagination metadata uses the standard `meta` wrapper (`current_page`, `last_page`, `per_page`, `total`). The ordering contract applies within every page.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Exchange requests retrieved.",
  "data": {
    "exchange_requests": [
      {
        "id": 1,
        "sender": { "...UserResource..." },
        "receiver": { "...UserResource..." },
        "teaching_skill": { "...UserSkillResource..." },
        "learning_skill": { "...UserSkillResource..." },
        "message": null,
        "status": "pending",
        "reconfirmation_required_by": null,
        "created_at": "2026-07-29T12:00:00.000000Z",
        "updated_at": "2026-07-29T12:00:00.000000Z"
      }
    ]
  },
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

### Show Exchange Request (GET /me/exchange-requests/{id})

Returns a single exchange request. Only the sender and receiver can view it.

**Error Responses:**
- 403: User is not part of this exchange request
- 404: Exchange request not found

### Update Exchange Request (PUT /me/exchange-requests/{id})

Edit the skills and message of an exchange request. Available only to a party of the request.

**Request Body:**

| Field              | Type    | Required | Description                                        |
| ------------------ | ------- | -------- | -------------------------------------------------- |
| teaching_skill_id  | integer | no       | ID of the sender's teaching user_skill (null/omitted = no skill offered) |
| learning_skill_id  | integer | no       | ID of the receiver's teaching user_skill (null = one-way) |
| message            | string  | no       | Optional message (max 500 characters)              |

**Permission & Status Rules:**
- A `pending` request can only be edited by the **sender**.
- An `accepted` request can be edited by **either party** (sender or receiver).
- Editing an `accepted` request resets its status to `pending` and sets `reconfirmation_required_by` to the **non-editor** party, who must re-confirm via accept/decline. Editing any request (pending or accepted) records the non-editor as the party whose confirmation is pending.
- **History capture:** editing an `accepted` request (the reopen path) writes one `exchange_request_history` row recording the **before** values (teaching_skill_id, learning_skill_id, message, status) and `edited_by`. Editing a `pending` request does NOT create a history row. The response `history` array reflects the recorded trail.
- `declined` and `cancelled` requests are terminal and cannot be edited.
- `receiver_id` is immutable and never part of the update payload.

**Validation Rules:**
- `teaching_skill_id`: nullable, integer, exists:user_skills,id — if present, must belong to sender and be "teaching" type
- `learning_skill_id`: nullable, integer, exists:user_skills,id — must belong to receiver, must be "teaching" type
- At least one of `teaching_skill_id` / `learning_skill_id` must be provided: 422
- `message`: nullable, string, max:500 — trimmed of leading/trailing whitespace; if the trimmed value is empty it is stored as `null`

**Success Response (200):** same shape as Create Exchange Request, with `message: "Exchange request updated."`

**Error Responses:**
- 403: User is not part of this exchange request
- 422: Only the sender can edit a pending request.
- 422: Only pending or accepted requests can be edited.
- 422: The teaching skill must belong to you and be of type teaching.
- 422: The learning skill must belong to the receiver and be of type teaching.
- 422: Provide at least one skill for the exchange.

### Accept Exchange Request (PUT /me/exchange-requests/{id}/accept)

The pending decider only. Valid only when current status is `pending`. Transition: `pending` → `accepted`.

**Pending decider** = `reconfirmation_required_by` when set (the non-editor of the last edit); otherwise the **receiver** (initial request). On success, `reconfirmation_required_by` is cleared.

Executes as a conditional update against the expected source state (`status = 'pending'`). If a concurrent request changed the status first, the update affects zero rows and the operation fails with 422 (see Canonical HTTP Response Codes) and a message indicating the request is no longer in the expected state. No partial update occurs.

**Error Responses:**
- 403: Only the sender can accept this request (when `reconfirmation_required_by = 'sender'`)
- 403: Only the receiver can accept this request (default)
- 422: Only pending requests can be accepted (including replay of an already-accepted request, or a concurrency conflict)

### Decline Exchange Request (PUT /me/exchange-requests/{id}/decline)

The pending decider only (see Accept). Valid only when current status is `pending`. Transition: `pending` → `declined`. On success, `reconfirmation_required_by` is cleared.

Executes as a conditional update against the expected source state (`status = 'pending'`), with the same concurrency behavior as Accept.

**Error Responses:**
- 403: Only the sender can decline this request (when `reconfirmation_required_by = 'sender'`)
- 403: Only the receiver can decline this request (default)
- 422: Only pending requests can be declined (including replay of an already-declined request, or a concurrency conflict)

### Cancel Exchange Request (PUT /me/exchange-requests/{id}/cancel)

Sender only. Valid only when current status is `pending` or `accepted`. Transitions: `pending` → `cancelled` or `accepted` → `cancelled`.

Executes as a conditional update against the expected source state (`status IN ('pending', 'accepted')`), with the same concurrency behavior as Accept.

**Error Responses:**
- 403: Only the sender can cancel this request
- 422: Only pending or accepted requests can be cancelled (including replay of an already-cancelled request, or a concurrency conflict)

### Concurrency

Create and transition operations execute atomically inside a database transaction. All transitions (accept, decline, cancel) are **optimistic concurrency**: they run as conditional updates against the expected source state (`WHERE status = <expected>`). Under concurrent requests, exactly one conflicting operation succeeds (zero-row conditional update); the loser observes the updated state and receives 422 with a message indicating the request is no longer in the expected state. No partial update occurs (see FEATURES.MD → Concurrency).

### API Resource Stability

`ExchangeRequestResource` defines the canonical response shape for exchange requests. Future phases (Messaging — Phase 8, Learning Sessions — Phase 9, Reviews — Phase 10) MUST extend this resource rather than redesigning it. The `id`, `sender`, `receiver`, `teaching_skill`, `learning_skill`, `message`, `status`, `reconfirmation_required_by`, `created_at`, and `updated_at` fields are stable and must not be renamed, removed, or re-typed. `teaching_skill` and `learning_skill` are nullable (`null` when the sender offers no teaching skill or no return skill is requested, respectively). `reconfirmation_required_by` is nullable (`'sender'`/`'receiver'` while a re-confirmation is pending after an edit, `null` otherwise). The `history` field is an array of `ExchangeRequestHistoryResource` entries (edit audit trail) — it is always present and serializes to `[]` when empty / when the relation is not eager-loaded.

### Notifications

Phase 7 sends no notifications (email, push, or in-app). New requests are visible only via the Exchange Requests page.

---

# Conversations

| Method | Endpoint            |
| ------ | ------------------- |
| GET    | /conversations      |
| GET    | /conversations/{id} |

Only available after an exchange request is accepted. A conversation is created immediately upon acceptance — empty conversations (zero messages) are valid, appear in the list, and can be opened.

### Lifecycle & State

- A conversation is created when the exchange request transitions to `accepted`, atomically within the same DB transaction as the transition (no partial state — acceptance and conversation creation succeed or fail together).
- Conversations are **always active** and immutable after creation. Their participants and linked exchange request cannot change.
- A conversation persists for the lifetime of the exchange; it is not deleted when the request is cancelled.
- Deleting the exchange request cascades the conversation and its messages. Deleting a participant account cascades their messages only; the conversation and the other participant's messages are preserved.
- `archived`, `locked`, and `closed` are future-phase states and are NOT part of Phase 8.

### Participants

- Every conversation has **exactly two participants**, derived from the accepted Exchange Request (sender + receiver). Participants are immutable; no additional participants may join; no group conversations exist in Phase 8.
- Only participants may access the conversation; all other users receive 403.

### Endpoint Responsibilities

- **`GET /conversations`** — conversation-list snapshot for the list pane and the unread badge. Returns a paginated collection of `ConversationResource` rows, each with `other_user`, `last_message`, `unread_count`, `updated_at`. Does NOT return the message thread.
- **`GET /conversations/{id}`** — metadata for a single selected conversation (participants, `exchange_request_id`, `updated_at`). Call when a conversation is selected to render the header. Does NOT return the message thread.
- **`GET /conversations/{id}/messages`** — the message thread for the chat window (see Messages below).

### Ordering (canonical)

Conversations are ordered by `updated_at DESC` (most recent activity). `updated_at` is the **sole ordering mechanism**; sending a new message updates the conversation's `updated_at`, which drives ordering. This is the only conversation-ordering rule — no implementation may apply another sort.

### Pagination Strategy (canonical)

Conversations and messages use **offset-based pagination** (`page`, `per_page` — default 20, max 50). Cursor-based pagination is intentionally deferred to a future phase and is NOT part of Phase 8.

### Read Tracking

Retrieving a conversation's message list (`GET /conversations/{id}/messages`) marks **EVERY unread incoming message in the conversation** as read (the entire conversation, not only the messages on the current page). It never marks messages sent by the authenticated user. No-op when there are no unread incoming messages (including empty conversations). Listing conversations or sending messages does NOT mark anything read.

### Unread Count

The sidebar unread badge is the SUM of every conversation's `unread_count` from `GET /conversations`. No dedicated unread-count endpoint exists.

### API Evolution Policy (architectural philosophy)

This is **not** an API versioning strategy. It documents how the Messaging API contract is intended to evolve so future phases remain consistent with this foundation:

- Existing endpoints must remain **backward compatible** whenever possible.
- Future messaging capabilities should **extend existing resources** (add optional fields, endpoints, or query parameters) instead of replacing them whenever practical.
- Additional optional fields, endpoints, or query parameters may be introduced **without changing existing behavior**.
- Existing response fields must **never change meaning**.
- Existing business rules remain the **source of truth regardless of the transport layer** (polling today, WebSockets in a future phase). Transport changes must never alter ordering, read, ownership, or failure semantics.

### Resource Responsibilities (canonical)

`ConversationResource` represents **conversation metadata only** (participants, `last_message` summary, `unread_count`, `updated_at`); `MessageResource` represents **message data only**. Neither resource exposes the other's data — `ConversationResource` never embeds a full thread.

---

# Messages

| Method | Endpoint                     |
| ------ | ---------------------------- |
| GET    | /conversations/{id}/messages |
| POST   | /conversations/{id}/messages |

### Lifecycle (canonical)

A Phase 8 message supports exactly two states: **sent** (created) and **read** (`read_at` set by read tracking). Editing, deleting, delivery status, reactions, attachments, and typing indicators are future extensions and are intentionally excluded — no fields or endpoints for them in Phase 8.

### Responsibilities

- **`GET /conversations/{id}/messages`** — the message thread, paginated (offset-based), ordered by `created_at ASC, id ASC` (oldest → newest). `created_at` is the ONLY chronological ordering field; `id ASC` exists ONLY as the deterministic tie-breaker when `created_at` values match — `id` must never be used as the primary chronological ordering mechanism. Triggers read tracking (see above). Use for opening a conversation and every thread refetch/poll.
- **`POST /conversations/{id}/messages`** — send a message. Participant-only. Stored with `sender_id` = authenticated user, `read_at = null`; updates the conversation's `updated_at`.

Body

- message (required, string, max 2000, trimmed; whitespace-only rejected with 422)

### Failure Behavior (canonical)

A failed message write (validation or DB error) returns the appropriate error with **no side effects**: it does not update the conversation's `updated_at` (ordering), does not affect unread counts, and does not modify conversation metadata.

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
- Browse discover (`GET /discover`)
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
