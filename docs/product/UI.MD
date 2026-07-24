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

## Verification Layout

Used for authenticated users whose email is not yet verified.

Access is restricted to email verification only.

Components:

- Navbar (simplified — no navigation links, only logout)
- Main Content
- Footer

Pages:

- Email Verification

---

## Authenticated Layout

Used for logged-in users with verified emails.

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

## Verification Navigation

Visible only to authenticated users with unverified email addresses.

- Logout

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

## Email Verification

### Purpose

Verify a newly registered email address using a 6-digit code before granting full application access.

### User Flow

1. User submits the registration form.
2. Backend handles one of four cases:
   - **Case 1 (new email)**: User created, code sent, redirect to verification.
   - **Case 2 (verified email)**: Registration rejected — email already registered.
   - **Case 3 (unverified, code active)**: Redirect to verification — code already sent, reuse existing.
   - **Case 4 (unverified, code expired)**: Account updated, new code sent, redirect to verification.
3. User is redirected to the Email Verification page (not authenticated).
4. The verification code was sent during registration. The user enters the 6-digit code.
5. Code is validated (10-min expiry, single-use, bcrypt-hashed).
6. Email is marked as verified, code is invalidated.
7. User is redirected to the Login page with a success message.
8. User logs in and accesses the Dashboard.

### Components

- Verification Code Input (6 individual digit inputs with auto-advance and paste support)
- Resend Code Button (with 60-second cooldown timer)
- Expiration Display (shows when the current code expires)
- Registration Message Banner (informs user about the registration case)
- Error Messages (invalid code, expired code, no code found, resend cooldown)
- Success State (verified — link to login page)
- Missing Email State (prompts user to register first)

### States

- **No Email**: Email query param missing. Prompt user to register.
- **Pending**: Code input ready. User enters the 6-digit code.
- **Submitting**: Code is being validated. Inputs and resend button disabled.
- **Error — Invalid Code**: Message displayed. Inputs cleared. Allow retry.
- **Error — Expired Code**: Message displayed. Prompt user to request a new code.
- **Error — No Code Found**: Message displayed. Prompt user to request a new code.
- **Error — Resend Cooldown**: Button shows remaining seconds. Disabled until cooldown ends.
- **Success (Verified)**: Email verified. "Sign In" button navigates to `/login?verified=true`.

### Registration Case Messaging

When redirected from registration, the page shows an info banner:
- **Cases 1, 4**: "Registration successful. Please verify your email." or "Registration successful. A new verification code has been sent to your email."
- **Case 3**: "A verification code has already been sent to this email."

### API Behavior

- Code expires 10 minutes after creation.
- Codes are single-use (invalidated after successful verification).
- Codes become invalid after a resend (old codes are marked as used).
- 60-second resend cooldown enforced server-side.
- Verification page does NOT auto-send a code on mount. The initial code is sent by the registration endpoint.
- The resend button is the only way to request a new code after the initial send.

### APIs

POST /api/v1/auth/email/send-code
POST /api/v1/auth/email/verify-code

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
- Verification Code Input (6 individual digit slots + auto-advance)

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
