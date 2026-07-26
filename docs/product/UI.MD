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
- Profile (/profile)
- Public Profile (/users/:username)
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
- Profile (/profile)
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

## Profile

### Purpose

View your own profile with all your information, including private fields like email.

### Route

`/profile` (authenticated)

### Components

- Avatar (with upload/remove actions)
- Profile Header (name, username, headline, joined date)
- Profile Details (bio, location, website, experience level)
- Languages (badges with proficiency labels)
- Timezone
- Availability Schedule
- Edit Profile Button
- Loading Skeleton
- Error State with Retry
- Empty State Placeholders

### User Actions

- Click Edit Profile button → navigate to `/profile/edit`
- Click avatar → change/remove avatar (inline)

### States

- **Loading**: Skeleton placeholders for avatar, name, bio, and availability while fetching
- **Loaded**: Full profile display with all available fields
- **Error**: Error message with retry button if profile fetch fails
- **Empty Bio**: Shows "No bio yet" placeholder
- **No Headline**: Section is hidden
- **No Availability**: Shows "No availability set" message

### APIs

GET /api/v1/me/profile

PUT /api/v1/me/profile (via Edit Profile)

POST /api/v1/me/avatar (via Avatar Uploader)

DELETE /api/v1/me/avatar (via Avatar Uploader)

GET /api/v1/me/availability

PUT /api/v1/me/availability (via Edit Profile)

### Responsive Layout

- Desktop: Two-column layout — left column has avatar + details, right column has availability
- Mobile: Single-column stacked layout

---

## Edit Profile (Modal)

### Purpose

Edit your personal profile information, languages, timezone, portfolio links, and availability. Implemented as a modal overlay on the Profile page.

### Trigger

- Button on Profile page → opens `EditProfileModal`
- Modal closes on Save (success), Cancel, ESC key, or click outside

### Components

- Dialog (reusable centered modal with overlay, ESC/click-outside to close, scroll lock)
- Avatar Uploader (preview, upload button, remove button)
- Profile Form (headline, bio, location, experience_level)
- Language Autocomplete (searchable, debounced, keyboard navigation, multi-select with removable badges, editable proficiency via inline dropdown)
- Timezone Selector (auto-detect via browser Intl API, manual override via searchable IANA list)
- PortfolioLinkSection (add/edit/delete/reorder links with platform-colored badges, inline add/edit forms)
- Availability Manager (list of slots with add/remove)
- Save Button
- Cancel Button (closes modal without saving)
- Form Validation Errors

### Form Fields

| Field            | Type       | Component            | Notes                              |
| ---------------- | ---------- | -------------------- | ---------------------------------- |
| headline         | string     | Input                | Max 100 chars, placeholder: "e.g. Full-stack developer" |
| bio              | textarea   | Textarea             | Max 500 chars |
| location         | string     | Input                | Max 100 chars, placeholder: "City, Country" |
| experience_level | select     | CustomSelect         | Options: beginner, intermediate, advanced |
| timezone         | string     | TimezoneSelect       | Auto-detected via Intl API, searchable IANA list |
| languages        | array      | LanguageAutocomplete  | Searchable autocomplete + proficiency badge dropdown |
| portfolio_links  | array      | PortfolioLinkSection  | Platform select + URL input, inline add/edit |

### Form Validation

- All fields are optional (nullable)
- Bio: max 500 characters
- Headline: max 100 characters
- Location: max 100 characters
- Timezone: valid IANA identifier (max 50 characters)
- Languages: each entry must have a valid language code and proficiency (native, fluent, intermediate, beginner)
- Portfolio links: each entry must have a valid platform and URL

### User Actions

- Save → PUT /api/v1/me/profile (includes profile fields, languages, timezone, portfolio_links) → modal closes → profile refetched
- Cancel → close modal (no changes saved)
- Upload Avatar → POST /api/v1/me/avatar
- Remove Avatar → DELETE /api/v1/me/avatar (with confirmation dialog)
- Add Portfolio Link → inline form with platform select + URL input
- Add Availability Slot → inline form with day/time pickers

### States

- **Saving**: Save button shows spinner, form disabled
- **Validation Error**: Field-level error messages below inputs
- **Save Error**: Error message below buttons
- **Avatar Uploading**: Progress indicator on uploader
- **Avatar Upload Error**: Error message on uploader

### Responsive Layout

- Desktop: Centered dialog, max-width ~640px
- Mobile: Full-width dialog with appropriate padding

---

## Public Profile

### Purpose

Display another user's public information. Used when browsing the marketplace or viewing another user.

### Route

`/users/:username` (public, no auth required)

### Components

- Avatar (initials-based default if none)
- Profile Header (name, username, joined date)
- Profile Details (headline, bio, location, experience level, timezone)
- Languages (badges with proficiency labels)
- Portfolio Links (platform name + clickable URL, sorted by display_order)
- Availability Schedule
- Exchange Button (placeholder/link to Phase 7)
- Loading Skeleton
- 404 State (user not found)

### States

- **Loading**: Skeleton while fetching
- **Loaded**: Full public profile with user information
- **Not Found**: "User not found" message with link back to marketplace
- **No Bio**: Section hidden or shows "No bio yet"
- **No Availability**: Section hidden

### Visibility Rules

| Field           | Visible? |
| --------------- | -------- |
| first_name      | Yes      |
| middle_name     | Yes      |
| last_name       | Yes      |
| suffix          | Yes      |
| username        | Yes      |
| headline        | Yes      |
| bio             | Yes      |
| avatar          | Yes      |
| location        | Yes      |
| portfolio_links | Yes      |
| experience_level| Yes      |
| languages       | Yes      |
| timezone        | Yes      |
| availability    | Yes      |
| joined_date     | Yes      |
| email           | **No**   |

### APIs

GET /api/v1/users/{username}

GET /api/v1/users/{username}/reviews (future)

### Responsive Layout

Same as Profile page — two columns on desktop, single column on mobile

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
- AvatarUploader (upload, preview, remove, progress indicator)
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
- Loading Skeleton (shimmer placeholder for content loading)
- Empty State
- Toast Notification
- Confirmation Dialog
- AvailabilityManager (add/remove slots, day-of-week selector, time pickers)
- PortfolioLinkSection (add/edit/delete/reorder portfolio links with platform-colored badges, inline forms)
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
