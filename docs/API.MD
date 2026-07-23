# SkillSwap API Specification

> Version: 1.0.0 (MVP)
> API Style: REST
> Base URL: /api/v1
> Authentication: Laravel Sanctum
> Response: JSON

---

# Overview

This document defines the MVP API contract for SkillSwap.

---

# API Standards

- RESTful endpoints
- JSON request/response
- Versioned API (`/api/v1`)
- Authenticated endpoints require Sanctum
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
- 500 Internal Server Error

---

# Authentication

| Method | Endpoint       | Auth  |
| ------ | -------------- | ----- |
| POST   | /auth/register | Guest |
| POST   | /auth/login    | Guest |
| POST   | /auth/logout   | User  |
| GET    | /auth/me       | User  |

Register Fields:

- first_name
- middle_name (optional)
- last_name
- suffix (optional)
- username
- email
- password
- password_confirmation

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
