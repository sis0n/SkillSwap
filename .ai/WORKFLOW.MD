# SkillSwap AI Workflow

> Version: 2.0.0

---

# Purpose

This document defines the standard workflow the AI must follow when working on the SkillSwap project.

The workflow ensures every implementation is consistent with the project's architecture, documentation, coding standards, and current development phase.

Never skip workflow steps unless explicitly instructed by the user.

---

# Primary Objective

Generate clean, production-ready code that aligns with the project's documentation, architecture, and current development phase.

Always prioritize correctness over speed.

---

# Step 1 — Understand the Request

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

# Step 2 — Read AI Context

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

# Step 3 — Read Project Documentation

Read only the documentation relevant to the current task.

Available documentation:

- docs/PLANNING.md
- docs/FEATURES.md
- docs/DATABASE.md
- docs/API.md
- docs/UI.md
- docs/DESIGN_SYSTEM.md
- docs/ROADMAP.md

Never generate code that contradicts these documents.

---

# Step 4 — Review Existing Code

Before creating anything:

- Check existing implementations.
- Reuse existing classes.
- Reuse services.
- Reuse components.
- Follow existing project patterns.

Avoid duplicate code.

Never rewrite working implementations unless requested.

---

# Step 5 — Plan the Implementation

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

# Step 6 — Implement

Generate complete implementations.

When applicable, generate:

Backend

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

Frontend

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

# Step 7 — Validate

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

# Step 8 — Documentation

Whenever the implementation changes the project, update the relevant documentation.

Examples:

Database changes

- DATABASE.md

API changes

- API.md

Feature changes

- FEATURES.md

UI changes

- UI.md

Design changes

- DESIGN_SYSTEM.md

Milestone completion

- ROADMAP.md

Documentation should never become outdated.

---

# Step 9 — Explain the Changes

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

Before considering any task complete, verify:

- The user's request has been completed.
- The implementation follows the current development phase.
- The implementation follows project documentation.
- The implementation follows coding standards.
- The code is production-ready.
- Existing functionality remains intact.
- Documentation is synchronized.
- No unnecessary code was introduced.

Only consider the task complete after all checks have passed.
