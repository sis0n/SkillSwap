# SkillSwap Roadmap
> Version: 5.0.0
> Project Stage: Minimum Viable Product (MVP)
> Last Updated: 2026-08-02

---
# Purpose
This roadmap tracks backend, frontend, testing, and documentation progress for the SkillSwap MVP.

---
# Project Documentation
- PLANNING.md
- FEATURES.md
- DATABASE.md
- API.md
- UI.md
- DESIGN_SYSTEM.md
- ROADMAP.md

Keep these documents synchronized throughout development.

---
# Development Workflow
1. Review documentation.
2. Implement backend.
3. Implement frontend.
4. Test the implementation.
5. Update documentation.
6. Mark the phase as completed.

---
# Current Focus
Current Phase: Phase 8 — Messaging
Current Status: Completed

Phase 8 — Messaging (Stages 1-5 ✅ Complete)

---

# Project Progress
**Completed:**

- Phase 1 — Project Foundation
- Phase 2 — Database
- Phase 3 — Authentication
- Phase 3.5 — Social OAuth (Google)
- Phase 3.75 — Role Architecture
- Phase 4 — User Profiles
- Phase 4.5 — Languages & Timezone
- Phase 4.6 — Portfolio Links
- Phase 5 — Skills
- Phase 5.1 — Skill Architecture Refinement

**Completed:**

- Phase 6 — Discover (Stages 1-5 ✅ Complete)
- Phase 7 — Exchange Requests (Stages 1-5 ✅ Complete)
- Phase 8 — Messaging (Stages 1-5 ✅ Complete)

**Remaining:**

- Phase 9 — Learning Sessions
- Phase 10 — Reviews
- Phase 11 — Pre-Release QA
- Phase 12 — Deployment
---
# MVP Milestones
## Phase 1 — Project Foundation
Status: Completed

### Backend
- [x] Laravel setup
- [x] Docker
- [x] PostgreSQL
- [x] Environment variables
- [x] Authentication foundation

### Frontend
- [x] React + TypeScript + Vite
- [x] Routing
- [x] API client

### Documentation
- [x] PLANNING.md
- [x] FEATURES.md
- [x] DATABASE.md
- [x] API.md
- [x] UI.md
- [x] DESIGN_SYSTEM.md
- [x] ROADMAP.md

---
## Phase 2 — Database
Status: Completed

### Backend
- [x] All MVP tables
- [x] Foreign keys
- [x] Indexes
- [x] Factories
- [x] Seeders

### Frontend
- [x] API types

### Documentation
- [x] DATABASE.md
- [x] API.md

---
## Phase 3 — Authentication
Status: Completed

Progress

- Backend Authentication API (Sanctum SPA): Completed
- Sanctum SPA Session Migration: Completed
- Frontend Infrastructure: Completed
- Frontend Authentication UI: Completed
- Registration Cases (1-4): Completed
- Email Verification (6-digit code): Completed
- Login with verification check: Completed
- Resend cooldown: Completed
- Testing: Completed (30 test cases, all passing)
- Documentation: Completed

### Notes
Phase 3 intentionally excludes the following features:

- Password Reset
- Email Change Verification
- Session Management
- Authentication Audit Logging

These features are planned for future phases and are not required for MVP completion.

## Authentication Version
**Current Version:** v1.0
**Status:** Feature complete for MVP. Production-ready for current project scope.

**Major Features Included:**

- Laravel Sanctum SPA Authentication
- Session-based Authentication
- Google OAuth
- 6-Digit Email Verification
- Role Architecture
- Rate Limiting

**Current Test Suite:**

- 55 automated tests
- 167 assertions
- Covers Authentication, Social OAuth, and Role Architecture

**Planned Future Versions (not started):**

- v1.1 — Password Reset, Email Change Verification
- v1.2 — Session Management, Logout From All Devices
- v2.0 — Multi-Factor Authentication, Advanced Security Features

### Backend
- [x] Register — handles 4 cases (new, verified, unverified+active, unverified+expired)
- [x] Login — checks email verification before Auth::attempt()
- [x] Login — rate limited: 5 attempts/min per email + 20 attempts/min per IP
- [x] Logout — session invalidation
- [x] Email Verification (6-digit code with 10-min expiry, single-use, bcrypt-hashed)
- [x] Resend code — 60s cooldown, invalidates old codes
- [x] Current User
- [x] Email uniqueness enforced via controller logic
- [x] Username uniqueness enforced via controller logic

### Backend — Sanctum SPA Migration (Completed)
- [x] Database sessions table and migration
- [x] Sanctum stateful domains config
- [x] CORS supports_credentials config
- [x] Session driver config (database)
- [x] AuthController session-based login/logout/register
- [x] Sanctum middleware in api group

### Frontend — Infrastructure
- [x] Axios client (withCredentials, CSRF interceptors, 419 retry, 401 handler)
- [x] Zustand auth store (session-based, no token, no localStorage)
- [x] TanStack Query client and provider
- [x] Auth hooks (useCurrentUser, useLogin, useRegister, useLogout)
- [x] Shared API types and error handling
- [x] Auth API layer (CSRF init, login, register, logout, getMe)
- [x] Route-level code splitting (React.lazy + Suspense)
- [x] Feature-based folder structure (features/auth/)
- [x] Theme store system listener
- [x] Route guards (session-based, minimal compatibility)

### Frontend — Completed
- [x] Login page form logic (React Hook Form + Zod + API integration)
- [x] Register page form logic (React Hook Form + Zod + API integration)
- [x] Form validation and error display
- [x] Loading states and error handling in forms
- [x] Global Error Boundary component

### Frontend — Email Verification (Completed)
- [x] Backend: Send 6-digit code endpoint (no auth required, accepts email body)
- [x] Backend: Verify 6-digit code endpoint (no auth required, accepts email + code)
- [x] Backend: Code expiration logic (10-min expiry, bcrypt-hashed, single-use)
- [x] Backend: Resend cooldown logic (60s cooldown, checks latest code regardless of status)
- [x] Backend: Route protection for unverified users (login blocks with 403, no session)
- [x] Backend: 4 registration cases handled with appropriate responses
- [x] Frontend: Email verification page (6-digit code input with paste support)
- [x] Frontend: Resend code with cooldown timer
- [x] Frontend: Registration message banner (shows context from registration case)
- [x] Frontend: No auto-send on mount — code sent during registration, resend as needed
- [x] Frontend: Redirect to `/login?verified=true` after successful verification
- [x] Frontend: Block dashboard/protected routes for unverified users (login rejects unverified)

### Testing
- [x] Register — new email (Case 1)
- [x] Register — verified email (Case 2)
- [x] Register — unverified + valid code (Case 3)
- [x] Register — unverified + expired code (Case 4)
- [x] Register — duplicate username
- [x] Register — password confirmation required
- [x] Verify — valid code
- [x] Verify — invalid code
- [x] Verify — expired code
- [x] Verify — used code
- [x] Verify — old code invalid after resend
- [x] Verify — already verified returns success
- [x] Resend — before cooldown
- [x] Resend — after cooldown
- [x] Resend — only newest code accepted
- [x] Login — verified account
- [x] Login — unverified account (403, no session)
- [x] Login — invalid password
- [x] Login — nonexistent email
- [x] Login — after successful verification
- [x] Logout — authenticated user
- [x] Protected routes — authenticated access
- [x] Protected routes — unauthenticated (401)
- [x] Me endpoint — no password exposed
- [x] 30 total test cases, all passing

### Documentation
- [x] API.md — Updated with registration cases, verification, login behavior
- [x] UI.md — Updated with verification flow
- [x] AUTH_PLAN.md — Architecture plan with updated checklist
- [x] ROADMAP.md — Updated with testing results

---
## Phase 3.5 — Social OAuth (Google)
Status: Completed

### Backend
- [x] Install Laravel Socialite
- [x] Create `social_accounts` table (provider-agnostic: provider, provider_id, provider_email, avatar_url)
- [x] SocialAccount model with HasFactory
- [x] Add `socialAccounts()` relationship to User model
- [x] SocialAuthService with clear method separation (authenticate, createUser, linkAccount, etc.)
- [x] SocialAuthController with provider-agnostic routing (`/auth/{provider}/redirect`, `/auth/{provider}/callback`)
- [x] Provider whitelist validation (`['google']`)
- [x] Google OAuth credentials in `config/services.php`
- [x] Configurable `FRONTEND_URL` for redirects (via `config/app.php`)
- [x] Password remains NOT NULL — OAuth users get `Hash::make(Str::random(64))`
- [x] Provider email verification check before linking/creating
- [x] Database transactions for multi-write operations
- [x] Session regeneration after authentication
- [x] Existing provider_id cannot be overwritten

### Frontend
- [x] GoogleLoginButton component (standard Google branding)
- [x] OAuthCallbackPage (session-based auth, no query param dependency)
- [x] Added Google button to LoginPage
- [x] Added Google button to RegisterPage
- [x] `/auth/callback` route in App.tsx

### Testing
- [x] 23 SocialAuthTest cases covering all 3 cases, error handling, and security scenarios
- [x] All 55 tests pass (30 auth + 23 social + 2 infrastructure)

### Documentation
- [x] DATABASE.MD — social_accounts table, updated users notes
- [x] API.MD — OAuth endpoints and flow
- [x] AUTH_PLAN.MD — new section with architecture, flow, security
- [x] ROADMAP.MD — this checklist

---
## Phase 3.75 — Role Architecture
Status: Completed

### Backend
- [x] Create `roles` table migration (id, name, slug, timestamps)
- [x] Create `add_role_id_to_users` migration
- [x] Role model with `hasMany(User)` relationship, constants (`Role::USER`, `Role::ADMIN`), `findBySlug()` static method
- [x] Update User model — `belongsTo(Role)`, `role_id` in fillable, `isAdmin()` / `isUser()` methods
- [x] RoleSeeder — inserts Admin and User roles by slug
- [x] Update DatabaseSeeder to call RoleSeeder first
- [x] Update UserFactory — centralized lookup via `Role::findBySlug(Role::USER)`
- [x] Update AuthController::register() — centralized lookup via `Role::findBySlug(Role::USER)`
- [x] Update SocialAuthService::createUser() — centralized lookup via `Role::findBySlug(Role::USER)`

### Infrastructure
- [x] Removed all `firstOrCreate()` calls — roles fail loudly when missing
- [x] Tests seed roles via `TestCase::setUp()` for consistent test environment

### API
- [x] UserResource includes role object (id, name, slug)
- [x] Role relationship loaded explicitly only where needed (login, me) — no global `$with`

### Testing
- [x] All 55 tests pass with role_id constraint

### Documentation
- [x] DATABASE.MD — roles table added, users table updated
- [x] API.MD — user response includes role
- [x] AUTH_PLAN.MD — Role Architecture section (section 19) with constants, lookup, convenience methods, system immutability
- [x] ROADMAP.MD — this checklist

---
## Phase 4 — User Profiles
Status: Completed

### Goal
Allow users to create, edit, and manage their public profile.

### Phase 4.5 — Languages & Timezone
Status: Completed

#### Goal
Add communication languages (relational, CLDR-sourced) and IANA timezone to user profiles.

#### Overview
Languages and timezone fields extend the profile to support multi-language teaching/learning sessions and timezone-aware scheduling. Languages are system-managed reference data seeded from CLDR; timezone is auto-detected on the frontend with manual override.

---
#### Backend — Languages
- [x] Create `languages` table migration (id, code, name, native_name, sort_order, timestamps)
- [x] Create `user_languages` pivot table migration (user_id, language_id, proficiency, unique constraint, timestamps)
- [x] Create `Language` model with HasFactory
- [x] Create `LanguageFactory` for tests
- [x] Create `LanguageSeeder` (CLDR curated subset of ~150 languages with documented inclusion criteria)
- [x] Call `LanguageSeeder` from `DatabaseSeeder`
- [x] Create `LanguageResource` (follows existing API Resource pattern)
- [x] Create `LanguageController` with `index()` returning `LanguageResource` collection
- [x] Register `GET /api/v1/languages` route (public, no auth required)
- [x] Add `languages()` BelongsToMany relationship to `User` model with `withPivot('proficiency')`
- [x] Update `ProfileService::updateProfile()` — wrap profile update + language sync in a single DB transaction
- [x] Add `syncLanguages()` private method to `ProfileService` (replaces all user languages)
- [x] Language sync is full replacement (sync strategy, not append)
- [x] Languages are system-managed — no create/edit/delete endpoints for languages table

#### Backend — Timezone
- [x] Create `add_timezone_to_profiles_table` migration (nullable VARCHAR(50) after website column)
- [x] Add `timezone` to `Profile` model `$fillable` array
- [x] Update `ProfileService::updateProfile()` — include timezone in fillable fields within transaction
- [x] Update `ProfileFactory` — include random timezone value

#### Backend — Validation (UpdateProfileRequest)
- [x] `timezone`: nullable, string, max:50
- [x] `languages`: nullable, array
- [x] `languages.*.code`: required_with:languages, string, exists:languages,code
- [x] `languages.*.proficiency`: required_with:languages, string, in:native,fluent,intermediate,beginner

#### Backend — Resources & Endpoints
- [x] `ProfileResource` — include `profile.timezone` and `languages` array (code, name, native_name, proficiency)
- [x] `UserResource` — include `profile.timezone` and `languages` array
- [x] `PublicProfileResource` — include `profile.timezone` and `languages` array
- [x] `GET /me/profile` — eager load `languages` relationship
- [x] `GET /users/{username}` — eager load `languages` relationship
- [x] `GET /api/v1/languages` — returns sorted LanguageResource collection

#### Backend — Testing
- [x] Language list — returns all languages
- [x] Language list — public (no auth required)
- [x] Language list — empty when no seeded data
- [x] Languages endpoint — read-only (POST returns 405, PUT/DELETE return 404)
- [x] Update profile — valid languages saved correctly
- [x] Update profile — invalid language code returns 422
- [x] Update profile — invalid proficiency returns 422
- [x] Update profile — replaces existing languages (not appends)
- [x] Update profile — language sync within transaction (atomic)
- [x] Get profile — includes languages in response
- [x] Public profile — includes languages in response
- [x] Update profile — valid timezone saved correctly
- [x] Update profile — null timezone is accepted (nullable)
- [x] Update profile — timezone exceeding 50 chars returns 422
- [x] Get profile — includes timezone in response
- [x] Public profile — includes timezone in response
- [x] All existing 80+ tests continue to pass (4 pre-existing storage failures in Docker only)

#### Frontend — Types & API
- [x] `Language` type (id, code, name, native_name)
- [x] `UserLanguage` type (code, name, native_name, proficiency)
- [x] `LanguageInput` type (code, proficiency)
- [x] `Profile` type — add `timezone` field
- [x] `UserProfile` type — add `languages` array
- [x] `UpdateProfileData` type — add `timezone` and `languages`
- [x] `getLanguages()` API function
- [x] `useLanguages()` hook (TanStack Query, staleTime: Infinity, gcTime: Infinity)

#### Frontend — Components
- [x] `LanguageAutocomplete` component:
    - Searchable autocomplete with debounced filtering
    - Keyboard navigation (arrow keys, Enter to select, Escape to close)
    - Duplicate language prevention
    - Removable selected languages (X button on badges)
    - Editable proficiency per selected language (inline select)
    - Empty state: "No languages found."
- [x] `TimezoneSelect` component:
    - Auto-detection via `Intl.DateTimeFormat().resolvedOptions().timeZone`
    - Dropdown populated via `Intl.supportedValuesOf("timeZone")` with graceful fallback
    - Auto-detected timezone shown as placeholder
    - Manual override supported
    - Helper text when using auto-detected value

#### Frontend — Page Updates
- [x] `EditProfilePage` — add LanguageAutocomplete and TimezoneSelect fields
- [x] `EditProfilePage` — pre-populate languages and timezone from profile data
- [x] `EditProfilePage` — submit languages and timezone in PUT /me/profile payload
- [x] `ProfilePage` — display languages with proficiency-labeled badges
- [x] `ProfilePage` — display timezone with globe icon
- [x] `PublicProfilePage` — display languages with proficiency-labeled badges
- [x] `PublicProfilePage` — display timezone with globe icon

#### Documentation
- [x] `FEATURES.MD` — Languages + Timezone sections (editable fields, visibility, proficiency values, design decisions)
- [x] `FEATURES.MD` — Add languages/timezone to contributing fields for profile completion
- [x] `DATABASE.MD` — Add languages table, user_languages pivot, timezone column on profiles
- [x] `DATABASE.MD` — Update ERD with language relationships
- [x] `API.MD` — Add GET /languages endpoint doc
- [x] `API.MD` — Update profile request/response with languages + timezone
- [x] `API.MD` — Update validation rules table
- [x] `API.MD` — Update public profile response with languages + timezone
- [x] `UI.MD` — LanguageAutocomplete component spec
- [x] `UI.MD` — TimezoneSelect component spec
- [x] `UI.MD` — Update form fields, validation, profile display, visibility rules
- [x] `ROADMAP.MD` — This expanded checklist
- [x] `ROADMAP.MD` — Version bump (Phase 4.5 completion)

### Backend
#### Profile Controller & Routes
- [x] Create `ProfileController` (Api/V1)
- [x] Register `v1/me/profile` routes (GET, PUT)
- [x] Register `v1/users/{username}` public route
- [x] Register `v1/me/avatar` routes (POST, DELETE)
- [x] Register `v1/me/availability` routes (GET, PUT)

#### Get Current Profile
- [x] `GET /me/profile` — returns authenticated user with profile and availability
- [x] Eager load profile and availability relationships
- [x] Return `ProfileResource` with all editable and read-only fields

#### Update Profile
- [x] `PUT /me/profile` — update bio, location, experience_level, headline, website
- [x] Create `UpdateProfileRequest` with validation rules
- [x] Auto-create profile record if it doesn't exist (via `firstOrCreate` or dedicated logic)
- [x] Return updated profile

#### Public Profile Endpoint
- [x] `GET /users/{username}` — returns public profile (anyone, no auth required)
- [x] Return user name, username, bio, avatar, location, experience_level, headline, website, joined date
- [x] Never expose email, email_verified_at, or other private fields
- [x] Return 404 if user not found
- [x] Eager load profile relationship

#### Avatar Upload
- [x] `POST /me/avatar` — upload profile picture
- [x] Validate file type (jpeg, png, webp, gif)
- [x] Validate file size (max 2MB)
- [x] Crop/resize to square (e.g., 400x400)
- [x] Store in `public/avatars/` disk
- [x] Delete old avatar file before storing new one
- [x] Return avatar URL

#### Avatar Removal
- [x] `DELETE /me/avatar` — remove profile picture
- [x] Delete file from storage
- [x] Set avatar field to null
- [x] Return 204 No Content

#### Availability — Get
- [x] `GET /me/availability` — return all availability slots for the authenticated user
- [x] Return array of slots with id, day_of_week, start_time, end_time

#### Availability — Update (replace all)
- [x] `PUT /me/availability` — replace all availability slots
- [x] Accept array of { day_of_week, start_time, end_time }
- [x] Validate day_of_week (0-6, where 0=Sunday)
- [x] Validate start_time < end_time
- [x] Delete all existing slots, then create new ones (replace strategy)
- [x] Return updated availability array

#### Profile Resource
- [x] Create `ProfileResource` that combines user identity fields + profile fields
- [x] Public profile resource excludes email, email_verified_at, private fields
- [x] Include avatar URL as full URL (not relative path)

#### Validation Rules
- [x] Bio: max 500 characters, nullable
- [x] Headline: max 100 characters, nullable
- [x] Location: max 100 characters, nullable
- [x] Website: valid URL, max 200 characters, nullable
- [x] Experience level: in:beginner,intermediate,advanced
- [x] Avatar: mimes:jpeg,png,webp,gif, max:2048
- [x] Availability day_of_week: integer between 0 and 6
- [x] Availability start_time/end_time: valid time format (H:i:s)
- [x] Availability: start_time must be before end_time

#### Authorization Checks
- [x] All `/me/*` routes require `auth:sanctum`
- [x] `/users/{username}` is public (no auth required)
- [x] Users can only update their own profile
- [x] Users can only manage their own availability

#### Profile Factory & Seeder Updates
- [x] Update `ProfileFactory` to create random profiles when creating users
- [x] Update `UserFactory` to associate a profile after user creation
- [x] Create `UserAvailabilityFactory` seeding in UserFactory

### Frontend
#### Profile Page (View Own Profile)
- [x] Create `ProfilePage` at `/profile`
- [x] Display user avatar, name, username, joined date
- [x] Display headline, bio, location, website
- [x] Display experience level badge
- [x] Display availability schedule (grouped by day)
- [x] Link to Edit Profile page
- [x] Fetch via `GET /me/profile`

#### Edit Profile Page
- [x] Create `EditProfilePage` at `/profile/edit`
- [x] Pre-populate form with current profile data
- [x] Editable fields: headline, bio, location, website
- [x] Editable field: experience_level (select: beginner, intermediate, advanced)
- [x] Form submission via `PUT /me/profile`
- [x] Success notification and redirect to profile page
- [x] Loading state while fetching current data
- [x] Error state on save failure

#### Avatar Uploader Component
- [x] Create `AvatarUploader` reusable component
- [x] Show current avatar preview
- [x] File picker button (accept images only)
- [ ] Drag-and-drop support (optional, nice-to-have)
- [x] Client-side preview before upload
- [x] Upload progress indicator
- [x] Upload via `POST /me/avatar`
- [x] Remove avatar button (with confirmation)
- [x] Remove via `DELETE /me/avatar`

#### Public Profile Page
- [x] Create `PublicProfilePage` at `/users/{username}`
- [x] Display avatar, name, username, joined date
- [x] Display headline, bio, location, website
- [x] Display experience level badge
- [x] Display availability schedule
- [x] Fetch via `GET /users/{username}`
- [x] 404 state for non-existent users
- [x] Exchange-request button (future — link to Phase 7)

#### Availability Manager Component
- [x] Create `AvailabilityManager` component
- [x] Display current availability schedule
- [x] Add slot button (day + time range picker)
- [x] Remove slot button (with confirmation)
- [x] Submit all slots at once via `PUT /me/availability`
- [x] Validation: prevent overlapping slots
- [x] Validation: start_time must be before end_time
- [x] Day labels: Sunday through Saturday

#### Profile Form Validation (Zod Schema)
- [x] Create `profileSchemas.ts` with Zod validations
- [x] Headline: max 100 chars
- [x] Bio: max 500 chars
- [x] Location: max 100 chars
- [x] Website: valid URL or empty
- [x] Experience level: enum

#### API Layer
- [x] Create `lib/api/profiles.ts` with all profile API functions
- [x] `getMyProfile()`
- [x] `updateProfile(data)`
- [x] `getPublicProfile(username)`
- [x] `uploadAvatar(file)`
- [x] `deleteAvatar()`
- [x] `getAvailability()`
- [x] `updateAvailability(slots)`
- [x] Add profile types to `lib/api/types.ts`

#### Routing
- [x] Add `/profile` route (ProtectedRoute)
- [x] Add `/profile/edit` route (ProtectedRoute)
- [x] Add `/users/:username` route (PublicLayout, no auth required)
- [x] Lazy-load all profile pages via `React.lazy`

#### Loading States
- [x] Profile page: skeleton while fetching profile data
- [x] Edit profile: skeleton while fetching, spinner on save
- [x] Avatar uploader: progress bar during upload
- [x] Public profile: skeleton while fetching
- [x] Availability manager: skeleton while loading, spinner on save

#### Error States
- [x] Profile load failure: error message + retry button
- [x] Profile save failure: field-level errors from API
- [x] Avatar upload failure: error message with retry
- [x] Avatar delete failure: error message with retry
- [x] Availability save failure: field-level errors from API
- [x] Public profile 404: "User not found" page
- [x] Network error: toast notification

#### Empty States
- [x] No bio: "No bio yet" placeholder text
- [x] No headline: hide headline section
- [x] No location: hide location
- [x] No website: hide website link
- [x] No availability: "No availability set" message
- [x] No avatar: show default avatar (initials-based)

#### Navigation Updates
- [x] Add "Profile" link to sidebar/nav when authenticated
- [x] Add profile dropdown/avatar in user menu

#### Dark Mode Support
- [x] Profile page adapts to dark theme
- [x] Edit profile form adapts to dark theme
- [x] Avatar uploader adapts to dark theme
- [x] Availability manager adapts to dark theme
- [x] Public profile page adapts to dark theme

#### Responsive Layout
- [x] Profile page: single column on mobile, two columns on desktop
- [x] Edit profile: full-width form on mobile, centered card on desktop
- [x] Profile header: stacked on mobile, horizontal on desktop
- [x] Avatar uploader: centered on mobile, side-aligned on desktop
- [x] Availability grid: single column on mobile, multiple columns on desktop
- [x] Public profile: same responsive patterns

### Testing — Backend
- [x] Get current profile — authenticated
- [x] Get current profile — unauthenticated (401)
- [x] Update profile — valid data
- [x] Update profile — creates profile if not exists
- [x] Update profile — invalid data (422)
- [x] Update profile — unauthenticated (401)
- [x] Get public profile — existing user
- [x] Get public profile — non-existent user (404)
- [x] Get public profile — email not exposed
- [x] Upload avatar — valid file
- [x] Upload avatar — invalid file type (422)
- [x] Upload avatar — file too large (422)
- [x] Upload avatar — unauthenticated (401)
- [x] Delete avatar — authenticated
- [x] Delete avatar — no avatar (204 no content)
- [x] Delete avatar — unauthenticated (401)
- [x] Get availability — authenticated
- [x] Get availability — unauthenticated (401)
- [x] Update availability — valid slots
- [x] Update availability — invalid day_of_week (422)
- [x] Update availability — start_time after end_time (422)
- [x] Update availability — unauthenticated (401)
- [x] Update availability — replaces all existing slots
- [x] Update availability — empty array clears all slots

### Testing — Frontend
- [ ] Profile page renders user data
- [ ] Edit profile form pre-populates data
- [ ] Edit profile form validation errors
- [ ] Edit profile saves successfully
- [ ] Avatar upload on file select
- [ ] Avatar remove with confirmation
- [ ] Public profile renders correctly
- [ ] Public profile 404 for invalid username
- [ ] Availability add/remove/save flow
- [ ] Loading skeletons display during fetch
- [ ] Error messages on API failure
- [ ] Empty states display correctly

### Documentation
- [x] API.md — Profile endpoints (request, response, validation, auth)
- [x] UI.md — Profile pages (components, states, user flow, APIs)
- [x] FEATURES.md — Detailed profile feature spec
- [x] DATABASE.md — Profile field constraints, defaults, and notes
- [x] ROADMAP.md — This expanded checklist

### Phase 4 Summary
**Backend Tests:** 25 new tests (80 total tests, 245 assertions, all passing)
**Frontend Tests:** Frontend test infrastructure not yet established (deferred to Phase 11 QA)
**Implementation:** All backend endpoints, API resources, form requests, services, frontend pages, components, and routing completed

---
## Phase 4.6 — Portfolio Links
Status: Completed

### Goal
Allow users to add, edit, delete, reorder, and display external portfolio/social links with platform-aware validation.

### Overview
Portfolio links are normalized across 11 platforms with platform-aware URL regex validation. Managed via dedicated CRUD + reorder endpoints, and also included in the profile update payload for single-save workflow from the edit modal.

---
#### Backend — Migration & Model
- [x] Create `portfolio_links` table migration (id, user_id FK cascade, platform, url, display_order, timestamps, user_id index)
- [x] Create `PortfolioLink` model with `$fillable` and `user()` BelongsTo relationship
- [x] Create `PortfolioLinkFactory` for tests

#### Backend — Validation
- [x] Create `ValidPortfolioUrl` rule class (11 platforms with platform-aware regex)
- [x] Create `StorePortfolioLinkRequest` (platform whitelist, ValidPortfolioUrl rule)
- [x] Create `UpdatePortfolioLinkRequest` (same validation, all fields optional)
- [x] Update `UpdateProfileRequest` — add `portfolio_links` validation (platform whitelist, url string max 500)

#### Backend — Service & Controller
- [x] Create `PortfolioLinkService` — getLinks, createLink (auto-assign display_order), updateLink, deleteLink (compaction), reorderLinks
- [x] Create `PortfolioLinkController` — index, store, update, destroy, reorder (owner checks in controller)
- [x] Create `PortfolioLinkResource`

#### Backend — Routes & Integration
- [x] Register portfolio links routes under `auth:sanctum` (`/me/portfolio-links`)
- [x] Update `ProfileService::updateProfile()` — add `syncPortfolioLinks()` (delete all + recreate from payload)
- [x] Include `portfolio_links` in `ProfileResource` and `PublicProfileResource`
- [x] Eager load `portfolioLinks` on profile routes

#### Backend — Testing
- [x] 19 PortfolioLinkTest cases: CRUD, auth, ownership isolation, platform URL validation (github valid/invalid, linkedin, youtube, website, invalid platform, invalid format), reorder, public/own profile inclusion
- [x] All 19 tests pass

#### Frontend — Types & API
- [x] `PortfolioLink` type (id, platform, url, display_order)
- [x] `PortfolioLinkInput` type (platform, url)
- [x] `CreatePortfolioLinkData`, `UpdatePortfolioLinkData` types
- [x] `portfolio_links` on `UserProfile`, `UpdateProfileData`, `ProfileFormData`
- [x] API functions: `createPortfolioLink`, `updatePortfolioLink`, `deletePortfolioLink`, `reorderPortfolioLinks`

#### Frontend — Hooks
- [x] `useCreatePortfolioLink`, `useUpdatePortfolioLink`, `useDeletePortfolioLink`, `useReorderPortfolioLinks`

#### Frontend — Components
- [x] `PortfolioLinkSection` component:
    - Controlled component with `value`/`onChange` props
    - Displays links with platform-colored badges, URL, actions (reorder up/down, edit, delete)
    - Inline add form with platform dropdown + URL input
    - Inline edit form with same fields
    - No individual save — integrated into main modal save flow

#### Frontend — Page Integration
- [x] `EditProfileModal` — manage portfolio_links in form state, pass to section, submit via PUT /me/profile
- [x] `ProfilePage` — display portfolio links with platform name + clickable URL
- [x] `PublicProfilePage` — display portfolio links with platform name + clickable URL
- [x] Old "Website" text field removed from edit modal and profile displays (replaced by portfolio links "Website" platform option)

#### Documentation
- [x] `FEATURES.MD` — Portfolio Links section (platform list, design decisions, contributing fields)
- [x] `DATABASE.MD` — portfolio_links table, updated ERD
- [x] `API.MD` — Portfolio links endpoints (CRUD + reorder), updated profile responses
- [x] `UI.MD` — Edit Profile modal, PortfolioLinkSection component, Visibility rules
- [x] `ROADMAP.MD` — This expanded checklist

### Phase 4.6 Summary
**Backend Tests:** 19 new tests (115 total tests, 335 assertions, all passing)
**Frontend Build:** TypeScript + Vite build passes clean
**Key Decisions:**

- Full replacement strategy in profile update (delete all + recreate)
- Old `profiles.website` column retained as legacy but unused in frontend
- Dedicated CRUD endpoints kept for granular operations
- Single save flow from edit modal (one PUT + one GET refetch)

---
## Phase 5 — Skills
Status: Completed (Backend + Frontend)

### Goal
Allow users to add, remove, browse, and feature skills they can teach or want to learn. Skills are the foundational data for Discover (Phase 6), Exchange Requests (Phase 7), and all subsequent phases.

### Overview
Phase 5 is organized into 7 architectural refinements plus 4 implementation improvements applied before full rollout.

**Refinements (documented in FEATURES.MD, DATABASE.MD, API.MD, UI.MD):**

1. **Duplicate Prevention** — Unique index on `(user_id, skill_id, type)` + app validation
2. **Skill Limit** — Max 30 skills per user
3. **Search & Filtering** — `?search=`, `?category_id=` for public skills endpoint
4. **Consistent Ordering** — Featured first, teaching before learning, alphabetical
5. **Years of Experience Validation** — Integer, nullable, 0–60
6. **Featured Skills** — Boolean `featured`, max 3 per user, appear first on profiles
7. **Empty States** — Type-specific messages, containers hidden when empty

**Pre-Implementation Improvements:**

1. **Active Exchange Request Guard** — Prevent deleting skills referenced by pending/accepted requests
2. **Category Filtering on /me/skills** — `?category_id=` filter with validation
3. **Explicit sort_order Seed Data** — Deterministic ordering for categories and skills
4. **Partial Update Safety** — Featured and other optional fields preserved when omitted

---
### Backend
#### Database — Migration (New)
- [x] Add `featured` boolean column to `user_skills` table (default false)
- [x] Add `sort_order` column to `skill_categories` table (unsigned smallint, default 0)
- [x] Add `sort_order` column to `skills` table (unsigned smallint, default 0)
- [x] Add unique composite index on `user_skills(user_id, skill_id, type)` — prevents duplicate skill entries
- [x] Verify existing factories and seeders are compatible

#### Models
- [x] Update `SkillCategory` model — add `sort_order` to fillable, add `scopeOrdered()`
- [x] Update `Skill` model — add `sort_order` to fillable, add `scopeSearch()`, `scopeByCategory()`
- [x] Update `UserSkill` model — add `featured` to fillable, add `$casts` for `featured` (boolean)

#### Controllers
- [x] Create `SkillCategoryController` — `index()` returns all categories ordered by sort_order + name
- [x] Create `SkillController` — `index()` with `?search=` and `?category_id=` query params support
- [x] Create `UserSkillController` — `index`, `store`, `update`, `destroy` with owner checks

#### Form Requests
- [x] Create `StoreUserSkillRequest` — validate all fields, duplicate check (user_id + skill_id + type), skill limit (max 30), featured limit (max 3), experience_level enum, years_of_experience (0–60)
- [x] Create `UpdateUserSkillRequest` — same validations, all fields optional, featured limit check excluding current record

#### Resources
- [x] Create `UserSkillResource` — return all fields with nested skill + category
- [x] Design with `meta` wrapper for future extensibility (review_count, average_rating, completed_exchanges, endorsements — not implemented now)

#### Routes
- [x] `GET /api/v1/skill-categories` — public
- [x] `GET /api/v1/skills` — public (with ?search=, ?category_id=)
- [x] `GET /api/v1/me/skills` — authenticated
- [x] `POST /api/v1/me/skills` — authenticated
- [x] `PUT /api/v1/me/skills/{userSkill}` — authenticated, owner-only
- [x] `DELETE /api/v1/me/skills/{userSkill}` — authenticated, owner-only

#### Service
- [x] Create `UserSkillService` — getUserSkills (with category filter, deterministic ordering), createUserSkill, updateUserSkill, deleteUserSkill (with active exchange request guard)

#### Profile Integration
- [x] Eager load `userSkills.skill.category` on ProfileController::show() and showPublic()
- [x] Update `ProfileResource` — add `user_skills` grouped by type (teaching/learning)
- [x] Update `PublicProfileResource` — add `user_skills` grouped by type (teaching/learning)
- [x] Deterministic ordering on all skill responses: featured first, teaching before learning, alphabetical

### Frontend
#### Types & API
- [x] `SkillCategory` type (id, name, slug, icon, sort_order)
- [x] `Skill` type (id, category_id, name, slug, sort_order, category?)
- [x] `UserSkill` type (id, skill_id, skill, type, title, description, experience_level, years_of_experience, teaching_style, featured, timestamps)
- [x] `CreateUserSkillData`, `UpdateUserSkillData` types
- [x] API functions: `getSkillCategories()`, `getSkills(params?)`, `getMySkills()`, `addUserSkill()`, `updateUserSkill()`, `deleteUserSkill()`
- [x] Update `UserProfile` and `PublicProfile` types to include `user_skills`

#### Pages
- [x] Create `/me/skills` (SkillsPage) — authenticated route, grouped skill list with add/edit/delete

#### Components
- [x] `SkillCard` — display card with type badge, experience level, featured badge, actions
- [x] `AddSkillModal` — searchable skill selector + all fields
- [x] `EditSkillModal` — pre-filled fields, skill locked
- [x] Profile integration: skill display on ProfilePage and PublicProfilePage

#### States
- [x] Loading: Skeleton cards for SkillsPage and profile skill sections
- [x] Empty (no skills at all): Centered empty state with CTA
- [x] Empty (teaching only): "No teaching skills yet."
- [x] Empty (learning only): "No learning goals yet."
- [x] Empty sections not rendered (containers hidden)
- [x] Error: Error message + retry button
- [x] Featured: Star/pin badge, appears first

### Testing — Backend (25 tests)
- [x] Guest can list skill categories
- [x] Authenticated user can list skill categories
- [x] Guest can list skills
- [x] Filter skills by category_id
- [x] Search skills by name (?search=)
- [x] Auth user can create a user skill
- [x] Same skill same type duplicate rejected (uniqueness enforcement)
- [x] Same skill different type allowed (teach + learn)
- [x] Invalid type (not teaching/learning) rejected
- [x] Skill limit (max 30) enforced
- [x] Featured limit (max 3) enforced
- [x] Years of experience validation (0–60, nullable)
- [x] Auth user can list their own skills (ordered correctly)
- [x] Auth user can update their own skill
- [x] Auth user cannot update another user's skill
- [x] Auth user can delete their own skill
- [x] Auth user cannot delete another user's skill
- [x] Delete skill with pending exchange request (422)
- [x] Delete skill with accepted exchange request (422)
- [x] Delete skill with completed exchange request (204 — allowed)
- [x] Delete skill with cancelled exchange request (204 — allowed)
- [x] Filter own skills by valid category_id
- [x] Filter own skills by invalid category_id (422)
- [x] Update preserves featured when not sent
- [x] Update featured only

### Documentation
- [x] FEATURES.MD — Skill Management section expanded (fields, business rules, search, ordering, empty states)
- [x] FEATURES.MD — MVP Skills checklist updated
- [x] DATABASE.MD — skill_categories, skills, user_skills DETAILED specs (sort_order, featured, unique constraint, deprecation)
- [x] API.MD — Skill Categories endpoint full doc
- [x] API.MD — Skills endpoint full doc (search, filter, remove POST /skills)
- [x] API.MD — My Skills endpoints full doc (CRUD, validation, business rules, ordering, category filter, active request guard)
- [x] API.MD — Profile responses include user_skills
- [x] UI.MD — My Skills section expanded (components, states, empty messages, ordering)
- [x] UI.MD — Profile integration spec
- [x] UI.MD — Reusable components added (SkillCard, SkillBadge, FeaturedBadge, AddSkillModal, EditSkillModal)
- [x] ROADMAP.MD — This expanded checklist

### Phase 5.1 — Skill Architecture Refinement
**Goal:** Normalize skill names globally, add optional user title, add catalog metadata, clean up slug generation.

**Changes:**

1. **Name normalization** — Trim whitespace, collapse spaces, case-insensitive lookup
2. **Unique catalog** — Skill names are globally unique; no duplicate records
3. **Slug cleanup** — Removed `Str::random(4)` suffix; uses simple `Str::slug()` with collision fallback
4. **User title** — `user_skills.title` nullable, max 100 characters; null displays skill name
5. **Catalog metadata** — Added `is_system` (boolean) and `created_by` (nullable FK to users) on `skills` table
6. **Search** — Case-insensitive search on `GET /skills` endpoint
7. **Ordering** — `GET /me/skills` now orders by skill name (not title) to match spec

### Phase 5 Summary
**Backend Implementation:** Migration, 3 controllers, 2 form requests, 1 service, 1 resource, 6 routes, profile resource integration — all complete. Refinement: normalization, metadata, nullable title, slug cleanup. Phase 5.2: many-to-many categories via pivot table, `category_ids` array API.
**Frontend Implementation:** SkillsPage, SkillCard, AddSkillModal, EditSkillModal, DeleteSkillDialog, SkillsSection, API layer, hooks, profile integration — all complete. Title is optional, null title shows skill name.
**Tests:** 44 backend skill test cases (44/44 passing, 0 regressions), 158/159 total (1 pre-existing avatar storage failure unrelated, down from 4 due to migration fix). Tests pass after many-to-many refactor.
**Build:** TypeScript compiles clean, Vite build succeeds (SkillsPage 19.6 KB gzip: 4.8 KB)
**Key Decisions:**

- Active exchange request guard prevents cascade-deleting exchange requests
- Many-to-many categories via `skill_category_skill` pivot table with unique composite index
- Deterministic ordering: featured first, teaching before learning, alphabetical by skill name; categories ordered by sort_order then name
- Duplicate prevention at DB + app layer (unique pivot composite + distinct validation rule)
- sort_order seed data: 0-indexed, category-indexed for skills
- Partial update safety: omitted fields (including featured) unchanged
- `portfolio_url` deprecated (use portfolio_links table)
- Skill names are globally unique (case-insensitive normalized) — no two skills with the same name
- `is_system` and `created_by` are internal metadata, not exposed in API
- Custom skills are created via `skill_name` + `category_ids` (array); existing names are always reused
- `syncWithoutDetaching()` used for atomic, idempotent category attachment
- Skill selector uses debounced search + category filter with inline results dropdown
- Category selector appears only when creating a brand-new skill (not for existing skills)
- Modal forms use controlled local state (no React Hook Form — consistent with existing profile patterns)
- Delete confirmations use inline dialog with backend error display for active exchange restriction

### Phase 5.1 Checklist — Skill Architecture Refinement
#### Backend
- [x] Add `is_system` and `created_by` columns to skills table
- [x] Make `user_skills.title` nullable, change max to 100
- [x] Normalize skill names (trim, collapse spaces, case-insensitive lookup)
- [x] Remove random slug suffix; use `Str::slug()` with collision fallback
- [x] Update `SkillCategorySeeder` — seeded skills get `is_system = true`
- [x] Update `UserSkillService` — normalization, metadata, ordering by skill name
- [x] Update `StoreUserSkillRequest` — title nullable, max:100, normalized duplicate check
- [x] Update `UpdateUserSkillRequest` — title max:100
- [x] Update `SkillController` — case-insensitive search

#### Frontend
- [x] Title field optional (nullable) in AddSkillModal
- [x] Show skill name when title is null in SkillCard and SkillsSection
- [x] Update TypeScript types (title nullable)
- [x] Update Zod schemas (title nullable, max 100)

#### Testing (17 new tests)
- [x] Skill name trimmed on creation
- [x] Skill name collapses multiple spaces
- [x] Case-insensitive lookup reuses existing skill
- [x] Uppercase input reuses existing skill
- [x] Case-insensitive skill search
- [x] Whitespace-normalized duplicate rejected
- [x] Case-insensitive duplicate rejected
- [x] Custom skill sets `is_system = false`
- [x] Custom skill sets `created_by` to user ID
- [x] Title is optional on create
- [x] Title can be null
- [x] Title max 100 on create
- [x] Title max 100 on update
- [x] Title can be set to null on update
- [x] Custom skill slug has no random suffix
- [x] Existing skill ignores category_id
- [x] No duplicate skill records for same normalized name

#### Documentation
- [x] DATABASE.MD — updated skills and user_skills tables
- [x] FEATURES.MD — unique catalog, custom creation, optional title
- [x] API.MD — updated validation rules, notes
- [x] UI.MD — title optional, category selector behavior
- [x] ROADMAP.MD — this checklist

### Phase 5.2 — Many-to-Many Categories
**Goal:** Allow skills to belong to multiple categories instead of a single category.

**Changes:**

1. **Pivot table** — Created `skill_category_skill` table with unique composite index `(skill_category_id, skill_id)`, cascade on delete
2. **Data migration** — Preserved all existing skill-to-category relationships by inserting into pivot from the old `skills.category_id` column
3. **Skills table** — Removed `category_id` foreign key column
4. **Models** — `Skill::categories()` and `SkillCategory::skills()` both use `BelongsToMany` with `->orderBy('skill_categories.sort_order')->orderBy('skill_categories.name')` for deterministic ordering
5. **Service** — `UserSkillService::createUserSkill()` uses `syncWithoutDetaching()` for atomic category attachment
6. **Validation** — `StoreUserSkillRequest` accepts `category_ids` (array of integers, `distinct`, `exists:skill_categories,id`) when creating custom skills
7. **Resources** — `UserSkillResource` and `SkillResource` return `categories` array instead of `category_id` + `category` object
8. **Controllers** — Eager load `categories` on all skill queries to prevent N+1

### Phase 5.2 Checklist — Many-to-Many Categories
#### Backend
- [x] Create `skill_category_skill` pivot migration with unique composite index + cascade deletes
- [x] Data migration: copy existing `skills.category_id` values into pivot table
- [x] Remove `category_id` from skills table
- [x] Update `Skill` model: `categories()` BelongsToMany with ordering
- [x] Update `SkillCategory` model: `skills()` BelongsToMany
- [x] Update `UserSkillService`: `syncWithoutDetaching()` for atomic attachment
- [x] Update `StoreUserSkillRequest`: `category_ids` array validation with `distinct`
- [x] Update `UserSkillResource`: `categories` array instead of `category` object
- [x] Update `SkillController`: eager load categories
- [x] Update `SkillCategorySeeder`: multi-category examples, `syncWithoutDetaching()`

#### Frontend
- [ ] Update API types (categories array, no category_id)
- [ ] Update AddSkillModal (category_ids array, multi-select optional)
- [ ] Update SkillCard / SkillsSection for categories array
- [ ] Update category filter to handle multi-category skills

#### Testing
- [x] Backend tests pass (SkillRefinementTest, SkillTest)
- [x] Pivot integrity: duplicate (skill_id, category_id) rejected
- [x] Duplicate `category_ids` in payload rejected (validation)
- [x] Idempotent re-attachment: same skill+categories re-saved without error
- [x] Deterministic category order in responses

#### Documentation
- [x] DATABASE.MD — added pivot table, removed category_id from skills
- [x] FEATURES.MD — category_ids array, multi-category support
- [x] API.MD — updated request/response examples, validation rules
- [x] ROADMAP.MD — this section

---
## Phase 6 — Discover
Status: Completed

### Goal
Enable users to discover and filter potential learning partners based on skill matches.

### Overview
Discover provides a discoverable directory of eligible users — those with a verified email, a completed profile, and at least one Discover-eligible skill (an approved user_skill discoverable in Discover) — who want to teach or learn specific skills.
It uses the existing skills data from Phase 5 as the foundation for matching. Users can search by skill name, filter by category or experience level, and browse potential partners' public profiles.
The sidebar **Discover** link at `/discover` and **Back to Discover** links on public profiles are already in place — only the Discover feature itself remains to be implemented.

**Authentication**
Guest users may browse Discover without logging in.
Authentication is only required when initiating an Exchange Request (Phase 7).

---
# Stage 1 — Frontend (UI Foundation)
### Goal
Build the complete Discover interface with all visual UI states before integrating with the backend.

### Dependencies
- None. Stage 1 is the first implementation stage and builds UI independently.
- References existing Phase 5 type conventions but does not depend on any Discover backend.
- Stage 1 must not wait for or assume any backend endpoint exists.

### Types
- [x] Create `DiscoverUser`
- [x] Create `DiscoverSearchParams`
- [x] Create `DiscoverSearchResponse`

### Boundaries
Stage 1 is strictly limited to frontend foundation. It must NOT include:

- API requests or API client modules (e.g. `lib/api/discover.ts`)
- React Query hooks or data fetching logic
- Backend integration of any kind
- Mock data, fake API responses, temporary API simulation, or hardcoded datasets
- Business logic (filtering, search, ranking, eligibility evaluation)
- Temporary workarounds that simulate backend behavior

All of the above belong to Stage 3 (Frontend Integration) or Stage 2 (Backend API).

### Pages & Components
- [x] Create `DiscoverPage`
- [x] Create `DiscoverSearchCard`
- [x] Create `DiscoverFilters`

### Routing
- [x] Register `/discover`
- [x] Configure as a public route

### User Interface
- [x] Search bar
- [x] Category filter
- [x] Type filter (Teaching / Learning / All)
- [x] Experience Level filter
- [x] Responsive results grid
- [x] Discover user cards
- [x] Skill chips (Top 3 + "+N more")
- [x] Pagination component

### States
- [x] Loading skeleton
- [x] Initial browse state
- [x] Empty results state
- [x] Error state
- [x] Active filter indicator
- [x] Clear filters action

### Theme
- [x] Dark mode support

### Responsive Layout
- [x] Mobile
- [x] Tablet
- [x] Desktop

### One-Way Exchange Support (added per user request)
Users may send an exchange request without offering a return skill. The sender checks "I'm not looking for anything in return" to indicate they're willing to teach without receiving a skill back.

- [x] Frontend: Checkbox in skills modal (visual only — deferred; business logic belongs to Phase 7)
- [ ] Backend: Accept one-way exchange requests (see Phase 7 — Exchange Requests)

### Stage 1 Completion Criteria
Stage 1 is complete when:

- [x] `DiscoverPage` with all UI states (loading skeleton, initial browse, empty, error, active filters)
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Reusable components (`DiscoverSearchCard`, `DiscoverFilters`, pagination)
- [x] Search bar (visual only — no search behavior)
- [x] Filter dropdowns (category, type, experience level — visual only, no filtering behavior)
- [x] Results grid with user cards and skill chips
- [x] ViewSkillsModal with skills grouped by Teaching/Learning
- [x] Dark mode support
- [x] Route registered at `/discover`
- [x] Navigation link in sidebar/navbar

Stage 1 explicitly does NOT include:

- No backend implementation
- No API requests
- No React Query or data fetching hooks
- No mock data or fake API simulation
- No business logic (filtering, search, ranking, eligibility)
- No temporary workarounds that simulate backend behavior

---
# Stage 2 — Backend API
### Goal
Implement the Discover search endpoint and business logic.

### Dependencies
- Stage 1 completed — UI component structure and type definitions are available for reference.

### Expected outputs
- `GET /api/v1/discover` endpoint with full search, filter, and pagination support
- `DiscoverSearchRequest` form request with validation
- `DiscoverService` with composable query builder and eligibility rules
- `DiscoverUserResource` with matched skills preview
- Search ranking: exact match > partial match > match count > alphabetical by `users.name` (tie-breaker: `users.id`)
- Browse mode: alphabetical by `users.name` (tie-breaker: `users.id`)
- Pagination: default `per_page = 20`, maximum `per_page = 50`, default `page = 1`
- API.md updated with endpoint documentation
- Backend tests passing for all search, filter, eligibility, and ranking scenarios
- API contract finalized and stable — no breaking changes after this stage

### Boundaries
Stage 2 must not modify:
- Existing UI components, layouts, or pages
- Frontend code of any kind (tsx, css, component state)
- Client-side routing
- Phase 5 backend (skills, categories — read-only access only)
- Existing database schema (no new migrations for Discover)
- Existing models, controllers, or services from other phases

### Controller & Routes
- [x] Create `DiscoverController`
- [x] Register `GET /api/v1/discover`
- [x] Apply `throttle:api` middleware

### Query Parameters
- [x] `q`
- [x] `category_id`
- [x] `type`
- [x] `experience_level`
- [x] `page`
- [x] `per_page`

### Form Request
- [x] Create `DiscoverSearchRequest`

Validation:

- [x] `q`
- [x] `category_id`
- [x] `type`
- [x] `experience_level`
- [x] `page`
- [x] `per_page`

### Service
- [x] Create `DiscoverService`
      Responsibilities:
- [x] Email verification eligibility
- [x] Profile completion eligibility
- [x] Discover-eligible skill filtering
- [x] Skill name search
- [x] Category filter
- [x] Type filter
- [x] Experience filter
- [x] Pagination

### Resource
- [x] Create `DiscoverUserResource`
      Include:
- [x] User information
- [x] Profile information
- [x] `matched_skills`
- [x] `matched_skills_count`

### Query Design
- [x] Join users, profiles, user_skills, skills, skill_categories
- [x] Exclude authenticated user (when authenticated)
- [x] Apply Discover eligibility rules
- [x] Eager load required relationships
- [x] Prevent N+1 queries
- [x] Return distinct users

### Ranking
Search mode:

- [x] Exact skill match
- [x] Partial skill match
- [x] Matching skill count
- [x] Alphabetical by `users.name` (tie-breaker: `users.id`)

Browse mode:

- [x] Alphabetical by `users.name` (tie-breaker: `users.id`)

### Stage 2 Completion Criteria
Stage 2 is complete when:

- [x] `DiscoverController` created with `GET /api/v1/discover`
- [x] `DiscoverSearchRequest` validates all query parameters
- [x] `DiscoverService` implements eligibility, search, filters, and pagination
- [x] `DiscoverUserResource` returns user info + matched skills preview
- [x] Query design prevents N+1 and returns distinct users
- [x] Search ranking works: exact > partial > match count > alphabetical by `users.name` (tie-breaker: `users.id`)
- [x] Browse mode returns alphabetical by `users.name` (tie-breaker: `users.id`)
- [x] Pagination defaults: `per_page = 20`, `max_per_page = 50`
- [x] API.md updated with endpoint documentation
- [x] All backend tests pass (37 tests, 110 assertions)
- [x] API contract is finalized and stable

Next stage (Stage 3) must not begin until all items above are satisfied.

---
# Stage 3 — Frontend Integration
### Goal
Replace visual-only UI states with real API integration.

### Dependencies
- Stage 1 completed — UI components, layout, and visual states exist.
- Stage 2 completed — Backend API is deployed, tested, and contract is finalized.

### Expected outputs
- `searchDiscover()` API client function in `lib/api/discover.ts`
- `useDiscoverSearch()` React Query hook with debounced search and pagination
- Search input triggers real API calls
- All filters (category, type, experience level) send query params to the API
- Category dropdown populated from `GET /api/v1/skill-categories` instead of hardcoded values
- Pagination controls fetch pages from the API
- Loading skeleton displays during API fetch
- Empty state shows when API returns no results
- Error state shows on API failure with retry
- No mock data, no fake API, no temporary workarounds

### Integration Contract
Stage 3 consumes the backend API contract from Stage 2 as-is:
- Endpoint: `GET /api/v1/discover`
- Query parameters: `q`, `category_id`, `type`, `experience_level`, `page`, `per_page`
- Response shape: `{ success, message, data: { users: [...], meta: {...} } }`
- Resource structure: `DiscoverUserResource` with user info, `matched_skills` (max 3), and `matched_skills_count`

Stage 3 must not redesign the API contract. If the contract is insufficient, the issue must be resolved by updating Stage 2 documentation and re-implementing Stage 2, not by working around it in frontend code.

### Boundaries
Stage 3 must not modify:
- Backend controllers, services, resources, or form requests
- Database schema or queries
- Ranking algorithm or eligibility rules
- API response structure or validation rules
- Any PHP or backend code
- Existing Phase 5 backend

### API
- [x] Create `searchDiscover()`

### Hooks
- [x] Create `useDiscoverSearch()`

Features:

- [x] Debounced search
- [x] keepPreviousData pagination
- [x] URL query synchronization

### Integration
- [x] Replace visual-only UI with real API data
- [x] Connect search
- [x] Connect filters
- [x] Fetch categories from `GET /api/v1/skill-categories` and populate dropdown
- [x] Remove hardcoded category values from `DiscoverFilters`
- [x] Connect pagination
- [x] Connect loading state
- [x] Connect empty state
- [x] Connect error state

### Stage 3 Completion Criteria
Stage 3 is complete when:

- [x] `searchDiscover()` API client function exists and is tested
- [x] `useDiscoverSearch()` hook integrates with the API
- [x] Search input triggers debounced API calls
- [x] Category, type, and experience level filters send correct query params
- [x] Category dropdown populated from `GET /api/v1/skill-categories` — no hardcoded values remain
- [x] Pagination fetches pages from the API
- [x] Loading skeleton shows during fetch
- [x] Empty state renders when API returns zero results
- [x] Error state renders with retry button on API failure
- [x] All visual-only UI states from Stage 1 are replaced with real API-driven states
- [x] No mock data, no fake API, no temporary workarounds remain in the codebase
- [x] Vite/TypeScript build passes clean (no discover-related errors)
- [x] ESLint — not configured in project (no discover-related issues)

Next stage (Stage 4) must not begin until all items above are satisfied.

---
# Stage 4 — Testing & Hardening
### Goal
Validate the full Discover feature through automated tests across backend and frontend, verify integration correctness, and fix any issues found.

### Dependencies
- Stage 1 completed — UI components exist and are stable.
- Stage 2 completed — Backend API is deployed, tested, and contract finalized.
- Stage 3 completed — Frontend is fully integrated with the backend API.

### Expected outputs
- All backend test scenarios pass (search, filters, pagination, ranking, eligibility, validation)
- All frontend test scenarios pass (render, interaction, states, responsive, dark mode)
- Integration verified: frontend consumes backend contract correctly
- No known regressions in existing functionality
- Documentation synchronized across all files
- Final review sign-off

### Boundaries
Stage 4 must not:
- Introduce new features or behavioral changes
- Modify backend business logic (ranking, eligibility, filtering)
- Modify UI component structure or design
- Change the API contract
- Add new API endpoints, query parameters, or response fields
- Alter database schema

### Backend
- [x] Browse returns eligible users
- [x] Search by skill
- [x] Partial skill search
- [x] Case-insensitive search
- [x] Category filter
- [x] Type filter
- [x] Experience filter
- [x] Combined filters
- [x] Pagination
- [x] Validation
- [x] Guest access
- [x] Ranking
- [x] Eligibility rules
- [x] matched_skills preview
- [x] matched_skills_count

### Frontend
- [x] Initial render
- [x] Browse state
- [x] Loading state
- [x] Empty state
- [x] Error state
- [x] Search interaction
- [x] Filter interaction
- [x] Pagination
- [x] Responsive layout
- [x] Dark mode

### Stage 4 Completion Criteria
Stage 4 is complete when:

- [x] All backend test cases pass (37 tests, 110 assertions)
- [x] All frontend test cases pass (manual verification — no test framework installed)
- [x] No regressions in existing test suites
- [x] Integration between frontend and backend verified
- [x] All issues found during testing are resolved
- [x] Documentation is synchronized

Next stage (Stage 5) must not begin until all items above are satisfied.

---
# Stage 5 — Documentation Synchronization
### Goal
Ensure all documentation accurately reflects the implemented Discover feature and is consistent across all files.

### Dependencies
- Stage 4 completed — all testing is done and issues are resolved.

### Expected outputs
- `API.md` accurately documents the Discover endpoint with correct request/response examples
- `FEATURES.md` Discover section matches implemented behavior
- `UI.md` Discover section matches the final UI
- `ROADMAP.md` Stage 1-5 checklists are marked complete
- All cross-references between documentation files are consistent
- No stale or contradictory content remains

### Boundaries
Stage 5 must not:
- Add new feature descriptions not implemented in Stages 1-4
- Change documented API contracts beyond what was implemented
- Introduce new requirements or scope
- Generate any production code

### Stage 5 Completion Criteria
Stage 5 is complete when:

- [x] `API.md` is updated with final contract
- [x] `FEATURES.md` is updated with final behavior
- [x] `UI.md` is updated with final UI description
- [x] `ROADMAP.md` has all Stage 1-5 items marked complete
- [x] No documentation inconsistencies exist between files

### Phase 6 Completion Criteria
Phase 6 is fully complete only when Stages 1-5 are all complete:

- [x] Stage 1 — Frontend UI complete
- [x] Stage 2 — Backend API complete
- [x] Stage 3 — Frontend Integration complete
- [x] Stage 4 — Testing & Hardening complete
- [x] Stage 5 — Documentation Synchronization complete
- [x] No known regressions remain

---
## Phase 7 — Exchange Requests
Status: Completed

### Goal
Let users send, accept, and reject skill exchange match requests. Phase 7 is the first interactive feature that connects users after discovery. It introduces the exchange request lifecycle: pending → accepted/declined/cancelled, with one-way teaching support.

### Overview
Exchange Requests connect Discover-matched users (Phase 6) by letting the sender propose a skill swap: they offer one of their teaching skills and optionally request to learn one of the receiver's teaching skills. The receiver accepts or declines; the sender can cancel. One-way teaching ("I'm not looking for anything in return") is supported via a nullable `learning_skill_id`, and one-way learning (receiver teaches nothing in return) is supported via a nullable `teaching_skill_id`. At least one of the two skills must be provided.

The `ExchangeRequest` model, migration, and factory already exist (Phase 2 database work). All service, controller, validation, and resource layers remain to be implemented. Editing an accepted request resets it to `pending` for re-confirmation by the non-editor, tracked via `reconfirmation_required_by`.

**Authentication**
Exchange Requests require authentication. Unlike Discover (public browse), sending, listing, accepting, declining, and cancelling all require an authenticated user.

**Dependencies**
- Phase 5 — Skills (user_skills for teaching/learning selection)
- Phase 6 — Discover (entry point for sending requests from search results and profiles)
- Phase 8 — Messaging (conversations created after acceptance)
- Phase 9 — Learning Sessions (sessions scheduled after acceptance)

**Existing Placeholders**
- Sidebar link `/exchange-requests` (AuthenticatedLayout)
- "Send Exchange Request" button in ViewSkillsModal (disabled — "Coming in Phase 7")
- "Send Exchange Request" link in PublicProfilePage (`href="#"`)
- Dashboard "Active Exchanges" card (hardcoded 0)
- One-way checkbox in ViewSkillsModal (visual only)
- `ExchangeRequest` model, migration, factory (Phase 2)

---

# Stage 1 — Frontend (UI Foundation)
### Goal
Build the complete Exchange Requests interface with all visual UI states before integrating with the backend.

### Dependencies
- None. Stage 1 is the first implementation stage and builds UI independently.
- References existing Phase 5/6 component and type conventions but does not depend on any Exchange Request backend.
- Stage 1 must not wait for or assume any backend endpoint exists.

### Types
- [x] Create `ExchangeRequestStatus` — Phase 7 uses only: `pending`, `accepted`, `declined`, `cancelled`. The `completed` status is introduced in Phase 9 (Learning Sessions) and must NOT be part of the Phase 7 frontend types, badges, filters, or component logic. It will be added during Phase 9 implementation.
- [x] Create `ExchangeRequest` interface (id, sender, receiver, teaching_skill, learning_skill, message, status, reconfirmation_required_by, created_at, updated_at)
- [x] Create `SendExchangeRequestData` interface (receiver_id, teaching_skill_id?, learning_skill_id?, message?)

### Boundaries
Stage 1 is strictly limited to frontend foundation. It must NOT include:

- API requests or API client modules (e.g. `lib/api/exchange-requests.ts`)
- React Query hooks or data fetching logic
- Backend integration of any kind
- Mock data, fake API responses, temporary API simulation, or hardcoded datasets — **exception:** isolated placeholder fixtures (see below)
- Business logic (status transitions, eligibility, ownership checks)
- Temporary workarounds that simulate backend behavior

All of the above belong to Stage 3 (Frontend Integration) or Stage 2 (Backend API).

**Placeholder fixtures:** Stage 1 requires visual loaded states before any backend exists. To satisfy this, isolated placeholder fixtures (e.g. `features/exchange-request/data/placeholder.ts`) are permitted and used only as default prop values to render the visual states. They are temporary, are NOT coupled to component logic, do not simulate backend behavior, and are fully replaced by real API integration in Stage 3.

### Pages & Components
- [x] Create `ExchangeRequestsPage` (tabs: Received / Sent)
- [x] Create `ExchangeRequestCard` (user info, skills, message, status badge, action buttons)
- [x] Create `SendExchangeRequestModal` (teaching skill selector, learning skill selector, one-way checkbox, message input; edit mode supports either party with role-aware skill fields)

### Routing
- [x] Lazy import + register `/exchange-requests` under `AuthenticatedLayout` in App.tsx
- [x] Sidebar link already exists — verify it maps to the route

### User Interface
- [x] Tabbed interface (Received / Sent) — Received is the default tab
- [x] Pending count badge on Received tab
- [x] Status badge (pending/accepted/declined/cancelled — `completed` added in Phase 9)
- [x] Teaching skill display
- [x] Learning skill display (hidden for one-way requests)
- [x] "One-way exchange" label for requests without a learning skill
- [x] Accept / Decline buttons (receiver view)
- [x] Cancel button (sender view)
- [x] "New Request" button
- [x] Responsive layout

### States
- [x] Loading spinner
- [x] Empty (received): "When someone sends you a request, it will appear here."
- [x] Empty (sent): "Requests you have sent will appear here."
- [x] Error state with retry button
- [x] Loaded state with request cards

### Theme
- [x] Dark mode support

### Responsive Layout
- [x] Mobile
- [x] Tablet
- [x] Desktop

### Stage 1 Completion Criteria
Stage 1 is complete when:

- [x] `ExchangeRequestsPage` with all UI states (loading, empty received, empty sent, error, loaded)
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Reusable components (`ExchangeRequestCard`, `SendExchangeRequestModal`)
- [x] Status badge colors for all 4 Phase 7 statuses (pending/accepted/declined/cancelled)
- [x] Route registered at `/exchange-requests`
- [x] Sidebar navigation link maps to the route
- [x] Dark mode support

Stage 1 explicitly does NOT include:

- No backend implementation
- No API requests
- No React Query or data fetching hooks
- No mock data or fake API simulation (isolated placeholder fixtures are permitted — see Boundaries above)
- No business logic (status transitions, ownership checks)
- No temporary workarounds that simulate backend behavior

---

# Stage 2 — Backend API
### Goal
Implement the Exchange Request API with status transitions, ownership rules, one-way exchange support (either skill nullable), and re-confirmation after edits.

### Dependencies
- Stage 1 completed — UI component structure and type definitions are available for reference.
- Phase 2 database — `exchange_requests` table already exists.

### Expected outputs
- New migrations: make `exchange_requests.learning_skill_id` and `exchange_requests.teaching_skill_id` nullable (one-way exchange support), and add `reconfirmation_required_by`
- `GET /api/v1/me/exchange-requests` endpoint — list user's requests
- `POST /api/v1/me/exchange-requests` endpoint — create a request
- `GET /api/v1/me/exchange-requests/{id}` endpoint — view a single request
- `PUT /api/v1/me/exchange-requests/{id}` — update a request (skills/message; resets accepted → pending for re-confirmation by the non-editor)
- `PUT /api/v1/me/exchange-requests/{id}/accept` — accept a pending request (pending decider only)
- `PUT /api/v1/me/exchange-requests/{id}/decline` — decline a pending request (pending decider only)
- `PUT /api/v1/me/exchange-requests/{id}/cancel` — cancel a pending/accepted request (sender only)
- `StoreExchangeRequestRequest` and `UpdateExchangeRequestRequest` form requests with validation
- `ExchangeRequestService` with status transition logic
- `ExchangeRequestResource` with sender, receiver, skill details, and reconfirmation_required_by
- Backend tests passing for all status transitions, auth, and validation scenarios
- API.md updated with endpoint documentation
- API contract finalized and stable — no breaking changes after this stage

### Boundaries
Stage 2 must not modify:
- Existing UI components, layouts, or pages
- Frontend code of any kind (tsx, css, component state)
- Client-side routing
- Existing database tables (new migrations only — make `learning_skill_id` / `teaching_skill_id` nullable, add `reconfirmation_required_by`)
- Existing models, controllers, or services from other phases

### Database
- [x] Create migration: make `exchange_requests.learning_skill_id` nullable
- [x] Create migration: make `exchange_requests.teaching_skill_id` nullable (sender offers no skill)
- [x] Create migration: add `reconfirmation_required_by` (nullable string: `'sender'` / `'receiver'`, `null` otherwise)

### Model (`ExchangeRequest.php`) — Already exists
- [x] Verify relationships: sender, receiver, teachingSkill, learningSkill, conversation, learningSessions
- [x] Ensure `$fillable` includes: sender_id, receiver_id, teaching_skill_id, learning_skill_id, message, status, reconfirmation_required_by

### Controller & Routes
- [x] Create `ExchangeRequestController`
- [x] Register `GET /api/v1/me/exchange-requests`
- [x] Register `POST /api/v1/me/exchange-requests`
- [x] Register `GET /api/v1/me/exchange-requests/{exchangeRequest}`
- [x] Register `PUT /api/v1/me/exchange-requests/{exchangeRequest}` (update)
- [x] Register `PUT /api/v1/me/exchange-requests/{exchangeRequest}/accept`
- [x] Register `PUT /api/v1/me/exchange-requests/{exchangeRequest}/decline`
- [x] Register `PUT /api/v1/me/exchange-requests/{exchangeRequest}/cancel`

### Form Request
- [x] Create `StoreExchangeRequestRequest`
- [x] Create `UpdateExchangeRequestRequest`

Validation:
- [x] `receiver_id`: required, integer, exists:users,id (store only)
- [x] `teaching_skill_id`: nullable, integer, exists:user_skills,id (at least one of teaching/learning required)
- [x] `learning_skill_id`: nullable, integer, exists:user_skills,id (at least one of teaching/learning required)
- [x] `message`: nullable, string, max:500 — trimmed of leading/trailing whitespace; empty trimmed value stored as `null`

### Service
- [x] Create `ExchangeRequestService`
      Responsibilities:
- [x] List requests where user is sender or receiver (ordered by `created_at DESC, id DESC`)
- [x] List filtering by `role` (sender/receiver) and `status`
- [x] List pagination — `page` default 1, `per_page` default 20, max 50 (matches Discover contract)
- [x] Create request — teaching_skill (if provided) belongs to sender and is "teaching" type
- [x] Create request — learning_skill (if provided) belongs to receiver and is "teaching" type
- [x] At least one of teaching_skill_id / learning_skill_id must be provided
- [x] Update request — sender can edit `pending`; either party can edit `accepted`; edit records `reconfirmation_required_by` = the non-editor and resets `accepted` → `pending` for re-confirmation
- [x] Same-direction same-skill duplicate guard — at most one active request per sender, receiver, and catalog `learning` skill (reverse-direction and different-skill requests are allowed)
- [x] Self-request guard (sender_id !== receiver_id)
- [x] Sender eligibility check (email verified, profile completion ≥ 5, teaching skill optional)
- [x] Receiver eligibility check (email verified, profile completion ≥ 5, at least one skill)
- [x] Accept — pending decider only (receiver for new requests; the non-editor after an edit), status must be pending (optimistic conditional update); clears `reconfirmation_required_by`
- [x] Decline — pending decider only (receiver for new requests; the non-editor after an edit), status must be pending (optimistic conditional update); clears `reconfirmation_required_by`
- [x] Cancel — sender only, status must be pending or accepted (optimistic conditional update)

### Business Rules
The canonical rules live in FEATURES.MD → Exchange Requests (Phase 7). This checklist tracks their implementation:

- [x] State machine — only the allowed transitions execute; all others return 422
- [x] Terminal states (`declined`, `cancelled`, `completed`) accept no further transitions
- [x] `accepted → completed` is NOT exposed in Phase 7 (deferred to Phase 9)
- [x] Idempotency — replaying a transition on the wrong source state returns 422
- [x] Duplicate guard scoped to same direction (sender → receiver) and same catalog `learning` skill
- [x] Ordering contract — list returns `created_at DESC, id DESC`
- [x] Concurrency — create/accept/decline/cancel run atomically in a DB transaction; accept/decline/cancel use conditional updates against the expected source state (optimistic concurrency, 422 on zero-row update)
- [x] Message normalization — trim on create; empty trimmed value stored as `null`
- [x] Notifications — none sent in Phase 7 (email, push, in-app all out of scope)

### Resource
- [x] Create `ExchangeRequestResource`
      Include:
- [x] id
- [x] sender (UserResource)
- [x] receiver (UserResource)
- [x] teaching_skill (UserSkillResource) — nullable when no skill offered
- [x] learning_skill (UserSkillResource) — nullable when no return skill
- [x] message
- [x] status
- [x] reconfirmation_required_by (nullable: `'sender'` / `'receiver'`, null otherwise)
- [x] created_at
- [x] updated_at

### Authorization
- [x] Controller-level ownership checks (no formal Policy — consistent with Phase 5 pattern)
- [x] Sender/receiver scoping on show, accept, decline, cancel

### Query Design
- [x] Eager load sender.profile, receiver.profile, teachingSkill.skill, learningSkill.skill
- [x] Prevent N+1 queries

### Status Transitions
- [x] `pending` → `accepted` (pending decider accepts — receiver for new requests, non-editor after an edit)
- [x] `pending` → `declined` (pending decider declines)
- [x] `pending` → `cancelled` (sender cancels)
- [x] `accepted` → `cancelled` (sender cancels)
- [x] `accepted` → `pending` (either party edits — re-confirmation by the non-editor)
- [x] `accepted` → `completed` deferred to Phase 9 (Learning Sessions)

### Stage 2 Completion Criteria
Stage 2 is complete when:

- [x] Migrations make `learning_skill_id` / `teaching_skill_id` nullable and add `reconfirmation_required_by`
- [x] `ExchangeRequestController` created with all 7 endpoints
- [x] `StoreExchangeRequestRequest` / `UpdateExchangeRequestRequest` validate all fields
- [x] `ExchangeRequestService` implements ownership, same-direction same-skill duplicate guard, self-request, eligibility, re-confirmation, edit-history capture, and status transition rules
- [x] `ExchangeRequestResource` returns sender, receiver, skills, message, status, reconfirmation_required_by, timestamps
- [x] Status transitions enforced (invalid transitions return 422)
- [x] Idempotency enforced (replay on wrong source state returns 422)
- [x] Ownership enforced (unauthorized actor returns 403)
- [x] Eligibility enforced for sender and receiver (422 on violation)
- [x] List ordering follows `created_at DESC, id DESC`
- [x] List filtering (`role`, `status`) and pagination (`page`, `per_page` — default 20, max 50) implemented
- [x] Optimistic concurrency — transitions run as conditional updates; zero-row updates return 422
- [x] Concurrency — create and transition operations run in DB transactions
- [x] API.md updated with endpoint documentation
- [x] All backend tests pass
- [x] API contract is finalized and stable

Next stage (Stage 3) must not begin until all items above are satisfied.

---

# Stage 3 — Frontend Integration
### Goal
Replace visual-only UI states with real API integration.

### Dependencies
- Stage 1 completed — UI components, layout, and visual states exist.
- Stage 2 completed — Backend API is deployed, tested, and contract is finalized.

### Expected outputs
- API client functions in `lib/api/exchange-requests.ts`
- React Query hooks with query and mutations
- `ExchangeRequestsPage` loads real request data
- `ExchangeRequestCard` actions (Accept / Decline / Cancel) call the API
- `SendExchangeRequestModal` submits real requests (including one-way)
- ViewSkillsModal and PublicProfilePage buttons trigger the real send flow
- Dashboard "Active Exchanges" card shows a real count
- Loading, empty, and error states driven by real API responses
- No mock data, no fake API, no temporary workarounds

### Integration Contract
Stage 3 consumes the backend API contract from Stage 2 as-is:
- Endpoints: `GET /api/v1/me/exchange-requests`, `POST /api/v1/me/exchange-requests`, `GET /api/v1/me/exchange-requests/{id}`, `PUT .../{id}` (update), `PUT .../{id}/accept`, `PUT .../{id}/decline`, `PUT .../{id}/cancel`
- Create body: `receiver_id`, `teaching_skill_id?`, `learning_skill_id?`, `message?` (at least one skill required)
- Update body: `teaching_skill_id?`, `learning_skill_id?`, `message?` (at least one skill required)
- Response shape: `{ success, message, data: { exchange_request(s): [...] } }`
- Resource structure: `ExchangeRequestResource` with sender, receiver, teaching_skill, learning_skill, message, status, reconfirmation_required_by

Stage 3 must not redesign the API contract. If the contract is insufficient, the issue must be resolved by updating Stage 2 documentation and re-implementing Stage 2, not by working around it in frontend code.

### Boundaries
Stage 3 must not modify:
- Backend controllers, services, resources, or form requests
- Database schema or queries
- Status transition or ownership rules
- API response structure or validation rules
- Any PHP or backend code

### API
- [x] Create `listExchangeRequests(params)` (role/status filters, pagination)
- [x] Create `getExchangeRequest(id)`
- [x] Create `createExchangeRequest(data)` (receiver_id, teaching_skill_id?, learning_skill_id?, message?)
- [x] Create `updateExchangeRequest(id, data)` (skills/message; accepted-edit reopens for re-confirmation)
- [x] Create `acceptExchangeRequest(id)`
- [x] Create `declineExchangeRequest(id)`
- [x] Create `cancelExchangeRequest(id)`

### Hooks
- [x] Create `useExchangeRequests(params)` (query, staleTime 30s, queryKey `["exchange-requests"]`, `keepPreviousData`)
- [x] Create `useExchangeRequest(id)` (single-request query, disabled when `id` is null)
- [x] Create `usePendingExchangeRequestCount()` (derived from list `meta.total`)
- [x] Create `useActiveExchangeCount()` (Dashboard "Active Exchanges" — queryKey `["dashboard"]`)
- [x] Create `useCreateExchangeRequest()` (mutation, invalidates `["exchange-requests"]`, `["exchange-request"]`, and `["dashboard"]`)
- [x] Create `useUpdateExchangeRequest()` (mutation, invalidates `["exchange-requests"]`, `["exchange-request"]`, and `["dashboard"]`)
- [x] Create `useAcceptExchangeRequest()` (mutation, invalidates `["exchange-requests"]`, `["exchange-request"]`, and `["dashboard"]`)
- [x] Create `useDeclineExchangeRequest()` (mutation, invalidates `["exchange-requests"]`, `["exchange-request"]`, and `["dashboard"]`)
- [x] Create `useCancelExchangeRequest()` (mutation, invalidates `["exchange-requests"]`, `["exchange-request"]`, and `["dashboard"]`)

### Schemas
- [x] Create `sendExchangeRequestSchema` (Zod: receiver_id, teaching_skill_id?, learning_skill_id?, message? max 500; at least one of teaching/learning enforced at submit)
- [x] Schema normalizes `message` — trims whitespace; trimmed-empty becomes `null` (matches backend; whitespace-only never sent as a non-empty string)

### Integration
- [x] Replace visual-only UI with real API data (placeholder fixtures removed)
- [x] Connect `ExchangeRequestsPage` list (Received / Sent tabs)
- [x] Connect pending count badge (real `meta.total`)
- [x] Connect `ExchangeRequestCard` Accept / Decline / Cancel actions (decider-aware: pending decider sees Accept/Decline)
- [x] Connect `SendExchangeRequestModal` — sender flow leads with the learning selector ("What would you like to learn from {name}?") and adds an optional "I'd also like to teach them a skill in return" teaching checkbox; receiver edit view shows "Skill you'll teach in return" + "Skill {sender} will teach you"; at least one skill required
- [x] Connect edit flow — Edit button on cards/details opens the modal prefilled; saving an accepted request shows "Awaiting sender/receiver confirmation"; locked fields (other party's chosen skill) submit their existing value
- [x] Connect `ExchangeRequestHistoryModal` — Details button on cards (shown when `history.length > 0`) opens the edit-audit timeline
- [x] Populate the learning selector from the receiver's teaching skills (`GET /users/{username}` → `data.user.user_skills.teaching`)
- [x] Populate the teaching selector from `GET /me/skills` filtered to `type === "teaching"` (sender's skills, gated on modal open)
- [x] Wire up ViewSkillsModal "Send Exchange Request" button
- [x] Wire up PublicProfilePage "Send Exchange Request" link
- [x] Wire up Dashboard "Active Exchanges" card (via `useActiveExchangeCount`)
- [x] Connect loading state
- [x] Connect empty states (received / sent)
- [x] Connect error state with retry

### Cache Invalidation
- [x] Every successful mutation (create, accept, decline, cancel, edit) invalidates `["exchange-requests"]`, `["exchange-request"]`, AND the `["dashboard"]` query key
- [x] Dashboard "Active Exchanges" card updates immediately after mutations (no manual refresh)

### Stage 3 Completion Criteria
Stage 3 is complete when:

- [x] API client functions exist and are used
- [x] React Query hooks integrate with the API
- [x] `ExchangeRequestsPage` renders real request data in both tabs
- [x] Pending count badge reflects real data
- [x] Accept/Decline/Cancel actions update status via API and invalidate cache
- [x] Edit action updates skills/message via API and invalidates cache; accepted-edit shows the re-confirmation note
- [x] Mutations invalidate `["exchange-requests"]`, `["exchange-request"]`, and the `["dashboard"]` query key
- [x] `SendExchangeRequestModal` sends real requests (pure-learning and with a teaching offer) and edits as either party
- [x] Skill selectors use the documented data sources (`GET /me/skills` teaching; `GET /users/{username}` teaching)
- [x] ViewSkillsModal and PublicProfilePage buttons initiate the real flow
- [x] Dashboard shows a real exchange count
- [x] Loading, empty, and error states are API-driven
- [x] No mock data, no fake API, no temporary workarounds remain in the codebase
- [x] Vite/TypeScript build passes clean (no exchange-request related errors)
- [x] ESLint — not configured in project (no exchange-request related issues)

Next stage (Stage 4) must not begin until all items above are satisfied.

---

# Stage 4 — Testing & Hardening
### Goal
Validate the full Exchange Requests feature through automated tests across backend and frontend, verify integration correctness, and fix any issues found.

### Dependencies
- Stage 1 completed — UI components exist and are stable.
- Stage 2 completed — Backend API is deployed, tested, and contract finalized.
- Stage 3 completed — Frontend is fully integrated with the backend API.

### Expected outputs
- All backend test scenarios pass (auth, validation, status transitions, ownership)
- All frontend test scenarios pass (render, interaction, states, responsive, dark mode)
- Integration verified: frontend consumes backend contract correctly
- No known regressions in existing functionality
- Documentation synchronized across all files
- Final review sign-off

### Boundaries
Stage 4 must not:
- Introduce new features or behavioral changes
- Modify backend business logic (status transitions, ownership rules)
- Modify UI component structure or design
- Change the API contract
- Add new API endpoints, query parameters, or response fields
- Alter database schema

### Backend
- [x] Guest cannot list exchange requests (401)
- [x] Guest cannot create exchange requests (401)
- [x] Authenticated user can list exchange requests
- [x] User can send request with teaching + learning skill
- [x] User can send one-way exchange request (no learning_skill_id)
- [x] User can send request with teaching skill only (no learning_skill_id)
- [x] Cannot send request with no skills at all (422)
- [x] Cannot send duplicate active request — same direction (sender → receiver) + same catalog `learning` skill (422, "You already have an active exchange with this user for this skill.")
- [x] Different-skill active request while another is active is allowed (201)
- [x] Reverse-direction request for the same skill is allowed (201)
- [x] Cannot send request to self (422)
- [x] Receiver can accept request (200, status → accepted)
- [x] Sender cannot accept request (403)
- [x] Receiver can decline request (200, status → declined)
- [x] Sender can cancel pending request (200, status → cancelled)
- [x] Sender can cancel accepted request (200, status → cancelled)
- [x] Receiver cannot cancel request (403)
- [x] Cannot accept declined/cancelled request (422)
- [x] User can view own exchange request
- [x] User cannot view unrelated exchange request (403)
- [x] Validation: missing receiver_id (422)
- [x] Validation: teaching_skill_id with wrong owner/type (422)
- [x] Validation: learning_skill_id with wrong owner/type (422)
- [x] Request appears in both sender and receiver lists
- [x] Idempotency: accept an accepted request (422)
- [x] Idempotency: decline a declined request (422)
- [x] Idempotency: cancel a cancelled request (422)
- [x] Idempotency: accept a cancelled request (422)
- [x] Idempotency: decline a completed request (422)
- [x] Eligibility: receiver with unverified email (422)
- [x] Eligibility: receiver with incomplete profile (422)
- [x] Eligibility: receiver with no skills (422)
- [x] Ordering: list returns newest-first (`created_at DESC, id DESC`)
- [x] Pagination: list honors `per_page` default 20, max 50, and `page`
- [x] Filtering: list filters by `role` (sender/receiver) and `status`
- [x] Message: whitespace-only message stored as `null`
- [x] Concurrency: two simultaneous Accepts on the same pending request — exactly one succeeds (200, status → accepted); the other's conditional update matches zero rows and returns 422; the final DB state is consistent (single accepted record)
- [x] Concurrency: Accept racing Sender Cancel on the same pending request — exactly one transition succeeds; the loser returns 422
- [x] New request is allowed after a previous request is declined/cancelled/completed

### Re-confirmation (accepted → edited → pending)
- [x] Receiver edits accepted request → status `pending`, `reconfirmation_required_by = 'sender'`
- [x] Sender edits accepted request → status `pending`, `reconfirmation_required_by = 'receiver'`
- [x] Sender (non-editor) can accept after receiver edit (200, status → accepted, reconfirmation cleared)
- [x] Sender (non-editor) can decline after receiver edit (200, status → declined)
- [x] Receiver (editor) cannot accept their own edit (403)
- [x] Receiver (editor) cannot decline their own edit (403)
- [x] Sender can edit a `pending` request (reconfirmation_required_by → `'receiver'`)
- [x] Receiver cannot edit a `pending` request (422)
- [x] Editing does not require both skills — at least one must remain (422 when both cleared)

### Edit History (accepted → edited audit trail)
- [x] Editing an `accepted` request records one `exchange_request_history` row (before teaching/learning skills, message, status + `edited_by`)
- [x] Editing a `pending` request does NOT record history
- [x] `show` returns `history: []` when none, and returns recorded history after an accepted edit

### Frontend
- [x] Initial render
- [x] Loading state
- [x] Empty received state
- [x] Empty sent state
- [x] Error state
- [x] Tabs interaction (Received / Sent)
- [x] Accept interaction
- [x] Decline interaction
- [x] Cancel interaction
- [x] Send request interaction (pure-learning and with a teaching offer)
- [x] Edit request interaction (sender and receiver, including clearing "teach in return" with a None option and locked other-party skills)
- [x] History modal (Details button shown only when `history.length > 0`)
- [x] Pending count badge
- [x] Responsive layout
- [x] Dark mode

### Stage 4 Completion Criteria
Stage 4 is complete when:

- [x] All backend test cases pass (Exchange Request suite 87/87; full suite 282 pass, 4 pre-existing unrelated storage failures, 1 unrelated Discover skip)
- [x] All frontend test cases pass (manual verification — no test framework installed)
- [x] No regressions in existing test suites
- [x] Integration between frontend and backend verified (Vite/TypeScript build passes clean)
- [x] All issues found during testing are resolved (see Phase 7.3 — Bug Fixes)
- [x] Documentation is synchronized

Next stage (Stage 5) must not begin until all items above are satisfied.

---

# Stage 5 — Documentation Synchronization
### Goal
Ensure all documentation accurately reflects the implemented Exchange Requests feature and is consistent across all files.

### Dependencies
- Stage 4 completed — all testing is done and issues are resolved.

### Expected outputs
- `API.md` accurately documents the Exchange Request endpoints with correct request/response examples
- `FEATURES.md` Exchange Requests section matches implemented behavior
- `UI.md` Exchange Requests section matches the final UI
- `ROADMAP.md` Stage 1-5 checklists are marked complete
- All cross-references between documentation files are consistent
- No stale or contradictory content remains

### Boundaries
Stage 5 must not:
- Add new feature descriptions not implemented in Stages 1-4
- Change documented API contracts beyond what was implemented
- Introduce new requirements or scope
- Generate any production code

### Stage 5 Completion Criteria
Stage 5 is complete when:

- [x] `API.md` is updated with final contract (same-direction same-skill duplicate guard, `history` field, edit-history capture note)
- [x] `FEATURES.md` is updated with final behavior (duplicate-rule refinement + Modification History)
- [x] `UI.md` is updated with final UI description (send/edit modal semantics, locked other-party skills, ExchangeRequestHistoryModal)
- [x] `ROADMAP.md` has all Stage 1-5 items marked complete
- [x] No documentation inconsistencies exist between files

### Phase 7.1 — Request Semantics & Duplicate Rule Refinement
**Decisions applied to the create/edit flow (see FEATURES.MD → Exchange Requests):**

- [x] Flipped and clarified semantics — `learning_skill` = what the sender wants to learn (drawn from the receiver's **teaching** skills, required); `teaching_skill` = the sender's offer back (**optional**)
- [x] Sender is NOT required to have a teaching skill — pure learning requests allowed
- [x] Duplicate guard scoped to **same direction (sender → receiver)** + **same catalog `learning` skill** only — reverse-direction and different-skill requests are NOT blocked
- [x] Guard skipped entirely when `learning_skill_id` is `null` (skill-less request)
- [x] New duplicate-violation message: `"You already have an active exchange with this user for this skill."`

#### Frontend — Send/Edit Modal (`SendExchangeRequestModal`)
- [x] Sender flow leads with "What would you like to learn from {name}?" populated from the receiver's teaching skills
- [x] Optional "I'd also like to teach them a skill in return" checkbox toggles the teaching field
- [x] Removed the old "I'm not looking for anything in return" checkbox
- [x] Teaching select + checkbox are disabled/locked when editing an `accepted` request as the sender (the other party's chosen skill is read-only)
- [x] When editing an `accepted` request as the receiver, the receiver's own `learning` selection is disabled (sender's chosen skill is read-only)
- [x] Locked fields submit their existing value (never nulled) so the other party's choice is preserved

### Phase 7.2 — Edit History / Audit Trail
**Capture point:** `ExchangeRequestService::update()` recorded a history row ONLY when an `accepted` request is edited (the `accepted → pending` reopen path). Pending edits do NOT create history.

#### Backend
- [x] Create `exchange_request_history` migration/table (id, exchange_request_id FK cascade, edited_by FK users, teaching_skill_id FK, learning_skill_id FK, message, status, timestamps, index on exchange_request_id)
- [x] Create `ExchangeRequestHistory` model with `BelongsTo` relations (`exchangeRequest`, `editedBy`, `teachingSkill`, `learningSkill`)
- [x] `ExchangeRequest::history()` — `HasMany`, newest-first ordering (`latest('id')`), added to `LOAD_WITH`
- [x] `ExchangeRequestService::recordHistoryIfAccepted()` — snapshots the **before** state (teaching_skill_id, learning_skill_id, message, status) + `edited_by` before applying the update
- [x] Create `ExchangeRequestHistoryResource` (id, edited_by, teaching_skill, learning_skill, message, status, created_at)
- [x] `ExchangeRequestResource` — exposes `history` (guarded by `relationLoaded('history')`, `[]` when not loaded — prevents `collection(null)` 500)
- [x] `ExchangeRequestController::show()` — eager-loads `history.editedBy.profile`

#### Frontend
- [x] Extend `ExchangeRequest` type with `history: ExchangeRequestHistory[]`
- [x] Create `ExchangeRequestHistoryModal` — dedicated modal, timeline of persisted edits, chronological (oldest → newest), context note: *"Only edits made after the request was accepted are recorded."*
- [x] `ExchangeRequestCard` — shows a **Details** button only when `(request.history?.length ?? 0) > 0`, wired via `onViewHistory`
- [x] `ExchangeRequestsPage` — owns `historyRequest` state and mounts the modal
- [x] Removed the inline history accordion from `ExchangeRequestDetailsModal`
- [x] Only **persisted** edit entries are displayed — no fabricated "Created/Accepted" timeline events

### Phase 7.3 — Bug Fixes
- [x] Fixed `ExchangeRequestResource::collection(null)` 500 on `show` by guarding `relationLoaded('history')`
- [x] Fixed skills create/update 500 — `UserSkillService` normalizes `featured` (`null`/absent → `false` on create; cast to bool on update only when present)

### Phase 7 Testing
- [x] DUPLICATE test — same-direction same-skill returns 422 with the new message
- [x] DUPLICATE test — accepted same-skill repeat returns 422
- [x] DUPLICATE test — different-skill active request still allowed (201)
- [x] DUPLICATE test — reverse-direction same-skill allowed (201)
- [x] HISTORY test — editing an `accepted` request records one history row (asserts before-values + editor + JSON shape)
- [x] HISTORY test — editing a `pending` request does NOT record history
- [x] HISTORY test — `show` returns `history: []` when none, and returns history after an accepted edit
- [x] SKILLS test — creating a skill with `featured: null` defaults to `false`
Phase 7 is fully complete only when Stages 1-5 are all complete:

- [x] Stage 1 — Frontend UI complete
- [x] Stage 2 — Backend API complete
- [x] Stage 3 — Frontend Integration complete
- [x] Stage 4 — Testing & Hardening complete
- [x] Stage 5 — Documentation Synchronization complete
- [x] No known regressions remain

---
## Phase 8 — Messaging
Status: Completed

### Goal
Provide matched users with private one-to-one messaging.

### Overview
After an exchange request is accepted, a `Conversation` is created and the two participants can exchange text messages. Messages are stored in the `messages` table with `read_at` for read tracking. Messaging is polling/refetch-based — **no WebSockets in the MVP** — consistent with Phase 7 (no real-time notifications). The `Conversation` and `Message` models, migrations, and factories already exist (Phase 2 database work). All service, controller, validation, resource, and frontend layers remain to be implemented.

**Conversation creation:** a conversation is created when an exchange request transitions to `accepted`. The Phase 7 `ExchangeRequestService::accept()` path is extended in Phase 8 Stage 2 to create the `Conversation` atomically with the transition — a cross-phase touchpoint into the Phase 7 service layer. Conversations exist only after acceptance. A conversation exists immediately upon acceptance, even with zero messages — empty conversations are valid and appear in the list.

**Canonical rules (normative summary — detailed in Stage 2 Business Rules):**

- **Conversation ordering:** conversations are ordered by `updated_at DESC` (most recent activity). Sending a new message updates the conversation's `updated_at`, which drives ordering.
- **Message ordering:** messages are ordered by `created_at ASC, id ASC` (oldest → newest). `created_at` is the ONLY chronological ordering field; `id` exists ONLY as a deterministic tie-breaker when `created_at` values are identical — it must never be used as the primary chronological ordering mechanism.
- **Read tracking:** retrieving a conversation's message list marks EVERY unread incoming message in the conversation as read (`read_at`) — the entire conversation, not only the messages on the current page. Messages sent by the authenticated user are never marked read by this action; the action is a no-op when there are no unread incoming messages.
- **Unread badge:** the sidebar unread count is the sum of every conversation's `unread_count` — derived from the existing conversations query. No dedicated unread-count endpoint exists.

### Messaging Architecture Principles (single source of truth)

The following invariants govern the Phase 8 Messaging architecture. All current and future Messaging work MUST conform to these principles. Detailed rules live in Stage 2 Business Rules, `FEATURES.MD` → Messaging, and `API.MD` → Conversations/Messages.

1. **Exactly two immutable participants** — every conversation has exactly two participants, derived from the accepted Exchange Request (sender + receiver). Participants are immutable; no additional participants may join; no group conversations exist in Phase 8.
2. **Created on acceptance** — a conversation exists only after the Exchange Request transitions to `accepted`, created atomically within the same DB transaction as the transition. No conversation exists before acceptance.
3. **Empty conversations are valid** — a conversation with zero messages is a valid state; it is listed and can be opened.
4. **Always active and immutable** — Phase 8 conversations are always active and their shape (participants, linked exchange request) is immutable after creation. Archive, lock, and closed states are future concepts and must NOT be implemented in Phase 8.
5. **Ordering depends only on latest activity** — conversation ordering depends solely on `updated_at DESC` (most recent activity); no other signal influences it. Messages use `created_at ASC, id ASC`, with `created_at` as the ONLY chronological field and `id ASC` purely as the deterministic tie-breaker.
6. **Metadata and threads have separate responsibilities** — `ConversationResource` (conversation metadata) and `MessageResource` (message data) are independent; neither exposes the other's data. The list endpoint returns summaries, never full threads.
7. **Read tracking is retrieval-scoped** — reading marks every unread incoming message in the conversation upon message-list retrieval; the user's own messages are never marked by it.
8. **Polling is the transport** — messaging is polling/refetch-based; WebSockets are explicitly out of scope for Phase 8.
9. **Transport must not affect business rules** — delivery/read semantics are business rules; the transport mechanism (HTTP polling now, WebSockets in a future phase) must never change them.
10. **No partial state** — transaction boundaries guarantee that exchange acceptance and conversation creation succeed or fail together; a failed message write has no side effects (ordering, unread counts, and conversation metadata remain unaffected).

### API Evolution Policy (architectural philosophy)

This is **not** an API versioning strategy. It documents how the Phase 8 Messaging API contract is intended to evolve so future phases remain consistent with this foundation:

- Existing endpoints must remain **backward compatible** whenever possible.
- Future messaging capabilities should **extend existing resources** (add optional fields, endpoints, or query parameters) instead of replacing them whenever practical.
- Additional optional fields, endpoints, or query parameters may be introduced **without changing existing behavior**.
- Existing response fields must **never change meaning**.
- Existing business rules remain the **source of truth regardless of the transport layer** (polling today, WebSockets in a future phase). Transport changes must never alter ordering, read, ownership, or failure semantics.

**Authentication**
Messaging requires authentication. Listing conversations, viewing messages, and sending all require an authenticated user, and only the two participants (the accepted request's sender/receiver) may access the conversation.

**Dependencies**
- Phase 7 — Exchange Requests (conversation created on acceptance; participants are the request's sender/receiver)
- Phase 9 — Learning Sessions (sessions scheduled after messaging)
- Phase 5 — Skills / Phase 6 — Discover (indirect, through Phase 7)

**Existing Placeholders**
- Sidebar link "Messages" (`/messages`) in AuthenticatedLayout — no route registered yet
- `Conversation` / `Message` models, migrations, and factories (Phase 2)
- `ExchangeRequest::conversation()` HasOne relationship (Phase 2 model)
- Documented endpoints in `API.MD` (`/conversations`, `/conversations/{id}`, `/conversations/{id}/messages`) and `UI.MD` (Conversations / Messages components)

> **Naming note (reconciled in Stage 5):** the sidebar labels the page "Messages" at `/messages`, while `UI.MD`/`API.MD` refer to "Conversations" and `/conversations` endpoints. This is intentional, not a conflict: **"Messages" is the user-facing sidebar/page label** for the messaging feature, while **"Conversations" is the internal feature/data-model name** (resources, `/conversations` endpoints, and the `["conversations"]` cache). All documentation uses both consistently — the sidebar and page are "Messages"; the API, data model, and cache are "Conversations".

---

# Stage 1 — Frontend (UI Foundation)
### Goal
Build the complete Messaging interface with all visual UI states before integrating with the backend.

### Dependencies
- None. Stage 1 is the first implementation stage and builds UI independently.
- References existing Phase 5/6/7 component and type conventions but does not depend on any Messaging backend.
- Stage 1 must not wait for or assume any backend endpoint exists.

### Types
- [x] Create `Conversation` interface (id, exchange_request_id, other_user, last_message, unread_count, updated_at)
- [x] Create `Message` interface (id, conversation_id, sender_id, sender, body, read_at, created_at)
- [x] Create `SendMessageData` interface (body)

### Boundaries
Stage 1 is strictly limited to frontend foundation. It must NOT include:

- API requests or API client modules (e.g. `lib/api/conversations.ts`)
- React Query hooks or data fetching logic
- Backend integration of any kind
- Mock data, fake API responses, temporary API simulation, or hardcoded datasets — **exception:** isolated placeholder fixtures (see below)
- Business logic (participant checks, read tracking, conversation creation)
- Temporary workarounds that simulate backend behavior

All of the above belong to Stage 3 (Frontend Integration) or Stage 2 (Backend API).

**Placeholder fixtures:** Stage 1 requires visual loaded states before any backend exists. To satisfy this, isolated placeholder fixtures are permitted and used only as default prop values to render the visual states. They are temporary, are NOT coupled to component logic, do not simulate backend behavior, and are fully replaced by real API integration in Stage 3.

### Pages & Components
- [x] Create `MessagesPage` (conversation list + chat window, two-pane on desktop / stacked on mobile)
- [x] Create `ConversationList` (avatar, name, last message, unread badge, active selection)
- [x] Create `ChatWindow` (message thread, message bubbles, input, send button)

### Routing
- [x] Lazy import + register `/messages` under `AuthenticatedLayout` in App.tsx
- [x] Sidebar link already exists (`/messages`) — verify it maps to the route

### User Interface
- [x] Conversation list with avatar/name/last message
- [x] Unread count badge (per conversation AND on the sidebar Messages link — the sidebar badge is the SUM of every conversation's `unread_count`, rendered visually from the placeholder fixtures via `useUnreadConversationCount`; the hook's internals are swapped for the React Query aggregate count in Stage 3 without modifying the layout, matching the Phase 7 `usePendingExchangeRequestCount` precedent)
- [x] Chat window with own vs other message bubbles
- [x] Message input + send button (disabled while empty)
- [x] "No conversations yet" empty state
- [x] "Select a conversation" empty thread state (desktop two-pane)
- [x] Empty conversation thread state — conversation with zero messages shows an empty thread area with the input enabled
- [x] Auto-scroll to the newest message on (a) initial conversation open and (b) immediately after the authenticated user successfully sends a message — NOT on polling/refetch
- [x] Loading skeleton
- [x] Error state with retry button
- [x] Responsive layout (mobile: list/thread toggled; tablet; desktop: two-pane)

### States
- [x] Loading skeleton
- [x] Empty (no conversations): "When you accept an exchange request, a conversation is created here."
- [x] Empty (no thread selected)
- [x] Empty conversation thread (zero messages — valid state; input enabled)
- [x] Error state with retry button
- [x] Loaded state with conversation list + thread

### Theme
- [x] Dark mode support

### Responsive Layout
- [x] Mobile
- [x] Tablet
- [x] Desktop

### Stage 1 Completion Criteria
Stage 1 is complete when:

- [x] `MessagesPage` with all UI states (loading, empty, error, loaded)
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Reusable components (`ConversationList`, `ChatWindow`)
- [x] Route registered at `/messages` matching the sidebar link
- [x] Dark mode support

Stage 1 explicitly does NOT include:

- No backend implementation
- No API requests
- No React Query or data fetching hooks
- No mock data or fake API simulation (isolated placeholder fixtures are permitted — see Boundaries above)
- No business logic (participant checks, read tracking)
- No temporary workarounds that simulate backend behavior

---

# Stage 2 — Backend API
### Goal
Implement the Conversation/Message API with participant-only ownership, read tracking, and conversation-creation-on-acceptance.

### Dependencies
- Stage 1 completed — UI component structure and type definitions are available for reference.
- Phase 2 database — `conversations` and `messages` tables already exist.
- Phase 7 completed — `ExchangeRequestService::accept()` exists and is the extension point for conversation creation.

### Expected outputs
- Conversation created on acceptance (extend `ExchangeRequestService::accept()`)
- `GET /api/v1/conversations` endpoint — list user's conversations
- `GET /api/v1/conversations/{id}` endpoint — view a single conversation
- `GET /api/v1/conversations/{id}/messages` endpoint — list messages
- `POST /api/v1/conversations/{id}/messages` endpoint — send a message
- `StoreMessageRequest` form request with validation
- `ConversationService` with conversation/message logic and read tracking
- `ConversationResource` and `MessageResource`
- Backend tests passing for auth, ownership, validation, and read-tracking scenarios
- API.md updated with endpoint documentation
- API contract finalized and stable — no breaking changes after this stage

### Boundaries
Stage 2 must not modify:
- Existing UI components, layouts, or pages
- Frontend code of any kind (tsx, css, component state)
- Client-side routing
- Existing database tables (new migrations only if strictly required — the Phase 2 schema is expected to suffice)
- Existing models, controllers, or services from other phases **except** the `ExchangeRequestService::accept()` extension point noted above (the single cross-phase touchpoint, implemented atomically in the existing transaction)

### Database (already exists — Phase 2)
- [x] `conversations` table — id, exchange_request_id (FK, unique, cascade delete), index on exchange_request_id
- [x] `messages` table — id, conversation_id (FK, cascade delete), sender_id (FK users, cascade delete), body (text), read_at (timestamp nullable), indexes on conversation_id and sender_id

### Model (already exists — Phase 2)
- [x] `Conversation` model — fillable (exchange_request_id), `exchangeRequest()`, `messages()`
- [x] `Message` model — fillable (conversation_id, sender_id, body, read_at), `read_at` datetime cast, `conversation()`, `sender()`
- [x] `ExchangeRequest::conversation()` HasOne relationship
- [x] `ConversationFactory` / `MessageFactory`

### Controller & Routes
- [x] Create `ConversationController`
- [x] Register `GET /api/v1/conversations`
- [x] Register `GET /api/v1/conversations/{conversation}`
- [x] Register `GET /api/v1/conversations/{conversation}/messages`
- [x] Register `POST /api/v1/conversations/{conversation}/messages`

### Endpoint Responsibilities (canonical)
The three conversation endpoints have distinct, non-overlapping responsibilities:

- **`GET /api/v1/conversations`** — conversation-list snapshot for the list pane and the unread badge. Returns a paginated collection of `ConversationResource` rows, each with `other_user`, `last_message`, `unread_count`, `updated_at`. Call when the Messages page (or its unread badge) loads or refetches. It does NOT return the message thread.
- **`GET /api/v1/conversations/{id}`** — metadata for a single selected conversation (the conversation header/detail: participants, `exchange_request_id`, `updated_at`). Call when a conversation is selected to render the header. It does NOT return the message thread.
- **`GET /api/v1/conversations/{id}/messages`** — the message thread for the chat window. Returns a paginated list of `MessageResource` in ascending order (`created_at ASC, id ASC`). Call when a conversation is opened and on every thread refetch/poll.

**Why both `/{id}` and `/{id}/messages` exist:** the single-conversation endpoint supplies full conversation metadata (header) independent of thread pagination; the messages endpoint supplies the thread content in ascending order. The list endpoint is a compact summary for the pane — it must not be used to render a full thread, and `/{id}` must not be used to page through messages. Each endpoint is the single source of truth for its pane.

### Form Request
- [x] Create `StoreMessageRequest`
      Validation:
- [x] `body`: required, string, max:2000 — trimmed of leading/trailing whitespace; whitespace-only body rejected (422)

### Service
- [x] Create `ConversationService`
      Responsibilities:
- [x] Conversation created on acceptance — extend `ExchangeRequestService::accept()` to create the `Conversation` in the same DB transaction (cross-phase touchpoint; single row guaranteed by the unique `exchange_request_id` constraint). The conversation is created immediately upon acceptance, even with zero messages — empty conversations are valid.
- [x] List conversations where the user is a participant (ordered by `updated_at DESC` — most recent activity; a sent message updates the conversation's `updated_at`)
- [x] List pagination — `page` default 1, `per_page` default 20, max 50 (matches Discover/Exchange contract)
- [x] View conversation — participant-only
- [x] List messages — ascending (`created_at ASC, id ASC`), paginated (default 20, max 50)
- [x] Send message — participant-only; message stored with `sender_id = auth user`, `read_at = null`; the message creation also updates the conversation's `updated_at` (drives ordering)
- [x] Read tracking — after a participant successfully retrieves the message list via `GET /api/v1/conversations/{id}/messages`, mark as read (`read_at = now()`) every message in that conversation where `sender_id != auth user` AND `read_at IS NULL`. Never marks the authenticated user's own messages. No-op when there are no unread incoming messages.
- [x] Unread count — derived from messages where `read_at IS NULL` and sender is the other participant
- [x] Empty conversation — opening a zero-message conversation is allowed; the message list returns an empty collection; read tracking performs no action

### Business Rules
The canonical rules live in FEATURES.MD → Messaging (Phase 8). This checklist tracks their implementation:

- [x] **Conversation lifecycle:** created on acceptance (atomically with the accept transition, even with zero messages); always active; persists for the lifetime of the exchange — it is not deleted when the request is cancelled. Deleting the exchange request cascades and deletes the conversation and its messages (FK cascade). **Participant-account deletion is an unresolved schema/data-retention concern, outside Stage 2 scope:** the current FK chain (`users → exchange_requests → conversations → messages`, all `cascadeOnDelete`) cascades the entire thread, conflicting with the long-term intent that a deleted participant's conversation and the other participant's messages be preserved. Stage 2 neither implements nor changes participant-deletion behavior and no schema change was made; a separate data-retention architecture decision is required. Conversations cannot be archived, locked, or closed in Phase 8 — those states are reserved for future phases.
- [x] **Conversation state (canonical):** Phase 8 conversations are always active and immutable after creation. `archived`, `locked`, and `closed` are future-phase concepts and must NOT be implemented in Phase 8.
- [x] **Participants (canonical):** every conversation has exactly two participants, derived from the accepted Exchange Request (sender + receiver). Participants are immutable; no additional participants may join; no group conversations exist in Phase 8.
- [x] Only the exchange request's participants (sender/receiver) can access the conversation; all others return 403
- [x] No messaging before acceptance (no conversation exists)
- [x] Message body — required, max 2000, trimmed non-empty
- [x] **Message lifecycle (canonical):** a Phase 8 message supports exactly two states — `sent` (created) and `read` (`read_at` set). Editing, deleting, delivery status, reactions, attachments, and typing indicators are future extensions and are intentionally excluded; no fields or endpoints for them in Phase 8.
- [x] **Conversation ordering (canonical):** conversations ordered by `updated_at DESC` (most recent activity). `updated_at` is the SOLE ordering mechanism; sending a new message updates the conversation's `updated_at`, which drives ordering. There is no other conversation-ordering rule.
- [x] **Message ordering (canonical):** messages ordered by `created_at ASC, id ASC` (oldest → newest). `created_at` is the ONLY chronological ordering field — `id` exists ONLY as a deterministic tie-breaker when `created_at` values are identical and must never be used as the primary chronological ordering mechanism. No implementation may apply its own sort, and any future implementation must preserve this contract regardless of the storage mechanism.
- [x] **Read tracking (canonical):** retrieving a conversation's message list (`GET /api/v1/conversations/{id}/messages`) marks EVERY unread incoming message in the conversation as read — the entire conversation, not only the messages returned on the current page. It never marks messages sent by the authenticated user. No-op when there are no unread incoming messages. Reading is triggered only by a successful message-list retrieval — not by listing conversations and not by sending.
- [x] **Empty conversation:** empty conversations (zero messages) are valid, appear in the list, and can be opened; read tracking is a no-op for them
- [x] **Unread badge:** the sidebar unread count is the SUM of every conversation's `unread_count` from `GET /api/v1/conversations` — no dedicated unread-count endpoint exists
- [x] **Pagination strategy:** conversations and messages use offset-based pagination (`page`, `per_page` — default 20, max 50). No infinite-scroll contract is defined by the API (the frontend may paginate on demand). Cursor-based pagination is intentionally deferred to a future phase and must NOT be added in Phase 8.
- [x] **Transaction boundary:** Exchange Request acceptance and Conversation creation must succeed or fail together within a single DB transaction — no partial state may exist.
- [x] **Failure behavior:** a failed message write (validation or DB error) must not update conversation ordering (`updated_at`), must not affect unread counts, and must not modify conversation metadata.
- [x] No real-time push — polling/refetch only (WebSockets out of scope for MVP); the transport must never alter the read/ordering business rules above
- [x] Notifications — none sent in Phase 8 (consistent with Phase 7)

### Resource
- [x] Create `ConversationResource`
      Include:
- [x] id
- [x] exchange_request_id
- [x] other_user (UserResource)
- [x] last_message (MessageResource, nullable)
- [x] unread_count
- [x] updated_at
- [x] Create `MessageResource`
      Include:
- [x] id
- [x] conversation_id
- [x] sender_id
- [x] sender (UserResource)
- [x] body
- [x] read_at (nullable)
- [x] created_at
      Responsibilities:
- [x] **Resource responsibilities (canonical):** `ConversationResource` represents conversation metadata ONLY (participants, `last_message` summary, `unread_count`, `updated_at`); `MessageResource` represents message data ONLY. Neither resource becomes responsible for the other's full data — `ConversationResource` never embeds a message thread, and `MessageResource` never embeds participant metadata beyond its sender.

### Authorization
- [x] Controller-level participant checks (no formal Policy — consistent with Phase 5/7 pattern)
- [x] Participant scoping on show, list messages, send

### Query Design
- [x] Eager load other participant's profile, last message sender, message senders
- [x] Prevent N+1 queries

### Stage 2 Completion Criteria
Stage 2 is complete when:

- [x] `ConversationController` created with all 4 endpoints
- [x] `StoreMessageRequest` validates all fields
- [x] `ConversationService` implements participant ownership, conversation-creation-on-acceptance, read tracking, and ordering rules
- [x] `ConversationResource` / `MessageResource` return the documented fields
- [x] Ownership enforced (unauthorized actor returns 403)
- [x] Conversation created immediately on acceptance — empty conversations valid and listed
- [x] List ordering follows the canonical contract (conversations `updated_at DESC`; messages `created_at ASC, id ASC`)
- [x] Read tracking fires only on message-list retrieval, for unread incoming messages only
- [x] List pagination (`page`, `per_page` — default 20, max 50) implemented
- [x] Conversation creation on accept runs in the same DB transaction as the transition
- [x] API.md updated with endpoint documentation
- [x] All backend tests pass — all 45 messaging tests pass; the full suite reports 4 pre-existing failures unrelated to Stage 2 (avatar upload/delete tests fail with `FilesystemIterator ... Failed to open directory: Permission denied` on `storage/framework/testing/disks/public`, an environment permission issue outside this stage's scope)
- [x] API contract is finalized and stable

Next stage (Stage 3) must not begin until all items above are satisfied.

---

# Stage 3 — Frontend Integration
### Goal
Replace visual-only UI states with real API integration.

### Dependencies
- Stage 1 completed — UI components, layout, and visual states exist.
- Stage 2 completed — Backend API is deployed, tested, and contract is finalized.

### Expected outputs
- API client functions in `lib/api/conversations.ts`
- React Query hooks with query and mutations
- `MessagesPage` loads real conversation data
- `ChatWindow` loads and sends real messages
- Loading, empty, and error states driven by real API responses
- No mock data, no fake API, no temporary workarounds

### Integration Contract
Stage 3 consumes the backend API contract from Stage 2 as-is:
- Endpoints: `GET /api/v1/conversations`, `GET /api/v1/conversations/{id}`, `GET /api/v1/conversations/{id}/messages`, `POST /api/v1/conversations/{id}/messages`
- Send body: `{ body }`
- Response shape: `{ success, message, data: { ... } }`

Stage 3 must not redesign the API contract. If the contract is insufficient, the issue must be resolved by updating Stage 2 documentation and re-implementing Stage 2, not by working around it in frontend code.

### Boundaries
Stage 3 must not modify:
- Backend controllers, services, resources, or form requests
- Database schema or queries
- Participant ownership or read-tracking rules
- API response structure or validation rules
- Any PHP or backend code

### API
- [x] Create `listConversations(params?)`
- [x] Create `getConversation(id)`
- [x] Create `getMessages(conversationId, params?)`
- [x] Create `sendMessage(conversationId, body)`

### Hooks
- [x] Create `useConversations()` (query, staleTime 30s, queryKey `["conversations"]`, `keepPreviousData`)
- [x] Create `useConversation(id)` (single-conversation metadata query, disabled when `id` is null)
- [x] Create `useMessages(conversationId)` (query, polling — see Polling Contract below; MUST NOT auto-scroll on refetch)
- [x] Create `useSendMessage()` (mutation, invalidates `["conversations"]` and `["messages"]`)
- [x] Create `useUnreadConversationCount()` (sidebar badge — DERIVED: sums every conversation's `unread_count` from the existing `useConversations()` query data; performs NO additional API request; no dedicated endpoint exists)

### Schemas
- [x] Create `sendMessageSchema` (Zod: body required, max 2000, trimmed — matches backend; whitespace-only never sent)

### Polling Contract (canonical)
- [x] Active conversation thread polls every ~5 seconds via `refetchInterval`; **window focus refetch** is enabled (`refetchOnWindowFocus`) so returning to the tab refreshes immediately
- [x] **Background polling** does NOT continue for the active conversation while the tab is unfocused (React Query's default `refetchIntervalInBackground: false` — the thread refreshes on focus instead); this is a performance decision, not a correctness one
- [x] After a successful send, the thread refetches (via cache invalidation) rather than continuing the existing poll cycle; the poll interval resets normally
- [x] **Temporary network interruption** — a failed poll leaves the last cached thread in place, keeps the user's scroll position, and shows a non-blocking "reconnecting" indicator; the next successful poll recovers automatically; messages are never lost or re-ordered client-side
- [x] Polling must never change read/ordering business rules — it is transport only

### Integration
- [x] Replace visual-only UI with real API data (placeholder fixtures removed)
- [x] Connect `MessagesPage` conversation list
- [x] Connect unread count badge (per conversation from `unread_count`; sidebar badge = SUM across conversations)
- [x] Connect `ChatWindow` thread load (oldest → newest) with auto-scroll to bottom
- [x] Auto-scroll triggers — (a) when a conversation is initially opened and (b) immediately after the authenticated user successfully sends a message; polling/refetches MUST NOT auto-scroll (preserve reading position)
- [x] Connect send message (append via API + cache invalidation)
- [x] Connect read-tracking refresh (unread clears after viewing the conversation — driven by the message-list retrieval, which marks the WHOLE conversation read)
- [x] Connect empty conversation thread (zero messages — valid state, input enabled)
- [x] Connect loading state
- [x] Connect empty states (no conversations / no thread selected)
- [x] Connect error state with retry

### Cache Invalidation
- [x] Every successful message send invalidates `["conversations"]` AND `["messages"]`
- [x] Unread count updates immediately after viewing/sending (no manual refresh) — derived from the invalidated conversations query, no extra request

### Cache Ownership (canonical)
- [x] **Conversation summaries** are owned by the `["conversations"]` query (list metadata: participants, `last_message`, `unread_count`, `updated_at`)
- [x] **Message threads** are owned exclusively by the `["messages"]` query (per-conversation thread data)
- [x] **Unread counts** are owned by the conversations query — `unread_count` lives on `ConversationResource` and the sidebar badge derives from it; there is no standalone unread cache
- [x] **No duplication:** message thread data must never be embedded inside conversation cache entries. `last_message` in the conversations cache is a summary only; the `["messages"]` cache is the single source of truth for the thread.

### Stage 3 Completion Criteria
Stage 3 is complete when:

- [x] API client functions exist and are used
- [x] React Query hooks integrate with the API
- [x] `MessagesPage` renders real conversation data
- [x] Unread badges reflect real data
- [x] `ChatWindow` loads and sends real messages
- [x] Mutations invalidate `["conversations"]` and `["messages"]`
- [x] Auto-scroll occurs on initial open and after own send only — never on polling/refetch
- [x] Empty conversations (zero messages) render as a valid thread with the input enabled
- [x] Sidebar unread badge is derived from the conversations query (no additional request)
- [x] Polling contract honored (interval, focus refetch, send-refetch, network-interruption recovery)
- [x] Cache ownership honored (no thread data duplicated into conversation summaries)
- [x] Loading, empty, and error states are API-driven
- [x] No mock data, no fake API, no temporary workarounds remain in the codebase
- [x] Vite/TypeScript build passes clean (no messaging-related errors)
- [x] ESLint — not configured in project (no messaging-related issues)

Next stage (Stage 4) must not begin until all items above are satisfied.

---

# Stage 4 — Testing & Hardening
### Goal
Validate the full Messaging feature through automated tests across backend and frontend, verify integration correctness, and fix any issues found.

### Dependencies
- Stage 1 completed — UI components exist and are stable.
- Stage 2 completed — Backend API is deployed, tested, and contract finalized.
- Stage 3 completed — Frontend is fully integrated with the backend API.

### Expected outputs
- All backend test scenarios pass (auth, validation, ownership, read tracking)
- All frontend test scenarios pass (render, interaction, states, responsive, dark mode)
- Integration verified: frontend consumes backend contract correctly
- No known regressions in existing functionality (especially Phase 7 accept flow)
- Documentation synchronized across all files
- Final review sign-off

### Boundaries
Stage 4 must not:
- Introduce new features or behavioral changes
- Modify backend business logic (participant ownership, read-tracking rules)
- Modify UI component structure or design
- Change the API contract
- Add new API endpoints, query parameters, or response fields
- Alter database schema

### Backend
- [x] Guest cannot list conversations (401)
- [x] Guest cannot send messages (401)
- [x] Authenticated user can list own conversations
- [x] Non-participant cannot view a conversation (403)
- [x] Non-participant cannot send a message (403)
- [x] Conversation created on acceptance (exactly one row; unique `exchange_request_id`)
- [x] No conversation exists before acceptance
- [x] Conversation appears in both participants' lists
- [x] Empty conversation is valid — created on acceptance with zero messages, appears in the list, and opens with an empty message list
- [x] Send message — valid body stored correctly
- [x] Send message — empty body (422)
- [x] Send message — whitespace-only body (422)
- [x] Send message — body exceeding max length (422)
- [x] Message body trimmed on store
- [x] Sending a message updates the conversation's `updated_at` (drives ordering)
- [x] Ordering — conversations by `updated_at DESC` (most recent activity first)
- [x] Ordering — messages ascending (`created_at ASC, id ASC`, oldest → newest)
- [x] Pagination — conversations honors `per_page` default 20, max 50, and `page`
- [x] Pagination — messages honors `per_page` default 20, max 50, and `page`
- [x] Read tracking — retrieving the message list marks the recipient's unread incoming messages as read
- [x] Read tracking — marks EVERY unread incoming message in the conversation, not only the messages on the current page
- [x] Read tracking — the authenticated user's own messages are never marked read by message-list retrieval
- [x] Read tracking — no-op when there are no unread incoming messages (including empty conversations)
- [x] Unread count — reflects unread messages from the other participant
- [x] Concurrency — accepting the same request creates exactly one conversation
- [x] Transaction atomicity — if conversation creation fails, the accept transition rolls back (no partial state)
- [x] Failure behavior — a rejected/errored message write leaves conversation ordering (`updated_at`), unread counts, and conversation metadata unchanged
- [x] Participants — exactly two, immutable, derived from the accepted request; no participant can be added or removed
- [x] Lifecycle — deleting the exchange request cascades the conversation and its messages; deleting a participant account follows the existing Phase 2 FK cascade behavior (`users → exchange_requests → conversations → messages`, all cascade delete) — the known data-retention conflict remains unresolved and outside Stage 4 scope
- [x] No archive/lock/close endpoints or states exist (Phase 8 scope guard)
- [x] Regression — Phase 7 accept/decline/cancel tests still pass after the accept-path extension

### Frontend
- [x] Initial render
- [x] Loading state
- [x] Empty conversations state
- [x] Empty thread state (no conversation selected)
- [x] Empty conversation thread (zero messages — valid state, input enabled)
- [x] Error state
- [x] Conversation selection
- [x] Send message interaction
- [x] Auto-scroll on initial open and after own send — NOT on polling/refetch
- [x] Unread badge (sidebar = sum of `unread_count`; no additional request)
- [x] Responsive layout
- [x] Dark mode

### Stage 4 Completion Criteria
Stage 4 is complete when:

- [x] All backend test cases pass
- [x] All frontend test cases pass (manual verification — no test framework installed)
- [x] No regressions in existing test suites (especially Phase 7)
- [x] Integration between frontend and backend verified
- [x] All issues found during testing are resolved
- [x] Documentation is synchronized

Next stage (Stage 5) must not begin until all items above are satisfied.

---

# Stage 5 — Documentation Synchronization
### Goal
Ensure all documentation accurately reflects the implemented Messaging feature and is consistent across all files.

### Dependencies
- Stage 4 completed — all testing is done and issues are resolved.

### Expected outputs
- `API.md` accurately documents the Conversation/Message endpoints with correct request/response examples, endpoint responsibilities, ordering (`updated_at DESC` for conversations, `created_at` as the only message-chronology field), read-tracking trigger and scope, lifecycle, state, participants, pagination strategy, failure behavior, and the API Evolution Policy
- `FEATURES.md` Messaging section matches implemented behavior (conversation-on-acceptance, empty-conversation validity, canonical ordering, read tracking, unread-badge derivation, polling-only, the Messaging Architecture Principles, and the API Evolution Policy)
- `UI.md` Messaging section matches the final UI (auto-scroll behavior, polling contract, empty states, unread-badge derivation, cache ownership, and the "Messages" vs "Conversations" naming reconciled with the sidebar)
- `ROADMAP.md` Stage 1-5 checklists are marked complete
- All cross-references between documentation files are consistent
- No stale or contradictory content remains

### Boundaries
Stage 5 must not:
- Add new feature descriptions not implemented in Stages 1-4
- Change documented API contracts beyond what was implemented
- Introduce new requirements or scope
- Generate any production code

### Stage 5 Completion Criteria
Stage 5 is complete when:

- [x] `API.md` is updated with final contract (endpoint responsibilities, ordering, read-tracking scope, lifecycle, state, participants, pagination strategy, failure behavior)
- [x] `FEATURES.md` Messaging section matches implemented behavior (architecture principles, lifecycle, state, message lifecycle, participants, ordering determinism, pagination, polling contract, read-tracking scope, resource responsibilities, cache ownership, transaction boundaries, failure behavior, future compatibility)
- [x] `UI.md` Messaging section matches the final UI (auto-scroll behavior, polling contract, empty states, unread-badge derivation, cache ownership, and the "Messages" vs "Conversations" naming reconciled with the sidebar)
- [x] `ROADMAP.md` Stage 1-5 checklists are marked complete
- [x] One canonical conversation-ordering rule (`updated_at DESC`) appears consistently — no `created_at DESC` conversation ordering anywhere
- [x] One canonical read-tracking rule appears consistently (message-list retrieval; EVERY unread incoming message in the conversation)
- [x] Message-ordering field responsibility is stated consistently (`created_at` = ONLY chronological field; `id` = tie-breaker only, never primary chronology)
- [x] The API Evolution Policy is present and consistent in ROADMAP, FEATURES.MD, and API.MD
- [x] Lifecycle, state, participants, transaction-boundary, and failure-behavior rules are stated identically in ROADMAP, FEATURES.MD, and API.MD
- [x] No documentation inconsistencies exist between files

Phase 8 is fully complete only when Stages 1-5 are all complete:

- [x] Stage 1 — Frontend UI complete
- [x] Stage 2 — Backend API complete
- [x] Stage 3 — Frontend Integration complete
- [x] Stage 4 — Testing & Hardening complete
- [x] Stage 5 — Documentation Synchronization complete
- [x] No known regressions remain

---
## Phase 9 — Learning Sessions
Status: Pending

### Goal
Allow matched users to schedule and manage learning sessions.

### Backend
- [ ] Session API

### Frontend
- [ ] Session page
- [ ] Calendar or date picker

### Documentation
- [ ] API.md
- [ ] UI.md

---
## Phase 10 — Reviews
Status: Pending

### Goal
Let users rate and review completed learning sessions.

### Backend
- [ ] Reviews API

### Frontend
- [ ] Review form
- [ ] Rating display

### Documentation
- [ ] API.md
- [ ] UI.md

---
## Phase 11 — Pre-Release QA
Status: Pending

### Goal
Perform end-to-end validation and quality assurance before launch.

### Backend
- [ ] Integration tests
- [ ] Edge case coverage

### Frontend
- [ ] E2E tests
- [ ] Accessibility audit

### Documentation
- [ ] Test plan
- [ ] QA checklist

---
## Phase 12 — Deployment
Status: Pending

### Goal
Deploy the MVP to production environments.

### Backend
- [ ] Production environment setup

### Frontend
- [ ] Production build and domain

### Documentation
- [ ] Deployment runbook

---
# Roadmap Maintenance
Update this roadmap whenever:

- A phase starts or finishes.
- A major feature is added, removed, or deferred.
- Project priorities change.
- Documentation structure changes.
- Version numbers are updated.

The roadmap should always reflect the current state of development.

---
# Notes
A phase is complete only after backend, frontend, testing, and documentation tasks are complete.

## Scope Deferrals
The following features were reviewed during Phase 6 — Discover planning and intentionally deferred to BACKLOG.MD:

- **Location filter** — Free-text `profiles.location` matching is unreliable and does not support the core MVP goal of skill-based discovery. Location information is still visible on user profile pages. Deferred to Phase 6.4 (BACKLOG item #14). Timezone-based filtering using existing `profiles.timezone` is a simpler interim approach.
