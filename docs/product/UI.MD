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
- Discover
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
- Discover
- Exchange Requests
- Conversations
- Learning Sessions
- Reviews
- Settings

---

# Navigation

## Public Navigation

- Home
- Discover
- Login
- Register

---

## Verification Navigation

Visible only to authenticated users with unverified email addresses.

- Logout

---

## Authenticated Navigation

- Dashboard
- Discover
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
- Browse Discover

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

### Active Exchanges

**Active exchange = exchange request with status `accepted`** (see FEATURES.MD → Terminology — Active Exchange).

The "Active Exchanges" card counts requests where the current user is sender or receiver AND status is `accepted`. Pending requests are NOT counted — they appear on the Exchange Requests page Received tab with a pending badge. Declined, cancelled, and completed requests are never counted.

**Data source:** for the MVP the count is DERIVED from the existing `GET /api/v1/me/exchange-requests` endpoint (frontend filters to `accepted` and counts). No dedicated dashboard endpoint is introduced in Phase 7.

### APIs

GET /api/v1/auth/me

GET /api/v1/learning-sessions

GET /api/v1/conversations

---

## Discover

### Purpose

Allow users to discover potential learning partners by browsing, searching, and filtering by skill.

### Route

`/discover` (public, no auth required)

### Components

- Search Bar (debounced input, searches by skill name)
- Category Filter (dropdown populated from `GET /api/v1/skill-categories`)
- Type Filter (toggle or select: All, Teaching, Learning)
- Experience Level Filter (dropdown: beginner, intermediate, advanced, expert)
- User Card (avatar, name, headline, location, matched skill chips with type + experience level badges — shows only skills matching current search criteria and active filters; clickable to open skills modal)
- Skills Modal (displays all matched skills grouped by Teaching/Learning with experience badges; includes "Send Exchange Request" button. The request modal shows the "I'm not looking for anything in return" checkbox — sender only — for one-way teaching)
- Pagination

### User Flow

1. User navigates to `/discover`
2. All eligible users are displayed in default ordering (paginated, alphabetical) — immediate browsing without searching. No relevance ranking is applied in browse mode.
3. User can enter a skill name in the search bar to narrow results by skill match
4. User can apply filters (category, type, experience level) independently without entering a search term, or combined with search
5. Active filters are indicated with a count and a "Clear all" button
6. Each user card shows up to 3 matched skill chips with "+N more" if additional matches exist
7. Clicking a user card opens a modal showing all matched skills grouped by Teaching/Learning
8. From the modal, user can send an exchange request (Phase 7, placeholder in Phase 6)
9. The exchange request modal (sender view) includes a "I'm not looking for anything in return" checkbox for one-way teaching (no return skill required). The receiver edit view has no such checkbox — its "Skill you'll teach in return" field is optional and clearable, but at least one skill (either "teach in return" or the sender's skill to learn) must remain selected when saving.
10. From the public profile, user can also send an exchange request (Phase 7)

### States

- **Loading:** Skeleton grid with 6 placeholder cards (avatar circle + 3 text lines + badge placeholders)
- **Initial (no query, no filters):** Shows all eligible users paginated with "Browse potential learning partners" heading. Users can start browsing immediately without entering any search term.
- **Empty (no results):** "No matches found" message with suggestions to broaden filters or try a different search term.
- **Error:** Error message with retry button.
- **Active Filters:** Filter bar shows active filter count badge; "Clear all" button resets all filters to default.

### Dark Mode Support

- All Discover components (search bar, filter dropdowns, user cards, pagination) adapt to dark theme using CSS variables.
- Follows the same pattern as existing profile and skills pages.

### Responsive Layout

- **Search bar:** Full width on all breakpoints
- **Filters:** Horizontal bar on desktop; collapsible panel on mobile
- **Results grid:** Single column on mobile, 2 columns on tablet, 3 columns on desktop
- **User cards:** Compact on mobile (smaller avatar, condensed text), standard sizing on desktop

---

### Stage Notes

All stages complete. See `API.md` for the full endpoint specification.

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

Display another user's public information. Used when browsing discover or viewing another user.

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
- **Not Found**: "User not found" message with link back to discover
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

Manage teaching and learning skills. Displays skills grouped by type (Teaching / Learning) with add, edit, delete, and feature actions.

### Route

`/me/skills` (authenticated)

### Components

- **SkillsPage** — main page with grouped skill list
- **SkillCard** — single skill display card with type badge, experience level, description, years of experience, featured toggle, edit/delete actions
- **AddSkillModal** — modal for adding a new skill (searchable skill selector, type toggle, experience level, title, description, years, teaching style, featured toggle)
- **EditSkillModal** — modal for editing an existing skill (same fields, skill selection locked)
- **FeaturedBadge** — small star/pin icon indicating a featured skill
- **SkillBadge** — compact chip/badge for displaying skills on profile pages

### States

#### SkillsPage

- **Loading:** Skeleton cards (matching Phase 4 skeleton pattern) grouped into two sections (Teaching / Learning)
- **Empty (no skills at all):** Centered empty state with heading "No skills added yet" and description "Add your first skill to start finding exchange partners!" — CTA button opens AddSkillModal
- **Empty (teaching only):** Teaching section shows "No teaching skills yet." — learning section renders normally
- **Empty (learning only):** Learning section shows "No learning goals yet." — teaching section renders normally
- **Both empty:** Only one empty state message shown; individual sections not rendered
- **Error:** Error message with retry button — "Unable to load your skills."
- **Loaded:** SkillCard grid grouped by Teaching / Learning with headings, counts, and Add Skill button

#### SkillCard

- **Default:** Displays skill name, type badge (Teaching/Learning), experience level badge, title, description (truncated), years of experience, featured badge
- **Featured:** Shows featured star icon, appears first in list
- **Actions:** Edit icon → opens EditSkillModal; Delete icon → confirmation dialog

#### AddSkillModal / EditSkillModal

- **Loading:** Skill selector shows skeleton while fetching skills list
- **Search:** Debounced search input with dropdown results
- **Empty search:** "No skills found." message + "Add '{name}' as a new skill" button (opens category selector for the new skill)
- **Title field:** Optional. If empty, the skill name is shown on profile instead.
- **Category selector:** Shown only when creating a custom skill (not shown when selecting an existing skill)
- **Saving:** Save button shows spinner, form disabled
- **Validation error:** Field-level error messages below inputs
- **Error:** General error message with retry
- **Featured limit exceeded:** Warning message when attempting to feature a 4th skill

### Empty State Messages

| Section          | Empty Message                          |
| ---------------- | -------------------------------------- |
| Teaching         | "No teaching skills yet."              |
| Learning         | "No learning goals yet."               |
| Both (no skills) | "No skills added yet." (single message) |

Empty sections are **not rendered** — if a user has no teaching skills, the Teaching heading and container are hidden entirely.

### Display Order (Deterministic)

1. Featured skills first (star/pin icon)
2. Teaching skills before learning skills
3. Alphabetical by skill name within each group

### Profile Integration

Both Profile Page and Public Profile Page display skills grouped by type:

- **Populated:** Compact SkillBadge chips in Teaching / Learning sections, featured skills shown first with star icon. If a skill has no custom title, the skill name is displayed instead.
- **Empty (own profile):** "Add skills to appear here" — link to `/me/skills`
- **Empty (public profile):** Section hidden entirely
- **Loading:** Skeleton badges
- **Error:** Section hidden (profile error shown at page level)

### APIs

GET /api/v1/me/skills

POST /api/v1/me/skills

PUT /api/v1/me/skills/{id}

DELETE /api/v1/me/skills/{id}

GET /api/v1/skill-categories (for skill selector)

GET /api/v1/skills (for skill search)

---

## Exchange Requests

### Purpose

Manage incoming and outgoing exchange requests. Users send a skill swap proposal (teach one skill, optionally learn another), and the pending decider (receiver for a new request, the non-editor after an edit) accepts or declines; the sender can cancel. Supports one-way teaching ("I'm not looking for anything in return") and one-way learning (sender offers no skill). Editing an accepted request resets it to pending for re-confirmation by the non-editor.

### Route

`/exchange-requests` (authenticated)

### Components

- **ExchangeRequestsPage** — main page with Received / Sent tabs, pending count badge, and "New Request" button. **Received is the default tab** on first visit; Sent is shown only when the user explicitly switches.
- **ExchangeRequestCard** — single request card with other party avatar/name, teaching skill, learning skill (or one-way label), optional message, status badge, and action buttons. Accept/Decline are shown to the pending decider (receiver for a new request; the non-editor after an edit). A "Awaiting sender/receiver confirmation" note appears while a re-confirmation is pending after an edit. A **Details** button appears when `history.length > 0`, opening ExchangeRequestHistoryModal.
- **ExchangeRequestDetailsModal** — read-only detail view for a single request: sender and receiver, teaching/learning skills (or one-way label), message, status badge, created date, and context-sensitive action buttons matching ExchangeRequestCard. Scoped only to the **current** state (history lives in ExchangeRequestHistoryModal).
- **SendExchangeRequestModal** — modal form to send a new request (teaching skill selector, learning skill selector, message input). Sender view leads with **"What would you like to learn from {name}?"** (from the receiver's teaching skills) and adds an optional **"I'd also like to teach them a skill in return"** checkbox that toggles the teaching selector; receiver edit view instead shows "Skill you'll teach in return" (optional, clearable via a None option) and the optional "Skill {sender} will teach you" selector. Saving requires at least one skill selected. When editing an **accepted** request, the **other party's** chosen skill is locked/read-only (sender: teaching locked; receiver: learning locked) and its value is preserved on submit.
- **ExchangeRequestHistoryModal** — dedicated modal showing the edit audit trail. Rendered on the card via a **Details** button shown only when `history.length > 0`. Displays persisted edits **oldest → newest** with avatar + name, date, and the **before** values of Teaching/Learning/Note; includes the note *"Only edits made after the request was accepted are recorded."* No fabricated created/accepted timeline entries.
- **StatusBadge** — color-coded badge for pending/accepted/declined/cancelled (`completed` is added in Phase 9 and must not be rendered in Phase 7)

### States

#### ExchangeRequestsPage

- **Loading:** Centered spinner
- **Empty (received):** Centered empty state — "When someone sends you a request, it will appear here."
- **Empty (sent):** Centered empty state — "Requests you have sent will appear here."
- **Error:** Error message with retry button — "Unable to load exchange requests."
- **Loaded:** Tabbed interface (Received / Sent) with **Received active by default**. Received tab shows a pending count badge when pending incoming requests exist. "New Request" button opens SendExchangeRequestModal.

#### ExchangeRequestCard

- **Pending (awaiting me):** When the current user is the pending decider (receiver for a new request; the non-editor after an edit), shows Accept (primary) and Decline (outline) buttons
- **Pending (awaiting them):** When the other party is the pending decider, shows Cancel (outline) button and the "Awaiting sender/receiver confirmation" note
- **Accepted:** Sender shows Cancel (outline) and Edit; Receiver shows Edit (an accepted request is editable by either party). Shows request date
- **Declined/Cancelled:** No action buttons; shows request date
- **One-way:** Learning skill row replaced with "One-way exchange (no return skill requested)" italic label
- **Details:** A **Details** button is shown only when the request has an edit history (`history.length > 0`); clicking opens ExchangeRequestHistoryModal

#### SendExchangeRequestModal

- **Loading:** Teaching skill selector shows spinner while fetching user's skills
- **No teaching skills:** "No teaching skills yet — you can send the request without one, or add one later." (sender view; the field is optional)
- **No receiver learning skills:** "This user has no teaching skills listed." (receiver's teaching-skill selector disabled)
- **Teaching offer checkbox:** Sender-only toggle — **"I'd also like to teach them a skill in return"** toggles the (optional) "Skill you can teach" selector. When unchecked, no teaching skill is sent (pure learning request).
- **Locked on accepted edit:** When editing an `accepted` request, the other party's chosen skill is disabled/read-only — sender: the "Skill you can teach" selector + its checkbox locked; receiver: the learning selector locked. Values are submitted unchanged.
- **Receiver edit view:** no one-way checkbox. Shows "Skill you'll teach in return (optional)" — the receiver's own teaching skills, with a "None" option to clear it — and "Skill {sender} will teach you (optional)". At least one of the two must be selected on save.
- **Saving:** Send/Save button shows spinner, form disabled
- **Validation error:** Inline field error — e.g. "Please select at least one skill for the exchange."
- **Success:** Modal closes, request list refreshes

#### ExchangeRequestHistoryModal

- **Context note:** *"Only edits made after the request was accepted are recorded."*
- **Empty:** "No edit history for this request."
- **Loaded:** Timeline of persisted edit entries **oldest → newest**, each showing editor avatar+name, timestamp, and the *before* Teaching/Learning/Note values, plus "Request reopened (pending) for re-confirmation."

**Skill selector data sources:**
- **Teaching Skill selector (sender's skills):** populated from `GET /api/v1/me/skills`, filtered client-side to `type === "teaching"` (the authenticated user is the sender). The backend create endpoint requires the chosen skill (if provided) to belong to the sender and be type "teaching" — the selector only offers skills that satisfy this.
- **Learning Skill selector (receiver's teaching skills):** populated from the receiver's public profile `GET /api/v1/users/{username}` → `data.user.user_skills.teaching`. The username comes from the current context (ViewSkillsModal or Public Profile page). The backend create endpoint requires the chosen skill to belong to the receiver and be type "teaching" — the selector only offers skills that satisfy this. In the receiver edit view this selector becomes "Skill you'll teach in return".
- Both selectors must render the selected skill's name and experience level, and submit the underlying `user_skill` id (`teaching_skill_id`, `learning_skill_id`). At least one of the two ids is required.

**Message normalization (frontend):** the message input applies the same normalization as the backend before submission — trimmed of leading/trailing whitespace, and a trimmed-empty value is sent as `null` (omitted/not sent as an empty string). The Zod schema normalizes on submit so both layers behave consistently. This matches the backend rule: whitespace-only messages are never persisted as non-empty strings.

### API Alignment

Endpoints use the `me/` prefix (user-owned resource) and `PUT` for state changes, matching the established API convention.

GET /api/v1/me/exchange-requests

POST /api/v1/me/exchange-requests

GET /api/v1/me/exchange-requests/{id}

PUT /api/v1/me/exchange-requests/{id} (edit — reset accepted → pending for re-confirmation)

PUT /api/v1/me/exchange-requests/{id}/accept

PUT /api/v1/me/exchange-requests/{id}/decline

PUT /api/v1/me/exchange-requests/{id}/cancel

**Cache invalidation:** after every successful mutation — Create Request, Update Request, Accept, Decline, Cancel — the frontend invalidates:
- `["exchange-requests"]` (the Exchange Requests list query), and
- the Dashboard query key used by the project (e.g. `["dashboard"]`, or the dashboard summary key that drives the "Active Exchanges" card).

This guarantees the Dashboard "Active Exchanges" card and the Exchange Requests list reflect the new state immediately, without a manual refresh. Invalidation must use the project's existing React Query cache conventions (see Phase 6 Discover integration for the established pattern).

### Entry Points

- **ViewSkillsModal** — "Send Exchange Request" button opens SendExchangeRequestModal prefilled with the Discover user's skills
- **Public Profile** — "Send Exchange Request" button opens the same flow for a profile
- **Sidebar** — "Exchange Requests" link navigates to `/exchange-requests`
- **Dashboard** — "Active Exchanges" card shows the count of accepted requests (see Dashboard → Active Exchanges)

### Notifications

Phase 7 sends no notifications (no email, no push, no in-app alerts). Users discover new requests only by visiting the Exchange Requests page — the Received tab shows a pending badge when pending incoming requests exist.

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

### Behavior

- The conversation list is ordered by `updated_at DESC` (most recent activity first) — conversations with the latest message activity appear at the top. Sending a message moves the conversation to the top.
- Empty conversations (created on acceptance, zero messages) appear in the list and are selectable; they show a last-message placeholder of "No messages yet."
- Loading skeleton, error state with retry, and a "When you accept an exchange request, a conversation is created here." empty state.

### Pagination

- The conversation list uses offset-based pagination from the API (`page`, `per_page`). The frontend loads more on demand; there is no fixed infinite-scroll contract.

### Unread Badge

- Each conversation row shows its `unread_count`.
- The sidebar Messages badge is the SUM of every conversation's `unread_count`, derived from the conversations query — no extra API request.

### Cache Ownership

- Conversation summaries live in the `["conversations"]` cache; message threads live exclusively in the `["messages"]` cache.
- `last_message` in a conversation row is a summary only — the thread is never duplicated into the conversation cache. The `["messages"]` cache is the single source of truth for thread content.

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

### Behavior

- Thread renders oldest → newest, auto-scrolling to the newest message on (a) initial conversation open and (b) immediately after the authenticated user successfully sends a message.
- Polling/refetch must NOT auto-scroll — the user's reading position is preserved.
- Empty conversation thread (zero messages) is a valid state: shows the empty thread area with the message input enabled.
- Message input + send button are disabled while the input is empty.
- "Select a conversation" state when no thread is selected (desktop two-pane).
- Incoming unread messages appear as unread until the message list is retrieved (read tracking), which marks EVERY unread incoming message in the conversation as read — not only those visible on the current page. The authenticated user's own messages are always read.
- Loading skeleton, error state with retry.

### Polling Contract

- The active conversation's thread polls every **~5 seconds** and **refetches on window focus**.
- After a successful send, the thread refetches (cache invalidation) and the poll interval resets normally.
- On a temporary network interruption, the last cached thread stays visible, scroll position is preserved, and a non-blocking "reconnecting" indicator may appear; the next successful poll recovers automatically. Messages are never lost or re-ordered client-side.
- Polling is transport only — it never alters read or ordering behavior.

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
- DiscoverSearchCard (clickable card with avatar, name, headline, location, skill chips, view profile link)
- DiscoverFilters (search input, category/type/experience level selects, clear filters)
- ViewSkillsModal (modal displaying all matched skills grouped by type with experience badges and exchange request button)
- SkillCard
- SkillBadge
- FeaturedBadge
- AddSkillModal
- EditSkillModal
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
