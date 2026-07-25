# SkillSwap Authentication Implementation Plan

> Version: 3.1.0
> Status: Approved — Role Architecture Added
> Authentication: Laravel Sanctum SPA (HTTP-only cookies, database sessions)
> Deployment: React SPA on Vercel → Laravel API on Render → PostgreSQL on Supabase

---

## Authentication Principles

- Session-based authentication uses Laravel Sanctum.
- Email ownership must be verified before login.
- Google OAuth automatically trusts verified provider emails.
- Roles are assigned only by the backend.
- Authentication and authorization are separate concerns.
- Password reset is intentionally outside the MVP scope.
- Security decisions favor simplicity and maintainability for the MVP.

---

# Table of Contents

1. [Authentication Principles](#authentication-principles)
2. [Authentication Architecture Overview](#1-authentication-architecture-overview)
3. [Sanctum Authentication Flow](#2-sanctum-authentication-flow)
4. [Authentication Lifecycle](#3-authentication-lifecycle)
5. [Session Driver: Database Sessions](#4-session-driver-database-sessions)
6. [CSRF Protection](#5-csrf-protection)
7. [Deployment Environments](#6-deployment-environments)
    - [7.1 Local Development](#61-local-development)
    - [7.2 Preview / Temporary Deployment](#62-preview--temporary-deployment)
    - [7.3 Production Deployment (Recommended)](#63-production-deployment-recommended)
    - [7.4 Session Cookie Configuration (Shared)](#64-session-cookie-configuration-shared-across-environments)
8. [Axios CSRF Behavior — Environment-by-Environment](#7-axios-csrf-behavior--environment-by-environment)
9. [Required Backend Changes](#8-required-backend-changes)
10. [Required Frontend Changes](#9-required-frontend-changes)
11. [State Management Architecture](#10-state-management-architecture)
12. [Updated Folder Structure](#11-updated-folder-structure)
13. [Dependencies to Install](#12-dependencies-to-install)
14. [Files to Create](#13-files-to-create)
15. [Files to Modify](#14-files-to-modify)
16. [File Migration Strategy](#15-file-migration-strategy)
17. [Recommended Implementation Order](#16-recommended-implementation-order)
18. [Deployment Configuration](#17-deployment-configuration)
19. [Complete Checklist](#18-complete-checklist)
20. [Role Architecture](#19-role-architecture)
21. [Deployment Roadmap](#20-deployment-roadmap)
22. [Future Session Security Capabilities](#21-future-session-security-capabilities)

---

# 1. Authentication Architecture Overview

```
                    SameSite=Lax/None (deployment-dependent)
                    ┌──────────────────────────────────────┐
                    │                                      │
  Browser           ▼                                      │
  ┌──────────┐  GET /sanctum/csrf-cookie                  │
  │ React    │  ←─────────── XSRF-TOKEN (cookie) ─────────┘
  │ SPA      │                                            │
  │ Vercel   │  POST /api/v1/auth/login                    │
  │          │  ←─────────── session cookie ──────────────┘
  │          │  (skillswap_session + XSRF-TOKEN rotated)
  └──────────┘  All subsequent requests withCredentials
       │
       │  Axios withCredentials: true
       │  X-XSRF-TOKEN header (auto-sent by Axios)
       ▼
  ┌──────────┐
  │ Laravel  │  config/sanctum.php → stateful = [Vercel domain]
  │ API      │  config/cors.php → supports_credentials, allowed_origins
  │ Render   │  app/Http/Kernel.php → EnsureFrontendRequestsAreStateful
  └──────────┘
       │
       ▼
  ┌──────────┐
  │ Supabase │
  │ Postgres │
  └──────────┘
```

---

# 2. Sanctum Authentication Flow

### Step 1 — CSRF Initialization (on app mount)
```
GET /sanctum/csrf-cookie
  → Laravel sets XSRF-TOKEN cookie (readable by JS, domain scoped to backend)
  → Axios, configured with withCredentials: true, automatically sends
    this cookie back as X-XSRF-TOKEN header on all subsequent requests
  → No manual cookie parsing or interceptor needed (see §5)
```

### Step 2 — Login
```
POST /api/v1/auth/login (email, password)
  → Laravel validates credentials via Auth::attempt()
  → On success: session starts → laravel_session cookie (HttpOnly, Secure)
  → XSRF-TOKEN is rotated after authentication
  → Returns { user } with 200
  → Frontend: invalidate ['auth', 'me'] TanStack Query → refetch user →
    sync to Zustand → navigate('/dashboard')
```

### Step 3 — Register
```
POST /api/v1/auth/register (first_name, last_name, username, email, password, ...)
  → Handles four cases based on email state:
     Case 1 (new email): Creates user, sends verification code, returns { email } with 201
     Case 2 (verified email): Rejects with 409 — email already registered
     Case 3 (unverified, valid code): Returns { email } with 200 — code already sent, reuse existing
     Case 4 (unverified, expired code): Updates account, sends new code, returns { email } with 200
  → No session created — user is not authenticated after registration
  → Frontend: navigate('/verify-email?email=...') — enters verification flow, not dashboard
```

### Step 4 — Session Restoration (on page refresh)
```
GET /api/v1/auth/me
  → laravel_session cookie sent automatically by browser (withCredentials)
  → 200 → user authenticated
  → 401 → no valid session → show login page
```

### Step 5 — Logout
```
POST /api/v1/auth/logout
  → Laravel destroys session + invalidates CSRF token
  → Frontend: clear TanStack Query cache → clear Zustand → navigate('/login')
```

---

# 3. Authentication Lifecycle

This section documents the complete authentication lifecycle from application startup to user logout.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. APPLICATION STARTUP                                                 │
│     ├── User visits app.skillswap.com                                   │
│     ├── App.tsx mounts                                                  │
│     ├── React.lazy loads pages                                          │
│     └── QueryClientProvider wraps the application                       │
│                                                                         │
│  2. CSRF INITIALIZATION                                                 │
│     ├── App.tsx useEffect() fires initialize()                          │
│     ├── GET /sanctum/csrf-cookie (withCredentials: true)               │
│     ├── Laravel sets XSRF-TOKEN cookie                                  │
│     └── Axios now has CSRF token for all subsequent requests            │
│                                                                         │
│  3. SESSION CHECK                                                       │
│     ├── initialize() calls GET /api/v1/auth/me (withCredentials)       │
│     │                                                                   │
│     ├── [SCENARIO A: VALID SESSION]                                     │
│     │   ├── Backend returns 200 + user data                             │
│     │   ├── TanStack Query caches ['auth', 'me']                       │
│     │   ├── Zustand: setUser(user), isAuthenticated=true,               │
│     │   │   isInitialized=true, isLoading=false                         │
│     │   └── ProtectedRoute renders <Outlet />                         │
│     │                                                                   │
│     └── [SCENARIO B: NO SESSION]                                        │
│         ├── Backend returns 401                                         │
│         ├── TanStack Query: query fails (retry: false)                 │
│         ├── Zustand: setUser(null), isAuthenticated=false,              │
│         │   isInitialized=true, isLoading=false                         │
│         └── ProtectedRoute redirects to /login                        │
│                                                                         │
│  4. USER PERFORMS LOGIN                                                 │
│     ├── User navigates to /login                                        │
│     ├── GuestRoute: isAuthenticated=false → renders LoginPage          │
│     ├── User fills form → Zod validates client-side                    │
│     ├── useMutation fires POST /api/v1/auth/login                      │
│     │                                                                   │
│     ├── [SUCCESS]                                                       │
│     │   ├── Backend starts session, sets cookies                        │
│     │   ├── TanStack Query: invalidate ['auth', 'me']                  │
│     │   ├── getMe() refetches → user data returned                     │
│     │   ├── Zustand: setUser(user)                                      │
│     │   └── navigate('/dashboard')                                      │
│     │                                                                   │
│     └── [ERROR]                                                         │
│         ├── 422 → Zod maps field errors to form fields                 │
│         ├── 401 → show "Invalid credentials"                           │
│         └── Network error → show "Connection error"                    │
│                                                                         │
│  5. AUTHENTICATED SESSION                                               │
│     ├── All API requests include cookies (withCredentials)              │
│     ├── TanStack Query handles caching + background refetch             │
│     ├── Axios 401 interceptor: clear state → redirect to /login        │
│     ├── Axios 419 interceptor: refresh CSRF → retry                    │
│     └── Zustand holds user object for sync access                       │
│                                                                         │
│  6. USER PERFORMS LOGOUT                                                │
│     ├── User clicks "Logout" on Dashboard                               │
│     ├── useMutation fires POST /api/v1/auth/logout                     │
│     ├── Laravel: session→invalidate(), regenerateToken()               │
│     ├── Frontend:                                                       │
│     │   ├── Clear TanStack Query cache                                 │
│     │   ├── Zustand: setUser(null), isAuthenticated=false              │
│     │   └── navigate('/login')                                          │
│     └── Cookies cleared server-side                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Rules for Developers

| Rule | Explanation |
|---|---|
| Auth state never stored in localStorage | No tokens, no user objects persisted. Session cookie is the source of truth. |
| `withCredentials: true` always | Required on every Axios instance for cookies to be sent cross-origin. |
| Don't manually parse `XSRF-TOKEN` | Axios handles this automatically (see §5). |
| `isInitialized` must be checked | Prevents flash of unprotected content on page refresh before session check completes. |
| 401 is not an error | A 401 from `/auth/me` simply means "no session" — this is expected on first visit. |
| 419 means refresh CSRF | Axios interceptor catches 419, refreshes CSRF cookie, retries once. |

---

# 4. Session Driver: Database Sessions

### Decision

Use `SESSION_DRIVER=database` instead of `SESSION_DRIVER=cookie`.

### Why Database Sessions

| Factor | Cookie Driver | Database Driver |
|---|---|---|
| Session data storage | Encrypted in the cookie itself | Server-side PostgreSQL `sessions` table |
| Data size limit | ~4KB (HTTP cookie limit) | Unlimited |
| Server-side control | None — cannot invalidate remotely | Full control — can invalidate all sessions for a user |
| Load balancer support | Works (cookie sent to any server) | Works best (shared database, all servers read same session) |
| Session listing | Not possible | Can list, count, and manage active sessions |
| User logout from anywhere | Cookie-based (single session) | Can invalidate all devices |
| Production SaaS readiness | Limited | Required for enterprise features |

### Advantages for SkillSwap

1. **Force logout from all devices** — If a user changes their password or their account is compromised, an admin can invalidate all database sessions. Cookie sessions cannot be revoked without the user's browser.
2. **Session management UI (future)** — Users can see "Active sessions" (like GitHub/Gmail) and remotely log out other devices.
3. **Load-balanced deployment** — SkillSwap will grow. Database sessions are the standard for multi-server Laravel apps. Cookie sessions duplicate data on every request.
4. **Rate limiting per session** — Track and throttle abusive sessions without affecting other users.
5. **No size constraints** — Future features may store session-level data (e.g., OAuth state, MFA challenges) that exceeds cookie limits.

### Setup Requirements

```bash
# Create the session migration
php artisan session:table

# Run migration
php artisan migrate

# Configure
SESSION_DRIVER=database
SESSION_CONNECTION=pgsql     # Uses Supabase PostgreSQL
SESSION_LIFETIME=120          # Minutes
SESSION_DOMAIN=               # Deployment-dependent (see §6)
```

The `sessions` table will contain:

| Column | Type | Purpose |
|---|---|---|
| id | string (PK) | Unique session ID |
| user_id | bigint FK (nullable) | Associated user |
| ip_address | string (nullable) | Client IP |
| user_agent | text (nullable) | Browser user agent |
| payload | text | Serialized session data (encrypted) |
| last_activity | integer | Unix timestamp |

---

# 5. CSRF Protection

### Sanctum Auto-Registers CSRF Route

Confirmed — **Laravel Sanctum already registers `/sanctum/csrf-cookie` automatically** in its service provider (`SanctumServiceProvider.php`). No manual route registration is needed.

The route is registered under the `web` middleware group with the name `sanctum.csrf-cookie`:
```php
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show'])
    ->middleware('web')
    ->name('sanctum.csrf-cookie');
```

### Axios Auto-Handles CSRF Cookies

**No manual cookie parsing or interceptor is needed.** Axios has built-in CSRF support:

```typescript
// These are the DEFAULT Axios values — no configuration needed!
xsrfCookieName: 'XSRF-TOKEN'    // ← Name of the cookie to read
xsrfHeaderName: 'X-XSRF-TOKEN'  // ← Name of the header to set
```

When `withCredentials: true` is set, Axios automatically:
1. Reads the `XSRF-TOKEN` cookie from `document.cookie` (available when same registrable domain)
2. Sets the `X-XSRF-TOKEN` header on every state-changing request
3. Laravel's `VerifyCsrfToken` middleware validates the header matches the cookie

**Requirements for automatic CSRF handling:**
- Frontend and backend must share the same registrable domain (e.g., `app.skillswap.com` + `api.skillswap.com`) — the `XSRF-TOKEN` cookie set by the backend on its domain must be readable from the frontend's `document.cookie`
- OR the Vite development proxy handles this (same-origin during development)

**For different registrable domains** (e.g., `app.vercel.app` + `skillswap-api.render.com`), the `XSRF-TOKEN` cookie belongs to the backend domain and is not readable from the frontend's `document.cookie`. In this scenario, you must either:
1. Use the same registrable domain (recommended for production)
2. Fall back to a manual interceptor that parses the cookie from the response

### Axios CSRF Configuration

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// No xsrfCookieName / xsrfHeaderName config needed — defaults work.
// No manual cookie parsing interceptor needed.
// No Bearer token interceptor needed.
```

### CSRF Error Recovery (419 Response)

For the Axios response interceptor (required):

```typescript
// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    // 419: CSRF token mismatch — refresh and retry
    if (response?.status === 419 && !config._retry) {
      config._retry = true
      await api.get('/sanctum/csrf-cookie')  // Refresh CSRF cookie
      return api(config)                      // Retry original request
    }

    // 401: Unauthenticated — clear state and redirect
    if (response?.status === 401) {
      useAuthStore.getState().setUser(null)
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)
```

---

# 6. Deployment Environments

SkillSwap has **three distinct deployment environments**, each with different cookie, CSRF, and SameSite behavior.

Every developer must understand that **what works in one environment may not work in another** — particularly regarding cookies and Axios CSRF handling.

---

## 6.1 Local Development

| Property | Value |
|---|---|
| Frontend URL | `http://localhost:5173` |
| Backend URL | `http://localhost:8000` |
| Domain relationship | Same origin (via Vite proxy) |

### How Requests Flow

In development, the Vite dev server proxies `/api/*` requests to the Laravel backend:

```
Browser → http://localhost:5173/api/v1/auth/login
              ↓
         Vite dev server (proxy)
              ↓
         http://localhost:8000/api/v1/auth/login
```

From the browser's perspective, all requests go to `localhost:5173`. Cookies are set by `localhost:8000` but the proxy handles forwarding. The browser treats this as **same-origin**.

### Required Configuration

```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

```php
// config/sanctum.php
'stateful' => ['localhost:5173', 'localhost:8000'],
```

```
# .env
SESSION_DOMAIN=localhost
SESSION_SAMESITE=lax          # Browser default — no config needed
SESSION_SECURE_COOKIE=false   # HTTP, not HTTPS
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:8000
FRONTEND_URL=http://localhost:5173
```

```typescript
// client/.env
VITE_API_URL=http://localhost:8000
```

### Cookie Behavior

| Cookie | HttpOnly | Secure | SameSite | Readable by JS? |
|---|---|---|---|---|
| `skillswap_session` | ✅ Yes | ❌ No | `Lax` | ❌ |
| `XSRF-TOKEN` | ❌ No | ❌ No | `Lax` | ✅ Yes (`document.cookie`) |

### Axios CSRF — Does Auto-Handling Work?

**Yes, fully.** Because Vite proxy makes requests appear same-origin:
- Axios reads `XSRF-TOKEN` from `document.cookie` ✅
- Axios sets `X-XSRF-TOKEN` header on every request ✅
- Laravel validates header matches cookie ✅
- No manual interceptor needed ✅

### Important Notes

- The Vite proxy (`/api` → `localhost:8000`) must be running for auth to work
- Laravel must be running on `php artisan serve` or via Docker
- No HTTPS configuration needed
- No third-party cookie concerns

---

## 6.2 Preview / Temporary Deployment

| Property | Value |
|---|---|
| Frontend URL | `https://skillswap-frontend-abc123.vercel.app` |
| Backend URL | `https://skillswap-backend-xyz789.onrender.com` |
| Domain relationship | **Different registrable domains** |

### Purpose

This environment is used for:
- Preview deployments triggered by PRs (Vercel preview)
- Early team testing before production
- Stakeholder demos

### Critical Limitation

**This environment uses cookies cross-site (different registrable domains).** This means:

1. Cookies are classified as **third-party** by the browser
2. `SameSite=None; Secure` is **required**
3. Browsers may **block third-party cookies** entirely depending on user settings
4. Chrome's **Storage Partitioning (CHIPS)** may apply
5. Safari's **Intelligent Tracking Prevention (ITP)** may block cookies
6. Axios cannot read `XSRF-TOKEN` from `document.cookie` because the cookie belongs to the backend domain

### Required Configuration

```php
// config/cors.php
'allowed_origins' => ['https://skillswap-frontend-abc123.vercel.app'],
'supports_credentials' => true,
```

```php
// config/sanctum.php
'stateful' => ['skillswap-frontend-abc123.vercel.app'],
```

```
# .env
SESSION_DOMAIN=skillswap-backend-xyz789.onrender.com
SESSION_SAMESITE=none          # REQUIRED for cross-site
SESSION_SECURE_COOKIE=true     # REQUIRED with SameSite=None
SANCTUM_STATEFUL_DOMAINS=skillswap-frontend-abc123.vercel.app
FRONTEND_URL=https://skillswap-frontend-abc123.vercel.app
```

```typescript
// client/.env
VITE_API_URL=https://skillswap-backend-xyz789.onrender.com
```

### Cookie Behavior

| Cookie | HttpOnly | Secure | SameSite | Readable by JS? |
|---|---|---|---|---|
| `skillswap_session` | ✅ Yes | ✅ Yes | `None` | ❌ |
| `XSRF-TOKEN` | ❌ No | ✅ Yes | `None` | ❌ **Cannot read — different domain** |

### Axios CSRF — Does Auto-Handling Work?

**No.** Axios reads `XSRF-TOKEN` from `document.cookie`. But in this environment:
- The `XSRF-TOKEN` cookie is set by the backend (`skillswap-backend-xyz789.onrender.com`)
- The frontend runs on a different domain (`skillswap-frontend-abc123.vercel.app`)
- `document.cookie` only exposes cookies for the **current origin** (the frontend domain)
- Therefore, Axios **cannot** read the `XSRF-TOKEN` cookie automatically

**What you must do instead:**

Option A — Use a manual CSRF interceptor that extracts the token from the 419 response:
```typescript
// Axios interceptor (required for preview deployments with different domains)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    if (response?.status === 419 && !config._retry) {
      config._retry = true
      await api.get('/sanctum/csrf-cookie')  // Get fresh XSRF-TOKEN
      // Read the cookie from the response headers instead of document.cookie
      const xsrfToken = response.headers['set-cookie']
        ?.split(';')
        .find(c => c.trim().startsWith('XSRF-TOKEN='))
        ?.split('=')[1]
      config.headers['X-XSRF-TOKEN'] = xsrfToken || ''
      return api(config)
    }
    // ...
  }
)
```

Option B — Accept that CSRF validation runs on every request (Sanctum's `EnsureFrontendRequestsAreStateful` handles CSRF as part of its session validation). In practice, Sanctum may accept the session cookie alone for stateful requests, but the `X-XSRF-TOKEN` header is still the recommended approach.

### Chrome CHIPS (Cookies Having Independent Partitioned State)

Chrome may require the `Partitioned` attribute for cross-site cookies:
```
Set-Cookie: XSRF-TOKEN=...; Path=/; Secure; SameSite=None; Partitioned
```

This is a rapidly evolving browser standard. Preview deployments may break without warning on certain browser versions.

### Summary — Preview Environment Limitations

| Concern | Status |
|---|---|
| Login/Register works | ⚠️ May be inconsistent |
| Session persists after refresh | ⚠️ Depends on browser cookie policy |
| Axios auto-CSRF works | ❌ No — manual handling required |
| Works on all browsers | ❌ Not guaranteed |
| Suitable for development | ✅ Yes, with caveats |
| Suitable for production | ❌ **No — do not use this as production** |

---

## 6.3 Production Deployment (Recommended)

| Property | Value |
|---|---|
| Frontend URL | `https://app.skillswap.com` |
| Backend URL | `https://api.skillswap.com` |
| Domain relationship | **Same registrable domain** (subdomains) |

### Why This Architecture Is Preferred

| Reason | Explanation |
|---|---|
| **SameSite=Lax works** | Subdomains are considered "same site" — no `SameSite=None` needed |
| **Axios auto-CSRF works** | `XSRF-TOKEN` cookie set by `api.skillswap.com` is readable from `app.skillswap.com`'s `document.cookie` because they share the same registrable domain |
| **No third-party cookie restrictions** | Chrome CHIPS, Safari ITP, and Firefox ETP do not block same-site cookies |
| **Maximum browser compatibility** | Works on all browsers without special configuration |
| **More secure** | `SameSite=Lax` is more restrictive than `None` |
| **Professional UX** | No cookie consent issues related to third-party cookies |
| **Future-proof** | As browsers phase out third-party cookies, same-site auth is unaffected |

### Required Configuration

```php
// config/cors.php
'allowed_origins' => ['https://app.skillswap.com'],
'supports_credentials' => true,
```

```php
// config/sanctum.php
'stateful' => ['app.skillswap.com'],
```

```
# .env
SESSION_DOMAIN=.skillswap.com     # Leading dot — covers all subdomains
SESSION_SAMESITE=lax              # Secure enough, works with subdomains
SESSION_SECURE_COOKIE=true        # HTTPS required
SANCTUM_STATEFUL_DOMAINS=app.skillswap.com
FRONTEND_URL=https://app.skillswap.com
```

```typescript
// client/.env
VITE_API_URL=https://api.skillswap.com
```

### Cookie Behavior

| Cookie | HttpOnly | Secure | SameSite | Readable by JS? |
|---|---|---|---|---|
| `skillswap_session` | ✅ Yes | ✅ Yes | `Lax` | ❌ |
| `XSRF-TOKEN` | ❌ No | ✅ Yes | `Lax` | ✅ Yes (`document.cookie` — same registrable domain) |

### Axios CSRF — Does Auto-Handling Work?

**Yes, fully.** Because `app.skillswap.com` and `api.skillswap.com` share the same registrable domain:

1. The `XSRF-TOKEN` cookie is set by `api.skillswap.com` with `Domain=.skillswap.com`
2. The browser sends this cookie to both `app.skillswap.com` and `api.skillswap.com`
3. `document.cookie` on `app.skillswap.com` includes the `XSRF-TOKEN` cookie
4. Axios reads it and sets `X-XSRF-TOKEN` header on every request
5. Laravel validates the header matches the cookie

**No manual interceptor required.**

### Why This Is the Target Architecture

All environments before production have compromises:
- **Local development** — Works perfectly but only for one developer
- **Preview deployments** — Work inconsistently across browsers due to third-party cookie restrictions

Production with same-registrable-domain subdomains is the **only architecture that is simultaneously secure, reliable, and compatible with all browsers.** It should be the target for launch.

---

## 6.4 Session Cookie Configuration (Shared Across Environments)

```php
// config/session.php
'secure' => env('SESSION_SECURE_COOKIE', true),
'http_only' => true,                                // Always — JS must never read session
'same_site' => env('SESSION_SAMESITE', 'lax'),     // Deployment-dependent
'domain' => env('SESSION_DOMAIN'),                 // Deployment-dependent
```

### Environment Variable Templates

**Local development (`.env`)**:
```
SESSION_DRIVER=database
SESSION_DOMAIN=localhost
SESSION_SAMESITE=lax
SESSION_SECURE_COOKIE=false
```

**Preview deployment (Render env vars)**:
```
SESSION_DRIVER=database
SESSION_DOMAIN=skillswap-backend-xyz789.onrender.com
SESSION_SAMESITE=none
SESSION_SECURE_COOKIE=true
```

**Production (Render env vars)**:
```
SESSION_DRIVER=database
SESSION_DOMAIN=.skillswap.com
SESSION_SAMESITE=lax
SESSION_SECURE_COOKIE=true
```

---

# 7. Axios CSRF Behavior — Environment-by-Environment

Axios has built-in CSRF handling via `xsrfCookieName` and `xsrfHeaderName` defaults:

```typescript
// Axios defaults (no configuration needed)
xsrfCookieName: 'XSRF-TOKEN'    // Reads this cookie from document.cookie
xsrfHeaderName: 'X-XSRF-TOKEN'  // Sets this header on every request
```

**However, this only works when the `XSRF-TOKEN` cookie is readable from `document.cookie`.** Whether that is true depends entirely on the deployment environment's domain relationship.

## 7.1 Local Development — ✅ Auto-CSRF Works

| Factor | Status |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8000` |
| Domain relationship | Same origin (Vite proxy) |
| XSRF-TOKEN in `document.cookie` | ✅ Yes |
| Axios auto-sets `X-XSRF-TOKEN` header | ✅ Yes |
| **Manual interceptor needed?** | **No** |

**Why:** The Vite proxy makes all `/api` requests appear to originate from `localhost:5173`. The `XSRF-TOKEN` cookie, while set by `localhost:8000`, is forwarded by the proxy. On the browser side, cookies for `localhost` are shared across ports, so `document.cookie` includes the `XSRF-TOKEN` value.

## 7.2 Preview Deployment — ❌ Auto-CSRF Does NOT Work

| Factor | Status |
|---|---|
| Frontend | `https://skillswap.vercel.app` |
| Backend | `https://skillswap.onrender.com` |
| Domain relationship | **Different registrable domains** |
| XSRF-TOKEN in `document.cookie` | ❌ No |
| Axios auto-sets `X-XSRF-TOKEN` header | ❌ No |
| **Manual interceptor needed?** | **Yes** |

**Why:** The `XSRF-TOKEN` cookie is set by the backend on `skillswap.onrender.com`. The frontend runs on `skillswap.vercel.app`. These are different registrable domains. `document.cookie` only exposes cookies for the **current origin** — the frontend domain. Therefore Axios cannot read the `XSRF-TOKEN` value.

**What you must do:** Use the 419 retry interceptor (already in the Axios config, see §5). Every POST/PUT/PATCH/DELETE request:
1. First attempt: sent without `X-XSRF-TOKEN` header (Axios can't read it)
2. Laravel responds **419 CSRF token mismatch**
3. Axios interceptor catches 419, calls `GET /sanctum/csrf-cookie`
4. Reads the `XSRF-TOKEN` from the **response `Set-Cookie` header** (manually)
5. Sets `X-XSRF-TOKEN` header explicitly
6. Retries the original request

This adds one extra round-trip to every state-changing request. Acceptable for preview/testing; not ideal for production.

## 7.3 Production (Same Registrable Domain) — ✅ Auto-CSRF Works

| Factor | Status |
|---|---|
| Frontend | `https://app.skillswap.com` |
| Backend | `https://api.skillswap.com` |
| Domain relationship | **Same registrable domain** (subdomains) |
| XSRF-TOKEN in `document.cookie` | ✅ Yes |
| Axios auto-sets `X-XSRF-TOKEN` header | ✅ Yes |
| **Manual interceptor needed?** | **No** |

**Why:** The `XSRF-TOKEN` cookie is set by `api.skillswap.com` with `Domain=.skillswap.com`. This cookie is sent by the browser to **all subdomains** of `skillswap.com`, including `app.skillswap.com`. Therefore, `document.cookie` on the frontend includes the `XSRF-TOKEN` value, and Axios reads it automatically.

## 7.4 Summary Table

| Environment | Axios auto-CSRF | Manual interceptor | Extra round-trips |
|---|---|---|---|
| Local development (Vite proxy) | ✅ Yes | Not needed | 0 |
| Preview (different domains) | ❌ No | Required (419 retry) | 1 per request |
| Production (same domain) | ✅ Yes | Not needed | 0 |

**Key rule:** Do not assume Axios CSRF auto-handling works everywhere. It works in development and in the target production architecture. It does NOT work in preview deployments with different registrable domains.

---

# 8. Required Backend Changes

### 7.1 New Migration
```bash
php artisan session:table   # Creates database/migrations/xxxx_xx_xx_xxxxxx_create_sessions_table.php
php artisan migrate          # Creates the sessions table in Supabase PostgreSQL
```

### 7.2 `.env`
```
SESSION_DRIVER=database
SESSION_CONNECTION=pgsql
SESSION_LIFETIME=120
SESSION_DOMAIN=.skillswap.com           # Production
# SESSION_DOMAIN=localhost               # Development
SESSION_SAMESITE=lax                     # Production (see §6)
# SESSION_SAMESITE=lax                   # Development
SESSION_SECURE_COOKIE=true               # Production
# SESSION_SECURE_COOKIE=false            # Development
SANCTUM_STATEFUL_DOMAINS=app.skillswap.com,localhost:3000
FRONTEND_URL=https://app.skillswap.com
```

### 7.3 `config/sanctum.php`
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,localhost:8080,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ',' . parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

### 7.4 `config/cors.php`
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 7.5 `config/session.php`
```php
'driver' => env('SESSION_DRIVER', 'database'),
'domain' => env('SESSION_DOMAIN'),
'secure' => env('SESSION_SECURE_COOKIE', true),
'http_only' => true,
'same_site' => env('SESSION_SAMESITE', 'lax'),
```

### 7.6 `app/Http/Kernel.php`
```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

### 7.7 `AuthController.php`

**`register()`** — Session instead of token:
```php
$user = User::create([...]);
event(new Registered($user));
Auth::login($user);
return $this->success(
    data: ['user' => new UserResource($user)],
    message: 'Registration successful.',
    code: Response::HTTP_CREATED,
);
```

**`login()`** — Session instead of token:
```php
if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
    $request->session()->regenerate();
    return $this->success(
        data: ['user' => new UserResource(Auth::user())],
        message: 'Login successful.',
    );
}
return $this->error(
    message: 'Invalid email or password.',
    code: Response::HTTP_UNAUTHORIZED,
);
```

**`logout()`** — Session destroy instead of token delete:
```php
auth()->logout();
$request->session()->invalidate();
$request->session()->regenerateToken();
return $this->success(message: 'Logged out successfully.');
```

**`me()`** — No change needed (already returns authenticated user via `$request->user()`).

### No new routes needed
- `/sanctum/csrf-cookie` is auto-registered by Sanctum (confirmed)
- All auth endpoints already exist in `routes/api.php`
- No route changes required

---

# 9. Required Frontend Changes

### 8.1 `lib/axios.ts` — Full Rewrite

```typescript
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// CSRF error recovery
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    if (response?.status === 419 && !config._retry) {
      config._retry = true
      await api.get('/sanctum/csrf-cookie')
      return api(config)
    }

    if (response?.status === 401) {
      useAuthStore.getState().setUser(null)
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
```

**Key points:**
- No `xsrfCookieName`/`xsrfHeaderName` override needed (Axios defaults match Sanctum)
- No manual cookie parsing
- No Bearer token interceptor
- `withCredentials: true` — the single most important line

### 8.2 `lib/api/auth.ts` — Session-Based

- Remove `token` from response types
- Add `getMe()` → `GET /api/v1/auth/me`
- Add `getCsrfCookie()` → `GET /sanctum/csrf-cookie`

### 8.3 `stores/authStore.ts` — No Token, No localStorage

```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean       // Derived: user !== null
  isLoading: boolean             // Initial session check
  isInitialized: boolean         // True after first GET /me completes
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  setInitialized: (v: boolean) => void
}
```

- No `token` field
- No `localStorage` reads/writes
- No synchronous auth check — must wait for `initialize()` to resolve

### 8.4 `App.tsx` — Initialize Sequence

```typescript
function App() {
  const initialize = useAuthStore((s) => s.initialize)
  const queryClient = useQueryClient()

  useEffect(() => {
    const init = async () => {
      await api.get('/sanctum/csrf-cookie')  // Step 1: CSRF
      await initialize()                      // Step 2: Check session
    }
    init()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>...</Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

---

# 10. State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TanStack Query (Server State)            │
│                                                             │
│  useQuery(['auth', 'me'])              → current user       │
│  useMutation(login)                    → invalidate ['me']  │
│  useMutation(register)                 → invalidate ['me']  │
│  useMutation(logout)                   → clear all queries  │
│                                                             │
│  (Future)                                                   │
│  useQuery(['marketplace'], { search, category })            │
│  useQuery(['skills'])                                       │
│  useQuery(['exchange-requests'])                            │
│  useMutation(accept) → invalidate ['exchange-requests']     │
│  useQuery(['conversations'])                                │
│  useQuery(['messages', conversationId])                     │
│  useMutation(sendMessage) → append to cache                 │
│  useQuery(['learning-sessions'])                            │
│  useMutation(completeSession) → invalidate ['sessions']    │
│  useQuery(['reviews', username])                            │
│  useMutation(submitReview) → invalidate ['reviews']         │
└──────────────────────┬──────────────────────────────────────┘
                       │ sync
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Zustand (Client State Only)              │
│                                                             │
│  authStore:                                                 │
│    user: User | null                                        │
│    isAuthenticated: boolean                                 │
│    isLoading: boolean                                       │
│    isInitialized: boolean                                   │
│    initialize(), setUser(), setInitialized()                │
│                                                             │
│  themeStore:                                                │
│    mode: 'light' | 'dark' | 'system'                       │
│    setMode()                                                │
│                                                             │
│  (Future)                                                   │
│  uiStore: { sidebarOpen, currentTab, ... }                 │
│  filterStore: { marketplaceFilters, ... }                  │
└─────────────────────────────────────────────────────────────┘
```

### Rule of Thumb

| Data belongs in... | Examples |
|---|---|
| **TanStack Query** | Everything from the API: user, marketplace, skills, exchanges, messages, sessions, reviews, notifications |
| **Zustand** | UI-only or client-persisted state: auth flags, theme, sidebar state, form drafts, filter selections |

---

# 11. Updated Folder Structure

```
client/src/
├── features/
│   └── auth/                          # NEW
│       ├── pages/
│       │   ├── LoginPage.tsx          # NEW (migrated from pages/Login.tsx)
│       │   └── RegisterPage.tsx       # NEW (migrated from pages/Register.tsx)
│       └── schemas/
│           └── authSchemas.ts         # NEW — Zod schemas for login/register
├── components/
│   ├── ui/                            # Existing (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   └── loading-spinner.tsx
│   ├── layout/
│   │   ├── PublicLayout.tsx           # Existing — may update
│   │   ├── Navbar.tsx                 # Existing — update auth check
│   │   ├── AuthenticatedLayout.tsx    # Future (Phase 4+)
│   │   ├── ProtectedRoute.tsx         # Existing — update to session-based
│   │   └── GuestRoute.tsx             # Existing — update to session-based
│   └── shared/
│       └── ErrorBoundary.tsx          # NEW — global error boundary
├── lib/
│   ├── api/
│   │   ├── axios.ts                   # MODIFY — withCredentials, CSRF handler
│   │   └── auth.ts                    # MODIFY — session-based, no token
│   └── utils.ts                       # Existing
├── stores/
│   ├── authStore.ts                   # REWRITE — session-based, no localStorage
│   └── themeStore.ts                  # Existing — add system listener
├── hooks/
│   ├── useTheme.ts                    # Existing
│   └── useAuth.ts                     # NEW — TanStack Query auth hooks
├── pages/
│   ├── Landing.tsx                   # Existing — unchanged
│   ├── Login.tsx                     ⚠️ WILL BE REMOVED AFTER MIGRATION
│   ├── Register.tsx                  ⚠️ WILL BE REMOVED AFTER MIGRATION
│   └── Dashboard.tsx                 # Existing — unchanged
├── App.tsx                            # MODIFY — QueryClientProvider, init sequence, code splitting
├── main.tsx                           # Existing
├── index.css                          # Existing
└── vite-env.d.ts                     # Existing
```

---

# 12. Dependencies to Install

```bash
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod
```

---

# 13. Files to Create

| # | File Path | Purpose |
|---|---|---|
| 1 | `features/auth/pages/LoginPage.tsx` | Login form with React Hook Form + Zod, API mutation, error handling, loading spinner |
| 2 | `features/auth/pages/RegisterPage.tsx` | Register form with React Hook Form + Zod, API mutation, error handling, loading spinner |
| 3 | `features/auth/schemas/authSchemas.ts` | Zod validation schemas for login and register forms |
| 4 | `components/shared/ErrorBoundary.tsx` | React error boundary wrapping the entire app |
| 5 | `hooks/useAuth.ts` | TanStack Query `useQuery`/`useMutation` hooks for auth operations |

---

# 14. Files to Modify

| # | File Path | Change |
|---|---|---|
| 1 | `lib/axios.ts` | `withCredentials: true`, 419 retry interceptor, 401 handler. No Bearer header. |
| 2 | `lib/api/auth.ts` | Remove token from response types. Add `getMe()`. |
| 3 | `stores/authStore.ts` | Rewrite: no `token`, no `localStorage`. Add `initialize()`, `isInitialized`. |
| 4 | `stores/themeStore.ts` | Add `matchMedia('prefers-color-scheme')` listener. |
| 5 | `App.tsx` | Add `QueryClientProvider`, CSRF init + session check on mount, route-level code splitting with `React.lazy`. |
| 6 | `components/layout/ProtectedRoute.tsx` | Use `isAuthenticated` + `isInitialized` from Zustand. |
| 7 | `components/layout/GuestRoute.tsx` | Same as above. |
| 8 | `components/layout/Navbar.tsx` | Update auth check to use Zustand `user` (not token). |
| 9 | Backend: `config/sanctum.php` | Add frontend domain to `stateful`. |
| 10 | Backend: `config/cors.php` | `supports_credentials => true`, allowed origins. |
| 11 | Backend: `config/session.php` | `driver => database`, domain, same_site, secure. |
| 12 | Backend: `.env` | `SESSION_DRIVER`, `SESSION_DOMAIN`, `SESSION_SAMESITE`, `SESSION_SECURE_COOKIE`, `SANCTUM_STATEFUL_DOMAINS`, `FRONTEND_URL`. |
| 13 | Backend: `app/Http/Kernel.php` | Add Sanctum stateful middleware to `api` group. |
| 14 | Backend: `AuthController.php` | Use `Auth::attempt()` + session for login. `Auth::login()` for register. `auth()->logout()` + `invalidate()` for logout. |
| 15 | Backend: New migration | `php artisan session:table`, then `php artisan migrate`. |

---

# 15. File Migration Strategy

No files will be deleted before migration is verified.

### Step-by-step process

```
Phase A — Create new files
  └── Create features/auth/pages/LoginPage.tsx   (new implementation)
  └── Create features/auth/pages/RegisterPage.tsx (new implementation)
  └── pages/Login.tsx and pages/Register.tsx still EXIST and are UNCHANGED

Phase B — Update routing
  └── App.tsx now imports from features/auth/pages/ instead of pages/
  └── Old files (pages/Login.tsx, pages/Register.tsx) are no longer imported
  └── But still exist on disk — safe rollback possible

Phase C — Test
  └── npm run dev → verify login page at /login renders new LoginPage
  └── npm run dev → verify register page at /register renders new RegisterPage
  └── Full auth flow test (register → dashboard → logout → login)

Phase D — Remove obsolete files
  └── Only after Phase C passes:
  └── rm pages/Login.tsx
  └── rm pages/Register.tsx
```

**Rollback plan:** If Phase C fails, revert `App.tsx` imports to point back to `pages/` — the old files were never touched.

---

# 16. Recommended Implementation Order

### Step 1 — Backend: Database Sessions
- Run `php artisan session:table` + `php artisan migrate`
- Set `SESSION_DRIVER=database` in `.env`

### Step 2 — Backend: Sanctum & CORS Configuration
- `config/sanctum.php` — stateful domains
- `config/cors.php` — credentials + origins
- `config/session.php` — driver, domain, same_site, secure
- `.env` — all session/sanctum/cors variables
- `app/Http/Kernel.php` — stateful middleware to `api` group

### Step 3 — Backend: Auth Controller
- `AuthController@register` — session-based
- `AuthController@login` — session-based
- `AuthController@logout` — session destroy

### Step 4 — Frontend: Dependencies
- `npm install @tanstack/react-query react-hook-form @hookform/resolvers zod`

### Step 5 — Frontend: Axios + API Layer
- `lib/axios.ts` — withCredentials, 419/401 interceptors
- `lib/api/auth.ts` — session-based functions, no token

### Step 6 — Frontend: Stores
- `stores/authStore.ts` — no token, no localStorage
- `stores/themeStore.ts` — add system theme listener

### Step 7 — Frontend: TanStack Query + Hooks
- `App.tsx` — QueryClientProvider
- `hooks/useAuth.ts` — auth queries/mutations

### Step 8 — Frontend: Auth Pages
- `features/auth/schemas/authSchemas.ts` — Zod validation
- `features/auth/pages/LoginPage.tsx` — full implementation
- `features/auth/pages/RegisterPage.tsx` — full implementation

### Step 9 — Frontend: Route Guards + Navbar
- `ProtectedRoute.tsx` — session check
- `GuestRoute.tsx` — session check
- `Navbar.tsx` — no token references

### Step 10 — Frontend: Error Handling
- `ErrorBoundary.tsx` — top-level error boundary

### Step 11 — Frontend: Finalize App.tsx
- React.lazy code splitting
- CSRF init + session check on mount
- Import from `features/auth/pages/` instead of `pages/`

### Step 12 — Verify + Clean Up
- Test full auth flow
- Remove old `pages/Login.tsx` and `pages/Register.tsx`

---

# 17. Deployment Configuration

### Backend (Render environment variables)

```
APP_URL=https://skillswap-api.onrender.com
FRONTEND_URL=https://app.skillswap.com            # Or Vercel deployment URL
SANCTUM_STATEFUL_DOMAINS=app.skillswap.com
SESSION_DRIVER=database
SESSION_CONNECTION=pgsql
SESSION_DOMAIN=.skillswap.com                     # Same registrable domain
SESSION_SAMESITE=lax
SESSION_SECURE_COOKIE=true
```

### Frontend (Vercel environment variables)

```
VITE_API_URL=https://skillswap-api.onrender.com
```

### Cookie Behavior Summary

| Environment | SameSite | Secure | HttpOnly (session) | JS-readable (XSRF-TOKEN) |
|---|---|---|---|---|
| Development (localhost) | Lax (default) | false | ✅ | ✅ (same origin) |
| Production (same domain) | Lax | true | ✅ | ✅ (same registrable domain → document.cookie) |
| Production (different domains) | None | true | ✅ | ❌ (different domain → manual interceptor needed) |

---

# 18. Complete Checklist

### Backend
- [x] Migration: Create `sessions` table
- [x] Config: `sanctum.php` — stateful domains
- [x] Config: `cors.php` — supports_credentials, allowed_origins
- [x] Config: `session.php` — driver, domain, same_site, secure
- [x] Config: `.env` — all session/sanctum/cors variables
- [x] Middleware: Sanctum stateful in `api` group
- [x] Controller: `register()` — handles 4 cases (new, verified, unverified+active, unverified+expired)
- [x] Controller: `login()` — checks email verification BEFORE `Auth::attempt()`
- [x] Controller: `logout()` — `session::invalidate()` + `regenerateToken()`
- [x] Controller: `sendVerificationCode()` — 60s cooldown checks latest code (any status)
- [x] Controller: `verifyCode()` — single-use, expired, invalid code rejection
- [x] Model: `EmailVerification` — `used_at` in fillable, `scopeValid`, `markAsUsed()`
- [x] Registration: Email uniqueness enforced via controller logic (not FormRequest)
- [x] Registration: Username uniqueness enforced via controller logic
- [x] No new routes needed (CSRF route auto-registered)

### Frontend
- [x] Dependencies: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`
- [x] Axios: `withCredentials: true`, 419 retry, 401 handler
- [x] API: Remove token from types, add `getMe()`
- [x] Store: Auth store rewritten — no token, no localStorage
- [x] Store: Theme store — system listener
- [x] TanStack Query: `QueryClientProvider`, hooks for auth
- [x] Pages: Login + Register with React Hook Form + Zod + API integration
- [x] Register page: Handles 409 Conflict for verified email
- [x] Email verification page: No auto-send on mount, registration message banner
- [x] Email verification page: Resend with cooldown, paste support, error states
- [x] Routes: ProtectedRoute + GuestRoute using session check
- [x] Navbar: Updated auth check
- [x] Error boundary: Top-level
- [x] App.tsx: CSRF init, session check, code splitting

### Verification
- [x] Register with new email → redirect to /verify-email → verify → redirect to /login → login → dashboard
- [x] Register with verified email → 409 Conflict error
- [x] Register with unverified email + valid code → redirect to /verify-email with info message
- [x] Register with unverified email + expired code → account updated, new code sent
- [x] Verify with valid code → email verified
- [x] Verify with invalid code → 422 error
- [x] Verify with expired code → 422 error
- [x] Verify with used code → 422 error
- [x] Old code invalid after resend
- [x] Resend before cooldown → 429 error
- [x] Resend after cooldown → new code sent
- [x] Login with verified account → session created
- [x] Login with unverified account → 403 error, no session
- [x] Login with invalid credentials → 401 error
- [x] Login after successful verification → session created
- [x] Logout → session destroyed
- [x] Unauthenticated access to protected routes → 401 error
- [x] Me endpoint returns user data without password
- [x] Login rate limited: 5 attempts/min per email + 20 attempts/min per IP (throttle:login)
- [x] 30 test cases pass covering all scenarios

---

# Out of Scope for Phase 3 (Intentionally Deferred)

The following authentication features are intentionally excluded from Phase 3. They are documented here so future contributors understand why they were deferred.

## Password Reset

**Deferred to:** Phase 3.8 or pre-launch

**Reasoning:** Password reset is self-contained — it requires a Forgot Password page, Reset Password page, email notifications, and token expiry validation. Google OAuth provides a fallback for users who forget their password. The `password_reset_tokens` table already exists (created in the users migration), so no schema changes are needed when implemented.

## Authentication Audit Logging

**Deferred to:** Phase 11 (Security) or Admin Module

**Reasoning:** No admin dashboard exists to consume audit logs. Implementing logging now would write to an unread database table, adding write amplification with zero user-facing benefit. Best implemented alongside admin/reporting features.

## Session Management

**Deferred to:** Phase 4+ (User Settings)

**Reasoning:** Active sessions, logout from all devices, and device management belong in User Settings or Profile. The database session infrastructure (`sessions` table, `SESSION_DRIVER=database`) is already in place. Only API endpoints and frontend UI are needed.

## Email Change Verification

**Deferred to:** Phase 4 (User Profiles)

**Reasoning:** Email change is a profile management feature, not an authentication feature. The existing 6-digit verification code infrastructure will be reused. Suggested flow: user requests change → code sent to new email → verify → update.

---

# 19. Role Architecture

## Overview

Users are assigned a role via a normalized `roles` table rather than a string column. This keeps the schema clean and makes future authorization simpler.

## Database

### roles

| Column | Type | Notes |
|--------|------|-------|
| id | bigint (PK) | |
| name | string | Display name |
| slug | string (unique) | Stable identifier for lookups — never hardcoded by ID |
| created_at | timestamp | |
| updated_at | timestamp | |

### users (modified)

| Column | Type | Notes |
|--------|------|-------|
| role_id | bigint (FK → roles.id) | Always set, never nullable |

## Relationship

```
Role
    hasMany(User)

User
    belongsTo(Role)
```

## Initial Roles

| Name | Slug | Constant |
|------|------|----------|
| Admin | admin | `Role::ADMIN` |
| User | user | `Role::USER` |

## Registration Behavior

All new users (email registration, Google OAuth, any future provider) automatically receive the **User** role.

Role assignment is server-only and never accepted from client input.

## Role Model — Constants & Lookup

Role slugs are defined as class constants to prevent typos:

```php
const ADMIN = 'admin';
const USER = 'user';
```

A centralized `findBySlug()` method looks up by slug and throws `ModelNotFoundException` if the role does not exist:

```php
public static function findBySlug(string $slug): self
{
    return static::where('slug', $slug)->firstOrFail();
}
```

Usage:

```php
'role_id' => Role::findBySlug(Role::USER)->id,
```

This replaces the previous `firstOrCreate()` pattern. Roles are system data that must exist after seeding. A missing role is a deployment failure, not a runtime condition to silently recover from.

## User Model — Convenience Methods

```php
$user->isAdmin();  // $user->role->slug === Role::ADMIN
$user->isUser();   // $user->role->slug === Role::USER
```

These keep authorization code readable and simplify expansion when additional roles are introduced.

## Eager Loading

The role relationship is loaded explicitly only where it is needed (login response, current user endpoint) rather than globally via `protected $with`. This avoids unnecessary joins on queries that do not require role information, such as background jobs, analytics, or unrelated feature queries.

Examples:

```php
// Login — explicit eager load
User::with('role')->where('email', $request->email)->first();

// Current user — load on authenticated instance
$request->user()->load('role');
```

## Seeders

`RoleSeeder` inserts the two initial roles. It is called from `DatabaseSeeder` before `SkillCategorySeeder`. Tests seed roles via the base `TestCase::setUp()` method to ensure `findBySlug()` never fails during testing.

## API Response

The `UserResource` includes the full role object:

```json
{
  "user": {
    "id": 1,
    "role": {
      "id": 2,
      "name": "User",
      "slug": "user"
    },
    ...
  }
}
```

## System Roles (Immutable)

The `Admin` and `User` roles are system records. Future administrative features must not allow:

- Deleting the Admin or User role
- Renaming system role slugs
- Creating duplicate system roles

These roles should be treated as application infrastructure, not user-managed data.

## Prepared for Future Authorization

The current architecture supports these future additions without a database redesign:

- **Role middleware** — Gate routes by `$user->isAdmin()`
- **Authorization policies** — Use `$user->role->slug` in policy methods
- **Admin dashboard protection** — Check `$user->isAdmin()` before serving admin routes

No RBAC or permissions system is implemented yet. The normalized `roles` table is a foundation, not a full authorization system.

## Future Roles (not MVP)

New roles can be added to the `roles` table without schema changes:

- Moderator
- Mentor
- Organization
- Instructor
- Company

## Not Implemented (Out of Scope)

No permissions, RBAC, or authorization logic is implemented. The role architecture is structural only.

---

# 20. OAuth / Social Authentication

> This section's numbering has been updated. All internal references within this section remain unchanged.

## Overview

OAuth authentication is implemented using:

- **Laravel Socialite** — handles the OAuth 2.0 handshake with providers
- **`social_accounts` table** — stores provider links (provider-agnostic)
- **`SocialAuthController`** — thin controller with `redirect()` and `callback()` methods
- **`SocialAuthService`** — all business logic (find, link, create, authenticate)
- **Provider-agnostic routing** — `/auth/{provider}/redirect` and `/auth/{provider}/callback`

## Provider Whitelist

```php
private const array PROVIDERS = ['google'];
```

Adding a new provider (e.g., GitHub) requires:
1. Add provider config to `config/services.php`
2. Add provider name to the whitelist

## Database: `social_accounts` Table

```php
Schema::create('social_accounts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('provider');
    $table->string('provider_id');
    $table->string('provider_email')->nullable();
    $table->string('avatar_url')->nullable();
    $table->timestamps();

    $table->unique(['provider', 'provider_id']);
    $table->unique(['user_id', 'provider']);
});
```

## Password Handling

OAuth-only accounts receive a random secure password:

```php
Hash::make(Str::random(64))
```

The `password` column remains **NOT NULL** — no schema changes needed.
Users can set their own password later in Settings (no additional migration required).

## OAuth Flow

```
Frontend → [Sign in with Google] → Backend /auth/google/redirect → Google
Google → Backend /auth/google/callback → SocialAuthService → Auth::login() → redirect
Redirect to FRONTEND_URL/auth/callback → Frontend callback page → init session → /dashboard
```

## Three Cases

| Case | Scenario | Action |
|------|----------|--------|
| 1 | provider + provider_id already linked | Authenticate linked user |
| 2 | Email exists, not yet linked | Link provider to existing user, auto-verify email, authenticate |
| 2b | Email exists, already linked to DIFFERENT provider account | Reject — cannot overwrite |
| 3 | New email | Create user with random password, create social_account, auto-verify email, authenticate |

## Security

- Provider email verification is checked before linking or creating accounts
- All multi-write operations wrapped in `DB::transaction()`
- Session regenerated after every authentication
- Existing `provider_id` cannot be overwritten
- Provider is validated against whitelist
- Duplicate social accounts prevented by database unique constraints

## Testing

23 test cases cover:
- Case 1: existing linked account → authentication
- Case 1: session regeneration
- Case 2: link existing local account
- Case 2: auto-verify unverified email
- Case 2: preserve user ID
- Case 2: different provider link rejected
- Case 2: existing link cannot be overwritten
- Case 3: new account creation
- Case 3: email auto-verified
- Case 3: random password generation
- Case 3: username generation from email
- Case 3: unique username when taken
- Security: unverified provider email rejected (create + link)
- Security: Google-only user cannot login with password
- Error: missing authorization code
- Error: provider exception
- Error: unsupported provider
- Transaction rollback on failure
- Configurable frontend URL

## 21. Deployment Roadmap

The SkillSwap project will progress through three deployment stages. Each stage has different capabilities and limitations.

## Stage 1: Local Development

| Aspect | Detail |
|---|---|
| Purpose | Individual developer work |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8000` |
| Database | Local PostgreSQL or Supabase |
| Auth behavior | Full Sanctum SPA — cookies work, Axios CSRF works |
| Limitations | Single developer, local-only |

**When to use:** During active development. Every developer runs this locally.

## Stage 2: Preview / Testing

| Aspect | Detail |
|---|---|
| Purpose | Team testing, PR previews, stakeholder demos |
| Frontend | `https://skillswap.vercel.app` (Vercel preview) |
| Backend | `https://skillswap.onrender.com` (Render) |
| Database | Supabase (shared dev instance) |
| Auth behavior | Cookies work with `SameSite=None; Secure`. Axios CSRF auto-handling **does not work** — requires 419 retry interceptor. Browser third-party cookie restrictions may cause inconsistent behavior. |
| Limitations | Not production-ready. Auth may behave differently across browsers. Preview deployments may break if browser cookie policies change. |

**When to use:** For testing and review cycles. **Do not use as production.**

**Expected auth quirks:**
- Some users may need to enable third-party cookies in their browser
- Safari and Firefox may block cookies entirely
- Login may succeed but session may not persist after refresh
- CSRF validation adds one extra round-trip per state-changing request

## Stage 3: Production

| Aspect | Detail |
|---|---|
| Purpose | Live public application |
| Frontend | `https://app.skillswap.com` |
| Backend | `https://api.skillswap.com` |
| Database | Supabase (production instance) |
| Auth behavior | Full Sanctum SPA — cookies work, Axios CSRF works. No third-party cookie issues. |
| Limitations | Requires DNS configuration for subdomains |

**Why Stage 3 is the target:**
- Same-registrable-domain architecture (`skillswap.com`) eliminates all cross-domain cookie issues
- `SameSite=Lax` is more secure than `None`
- Axios CSRF auto-handling works without extra round-trips
- No third-party cookie restrictions (Chrome CHIPS, Safari ITP, Firefox ETP)
- Works identically on all browsers without special configuration
- Professional branding with custom domain

## Stage Migration Plan

```
Current State
    │
    ▼
Stage 1: Local Development (NOW)
    │   ├── Implement Phase 3 auth here
    │   ├── Test with Vite proxy
    │   └── Verify CSRF, login, register, logout
    │
    ▼
Stage 2: Preview on Vercel + Render (DURING DEVELOPMENT)
    │   ├── Deploy for team testing
    │   ├── Set SameSite=None; Secure
    │   ├── Accept CSRF round-trip overhead
    │   └── Note: not fully reliable across browsers
    │
    ▼
Stage 3: Production (FOR LAUNCH)
        ├── Purchase skillswap.com domain
        ├── Configure app.skillswap.com (Vercel)
        ├── Configure api.skillswap.com (Render)
        ├── Set SameSite=Lax; Secure
        ├── Switch to production Supabase instance
        └── Auth works fully on all browsers
```

---

# 22. Future Session Security Capabilities

Because SkillSwap uses **server-side database sessions** (`SESSION_DRIVER=database`), the following security features become possible in future phases. They require no additional infrastructure — only application code.

These features are **not required for the MVP**. They are documented here so the architecture accounts for them from the start.

## 22.1 Logout from All Devices

```php
// Invalidate all sessions for a user
DB::table('sessions')->where('user_id', $user->id)->delete();
```

**When to implement:** After password change, or as an explicit "Log out everywhere" button in Settings.

**Privacy/UX:** Inform the user that all other devices will be signed out.

## 22.2 Active Session Management

Users can view a list of currently active sessions (similar to Gmail, GitHub, Facebook):

| Column | Data from `sessions` table |
|---|---|
| Device / Browser | `user_agent` (parsed) |
| IP address | `ip_address` |
| Last active | `last_activity` |
| Current session indicator | Compare session ID from cookie |

**When to implement:** Settings page (Phase 4 or later).

## 22.3 Session Revocation

Users can manually revoke a specific session (e.g., "I lost my phone"):

```php
// Revoke one session (except current)
DB::table('sessions')
    ->where('id', $request->session_id)
    ->where('user_id', $user->id)
    ->delete();
```

**When to implement:** Same as active session management.

## 22.4 Password-Change Session Invalidation

When a user changes their password, all existing sessions (except the current one) are automatically invalidated:

```php
// In User model or PasswordChange event handler
public function invalidateOtherSessions(string $currentSessionId): void
{
    DB::table('sessions')
        ->where('user_id', $this->id)
        ->where('id', '!=', $currentSessionId)
        ->delete();
}
```

**Best practice:** This prevents a stolen session from surviving a password change.

## 22.5 Suspicious Login Detection

Using the `ip_address` and `user_agent` columns in the `sessions` table, the application can detect:

- Login from a new location (geolocate IP)
- Login from an unknown device (compare user agent against known devices)
- Login from a VPN or proxy (IP reputation check)
- Multiple sessions from different geographic regions simultaneously

**When to implement:** Post-MVP security hardening (Phase 11 or later).

## 22.6 Rate Limiting per Session

```php
// Track requests per session for abuse detection
// sessions table can store a requests_count or last_request_at
```

**When to implement:** If abuse becomes a concern post-launch.

## 22.7 Device Management UI (Wireframe)

```
Settings → Security
─────────────────────────────────────────────
Active Sessions

  📱 Chrome on Windows
     IP: 192.168.1.1
     Last active: 2 minutes ago
     [Revoke]

  📱 Safari on iPhone
     IP: 10.0.0.1
     Last active: 3 hours ago
     [Revoke]

  📱 Firefox on Linux ← Current session
     IP: 192.168.1.1
     Last active: Now
     [Cannot revoke current]

[Log out of all other devices]
─────────────────────────────────────────────
```

## Summary

| Capability | Requires database sessions? | MVP priority |
|---|---|---|
| Logout from all devices | ✅ Yes | Medium (add after password change) |
| Active session management | ✅ Yes | Low (Settings page enhancement) |
| Session revocation | ✅ Yes | Low (same as above) |
| Password-change invalidation | ✅ Yes | High (security best practice) |
| Suspicious login detection | ✅ Yes | Low (post-MVP) |
| Per-session rate limiting | ✅ Yes | Low (post-MVP) |

These features are **not possible** with the cookie session driver (`SESSION_DRIVER=cookie`), which stores all session data in the cookie itself and has no server-side session storage. The decision to use database sessions from the beginning enables all of the above without a future migration.
