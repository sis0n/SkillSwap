# SkillSwap Features

> Version: 1.1.0

---

# Feature List

## MVP Features

- Authentication
- User Profiles
- Skill Management
- Skill Marketplace
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

- **Onboarding prompts**: After registration, guide the user to complete their profile before browsing the marketplace. Show a progress bar or checklist of remaining fields.
- **Trust signals**: Display a "Profile complete" badge on search results and public profiles. Incomplete profiles may appear lower in search rankings.
- **Feature gating**: Require a complete profile before sending exchange requests. This ensures users have sufficient context about their learning partner before committing.
- **Search ranking**: Boost complete profiles in marketplace search results. Filtering by completeness is a future option.

#### When to Re-evaluate

These rules should be re-evaluated when:

- **Phase 5 (Skills)** is implemented — skills are a strong trust signal. The completion threshold may increase or skills may become a contributing field.
- User research indicates that users trust profiles differently than assumed.
- The platform introduces new profile fields (e.g., social links, education, certifications).

---

# Skill Management

## Description

Users can manage the skills they can teach and the skills they want to learn.

### Features

- Add teaching skills
- Add learning skills
- Remove skills
- Search skills
- Browse skill categories

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

# Skill Marketplace

## Description

The marketplace allows users to browse available teachers and learners.

### Features

- Browse users
- Search by skill
- Filter by category
- View user profile
- View skill information

### Search Filters

- Skill
- Category
- Experience Level

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

- [ ] Add Skill
- [ ] Remove Skill
- [ ] Search Skills
- [ ] Categories

---

## Marketplace

- [ ] Browse Users
- [ ] Search Users
- [ ] Filter Users

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
