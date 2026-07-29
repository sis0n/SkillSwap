# SkillSwap Features

> Version: 1.1.0

---

# Feature List

## MVP Features

- Authentication
- User Profiles
- Skill Management
- Discover
- Matching System
- Messaging
- Learning Sessions
- Reviews & Ratings
- Dashboard
- Settings

---

# Authentication

## Description

Provides secure user authentication and account management.

### Features

- Register
- Login
- Logout
- Email Verification (6-digit code)

### User Story

As a new user,

I want to create an account,

So that I can use SkillSwap.

---

### Email Verification Flow

#### After Registration

1. User registers successfully. A 6-digit verification code is sent to their email.
2. User verifies their email using the code.
3. User can now log in with their credentials.

#### Verification Code

- 6 numeric digits.
- Randomly generated.
- Single use only.
- Expires after 10 minutes.
- New code invalidates any previous code.

#### Resend

- Available after 60-second cooldown.
- Generates a new code.
- Invalidates the previous code.
- Restarts the 10-minute timer.

#### Login Before Verification

- Unverified users are blocked from logging in (403 Forbidden).
- Verification must be completed before the first login.
- This ensures email ownership and prevents account squatting.

---

# User Profiles

## Description

Every user has a public profile containing personal information and learning preferences.

### Features

- Upload profile picture
- Edit profile
- Update bio
- Set headline
- Set availability
- Set experience level
- Add location
- Add portfolio links (multi-platform with platform-aware validation)
- Add languages (communication languages, not skills)
- Set timezone (IANA identifier, auto-detect with manual override)
- View public profiles

### Profile Information

#### Editable Fields (via Edit Profile)

| Field            | Type    | Max   | Required | Notes                          |
| ---------------- | ------- | ----- | -------- | ------------------------------ |
| headline         | string  | 100   | No       | Short tagline (e.g. "Full-stack developer") |
| bio              | text    | 500   | No       | Longer description/about me    |
| location         | string  | 100   | No       | City, country                  |
| portfolio_links  | array   | —     | No       | Array of {platform, url} objects  |
| experience_level | enum    | —     | No       | beginner, intermediate, advanced |
| timezone         | string  | 50    | No       | IANA timezone identifier (e.g. "Asia/Manila") |
| languages        | array   | —     | No       | Array of {code, proficiency} objects |
| avatar           | file    | 2MB   | No       | jpeg, png, webp, gif           |

#### Read-Only Fields (set during registration)

| Field      | Source     | Visibility |
| ---------- | ---------- | ---------- |
| first_name | users      | Public     |
| middle_name| users      | Public     |
| last_name  | users      | Public     |
| suffix     | users      | Public     |
| username   | users      | Public     |
| email      | users      | Private    |
| joined_date| users (created_at) | Public |

### Field Visibility

#### Public (visible on public profile)

- first_name, middle_name, last_name, suffix
- username
- headline
- bio
- avatar
- location
- portfolio_links
- experience_level
- languages (code, name, proficiency)
- timezone
- availability
- joined_date (created_at)

#### Private (only visible to the account owner)

- email
- email_verified_at

### Avatar Upload

- Accepted formats: jpeg, png, webp, gif
- Maximum file size: 2MB
- Image is cropped/resized to a 400x400 square
- Stored on the `public` disk under `avatars/` directory
- Uploading a new avatar replaces the old one (old file is deleted)
- Users can remove their avatar at any time
- Removing an avatar reverts to an initials-based default
- The avatar URL returned by the API is a full URL (not a relative path)

### Availability

- Availability represents the user's weekly recurring schedule
- Each slot has: day_of_week (0-6, where 0=Sunday), start_time, end_time
- Users can have multiple slots per day
- Overlapping slots on the same day are not allowed
- Users replace their entire availability schedule on update (not individual CRUD)
- An empty array means no availability is set

### Experience Level

- beginner
- intermediate
- advanced

### Languages

Languages represent the communication languages a user can teach or learn in — independent of their skills. For example, a user might teach Piano in English and Spanish.

**Design decisions:**

- Languages stored in a normalized `languages` table (CLDR as source of truth)
- User–language relationship stored in `user_languages` pivot with proficiency level
- Languages are system-managed reference data — users cannot create, edit, or delete them
- Seeded via LanguageSeeder (curated CLDR subset of ~150 languages); never fetched from external APIs at runtime
- Exposed via language codes in the public API (not internal IDs)

**Proficiency values:**

- native
- fluent
- intermediate
- beginner

### Timezone

Stored as an IANA timezone identifier (VARCHAR(50)) on the profile.

- Auto-detected on the frontend via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Users can override the detected timezone via the timezone selector
- Populated using browser-supported IANA identifiers via `Intl.supportedValuesOf("timeZone")` with a graceful fallback
- Nullable — no timezone set by default

### Portfolio Links

Portfolio links are external URLs to a user's work or social profiles. Each link has a platform and URL, validated using platform-aware regex patterns.

**Supported platforms (11):**

| Platform  | URL Pattern                        |
| --------- | ---------------------------------- |
| GitHub    | github.com/username                |
| GitLab    | gitlab.com/username                |
| LinkedIn  | linkedin.com/in/ or /company/      |
| Behance   | behance.net/username               |
| Dribbble  | dribbble.com/username              |
| Figma     | figma.com/username                 |
| CodePen   | codepen.io/username                |
| YouTube   | youtube.com/ or youtu.be/          |
| Medium    | medium.com/username                |
| Dev.to    | dev.to/username                    |
| Website   | Any valid http(s) URL              |

**Design decisions:**

- Stored in a normalized `portfolio_links` table (one user has many links)
- `display_order` column for manual reordering (client-driven, compaction on delete)
- Platform validation via `ValidPortfolioUrl` rule class (platform-aware regex)
- Full replacement on profile update (sent as part of `PUT /me/profile`)
- The legacy `website` column on `profiles` is retained but unused in the frontend

### User Story

As a learner,

I want people to know what skills I have,

So they can decide whether to learn from me.

### Profile States

- **Empty Profile**: New user with no bio, no headline, no avatar, no availability — shows placeholder text and default avatar (initials-based)
- **Complete Profile**: User has filled in multiple fields — shows all available information
- **Public View**: Other users can see the profile but cannot see email or edit controls

---

### Profile Completion

#### Purpose

Profile completion defines which fields are required for a profile to be considered "complete." This specification exists as a single source of truth so that future onboarding prompts, trust signals, search ranking, and feature gating can be implemented consistently across the backend and frontend.

Profile completion is **not implemented in Phase 4**. Phase 4 establishes the profile data model and API. Completion scoring and indicators may be introduced in a future phase. The rules below serve as the foundation for that work.

#### Completion Levels

| Level | Definition | Notes |
|-------|-----------|-------|
| Incomplete | Fewer than 2 contributing fields filled | User has not engaged with their profile yet |
| Partial | 2–4 contributing fields filled | User has started but not finished |
| Complete | 5 or more contributing fields filled | Profile is representative and trustworthy |

#### Contributing Fields

The following fields contribute toward profile completion. Each field counts as 1 point toward a score of 5 for a complete profile.

| Field            | Type     | Weight | Notes |
| ---------------- | -------- | ------ | ----- |
| Avatar           | image    | 1      | Any uploaded photo (not the initials default) |
| Headline         | string   | 1      | Any non-empty value |
| Bio              | text     | 1      | Any non-empty value |
| Experience Level | enum     | 1      | Any non-default value (beginner does not count; intermediate or advanced counts) |
| Availability     | array    | 1      | At least one time slot set |
| Location         | string   | 1      | Any non-empty value |
| Portfolio Links  | array    | 1      | At least one portfolio link |
| Languages        | array    | 1      | At least one language with proficiency set |
| Timezone         | string   | 1      | Any non-empty IANA identifier |

#### Non-Contributing Fields

The following fields are excluded from completion scoring:

- **Display name** (first_name, middle_name, last_name, suffix) — required during registration, always present.
- **Username** — required during registration, always present.
- **Email** — required during registration, always present, private.

These fields are guaranteed to exist for every user and therefore do not differentiate profile completeness.

#### Future Use Cases

Profile completion rules are designed to support (but not constrain) the following future features:

- **Onboarding prompts**: After registration, guide the user to complete their profile before browsing Discover. Show a progress bar or checklist of remaining fields.
- **Trust signals**: Display a "Profile complete" badge on search results and public profiles. Incomplete profiles may appear lower in search rankings.
- **Feature gating**: Require a complete profile before sending exchange requests. This ensures users have sufficient context about their learning partner before committing.
- **Search ranking**: Boost complete profiles in discover search results. Filtering by completeness is a future option.

#### When to Re-evaluate

These rules should be re-evaluated when:

- **Phase 5 (Skills) is implemented** — skills are a strong trust signal. At minimum 1 skill (teaching or learning) is expected to count as a contributing field. The completion threshold may increase from 5 to 6 if skills are added.
- User research indicates that users trust profiles differently than assumed.
- The platform introduces new profile fields (e.g., social links, education, certifications).

---

# Skill Management

## Description

Users can manage the skills they can teach and the skills they want to learn. Each skill entry includes type (teaching/learning), experience level, description, years of experience, and optional featured status.

### Features

- Add teaching skills
- Add learning skills
- Remove skills (blocked if used by active exchange requests)
- Search skills (case-insensitive partial match)
- Browse skill categories
- Feature up to 3 skills (highlighted on profile)
- Duplicate prevention: same skill cannot be added twice for the same purpose
- Custom skill creation: type any skill name; if it doesn't exist, the system creates it automatically
- Optional user title: customize how your skill appears on your profile; null displays skill name

---

### Skill Catalog

The `skills` table is the master catalog of all skills. Skill names are globally unique — a skill exists only once in the catalog.

**Name normalization:**
- Leading/trailing whitespace is trimmed
- Multiple spaces are collapsed into one
- Lookups are case-insensitive (`LOWER(name)`)

Examples:
- `" laravel "` → matches `"Laravel"` → reused
- `"LARAVEL"` → matches `"Laravel"` → reused
- `"Adobe     Photoshop"` → normalized to `"Adobe Photoshop"`

**Metadata fields (internal, not exposed):**
- `is_system`: `true` for seeded skills, `false` for user-created skills
- `created_by`: `null` for seeded skills, authenticated user ID for user-created skills

### Custom Skill Creation

Users can create custom skills that don't exist in the catalog. When a user submits a skill name that doesn't exist (case-insensitive match), the system automatically creates a new `skills` record and links it to the user's `user_skills`. If the name already exists, the existing record is reused — no duplicates are created.

### Skill Fields

| Field               | Type     | Required | Validation                    | Notes                              |
| ------------------- | -------- | -------- | ----------------------------- | ---------------------------------- |
| skill_id            | integer  | No*      | exists:skills,id              | References the skills reference table |
| skill_name          | string   | No*      | max:255                       | Custom skill name for creating new skills |
| category_ids        | array    | No*      | array, min:1, exists:skill_categories,id (each) | Required only when creating a new skill (`skill_name`). A skill can belong to multiple categories. |
| type                | enum     | Yes      | teaching, learning            | Purpose of the skill entry         |
| title               | string   | No       | max:100, nullable             | Custom title for display; null shows skill.name |
| description         | text     | No       | max:1000                      | Free-text proficiency or goal       |
| experience_level    | enum     | Yes      | beginner, intermediate, advanced, expert | Skill-specific proficiency  |
| years_of_experience | integer  | No       | min:0, max:60                 | Years of experience in this skill   |
| teaching_style      | string   | No       | max:500                       | How the user teaches (e.g. hands-on, lecture) |
| featured            | boolean  | No       | true/false, default false     | Highlight this skill on profile (max 3) |

*\*Either `skill_id` or `skill_name` is required. If `skill_name` is provided, `category_ids` is also required (array of valid category IDs).*

---

### Business Rules

#### Duplicate Prevention

A user can never add the exact same skill for the same purpose (type). The following is **rejected:**
- Teaching → PHP (existing) + Teaching → PHP (new)

The following is **allowed:**
- Teaching → PHP + Learning → PHP (a user may teach and learn the same skill)

Enforced at:
- **Database level:** Unique composite index on `(user_id, skill_id, type)`
- **Application level:** Validation in `StoreUserSkillRequest`

#### Skill Limit

A user can have a maximum of **30 skills** total. Attempting to add a 31st skill returns a 422 validation error. This prevents abuse and encourages users to curate their skill list.

#### Featured Skills

- Users can feature up to **3 skills**
- Featured skills appear **first** on Profile and Public Profile
- Discover continues using the full skill list (featured has no effect on search ranking)
- Enforced at the application validation layer

#### Years of Experience

- Nullable (user may not want to disclose)
- If provided, must be an integer between 0 and 60

#### Deleting Skills

A skill can only be removed if it is **not** referenced by an active exchange request:

| Exchange Request Status | Deletion Allowed |
| ----------------------- | ---------------- |
| pending                 | No               |
| accepted                | No               |
| completed               | Yes              |
| cancelled               | Yes              |
| declined                | Yes              |

This prevents the data integrity issue of exchange requests referencing deleted skills.

---

### Search & Filtering

Search and filtering is supported on the `GET /skills` endpoint (public):

| Parameter   | Type     | Description                           |
| ----------- | -------- | ------------------------------------- |
| search      | string   | Partial name search (e.g. "photo")    |
| category_id | integer  | Filter by category                    |

The `GET /me/skills` endpoint returns all of the authenticated user's skills with deterministic ordering. It also supports `?category_id=` to filter by a valid category:

| Parameter   | Type     | Validation                 | Description                          |
| ----------- | -------- | -------------------------- | ------------------------------------ |
| category_id | integer  | exists:skill_categories,id | Filter own skills by category        |

Invalid category IDs return a 422 validation error.

---

### Response Ordering

All skill list responses follow this deterministic order:
1. Featured skills first (`featured = true`)
2. Teaching skills before learning skills
3. Alphabetical by skill name within each group

---

### Empty States

When a user has no skills:
- **Teaching section:** "No teaching skills yet."
- **Learning section:** "No learning goals yet."
- Containers are not rendered if empty (avoids showing empty sections)

---

### Skill Categories

- Programming
- Design
- Music
- Languages
- Photography
- Business
- Marketing
- Writing
- Video Editing
- Cooking
- Other

### User Story

As a user,

I want to add my skills,

So others can discover me.

---

# Discover

## Description

Discover allows users to find potential learning partners. It is the entry point for the exchange workflow — users browse, search, filter, view profiles, and initiate exchange requests. Only users who satisfy all Discover eligibility requirements appear in results.

### Features

| Feature | Stage |
| ------- | ----- |
| Browse all eligible users (paginated, no search required) | Stage 3 (Frontend Integration) |
| Search by skill name (partial match, case-insensitive) | Stages 2+3 (Backend API + Integration) |
| Filter by skill category | Stages 2+3 (Backend API + Integration) |
| Filter by teaching/learning direction | Stages 2+3 (Backend API + Integration) |
| Filter by skill-specific experience level | Stages 2+3 (Backend API + Integration) |
| View matched skills preview — only skills matching the current search criteria and active filters (top 3 + count) | Stages 2+3 (Backend API + Integration) |
| View user profile (navigate to `/users/{username}`) | Stage 1 (UI) |
| Initiate exchange request | Phase 7 |
| One-way exchange support — visual checkbox in skills modal | Stage 1 (UI) |
| One-way exchange support — backend acceptance logic | Phase 7 |

### Stage 1 Scope (Frontend Foundation Only)

Stage 1 builds the UI shell only:

- Discover page layout, user cards, skills modal, filter/search controls
- All UI states: loading skeleton, initial browse, empty, error, active filters
- Responsive layout and dark mode
- Route registration and navigation

No API calls, no mock data, no business logic, no backend integration.

### Business Rules

- Discover is publicly accessible — no authentication required to browse.
- Exchange Requests (Phase 7) still require authentication — browsing and discovery do not.
- Discover cards are lightweight previews. They are not complete profiles.
- Clicking a card opens the View Skills Modal, showing all matched skills as a preview. The card also contains a dedicated "View Profile" link that navigates to the user's Public Profile (`/users/{username}`) for the full view.
- Discover does not duplicate Public Profile functionality. It provides discovery; Public Profile provides detail.
- A user must satisfy all three requirements to appear in Discover: (1) email verified, (2) profile completed (5+ contributing fields — see Profile Completion above), (3) at least one Discover-eligible skill. A Discover-eligible skill is a user_skill that is both approved and discoverable in Discover. For the MVP, all approved user skills are Discover-eligible — this terminology remains valid if future phases introduce visibility controls (private skills, moderation, suspension).
- Eligibility is evaluated automatically by the platform. Users do not submit applications, and administrators do not manually approve listings. Once all requirements are met, the user becomes discoverable. If a user later fails to satisfy any requirement, they become ineligible until all requirements are met again.
- Future enhancements such as discover moderation, suspension, verification, featured users, trusted experts, and manual review workflows are outside MVP scope.

### Search Filters

| Filter            | Type     | Description                                      |
| ----------------- | -------- | ------------------------------------------------ |
| Skill             | string   | Free-text search by skill name (partial, case-insensitive) |
| Category          | integer  | Filter by skill category ID                      |
| Type              | enum     | Filter by direction: teaching, learning           |
| Experience Level  | enum     | Filter by skill-specific proficiency: beginner, intermediate, advanced, expert |

**Note:** The experience level filter operates on `user_skills.experience_level` (skill-specific), not `profiles.experience_level` (profile-wide). A user may be a "beginner" at Photography but "advanced" at Design — these are independent.

### Display

- Results show a lightweight card: avatar, name, headline, location, matched skill chips (max 3), total match count. Cards display only skills that match the current search criteria and active filters — unrelated skills are not shown. When browsing without a query or filter, cards show the user's top 3 Discover-eligible skills as a preview.
- **Search ranking** (when `q` is provided) uses deterministic relevance-based priority. Ranking is calculated after all active filters have been applied — only matching skills influence the order:
   1. Exact skill name match
   2. Partial skill name match
   3. Number of matching skills — counted from the set of skills that remain after all active Discover search criteria and filters are applied. Users with more matching skills rank higher. Unrelated Discover-eligible skills are not counted.
   4. Alphabetical by `users.name` (final tie-breaker: `users.id`)
- **Browse mode** (no search query) does not use relevance ranking. Eligible users are returned in default ordering: alphabetical by `users.name` (tie-breaker: `users.id`).
- No authentication required — anyone can browse discover
- Search text is optional. Filters operate independently — users may browse using category, type, or experience level filters without entering a search term. When no query or filter is active, all eligible users are shown (paginated, default ordering).
- The authenticated user (if logged in) is excluded from their own results
- Clicking a user card opens the View Skills Modal as a preview. A separate "View Profile" link navigates to the full public profile (`/users/{username}`)

### States

- **Loading:** Skeleton grid with 6 placeholder cards
- **Initial:** All eligible users displayed immediately with "Browse potential learning partners" heading
- **Empty:** "No matches found" with suggestion to broaden filters
- **Error:** Error message with retry button

### User Story

As a learner,

I want to find people who can teach me,

So I can request a skill exchange.

---

# Matching System

## Description

Users can connect with compatible learning partners.

### Features

- Send match request
- Accept request
- Reject request
- Cancel request
- View active matches

### Match Status

- Pending
- Accepted
- Rejected
- Cancelled
- Completed

### User Story

As a user,

I want to connect with another learner,

So we can exchange knowledge.

---

# Messaging

## Description

Matched users can communicate through private conversations.

### Features

- One-to-one messaging
- View conversation history
- Send text messages

### User Story

As a matched user,

I want to discuss schedules and learning goals,

So we can prepare for our sessions.

---

# Learning Sessions

## Description

Matched users can organize their learning sessions.

### Features

- Schedule session
- Accept invitation
- Reject invitation
- Cancel session
- Complete session

### Session Information

- Title
- Description
- Date
- Time
- Duration
- Status

### Session Status

- Scheduled
- Ongoing
- Completed
- Cancelled

### User Story

As a learner,

I want to schedule learning sessions,

So both participants know when to meet.

---

# Reviews & Ratings

## Description

Users can review each other after completing a learning session.

### Features

- Leave rating
- Write review
- View reviews
- View average rating

### Rating Scale

1 Star

2 Stars

3 Stars

4 Stars

5 Stars

### User Story

As a learner,

I want to rate my learning partner,

So other users know who is trustworthy.

---

# Dashboard

## Description

The dashboard provides an overview of the user's activity.

### Widgets

- Active Matches
- Upcoming Sessions
- Recent Messages
- Recent Reviews

### User Story

As a user,

I want one place to manage everything,

So I can quickly continue learning.

---

# Settings

## Description

Allows users to manage account preferences.

### Features

- Change password
- Update profile
- Delete account
- Logout

---

# Future Features

These are intentionally excluded from the MVP.

## Skill Credits

Teach users.

↓

Earn credits.

↓

Spend credits on learning.

---

## AI Matching

Recommend users based on:

- Skills
- Experience
- Schedule
- Interests
- Ratings

---

## AI Learning Roadmap

Generate personalized learning plans.

Example

Laravel Developer

↓

HTML

↓

CSS

↓

JavaScript

↓

PHP

↓

Laravel

---

## Certificates

Issue digital certificates after completing learning paths.

---

## Skill Verification

Verify skills using:

- Portfolio
- Quiz
- Community approval

---

## Video Calling

Built-in online learning sessions.

---

## Notifications

Notify users about:

- New match requests
- Messages
- Upcoming sessions

---

## Mobile Application

Native Android and iOS application.

---

## Group Learning

Support:

- One teacher
- Multiple students

---

# MVP Completion Checklist

## Authentication

- [x] Register
- [x] Login
- [x] Logout
- [ ] Password Reset _(deferred)_
- [x] Email Verification (6-digit code)

---

## Profiles

- [x] View Profile (/profile)
- [x] Edit Profile (modal)
- [x] Public Profile (/users/:username)
- [x] Upload Avatar
- [x] Remove Avatar
- [x] Headline
- [x] Bio
- [x] Location
- [x] Portfolio Links
- [x] Experience Level
- [x] Languages
- [x] Timezone
- [x] Availability Schedule
- [x] Profile Form Validation
- [x] Loading States
- [x] Error States
- [x] Empty States
- [x] Responsive Layout
- [x] Dark Mode Support

---

## Skills

- [x] Add Skill (with type, experience_level, title, description, years_of_experience, teaching_style)
- [x] Remove Skill (with active exchange request guard)
- [x] Update Skill
- [x] Search Skills (?search=, ?category_id=)
- [x] Browse Skill Categories
- [x] Duplicate Prevention (unique per user_id + skill_id + type)
- [x] Skill Limit (max 30 per user)
- [x] Featured Skills (max 3 per user)
- [x] Years of Experience Validation (integer, 0–60)
- [x] Response Ordering (featured first, teaching before learning, alphabetical)
- [x] Empty States (teaching/learning-specific messages)
- [x] Profile Integration (user_skills on Profile + Public Profile)
- [x] UserSkill Resource (extensible meta wrapper for future fields)
- [x] Tests (25 test cases)

---

## Discover

- [x] Browse Users (paginated, default alphabetical ordering, no search required)
- [x] Search Users (by skill name, case-insensitive partial match, relevance-ranked)
- [x] Filter Users (by category, type, experience level — filters work independently of search)
- [x] Discover Page (search bar, filter bar, user cards grid, pagination)
- [x] Discover User Resource (lightweight listing-optimized response)
- [x] Matched Skills Preview (top 3 + total count)
- [x] Loading / Empty / Error States
- [x] Responsive Layout (1/2/3 columns)
- [x] Dark Mode Support
- [x] Backend Tests (37 test cases, 110 assertions)
- [x] Documentation (API.md, UI.md, ROADMAP.md, FEATURES.md)

---

## Matching

- [ ] Send Request
- [ ] Accept Request
- [ ] Reject Request

---

## Messaging

- [ ] Send Message
- [ ] Receive Message
- [ ] Conversation History

---

## Sessions

- [ ] Schedule
- [ ] Accept
- [ ] Complete

---

## Reviews

- [ ] Rating
- [ ] Comment

---

## Dashboard

- [ ] Active Matches
- [ ] Upcoming Sessions
- [ ] Recent Messages

---

## Settings

- [ ] Update Profile
- [ ] Change Password
- [ ] Delete Account
