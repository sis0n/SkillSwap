# SkillSwap Roadmap

> Version: 5.0.0
> Project Stage: Minimum Viable Product (MVP)
> Last Updated: 2026-07-26

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
Current Phase: Phase 6 — Marketplace
Current Status: Pending

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

**Current:**
- Phase 6 — Marketplace (Pending)

**Remaining:**
- Phase 6 — Marketplace
- Phase 7 — Exchange Requests
- Phase 8 — Messaging
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
Allow users to add, remove, browse, and feature skills they can teach or want to learn. Skills are the foundational data for Marketplace (Phase 6), Exchange Requests (Phase 7), and all subsequent phases.

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

## Phase 6 — Marketplace
Status: Pending

### Goal
Enable users to discover and filter potential learning partners based on skill matches.

### Overview
Marketplace provides a discoverable directory of eligible users — those with a verified email, a completed profile, and at least one Marketplace-eligible skill (an approved user_skill discoverable in Marketplace) — who want to teach or learn specific skills. It uses the existing skills data from Phase 5 as the foundation for matching. Users can search by skill name, filter by category or experience level, and browse potential partners' public profiles. The sidebar "Marketplace" link at `/marketplace` and "Back to Marketplace" links on public profiles are already in place — a route and page implementation is required.

**Authentication:** Guest (no login required to browse). Users can discover potential partners without authenticating; sending exchange requests (Phase 7) requires login.

---

### Backend

#### Controller & Routes
- [ ] Create `MarketplaceController` (Api/V1)
- [ ] Register `GET /api/v1/marketplace` route (rate-limited via `throttle:api` middleware)
- [ ] Support query params: `?q=` (skill name), `?category_id=` (skill category), `?type=` (teaching/learning), `?experience_level=` (skill-specific), `?page=` (pagination), `?per_page=` (results per page, max 50)

#### Form Request
- [ ] Create `MarketplaceSearchRequest` — validate all query parameters consistently:
  - `q`: string, nullable, max:255
  - `category_id`: integer, nullable, exists:skill_categories,id
  - `type`: string, nullable, in:teaching,learning
  - `experience_level`: string, nullable, in:beginner,intermediate,advanced,expert
  - `page`: integer, nullable, min:1
  - `per_page`: integer, nullable, min:1, max:50

#### Service
- [ ] Create `MarketplaceService` — `searchUsers()` with composable filters:
  - Eligibility filter: email verified (`users.email_verified_at IS NOT NULL`)
  - Eligibility filter: profile completed (5+ contributing fields non-null — see FEATURES.MD Profile Completion)
  - Eligibility filter: only `user_skills.status = 'approved'` — users without Marketplace-eligible skills are excluded
  - Skill name search (case-insensitive, partial match on `skills.name`)
  - Category filter (filter by `skill_categories.id`)
  - Type filter (teaching/learning direction)
  - Experience level filter (on `user_skills.experience_level`, skill-specific)
  - Pagination (default 20 per page)

#### Resource
- [ ] Create `MarketplaceUserResource` (lightweight, listing-optimized — not a full public profile):
  - User: id, name, username, avatar_url
  - Profile: headline, bio, location
  - Skills: array of matched { skill_name, type, experience_level } (limit to top 3 for preview). When no query or filter is provided, shows top 3 Marketplace-eligible skills.
  - `matched_skills_count`: total number of the user's skills that remain after all active Marketplace search criteria and filters are applied. When no query or filter is provided, reflects the user's total Marketplace-eligible skill count.

#### Query Design
- [ ] Search across `users` joined with `user_skills`, `skills`, `skill_categories`, `profiles`
- [ ] Eligibility: `users.email_verified_at IS NOT NULL` — unverified emails excluded
- [ ] Eligibility: profile completed (5+ contributing fields non-null, following FEATURES.MD Profile Completion rules)
- [ ] Eligibility: `user_skills.status = 'approved'` — only Marketplace-eligible skills qualify for discovery
- [ ] Exclude the authenticated user from results (when authenticated)
- [ ] Search ranking: exact match > partial match > matching skill count (after all active filters) > alphabetical by display name (deterministic, no new ranking fields required)
- [ ] Browse mode default order: alphabetical by display name (no relevance ranking)
- [ ] Eager load profile and skill relationships to prevent N+1
- [ ] Distinct users (deduplicate when multiple skill matches)

---

### Frontend

#### Types & API
- [ ] Create `MarketplaceUser` type (id, name, username, avatar_url, headline, bio, location, matched_skills, matched_skills_count)
- [ ] Create `MarketplaceSearchParams` type (q, category_id, type, experience_level, page, per_page)
- [ ] Create `MarketplaceSearchResponse` type ({ users: MarketplaceUser[], meta: PaginationMeta })
- [ ] Create `searchMarketplace(params)` API function in `lib/api/marketplace.ts`

#### Hooks
- [ ] Create `useMarketplaceSearch(params)` — TanStack Query hook with debounced search, keepPreviousData for pagination

#### Page & Components
- [ ] Create `MarketplacePage` at `/marketplace`:
  - Search bar with debounced input
  - Filter bar: Category dropdown, Type toggle (teaching/learning/all), Experience Level dropdown
  - Results grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
  - Result card: avatar, name, headline, location, experience level badge, skill match chips (top 3 + "+N more")
  - Click card → navigate to `/users/{username}`
- [ ] Create `MarketplaceSearchCard` component (reusable result card)
- [ ] Create `MarketplaceFilters` component (search + filter bar, collapsible on mobile)
- [ ] Register route in `App.tsx` for `/marketplace` (unauthenticated route, public layout — guest browsing)

#### States
- [ ] Loading: Skeleton grid with 6 placeholder cards
- [ ] Initial (no query, no filters): Shows all eligible users paginated — "Browse potential learning partners" heading
- [ ] Empty (no results): "No matches found" with suggestion to broaden filters
- [ ] Error: Error message with retry button
- [ ] Active filter indicator: Show active filter count, clear all button

#### Dark Mode Support
- [ ] Marketplace page adapts to dark theme
- [ ] Search bar, filter dropdowns, result cards all use CSS variables

#### Responsive Layout
- [ ] Search bar: full width on all breakpoints
- [ ] Filters: horizontal bar on desktop, collapsible panel on mobile
- [ ] Results: single column on mobile, 2 columns on tablet, 3 columns on desktop
- [ ] Card density: compact on mobile, standard on desktop

---

### Testing — Backend

- [ ] Search — empty query returns all eligible users (paginated)
- [ ] Search — by skill name (partial match)
- [ ] Search — by skill name (case-insensitive)
- [ ] Search — by category_id
- [ ] Search — by type (teaching/learning)
- [ ] Search — by experience_level (skill-specific)
- [ ] Search — combination of multiple filters
- [ ] Search — excludes authenticated user from results (when authenticated)
- [ ] Search — no results returns empty array
- [ ] Search — pagination returns correct meta
- [ ] Search — guest access returns 200 (no auth required)
- [ ] Search — invalid category_id returns 422 (via Form Request)
- [ ] Search — invalid type returns 422
- [ ] Search — invalid experience_level returns 422
- [ ] Search — response includes matched skills preview (max 3)
- [ ] Search — response includes `matched_skills_count` (only skills remaining after all active filters, not unrelated skills)
- [ ] Browse (no query, no filters) — `matched_skills` shows top 3 Marketplace-eligible skills, `matched_skills_count` reflects total Marketplace-eligible skill count
- [ ] Ranking — exact match appears before partial match in results
- [ ] Ranking — when partial matches exist, user with more matching skills (after all active filters applied) ranks higher than user with fewer
- [ ] Ranking — matching skill count does not include unrelated Marketplace-eligible skills that fall outside active filters
- [ ] Ranking — alphabetical by display name breaks ties when all other ranking factors are equal
- [ ] Browse mode — results are in alphabetical order by display name (no relevance ranking applied)
- [ ] Eligibility — users with unverified email are excluded from results
- [ ] Eligibility — users with incomplete profile are excluded from results
- [ ] Eligibility — users without Marketplace-eligible skills are excluded from results
- [ ] Eligibility — user who meets all three requirements appears in results
- [ ] Eligibility — user who later fails a requirement is excluded from subsequent requests

---

### Documentation
- [ ] API.md — Marketplace browse endpoint (request, response, validation rules, auth, pagination)
- [ ] UI.md — Marketplace page (components, states, user flow, responsive behavior, dark mode)
- [ ] FEATURES.MD — Marketplace feature description (filters, states, user story)
- [ ] ROADMAP.MD — This expanded checklist

---

## Phase 7 — Exchange Requests
Status: Pending

### Goal
Let users send, accept, and reject skill exchange match requests.

### Backend
- [ ] Exchange request API

### Frontend
- [ ] Request form
- [ ] Inbox and response UI

### Documentation
- [ ] API.md
- [ ] UI.md

---

## Phase 8 — Messaging
Status: Pending

### Goal
Provide matched users with private one-to-one messaging.

### Backend
- [ ] Conversation and message API

### Frontend
- [ ] Conversation list
- [ ] Message thread view

### Documentation
- [ ] API.md
- [ ] UI.md

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
The following features were reviewed during Phase 6 planning and intentionally deferred to BACKLOG.MD:

- **Location filter** — Free-text `profiles.location` matching is unreliable and does not support the core MVP goal of skill-based discovery. Location information is still visible on user profile pages. Deferred to Phase 6.4 (BACKLOG item #14). Timezone-based filtering using existing `profiles.timezone` is a simpler interim approach.
