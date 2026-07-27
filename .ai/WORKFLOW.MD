# SkillSwap AI Workflow

> Version: 3.0.0

---

# Purpose

This document defines the standard workflow the AI must follow when working on the SkillSwap project.

The workflow operates at two levels:

- **Feature Development Lifecycle** — The 8-stage process every roadmap phase follows, from planning through completion.
- **Task Implementation Workflow** — The detailed steps for executing individual implementation tasks within a phase.

Both levels must be followed unless explicitly instructed by the user.

---

# Primary Objective

Deliver production-ready features that are architecturally sound, well-documented, and aligned with project standards.

Always prioritize correctness over speed.

---

# Feature Development Lifecycle

Every major roadmap phase follows this 8-stage lifecycle.

Stages are sequential. Do not proceed to the next stage until the current stage's expected outputs are complete, unless the stage explicitly allows iteration.

---

## Stage 1 — Planning

**Purpose:** Define the phase scope and break it into actionable tasks.

**Expected outputs:**
- ROADMAP checklist updated with detailed, ordered items.
- Affected systems identified (database, API, frontend, tests, documentation).
- Task dependencies identified.

**What should happen:**
- List every database table, model, API endpoint, UI page, and component the phase touches.
- Identify validation and authorization requirements.
- Estimate relative complexity of each item.

**What should not happen:**
- Writing code or making final architectural decisions before the scope is clear.
- Skipping dependency analysis.

---

## Stage 2 — Architecture Review

**Purpose:** Confirm the architectural approach before investing in documentation or implementation.

**Expected outputs:**
- Architecture decisions explicitly stated.
- Inconsistencies with existing patterns identified and resolved.

**What should happen:**
- Review database schema requirements against existing tables and DATABASE.md.
- Review API design against existing RESTful patterns and API.md.
- Review UI component hierarchy against the design system and UI.md.
- Review service layer needs against existing service patterns.

**What should not happen:**
- Documenting or implementing until the architecture is agreed upon.
- Making decisions that contradict existing project patterns without explicit reasoning.

---

## Stage 3 — Documentation Refinement

**Purpose:** Update all relevant documentation to reflect the approved architecture decisions.

**Expected outputs:**
- DATABASE.md updated (if schema changes are needed).
- API.md updated (if new or modified endpoints).
- FEATURES.md updated (if feature scope or behavior changes).
- UI.md updated (if new or modified pages or components).
- BACKLOG.md updated (if items are promoted or deferred).
- All other affected documentation updated.

**What should happen:**
- Write documentation with enough specificity that a developer can implement from it.
- Include request and response examples for APIs.
- Include component descriptions and user flows for UI.
- Include column types, constraints, and relationships for database changes.

**What should not happen:**
- Rewriting unrelated documentation.
- Making architectural changes without updating the corresponding documentation.
- Leaving documentation vague or incomplete.

---

## Stage 4 — Documentation Verification

**Purpose:** Confirm all documentation is internally consistent and ready for implementation.

**Expected outputs:**
- All cross-document references confirmed consistent.
- All terminology conflicts resolved.
- All stale references removed.

**What should happen:**
- Cross-reference every field, endpoint, component name, and behavior across all affected documents.
- Verify the documentation describes a complete, buildable feature.
- Fix any inconsistencies found.

**What should not happen:**
- Changing the architecture during verification.
- Proceeding to implementation with known inconsistencies.

---

## Stage 5 — Implementation

**Purpose:** Build the feature following the approved architecture and documentation.

**Expected outputs:**
- Working backend code (routes, controllers, services, models, policies, resources, migrations, seeders, factories).
- Working frontend code (pages, layouts, components, hooks, API services, forms, validation).
- Tests covering the implementation.
- Responsive UI following the design system.

**What should happen:**
- Follow the Task Implementation Workflow for each individual task within the phase.
- Generate complete implementations with no placeholders or incomplete code.
- Follow existing patterns and reuse existing code where appropriate.

**What should not happen:**
- Deviating from the approved architecture without returning to Stage 2.
- Skipping tests.
- Generating implementations that contradict the documentation.

---

## Stage 6 — Implementation Review

**Purpose:** Verify the implementation matches the approved architecture and documentation.

**Expected outputs:**
- Discrepancies between implementation and architecture identified and resolved.

**What should happen:**
- Compare the implementation against the architecture documentation.
- Verify database schema matches DATABASE.md.
- Verify API behavior matches API.md.
- Verify UI matches UI.md.
- Verify feature behavior matches FEATURES.md.
- Fix any discrepancies found.

**What should not happen:**
- Introducing new features beyond the documented scope.
- Skipping the review because the implementation "feels right."

---

## Stage 7 — Hardening

**Purpose:** Fix remaining issues, add polish, and confirm production readiness.

**Expected outputs:**
- All known issues resolved.
- Error handling verified.
- Edge cases handled.
- Performance considerations addressed.

**What should happen:**
- Run the full test suite and fix any failures.
- Review error handling paths (validation errors, authorization failures, not found, server errors).
- Handle edge cases (empty states, loading states, error states, pagination boundaries).
- Verify performance (eager loading, pagination, query optimization, caching where appropriate).
- Verify security (authentication, authorization, input validation, data exposure).

**What should not happen:**
- Introducing new features during hardening.
- Ignoring failing tests.
- Deferring edge case handling.

---

## Stage 8 — Completion

**Purpose:** Confirm the phase meets all completion criteria and mark it done.

**Expected outputs:**
- ROADMAP checklist items for the phase marked completed.
- Phase summary documented.

**A phase is complete only when all of the following are satisfied:**
- Implementation is complete — all code written, no placeholders.
- Documentation is synchronized — all affected docs reflect the final implementation.
- Tests pass — full test suite green.
- Architecture review completed (Stage 2).
- Implementation review completed (Stage 6).
- Hardening completed (Stage 7).

**What should happen:**
- Mark all ROADMAP checklist items for the phase as completed.
- Document the phase summary (what was built, key decisions, known limitations).

**What should not happen:**
- Marking a phase complete with unfinished items.
- Marking a phase complete when documentation is out of date.
- Deferring completion criteria to "future cleanup."

---

# Architectural Freeze

Once Stage 5 (Implementation) begins, the architecture approved during Stage 2 and refined during Stage 3 is considered frozen.

**During implementation:**
- Minor documentation corrections are allowed (typos, formatting, clarifications).
- Architectural changes are not permitted unless:
  - A critical flaw is discovered that makes the current design incorrect.
  - Implementation becomes impossible under the current design.
  - Business requirements change.

**When an architectural change becomes necessary:**
1. Pause Stage 5 (Implementation).
2. Return to Stage 2 (Architecture Review) to revise the architecture.
3. Update all affected documentation (Stage 3).
4. Re-verify documentation consistency (Stage 4).
5. Resume implementation with the updated architecture.

Architectural drift — making undocumented design decisions during implementation — undermines the lifecycle and must be avoided.

---

# Documentation Synchronization

Documentation is part of the development process, not an afterthought.

**Principles:**
- When a feature changes, all affected documentation must be updated in the same pass.
- Never update only code and leave documentation stale.
- Never rewrite unrelated documentation — only touch what the feature affects.
- Documentation should describe the system as it is, not as it was planned.

**Documents to keep synchronized:**
- `docs/architecture/ROADMAP.MD` — phase progress and completion status.
- `docs/architecture/DATABASE.MD` — schema, tables, columns, relationships, indexes.
- `docs/architecture/API.MD` — endpoints, request parameters, response shapes, validation rules, errors.
- `docs/architecture/PLANNING.MD` — project scope and technical decisions.
- `docs/product/FEATURES.MD` — feature scope, behavior, filters, sorting, edge cases.
- `docs/product/UI.MD` — pages, components, user flows, states, responsive behavior.
- `docs/product/BACKLOG.MD` — deferred items, promoted items, newly identified work.
- `docs/design/DESIGN_SYSTEM.MD` — components, variants, design tokens (when UI changes).

**When to synchronize:**
- During Stage 3 (Documentation Refinement) — before implementation.
- During Stage 5 (Implementation) — when code changes reveal documentation gaps.
- During Stage 6 (Implementation Review) — when review finds discrepancies.
- During Stage 8 (Completion) — final confirmation before marking the phase done.

Outdated documentation is a liability. Keep it current.

---

# Task Implementation Workflow

The following steps apply during Stage 5 (Implementation) for each individual task within a phase.

---

## Step 1 — Understand the Request

Before generating any code:

- Read the user's request carefully.
- Identify whether it is:
  - A new feature
  - A bug fix
  - A refactor
  - A documentation update
  - A UI change
  - A database change
  - An API change

If the request is unclear, ask for clarification before proceeding.

---

## Step 2 — Read AI Context

Always read the AI documentation first.

Read:

- .ai/SKILL.md
- .ai/CODING_RULES.md
- .ai/PROMPT.md

Use these documents to understand:

- Project context
- Coding standards
- Current development phase
- Current objectives
- Current scope

---

## Step 3 — Read Project Documentation

Read only the documentation relevant to the current task.

Available documentation:

- docs/architecture/PLANNING.md
- docs/architecture/DATABASE.md
- docs/architecture/API.md
- docs/architecture/ROADMAP.md
- docs/product/FEATURES.md
- docs/product/UI.md
- docs/product/BACKLOG.md
- docs/design/DESIGN_SYSTEM.md

Never generate code that contradicts these documents.

---

## Step 4 — Review Existing Code

Before creating anything:

- Check existing implementations.
- Reuse existing classes.
- Reuse services.
- Reuse components.
- Follow existing project patterns.

Avoid duplicate code.

Never rewrite working implementations unless requested.

---

## Step 5 — Plan the Implementation

Before coding, determine:

- Files to modify
- New files to create
- Database tables involved
- Models involved
- Relationships involved
- API endpoints involved
- UI pages involved
- Components involved
- Validation requirements
- Authorization requirements

Choose the simplest maintainable solution.

---

## Step 6 — Implement

Generate complete implementations.

When applicable, generate:

**Backend:**
- Routes
- Controllers
- Form Requests
- Services
- Models
- Policies
- API Resources
- Migrations
- Seeders
- Factories
- Tests

**Frontend:**
- Pages
- Layouts
- Components
- Hooks
- API Services
- Forms
- Validation
- Responsive UI

Do not generate incomplete implementations.

Avoid placeholders.

---

## Step 7 — Validate

Before finishing:

Verify:

- Syntax
- Laravel best practices
- React best practices
- TypeScript typing
- Database relationships
- API consistency
- UI consistency
- Design system consistency
- Security
- Performance

Ensure the implementation is production-ready.

---

## Step 8 — Synchronize Documentation

Update all affected documentation. Follow the Documentation Synchronization principles defined above.

---

## Step 9 — Explain the Changes

After implementation:

Explain:

- What was implemented
- Files created
- Files modified
- Why the approach was chosen
- Integration notes

Keep explanations concise.

---

# Error Handling

If errors occur:

- Identify the root cause.
- Explain the problem.
- Recommend the simplest solution.
- Avoid guessing.

---

# Refactoring

When refactoring:

- Preserve behavior.
- Improve readability.
- Reduce duplication.
- Maintain compatibility.
- Follow existing architecture.

Avoid unnecessary rewrites.

---

# Security

Always consider:

- Authentication
- Authorization
- Validation
- Password hashing
- Mass assignment protection
- Secure API responses
- Sensitive data protection

Security should never be optional.

---

# Performance

Prefer efficient solutions.

Examples:

- Eager loading
- Pagination
- Database indexing
- Query optimization
- Component reuse
- Lazy loading when appropriate

Optimize only when beneficial.

---

# Communication

Responses should be:

- Accurate
- Concise
- Practical
- Professional

Explain architectural decisions only when necessary.

Avoid unnecessary repetition.

---

# Development Principles

Always prioritize:

1. Correctness
2. Simplicity
3. Readability
4. Maintainability
5. Scalability
6. Security
7. Performance

Never sacrifice maintainability for clever solutions.

---

# Completion Checklist

Before considering any individual task complete, verify:

- The user's request has been completed.
- The implementation follows the current development phase.
- The implementation follows project documentation.
- The implementation follows coding standards.
- The code is production-ready.
- Existing functionality remains intact.
- Documentation is synchronized.
- No unnecessary code was introduced.

Only consider the task complete after all checks have passed.
