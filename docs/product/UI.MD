# SkillSwap UI Documentation

> Version: 1.0.0

---

# Purpose

This document defines the user interface structure of SkillSwap.

It serves as the blueprint for the frontend implementation and should be used together with:

- FEATURES.md
- API.md
- DATABASE.md

The UI should remain simple, modern, responsive, and easy to use.

---

# Design Principles

The user interface should follow these principles:

- Clean and minimal
- Mobile-first responsive design
- Consistent spacing
- Reusable components
- Accessible interface
- Fast navigation
- Simple user flows

---

# Application Layouts

## Public Layout

Used for visitors who are not logged in.

Components:

- Navbar
- Main Content
- Footer

Pages:

- Landing Page
- Login
- Register
- Forgot Password
- Marketplace
- Public Profile

---

## Authenticated Layout

Used for logged-in users.

Components:

- Sidebar
- Top Navigation
- Main Content
- User Menu

Pages:

- Dashboard
- My Profile
- Edit Profile
- My Skills
- Marketplace
- Exchange Requests
- Conversations
- Learning Sessions
- Reviews
- Settings

---

# Navigation

## Public Navigation

- Home
- Marketplace
- Login
- Register

---

## Authenticated Navigation

- Dashboard
- Marketplace
- My Skills
- Exchange Requests
- Messages
- Sessions
- Profile
- Settings
- Logout

---

# Pages

## Landing Page

### Purpose

Introduce SkillSwap to new users.

### Components

- Hero Section
- Call To Action
- Features Section
- Testimonials (future)
- Footer

### User Actions

- Register
- Login
- Browse Marketplace

### APIs

None

---

## Login

### Purpose

Allow users to access their account.

### Components

- Login Form

### User Actions

- Login
- Forgot Password

### APIs

POST /api/v1/auth/login

---

## Register

### Purpose

Create a new account.

### Components

- Registration Form

### APIs

POST /api/v1/auth/register

---

## Dashboard

### Purpose

Provide an overview of the user's activity.

### Components

- Welcome Card
- Active Exchanges
- Upcoming Sessions
- Recent Messages
- Quick Actions

### APIs

GET /api/v1/auth/me

GET /api/v1/learning-sessions

GET /api/v1/conversations

---

## Marketplace

### Purpose

Allow users to discover other learners.

### Components

- Search Bar
- Category Filter
- Experience Filter
- User Cards
- Pagination

### APIs

GET /api/v1/marketplace

---

## Public Profile

### Purpose

Display another user's public information.

### Components

- Avatar
- Bio
- Teaching Skills
- Learning Skills
- Reviews
- Exchange Button

### APIs

GET /api/v1/users/{username}

GET /api/v1/users/{username}/reviews

---

## My Profile

### Purpose

Manage personal information.

### Components

- Avatar
- Personal Information
- Availability
- Bio

### APIs

GET /api/v1/me

PUT /api/v1/me

---

## My Skills

### Purpose

Manage teaching and learning skills.

### Components

- Skill List
- Add Skill
- Edit Skill
- Delete Skill

### APIs

GET /api/v1/me/skills

POST /api/v1/me/skills

PUT /api/v1/me/skills/{id}

DELETE /api/v1/me/skills/{id}

---

## Exchange Requests

### Purpose

Manage incoming and outgoing exchange requests.

### Components

- Request Cards
- Accept Button
- Decline Button
- Cancel Button

### APIs

GET /api/v1/exchange-requests

POST /api/v1/exchange-requests

PATCH /api/v1/exchange-requests/{id}/accept

PATCH /api/v1/exchange-requests/{id}/decline

PATCH /api/v1/exchange-requests/{id}/cancel

---

## Conversations

### Purpose

View conversations.

### Components

- Conversation List
- Last Message
- User Avatar

### APIs

GET /api/v1/conversations

---

## Messages

### Purpose

Communicate with matched users.

### Components

- Chat Window
- Message Input
- Send Button

### APIs

GET /api/v1/conversations/{id}/messages

POST /api/v1/conversations/{id}/messages

---

## Learning Sessions

### Purpose

Schedule and manage learning sessions.

### Components

- Calendar
- Session Card
- Schedule Form

### APIs

GET /api/v1/learning-sessions

POST /api/v1/learning-sessions

PUT /api/v1/learning-sessions/{id}

PATCH /api/v1/learning-sessions/{id}/complete

DELETE /api/v1/learning-sessions/{id}

---

## Reviews

### Purpose

Leave feedback after completed sessions.

### Components

- Rating
- Review Form

### APIs

POST /api/v1/reviews

GET /api/v1/users/{username}/reviews

---

## Settings

### Purpose

Manage account preferences.

### Components

- Profile Settings
- Password Settings
- Delete Account

---

# Reusable Components

- Button
- Input
- Textarea
- Select
- Modal
- Card
- Avatar
- Badge
- Navbar
- Sidebar
- Pagination
- Search Bar
- User Card
- Skill Card
- Session Card
- Rating Stars
- Loading Spinner
- Empty State

---

# Responsive Design

Desktop

- Sidebar Navigation
- Multi-column Layout

Tablet

- Collapsible Sidebar
- Two-column Layout

Mobile

- Bottom Navigation
- Single-column Layout
- Responsive Cards

---

# Future Screens

These screens are outside the MVP.

- Notifications
- AI Matching
- Certificates
- Skill Credits
- Video Calling
- Group Learning
- Admin Dashboard

---

# Notes

The UI should always consume data through the Laravel REST API.

The frontend must never communicate directly with the database.

All pages should be responsive and reusable whenever possible.
