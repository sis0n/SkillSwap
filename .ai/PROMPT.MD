# SkillSwap AI Prompt

> Version: 2.0.0

---

# Purpose

This document defines the current development phase, implementation scope, and active tasks for the SkillSwap project.

Before generating any code, always read this document together with the project documentation.

---

# Required Context

Always read these files before starting any task.

## AI Context

- .ai/SKILL.md
- .ai/CODING_RULES.md
- .ai/WORKFLOW.md
- .ai/PROMPT.md

## Project Documentation

- docs/PLANNING.md
- docs/FEATURES.md
- docs/DATABASE.md
- docs/API.md
- docs/UI.md
- docs/DESIGN_SYSTEM.md
- docs/ROADMAP.md

These documents are the project's source of truth.

Never generate code that contradicts them.

---

# General Rules

Always:

- Follow the current roadmap phase.
- Follow Laravel best practices.
- Follow React and TypeScript best practices.
- Generate production-ready code.
- Reuse existing code whenever possible.
- Keep documentation synchronized with implementation.
- Ask for clarification if requirements are unclear.

Never:

- Skip roadmap tasks.
- Implement future phases.
- Invent undocumented features.
- Invent undocumented API endpoints.
- Invent undocumented database tables.
- Invent undocumented UI pages.

---

# Current Development Phase

Phase 7 — Exchange Requests (Pending)

---

# Current Objective

Implement the complete Exchange Requests module for the MVP, following the Phase 7 roadmap stages (Stage 1 — Frontend UI Foundation → Stage 2 — Backend API → Stage 3 — Frontend Integration → Stage 4 — Testing & Hardening → Stage 5 — Documentation Synchronization).

The canonical business rules are defined in FEATURES.MD → Exchange Requests (Phase 7): state machine, ownership, duplicate, idempotency, eligibility, ordering, concurrency, and notifications deferral.

---

# Current Scope

## Backend

- Make `exchange_requests.learning_skill_id` nullable (migration)
- ExchangeRequestService (create, accept, decline, cancel, list with `role`/`status` filtering, pagination, and ordering contract)
- ExchangeRequestController (index, show, store, accept, decline, cancel)
- ExchangeRequestResource
- StoreExchangeRequestRequest
- Routes under `me/exchange-requests`
- Enforce state machine, ownership, bidirectional duplicate guard, idempotency, and eligibility
- Enforce optimistic concurrency (conditional updates on transitions, 422 on zero-row update) and message trim/empty→null

## Frontend

- API module `lib/api/exchange-requests.ts`
- Types, hooks, Zod schemas in `features/exchange-request/` (Phase 7 statuses: pending, accepted, declined, cancelled — `completed` is Phase 9)
- ExchangeRequestsPage (Received / Sent tabs, Received default)
- ExchangeRequestCard, SendExchangeRequestModal (Teaching selector from `GET /me/skills`; Learning selector from `GET /users/{username}`)
- Wire up ViewSkillsModal and PublicProfilePage entry points
- Wire up Dashboard "Active Exchanges" count (derived from Exchange Requests endpoint, status = accepted)
- Invalidate `["exchange-requests"]` and the Dashboard query key after every successful mutation
- Zod schema normalizes `message` (trim, empty → null) to match the backend

## Documentation

Update when necessary:

- API.md
- FEATURES.md
- UI.md
- DATABASE.md
- ROADMAP.md

## Excluded

Do not implement:

- Notifications (email, push, in-app) — deferred
- Messaging (Phase 8)
- Learning Sessions (Phase 9)
- Reviews (Phase 10)
- `accepted → completed` transition (Phase 9)

Unless explicitly requested.

---

# Current Tasks

Complete every unfinished task for the current roadmap phase.

Before implementing:

1. Read the relevant documentation.
2. Review existing code.
3. Identify affected files.
4. Explain the implementation plan.

During implementation:

- Generate complete backend code.
- Generate complete frontend code.
- Keep the implementation consistent with the documentation.

After implementation:

- Summarize the completed work.
- List modified files.
- Mention documentation updates.
- Wait for user approval before continuing.

---

# Completion Criteria

The current phase is complete when:

Backend

- All backend tasks are finished.

Frontend

- All frontend tasks are finished.

Documentation

- Documentation is synchronized.

Testing

- Required tests have been added when applicable.

The implementation must match:

- DATABASE.md
- API.md
- UI.md
- DESIGN_SYSTEM.md
- ROADMAP.md

---

# Notes

Only implement the current roadmap phase.

Do not move to the next phase until the user explicitly approves.

When the current phase changes, update only the following sections:

- Current Development Phase
- Current Objective
- Current Scope
- Current Tasks

The rest of this document should remain unchanged throughout the project.
