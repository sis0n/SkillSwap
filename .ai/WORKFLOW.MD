# SkillSwap AI Workflow

> Version: 1.0.0

---

# Purpose

This document defines the standard workflow the AI should follow when assisting with the SkillSwap project.

The AI should follow this workflow before generating code, modifying existing code, or making architectural decisions.

---

# Primary Objective

Always generate production-ready code that is consistent with the project's architecture, documentation, and coding standards.

Do not make assumptions that contradict the project's documentation.

---

# Step 1 — Understand the Request

Before writing code:

- Read the user's request carefully.
- Identify the feature, bug, or enhancement being requested.
- Determine whether the request belongs to the MVP or a future feature.

If the request is unclear, ask for clarification before generating code.

---

# Step 2 — Read the Project Documentation

Use the documentation as the primary source of truth.

Read the following documents when they are relevant:

- docs/PLANNING.md
- docs/FEATURES.md
- docs/DATABASE.md
- docs/API.md
- docs/ROADMAP.md

Never generate code that conflicts with these documents.

---

# Step 3 — Review Existing Code

Before creating new files or functions:

- Check whether similar functionality already exists.
- Reuse existing services, models, and utilities whenever possible.
- Follow the existing project structure.
- Avoid duplicate logic.

Do not rewrite working code unless the user requests refactoring.

---

# Step 4 — Plan the Solution

Before implementing a feature:

- Identify the affected files.
- Identify required database tables.
- Identify related API endpoints.
- Identify required models and relationships.
- Identify validation rules.
- Identify authorization requirements.

If multiple implementation approaches exist, choose the simplest maintainable solution.

---

# Step 5 — Implement the Feature

Generate complete, production-ready code.

Follow the project's coding standards.

When applicable, generate:

- Routes
- Controllers
- Form Requests
- Services
- Models
- Policies
- API Resources
- Migrations
- Seeders
- Tests

Avoid placeholders and incomplete implementations.

---

# Step 6 — Validate the Implementation

Before finishing:

- Check for syntax errors.
- Verify Laravel best practices.
- Verify naming consistency.
- Verify database relationships.
- Verify API consistency.
- Verify security considerations.

Ensure the implementation is complete.

---

# Step 7 — Explain the Changes

After generating code:

Provide a concise explanation that includes:

- What was implemented
- Which files were created or modified
- Why the solution was chosen
- Any important notes for integration

Keep explanations brief and practical.

---

# Documentation Updates

If the implementation changes the project structure, API, or database:

Update the relevant documentation:

- DATABASE.md
- API.md
- FEATURES.md
- ROADMAP.md

Do not leave documentation outdated.

---

# Error Handling

If an error is encountered:

- Identify the root cause.
- Explain the issue clearly.
- Suggest the simplest fix.
- Avoid unnecessary complexity.

Do not guess the cause of errors.

---

# Refactoring

When refactoring:

- Preserve existing functionality.
- Improve readability.
- Reduce duplication.
- Maintain backward compatibility whenever possible.

Avoid unnecessary rewrites.

---

# Security

Always consider security.

Examples include:

- Input validation
- Authentication
- Authorization
- Password hashing
- Mass assignment protection
- SQL injection prevention
- Sensitive data protection

Never sacrifice security for convenience.

---

# Performance

Prefer efficient solutions.

When applicable:

- Use eager loading.
- Paginate large datasets.
- Minimize database queries.
- Avoid unnecessary loops.
- Reuse existing resources.

Optimize only when it improves maintainability or performance.

---

# Communication

When responding:

- Be concise.
- Be accurate.
- Explain architectural decisions when necessary.
- Avoid unnecessary repetition.

Focus on solving the user's request.

---

# Development Principles

The AI should always prioritize:

1. Correctness
2. Simplicity
3. Maintainability
4. Readability
5. Scalability

Never prioritize cleverness over clarity.

---

# Completion Checklist

Before considering a task complete, verify:

- The request has been fully addressed.
- The code follows the project standards.
- The implementation is production-ready.
- Existing functionality has not been broken.
- Documentation remains accurate.
- No unnecessary code was introduced.

Only consider the task complete after all checks have passed.
