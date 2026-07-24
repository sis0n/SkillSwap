# SkillSwap Roadmap

> Version: 4.0.0
> Project Stage: Minimum Viable Product (MVP)

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

Current Phase: Phase 4 — User Profiles

Current Status: Pending

---

## Previous Phase

Phase 3.75 — Role Architecture: Completed

---

# MVP Milestones

## Phase 1 — Project Foundation

Status: Completed

### Backend

- [x] Laravel setup
- [x] Docker
- [x] PostgreSQL
- [x] Environment variables
- [x] Authentication

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

- Backend API (Bearer Token): Completed
- Backend Sanctum Migration: Completed
- Frontend Infrastructure: Completed
- Frontend Authentication UI: Completed
- Registration Cases (1-4): Completed
- Email Verification (6-digit code): Completed
- Login with verification check: Completed
- Resend cooldown: Completed
- Testing: Completed (30 test cases, all passing)
- Documentation: Completed

### Backend

- [x] Register — handles 4 cases (new, verified, unverified+active, unverified+expired)
- [x] Login — checks email verification before Auth::attempt()
- [x] Login — rate limited to 5 attempts/min per email (throttle:login)
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

Status: Pending

### Backend

- [ ] Profile API
- [ ] Avatar upload
- [ ] Availability

### Frontend

- [ ] Profile page
- [ ] Edit profile
- [ ] Responsive UI
- [ ] Dark mode

### Documentation

- [ ] API.md
- [ ] UI.md
- [ ] DESIGN_SYSTEM.md
- [ ] FEATURES.md

---

## Phase 5 — Skills

Status: Pending

Backend

- [ ] Skill management

Frontend

- [ ] Skills pages
- [ ] Skill forms

Documentation

- [ ] API.md
- [ ] UI.md

---

## Phase 6 — Marketplace

Status: Pending

## Phase 7 — Exchange Requests

Status: Pending

## Phase 8 — Messaging

Status: Pending

## Phase 9 — Learning Sessions

Status: Pending

## Phase 10 — Reviews

Status: Pending

## Phase 11 — Testing

Status: Pending

## Phase 12 — Deployment

Status: Pending

---

# Notes

A phase is complete only after backend, frontend, testing, and documentation tasks are complete.
